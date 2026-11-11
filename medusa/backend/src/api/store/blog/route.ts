import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService = req.scope.resolve(BLOG_MODULE)

  const limit = parseInt(req.query.limit as string) || 20
  const offset = parseInt(req.query.offset as string) || 0

  const [posts, count] = await blogModuleService.listAndCountBlogPosts(
    { is_published: true },
    {
      order: { published_at: "DESC" },
      skip: offset,
      take: limit,
    }
  )

  res.json({ blog_posts: posts, count, limit, offset })
}
