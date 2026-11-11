/**
 * Final sweep across every HTML field in the DB to rewrite:
 *   - Accented internal hrefs (`/collections/casque-anti-bruit-bébé` →
 *     `/collections/casque-anti-bruit-bebe/`)
 *   - PrestaShop legacy paths (`/casque-anti-bruit-bébé` → `/collections/...`)
 *   - The `moms-shells` typo (real handle is `mom-s-shells`)
 *
 * Scans: product.description, product_collection.metadata (intro_text +
 * seo_text), page.content. blog_post.content was already done by v1/v2/v3.
 *
 * Idempotent. Skips external URLs (anything not on `magic-crochet-kit.com`).
 *
 * Run: npx medusa exec src/scripts/rewrite-non-ascii-urls-everywhere.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { PAGE_MODULE } from "../modules/page"

function deaccent(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
}

function stripDomain(url: string): string {
  return url.replace(/^https?:\/\/geniuz\.fr/, "")
}

type Resolver = (rawHref: string) => string | null

function makeResolver(
  collectionHandles: Set<string>,
  productHandles: Set<string>,
  blogHandles: Set<string>
): Resolver {
  const COLLECTION_ALIAS: Record<string, string> = {
    "coquille-allaitement": "coquillage-allaitement-nacre",
    "coquillage-allaitement": "coquillage-allaitement-nacre",
    "coussinet-d-allaitement": "coussinet-allaitement",
  }

  return (rawHref) => {
    // Skip external (anything not on our domain or starting with /)
    if (!rawHref) return null
    if (!rawHref.startsWith("/") && !rawHref.startsWith("https://magic-crochet-kit.com") && !rawHref.startsWith("http://magic-crochet-kit.com")) return null

    const path = stripDomain(rawHref)
    const m = path.match(/^([^?#]*)([?#].*)?$/)
    const cleanPath = m ? m[1] : path
    const tail = m && m[2] ? m[2] : ""
    const noTrail = cleanPath.replace(/\/+$/, "")
    if (!noTrail) return null

    const segs = noTrail.split("/").filter(Boolean).map((s) => deaccent(s).toLowerCase())
    if (segs.length === 0) return null

    // /blog/<slug> — make sure deaccented + trailing slash
    if (segs[0] === "blog") {
      if (segs.length === 1) return `/blog/${tail}`
      const slug = segs.slice(1).join("/")
      if (slug.startsWith("article/")) {
        const realSlug = slug.replace(/^article\//, "")
        if (blogHandles.has(realSlug)) return `/blog/${realSlug}/${tail}`
        return null
      }
      // already /blog/X — just deaccent + trailing slash
      if (blogHandles.has(segs[segs.length - 1])) return `/blog/${segs[segs.length - 1]}/${tail}`
      return null
    }

    // /products/<slug>
    if (segs[0] === "products" && segs[1]) {
      const slug = segs[segs.length - 1]
      if (productHandles.has(slug)) return `/products/${slug}/${tail}`
      return null
    }

    // /collections/<slug>
    if (segs[0] === "collections" && segs[1]) {
      const slug = COLLECTION_ALIAS[segs[1]] || segs[1]
      if (collectionHandles.has(slug)) return `/collections/${slug}/${tail}`
      return null
    }

    // /marques/<brand>
    if (segs[0] === "marques" && segs[1]) {
      // Handle moms-shells typo
      const fixed = segs[1] === "moms-shells" ? "mom-s-shells" : segs[1]
      return `/marques/${fixed}/${tail}`
    }
    if (segs[0] === "fournisseur" && segs[1]) {
      return `/marques/${segs[1]}/${tail}`
    }

    // /<collection-handle>/<product-handle> (PrestaShop layout)
    if (segs.length >= 2) {
      const productSlug = segs[segs.length - 1]
      if (productHandles.has(productSlug)) return `/products/${productSlug}/${tail}`
    }

    // /<collection-handle>
    const colSlug = COLLECTION_ALIAS[segs[0]] || segs[0]
    if (collectionHandles.has(colSlug)) return `/collections/${colSlug}/${tail}`

    return null
  }
}

function rewriteHrefs(html: string, resolve: Resolver): { html: string; count: number } {
  if (!html || !html.includes('href="')) return { html, count: 0 }
  let result = html
  let total = 0
  const hrefs = Array.from(new Set(Array.from(html.matchAll(/href="([^"]+)"/g)).map((m) => m[1])))
  for (const href of hrefs) {
    const target = resolve(href)
    if (!target || target === href) continue
    const occurrences = result.split(`"${href}"`).length - 1
    result = result.split(`"${href}"`).join(`"${target}"`)
    total += occurrences
  }
  return { html: result, count: total }
}

export default async function rewrite({ container }: ExecArgs) {
  const productSvc: any = container.resolve(Modules.PRODUCT)
  const pageSvc: any = container.resolve(PAGE_MODULE)

  console.log("\n=== Sweeping every HTML field for legacy/accented URLs ===\n")

  // ---- Reference data ----
  const [collections, products] = await Promise.all([
    productSvc.listProductCollections({}, { take: 1000 }),
    productSvc.listProducts({}, { take: 1000, select: ["id", "handle", "description"] }),
  ])
  // blog handles are needed by the resolver — load them via raw SQL to
  // stay independent of the BLOG module API.
  const { Client } = await import("pg")
  const dbUrl = process.env.DATABASE_URL!
  const pg = new Client({ connectionString: dbUrl })
  await pg.connect()
  const blogRows = (await pg.query("SELECT handle FROM blog_post WHERE deleted_at IS NULL")).rows
  await pg.end()

  const collectionHandles = new Set<string>(collections.map((c: any) => c.handle))
  const productHandles = new Set<string>(products.map((p: any) => p.handle))
  const blogHandles = new Set<string>(blogRows.map((r: any) => r.handle))

  console.log(`  loaded: ${collectionHandles.size} cols, ${productHandles.size} products, ${blogHandles.size} blog posts\n`)

  const resolve = makeResolver(collectionHandles, productHandles, blogHandles)

  // ---- Product descriptions ----
  console.log("Products:")
  let prodTotal = 0
  let prodPosts = 0
  for (const p of products) {
    if (!p.description || !p.description.includes('href="')) continue
    const { html, count } = rewriteHrefs(p.description, resolve)
    // Also fix the moms-shells typo (non-href occurrences)
    let after = html.replace(/moms-shells/g, "mom-s-shells")
    const typoFixes = (html.match(/moms-shells/g) || []).length
    if (count > 0 || typoFixes > 0 || after !== html) {
      await productSvc.updateProducts({ id: p.id, description: after })
      const totalChanges = count + typoFixes
      console.log(`  ✓ ${p.handle.padEnd(55)} ${totalChanges} change(s)`)
      prodTotal += totalChanges
      prodPosts += 1
    }
  }
  console.log(`  → ${prodPosts} products updated, ${prodTotal} change(s)\n`)

  // ---- Collection metadata (intro_text + seo_text) ----
  console.log("Collections:")
  let colTotal = 0
  let colPosts = 0
  for (const c of collections) {
    const meta: any = c.metadata || {}
    let changed = false
    let totalChanges = 0
    const newMeta = { ...meta }
    for (const field of ["intro_text", "seo_text"]) {
      if (typeof newMeta[field] === "string" && newMeta[field].includes('href="')) {
        const { html, count } = rewriteHrefs(newMeta[field], resolve)
        if (count > 0) {
          newMeta[field] = html
          changed = true
          totalChanges += count
        }
      }
    }
    if (changed) {
      await productSvc.updateProductCollections({ id: c.id, metadata: newMeta })
      console.log(`  ✓ ${c.handle.padEnd(55)} ${totalChanges} change(s)`)
      colPosts += 1
      colTotal += totalChanges
    }
  }
  console.log(`  → ${colPosts} collections updated, ${colTotal} change(s)\n`)

  // ---- Custom CMS pages ----
  console.log("Pages:")
  const pages = await pageSvc.listPages({})
  let pageTotal = 0
  let pageCount = 0
  for (const p of pages) {
    if (!p.content || !p.content.includes('href="')) continue
    const { html, count } = rewriteHrefs(p.content, resolve)
    if (count > 0) {
      await pageSvc.updatePages({ id: p.id, content: html })
      console.log(`  ✓ ${p.handle.padEnd(55)} ${count} change(s)`)
      pageCount += 1
      pageTotal += count
    }
  }
  console.log(`  → ${pageCount} pages updated, ${pageTotal} change(s)\n`)

  console.log(`Total: ${prodTotal + colTotal + pageTotal} change(s) across ${prodPosts + colPosts + pageCount} entities.\n`)
}
