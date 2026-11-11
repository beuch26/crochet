/**
 * One-shot rewriter: replace every legacy PrestaShop URL (with accents)
 * inside blog_post.content with its canonical Astro path.
 *
 * Source of truth for the mapping is hard-coded below — it was derived
 * from the actual distinct hrefs found by:
 *   SELECT DISTINCT (regexp_matches(content, 'href="([^"]*[éèêâîôûàç][^"]*)"', 'g'))[1]
 *   FROM blog_post WHERE deleted_at IS NULL;
 *
 * Ordering: longest patterns first so nested URLs (e.g.
 * `/biberons-tétines/biberon-pp-natural-wave`) are rewritten before
 * their parent (`/biberons-tétines`).
 *
 * Idempotent — re-running after success is a no-op (the patterns are
 * gone from the content).
 *
 * Run: npx medusa exec src/scripts/rewrite-blog-legacy-urls.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { BLOG_MODULE } from "../modules/blog"

// [oldFragment, newPath]
// Longest first. `oldFragment` is the URL value that lives between
// the href quotes; `newPath` is the Astro-canonical replacement.
const REWRITES: Array<[string, string]> = [
  // === Type B: nested products (PrestaShop /collection/product layout) ===
  ["https://magic-crochet-kit.com/tire-lait/tire-lait-électrique-simple-solo-hands-free-medela", "/products/tire-lait-electrique-simple-solo-hands-free-medela/"],
  ["https://magic-crochet-kit.com/blog/article/quelle-est-la-duree-idéale-de-l-allaitement", "/blog/duree-ideale-lallaitement/"],
  ["https://magic-crochet-kit.com/blog/article/faire-accepter-biberon-bébé-allaite", "/blog/faire-accepter-biberon-bebe-allaite/"],
  ["https://magic-crochet-kit.com/blog/article/peut-on-etre-enceinte-et-avoir-ses-règles", "/blog/peut-on-etre-enceinte-et-avoir-ses-regles/"],
  ["https://magic-crochet-kit.com/blog/article/comment-habiller-bébé-la-nuit", "/blog/comment-habiller-bebe-la-nuit/"],
  ["https://magic-crochet-kit.com/blog/article/diversification-alimentaire-bébé", "/blog/diversification-alimentaire-bebe/"],
  ["https://magic-crochet-kit.com/blog/article/quand-introduire-feculents-bébé", "/blog/quand-introduire-feculents-bebe/"],
  ["https://magic-crochet-kit.com/tire-lait/tire-lait-électrique-double-medela", "/products/tire-lait-electrique-double-medela/"],
  ["https://magic-crochet-kit.com/blog/article/oignon-sous-le-lit-de-bébé", "/blog/oignon-sous-le-lit-de-bebe/"],
  ["https://magic-crochet-kit.com/biberons-tétines/biberon-pp-natural-wave", "/products/biberon-pp-natural-wave/"],
  ["https://magic-crochet-kit.com/soins-grossesse/huile-massage-périnée-bio", "/products/huile-massage-perinee-bio/"],
  ["https://magic-crochet-kit.com/blog/article/favoriser-sommeil-de-bébé", "/blog/favoriser-sommeil-de-bebe/"],
  ["https://magic-crochet-kit.com/blog/article/préparer-arrivee-de-bébé", "/blog/preparer-arrivee-de-bebe/"],
  ["https://magic-crochet-kit.com/blog/article/terreur-nocturne-bébé", "/blog/terreur-nocturne-bebe/"],
  ["https://magic-crochet-kit.com/vaisselle-bébé/set-repas-en-silicone-pour-bébé", "/products/set-repas-en-silicone-pour-bebe/"],
  ["https://magic-crochet-kit.com/biberons-tétines/tétine-natural-wave", "/products/tetine-natural-wave/"],
  ["https://magic-crochet-kit.com/blog/article/recettes-bébé-6-mois", "/blog/recettes-bebe-6-mois/"],
  ["https://magic-crochet-kit.com/tire-lait/tire-lait-électrique-portable", "/products/tire-lait-electrique-portable/"],
  ["https://magic-crochet-kit.com/blog/article/bébé-pleure-au-sein", "/blog/bebe-pleure-au-sein/"],
  ["https://magic-crochet-kit.com/blog/article/finger-food-bébé", "/blog/finger-food-bebe/"],
  ["https://magic-crochet-kit.com/tire-lait/tire-lait-électrique-2-en-1", "/products/tire-lait-electrique-2-en-1/"],
  ["https://magic-crochet-kit.com/casque-anti-bruit-bébé", "/collections/casque-anti-bruit-bebe/"],
  ["https://magic-crochet-kit.com/trousse-de-soin-bébé", "/collections/trousse-de-soin-bebe/"],
  ["https://magic-crochet-kit.com/tresse-de-lit-bébé", "/collections/tresse-de-lit-bebe/"],

  // Relative variants (no domain)
  ["/vaisselle-bébé/set-repas-en-silicone-pour-bébé", "/products/set-repas-en-silicone-pour-bebe/"],
  ["/tire-lait/tire-lait-électrique-portable", "/products/tire-lait-electrique-portable/"],
  ["/blog/article/quand-introduire-feculents-bébé", "/blog/quand-introduire-feculents-bebe/"],
  ["/blog/article/diversification-alimentaire-bébé", "/blog/diversification-alimentaire-bebe/"],
  ["/blog/article/favoriser-sommeil-de-bébé", "/blog/favoriser-sommeil-de-bebe/"],
  ["/blog/article/finger-food-bébé", "/blog/finger-food-bebe/"],

  // === Type A: bare collections (PrestaShop /handle layout) ===
  // Absolute first, then relative, longest first
  ["https://magic-crochet-kit.com/attache-tétine", "/collections/attache-tetine/"],
  ["https://magic-crochet-kit.com/biberons-tétines", "/collections/biberons-tetines/"],
  ["https://magic-crochet-kit.com/vaisselle-bébé", "/collections/vaisselle-bebe/"],
  ["https://magic-crochet-kit.com/bébé", "/collections/bebe/"],

  ["/biberons-tétines", "/collections/biberons-tetines/"],
  ["/vaisselle-bébé", "/collections/vaisselle-bebe/"],
  ["/bébé", "/collections/bebe/"],
]

export default async function rewrite({ container }: ExecArgs) {
  const blogService: any = container.resolve(BLOG_MODULE)

  console.log("\n=== Rewriting legacy URLs in blog content ===\n")

  const posts: any[] = await blogService.listBlogPosts({})
  let totalUpdated = 0
  let totalReplacements = 0

  for (const post of posts) {
    const before: string = post.content || ""
    let after = before
    let postReplacements = 0
    for (const [from, to] of REWRITES) {
      if (after.includes(from)) {
        const occurrences = after.split(from).length - 1
        after = after.split(from).join(to)
        postReplacements += occurrences
      }
    }
    if (postReplacements > 0) {
      await blogService.updateBlogPosts({ id: post.id, content: after })
      console.log(`  ✓ ${post.handle.padEnd(50)} ${postReplacements} replacement(s)`)
      totalUpdated += 1
      totalReplacements += postReplacements
    }
  }

  console.log(`\nDone: ${totalUpdated} post(s) updated, ${totalReplacements} URL(s) rewritten.\n`)
}
