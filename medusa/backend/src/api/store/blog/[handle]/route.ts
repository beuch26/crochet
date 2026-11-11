import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService = req.scope.resolve(BLOG_MODULE)
  const { handle } = req.params

  const [posts] = await blogModuleService.listAndCountBlogPosts(
    { handle, is_published: true },
    { take: 1 }
  )

  if (!posts.length) {
    return res.status(404).json({ message: "Article non trouvé" })
  }

  res.json({ blog_post: posts[0] })
}
