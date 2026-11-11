import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { BLOG_MODULE } from "../modules/blog"
import { getIntegrationConfig } from "../lib/integration-config"

/**
 * Triggers a configurable HTTP webhook when a blog_post is created/updated/deleted.
 *
 * Drives storefront rebuilds: by default the webhook points at GitHub
 * Actions repository_dispatch on the storefront repo, which kicks off the
 * build+deploy workflow. Multiple posts in quick succession are
 * naturally deduped by the workflow's `concurrency: cancel-in-progress`.
 *
 * Env vars (all optional — empty BLOG_BUILD_HOOK_URL = no-op):
 *   BLOG_BUILD_HOOK_URL    e.g. https://api.github.com/repos/owner/repo/dispatches
 *   BLOG_BUILD_HOOK_TOKEN  Bearer token (GitHub fine-grained PAT with Actions:write)
 *   BLOG_BUILD_HOOK_BODY   JSON body, default {"event_type":"blog-post-changed"}
 *                          The subscriber merges {client_payload: {…post info, action}}.
 *
 * Failures never block the original mutation — they're logged and dropped.
 */

async function fireHook(
  eventName: string,
  postId: string,
  container: any,
): Promise<void> {
  const logger = container.resolve("logger")

  // Read from DB integration first; fall back to env via the helper.
  const cfg = await getIntegrationConfig<{
    hook_url?: string
    event_type?: string
    pat?: string
  }>(container, "github_blog_rebuild")

  const hookUrl = cfg.hook_url || process.env.BLOG_BUILD_HOOK_URL
  if (!hookUrl) {
    logger.info(`[blog-build-hook] github_blog_rebuild not configured — skip (${eventName})`)
    return
  }

  const hookToken = cfg.pat || process.env.BLOG_BUILD_HOOK_TOKEN
  const eventType = cfg.event_type || "blog-post-changed"
  const hookBodyRaw = process.env.BLOG_BUILD_HOOK_BODY || JSON.stringify({ event_type: eventType })

  let payload: any
  try {
    payload = JSON.parse(hookBodyRaw)
  } catch {
    payload = { event_type: "blog-post-changed" }
  }

  // Best-effort fetch of the post for the payload (skipped on delete since the row is gone).
  let post: any = null
  if (eventName !== "blog_post.deleted") {
    try {
      const blogService = container.resolve(BLOG_MODULE) as any
      post = await blogService.retrieveBlogPost(postId)
    } catch {
      /* ignored */
    }
  }

  payload.client_payload = {
    ...(payload.client_payload || {}),
    action: eventName.replace("blog_post.", ""),
    blog_post_id: postId,
    handle: post?.handle ?? null,
    title: post?.title ?? null,
    is_published: post?.is_published ?? null,
    fired_at: new Date().toISOString(),
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
  }
  if (hookToken) headers["Authorization"] = `Bearer ${hookToken}`

  try {
    const response = await fetch(hookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      logger.error(
        `[blog-build-hook] HTTP ${response.status} on ${eventName} ${postId}: ${text.slice(0, 200)}`,
      )
      return
    }

    logger.info(`[blog-build-hook] Triggered rebuild for ${eventName} ${postId}`)
  } catch (e: any) {
    logger.error(`[blog-build-hook] Webhook failed: ${e?.message || e}`)
  }
}

export default async function blogBuildHookHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!event?.data?.id) return
  await fireHook(event.name, event.data.id, container)
}

export const config: SubscriberConfig = {
  event: ["blog_post.created", "blog_post.updated", "blog_post.deleted"],
}
