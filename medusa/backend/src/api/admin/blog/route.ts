import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService = req.scope.resolve(BLOG_MODULE)

  // Cap to prevent authenticated DoS via huge limits.
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 200)
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0)

  const filters: Record<string, unknown> = {}

  if (req.query.is_published !== undefined) {
    filters.is_published = req.query.is_published === "true"
  }
  if (req.query.category) {
    filters.category = req.query.category
  }

  const [posts, count] = await blogModuleService.listAndCountBlogPosts(
    filters,
    {
      order: { created_at: "DESC" },
      skip: offset,
      take: limit,
    }
  )

  res.json({ blog_posts: posts, count, limit, offset })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService = req.scope.resolve(BLOG_MODULE)

  const post = await blogModuleService.createBlogPosts(req.body as Record<string, unknown>)

  // Emit so the build-hook subscriber can trigger a storefront rebuild.
  // Failure here must NOT roll back the create — log and continue.
  try {
    const eventBus = req.scope.resolve("event_bus") as any
    await eventBus.emit({ name: "blog_post.created", data: { id: post.id } })
  } catch (e: any) {
    console.error("[blog] event emit failed:", e?.message)
  }

  res.status(201).json({ blog_post: post })
}
