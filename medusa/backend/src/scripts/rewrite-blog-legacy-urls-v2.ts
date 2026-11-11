/**
 * Second pass: catches every remaining legacy PrestaShop URL in blog
 * content that the first script (rewrite-blog-legacy-urls.ts) missed
 * because it only targeted accented variants.
 *
 * Smarter than v1: instead of hardcoded source→target pairs, this one
 * loads every collection/product/blog handle from the DB and resolves
 * each href dynamically.
 *
 * Patterns handled (relative and `https://magic-crochet-kit.com/`-prefixed both):
 *   /blog/article/<slug>     → /blog/<slug>/         (with manual remaps below)
 *   /<collection>/<product>  → /products/<product>/  (if product exists)
 *   /<collection>            → /collections/<collection>/   (if collection exists)
 *   /fournisseur/<brand>     → /marques/<brand>/
 *
 * Idempotent — re-running after success is a no-op.
 *
 * Run: npx medusa exec src/scripts/rewrite-blog-legacy-urls-v2.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { BLOG_MODULE } from "../modules/blog"
import { Modules } from "@medusajs/framework/utils"

// Manual remaps for slugs that don't exist 1-to-1 in the current schema.
// LHS is the slug as seen in the legacy URL; RHS is the new canonical path.
const MANUAL_BLOG_REMAPS: Record<string, string> = {
  "comment-conserver-le-lait-maternel": "/collections/conservation-lait-maternel/",
  "quel-soutien-gorge-choisir-pour-allaiter": "/blog/soutien-gorge-choisir-allaiter/",
  "tire-lait-le-plus-efficace-2024": "/blog/meilleur-tire-lait/",
}

// Aliases for collection handles that have been renamed
const COLLECTION_ALIAS: Record<string, string> = {
  "coquille-allaitement": "coquillage-allaitement-nacre",
  "coquillage-allaitement": "coquillage-allaitement-nacre",
  "coussinet-d-allaitement": "coussinet-allaitement",
}

function deaccent(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
}

function stripDomain(url: string): string {
  return url.replace(/^https?:\/\/geniuz\.fr/, "")
}

export default async function rewrite({ container }: ExecArgs) {
  const blogService: any = container.resolve(BLOG_MODULE)
  const productSvc: any = container.resolve(Modules.PRODUCT)

  console.log("\n=== Rewriting legacy URLs in blog content (v2) ===\n")

  // ---- Load reference data ----
  const [collections, products, posts] = await Promise.all([
    productSvc.listProductCollections({}, { take: 1000 }),
    productSvc.listProducts({}, { take: 1000, select: ["handle"] }),
    blogService.listBlogPosts({}),
  ])
  const collectionHandles = new Set(collections.map((c: any) => c.handle))
  const productHandles = new Set(products.map((p: any) => p.handle))
  const blogHandles = new Set(posts.map((p: any) => p.handle))

  console.log(`  loaded: ${collectionHandles.size} collections, ${productHandles.size} products, ${blogHandles.size} blog posts\n`)

  // ---- Resolver ----
  function resolve(rawHref: string): string | null {
    const path = stripDomain(rawHref)
    if (!path.startsWith("/")) return null
    // Strip query/hash for matching, re-attach at end
    const m = path.match(/^([^?#]*)([?#].*)?$/)
    const cleanPath = m ? m[1] : path
    const tail = m && m[2] ? m[2] : ""
    const noTrail = cleanPath.replace(/\/+$/, "")
    if (!noTrail || noTrail === "") return null

    const segs = noTrail.split("/").filter(Boolean).map((s) => deaccent(s).toLowerCase())
    if (segs.length === 0) return null

    // /blog/article/<slug>
    if (segs[0] === "blog" && segs[1] === "article" && segs[2]) {
      const slug = segs.slice(2).join("/")
      if (MANUAL_BLOG_REMAPS[slug]) return MANUAL_BLOG_REMAPS[slug] + tail
      if (blogHandles.has(slug)) return `/blog/${slug}/${tail}`
      // Unknown blog slug → don't touch, will hit 404
      return null
    }

    // /fournisseur/<brand>
    if (segs[0] === "fournisseur" && segs[1]) {
      return `/marques/${segs[1]}/${tail}`
    }

    // Skip already-canonical paths
    if (["products", "collections", "marques", "blog", "p"].includes(segs[0])) return null
    // Skip static pages
    if (["images", "favicon", "robots", "sitemap", "feed-google-merchant", "feed-tiktok-shop", "content"].includes(segs[0])) return null

    // PrestaShop /<collection>/<product>
    if (segs.length >= 2) {
      const productSlug = segs[segs.length - 1]
      if (productHandles.has(productSlug)) return `/products/${productSlug}/${tail}`
    }

    // PrestaShop bare /<collection>
    const colSlug = segs[0]
    const aliased = COLLECTION_ALIAS[colSlug] || colSlug
    if (collectionHandles.has(aliased)) return `/collections/${aliased}/${tail}`

    return null
  }

  // ---- Walk posts ----
  let totalPosts = 0
  let totalReplacements = 0
  const unresolved = new Set<string>()

  for (const post of posts) {
    const before: string = post.content || ""
    if (!before.includes('href="')) continue

    let after = before
    let postReplacements = 0
    // Find every href in this post
    const hrefMatches = Array.from(before.matchAll(/href="([^"]+)"/g))
    const uniqueHrefs = new Set(hrefMatches.map((m) => m[1]))

    for (const href of uniqueHrefs) {
      // Only consider internal candidates
      if (!href.startsWith("/") && !href.startsWith("https://magic-crochet-kit.com") && !href.startsWith("http://magic-crochet-kit.com")) continue
      const target = resolve(href)
      if (!target) {
        if (
          href !== "/" &&
          !href.startsWith("/products/") &&
          !href.startsWith("/collections/") &&
          !href.startsWith("/blog/") &&
          !href.startsWith("/marques/") &&
          !href.startsWith("/p/") &&
          !href.startsWith("/a-propos") &&
          !href.startsWith("/cgv") &&
          !href.startsWith("/contact") &&
          !href.startsWith("/faq") &&
          !href.startsWith("/livraison") &&
          !href.startsWith("/mentions-legales") &&
          !href.startsWith("/politique-de-confidentialite") &&
          !href.startsWith("/suivi-commande") &&
          !href.startsWith("/wishlist") &&
          !href.startsWith("/cart") &&
          !href.startsWith("/checkout") &&
          !href.startsWith("/account") &&
          !href.startsWith("/search") &&
          !href.startsWith("/#") &&
          !href.startsWith("#") &&
          href !== "https://magic-crochet-kit.com" &&
          href !== "https://magic-crochet-kit.com/"
        ) {
          unresolved.add(href)
        }
        continue
      }
      if (href === target) continue
      const occurrences = after.split(`"${href}"`).length - 1
      after = after.split(`"${href}"`).join(`"${target}"`)
      postReplacements += occurrences
    }

    if (postReplacements > 0) {
      await blogService.updateBlogPosts({ id: post.id, content: after })
      console.log(`  ✓ ${post.handle.padEnd(55)} ${postReplacements} replacement(s)`)
      totalPosts += 1
      totalReplacements += postReplacements
    }
  }

  console.log(`\nDone: ${totalPosts} post(s) updated, ${totalReplacements} URL(s) rewritten.`)

  if (unresolved.size > 0) {
    console.log(`\n⚠ ${unresolved.size} URL(s) could not be resolved (will 404 — review manually):`)
    Array.from(unresolved).sort().forEach((u) => console.log(`   ${u}`))
  }
  console.log()
}
