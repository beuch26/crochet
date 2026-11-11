import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService = req.scope.resolve(BLOG_MODULE)
  const { id } = req.params

  const post = await blogModuleService.retrieveBlogPost(id)

  res.json({ blog_post: post })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService = req.scope.resolve(BLOG_MODULE)
  const { id } = req.params

  // Strip any `id` from the body so the URL param is always authoritative —
  // otherwise body could redirect the update to a different post.
  const { id: _bodyId, ...body } = (req.body || {}) as Record<string, unknown>
  const post = await blogModuleService.updateBlogPosts({ id, ...body })

  try {
    const eventBus = req.scope.resolve("event_bus") as any
    await eventBus.emit({ name: "blog_post.updated", data: { id } })
  } catch (e) {
    console.error("[blog] event emit failed:", e)
  }

  res.json({ blog_post: post })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService = req.scope.resolve(BLOG_MODULE)
  const { id } = req.params

  await blogModuleService.deleteBlogPosts(id)

  try {
    const eventBus = req.scope.resolve("event_bus") as any
    await eventBus.emit({ name: "blog_post.deleted", data: { id } })
  } catch (e) {
    console.error("[blog] event emit failed:", e)
  }

  res.status(200).json({ id, object: "blog_post", deleted: true })
}
