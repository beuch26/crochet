/**
 * Final mop-up of the 3 legacy URLs v2 couldn't resolve:
 *   /blog/categorie/maman                                      → /blog/?cat=maman
 *   /content/choisir-son-coquillage-d-allaitement              → /blog/qu-est-ce-qu-une-coquille-d-allaitement/
 *   /content/comment-fonctionne-les-coquillages-d-allaitement  → /blog/comment-mettre-les-coquillages-d-allaitement-en-nacre/
 *
 * Run: npx medusa exec src/scripts/rewrite-blog-legacy-urls-v3.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { BLOG_MODULE } from "../modules/blog"

const REWRITES: Array<[string, string]> = [
  ["https://magic-crochet-kit.com/blog/categorie/maman", "/blog/?cat=maman"],
  ["/blog/categorie/maman", "/blog/?cat=maman"],
  ["https://magic-crochet-kit.com/content/choisir-son-coquillage-d-allaitement", "/blog/qu-est-ce-qu-une-coquille-d-allaitement/"],
  ["/content/choisir-son-coquillage-d-allaitement", "/blog/qu-est-ce-qu-une-coquille-d-allaitement/"],
  ["https://magic-crochet-kit.com/content/comment-fonctionne-les-coquillages-d-allaitement", "/blog/comment-mettre-les-coquillages-d-allaitement-en-nacre/"],
  ["/content/comment-fonctionne-les-coquillages-d-allaitement", "/blog/comment-mettre-les-coquillages-d-allaitement-en-nacre/"],
]

export default async function rewrite({ container }: ExecArgs) {
  const blogService: any = container.resolve(BLOG_MODULE)
  console.log("\n=== Final mop-up of legacy URLs ===\n")
  const posts: any[] = await blogService.listBlogPosts({})
  let total = 0
  for (const post of posts) {
    let after: string = post.content || ""
    let n = 0
    for (const [from, to] of REWRITES) {
      if (!after.includes(from)) continue
      const c = after.split(from).length - 1
      after = after.split(from).join(to)
      n += c
    }
    if (n > 0) {
      await blogService.updateBlogPosts({ id: post.id, content: after })
      console.log(`  ✓ ${post.handle.padEnd(50)} ${n} replacement(s)`)
      total += n
    }
  }
  console.log(`\nDone: ${total} replacement(s).\n`)
}
