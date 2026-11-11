import { ExecArgs } from "@medusajs/framework/types"
import { REDIRECT_MODULE } from "../modules/redirect"
import { Modules } from "@medusajs/framework/utils"

/**
 * Seeds REAL redirections from PrestaShop URLs indexed by Google.
 *
 * PrestaShop URL patterns (confirmed from Google index):
 *
 * Categories:
 *   /casque-anti-bruit-bebe  →  /collections/casque-anti-bruit-bebe
 *   /bebe                    →  /collections/bebe
 *   /pour-maman              →  /collections/pour-maman (already matches)
 *   /coquillage-allaitement  →  /collections/coquillage-allaitement-nacre
 *
 * Products:
 *   /casque-anti-bruit-bebe/alpine-baby-muffy-casque  →  /products/alpine-baby-muffy-casque
 *   /soins-allaitement/creme-lanoline-hpa-lansinoh     →  /products/creme-lanoline-hpa-lansinoh
 *
 * Blog:
 *   /blog/article/slug  →  /blog/slug
 *
 * Other:
 *   /marque/medela  →  /collections (no brand page)
 *   /promotions     →  /collections
 *   /plan-site      →  /sitemap.xml
 */
export default async function seedRedirectsPrestashop({ container }: ExecArgs) {
  const redirectService = container.resolve(REDIRECT_MODULE) as any
  const productService = container.resolve(Modules.PRODUCT) as any

  console.log("Seeding PrestaShop → Medusa redirects (real Google-indexed URLs)...")

  const redirects: { source: string; target: string; note: string }[] = []

  // ========================================
  // 1. CATEGORY PAGES (bare slug → /collections/slug)
  // ========================================
  const categoryMappings: Record<string, string> = {
    // Exact matches (Google-confirmed)
    "casque-anti-bruit-bebe": "casque-anti-bruit-bebe",
    "bebe": "bebe",
    "pour-maman": "pour-maman",
    "bijoux": "bijoux",
    "bola-de-grossesse": "bola-de-grossesse",
    "coquillage-allaitement": "coquillage-allaitement-nacre",
    "coquillage-allaitement-nacre": "coquillage-allaitement-nacre",
    "soins-allaitement": "soins-allaitement",
    "soins-grossesse": "soins-grossesse",
    "tire-lait": "tire-lait",
    "soutien-gorge-allaitement": "soutien-gorge-allaitement",
    "coussinet-allaitement": "coussinet-allaitement",
    "bout-de-sein": "bout-de-sein",
    "conservation-lait-maternel": "conservation-lait-maternel",
    "biberons-tetines": "biberons-tetines",
    "vaisselle-bebe": "vaisselle-bebe",
    "tresse-de-lit-bebe": "tresse-de-lit-bebe",
    "trousse-de-soin-bebe": "trousse-de-soin-bebe",
    "attache-tetine": "attache-tetine",
  }

  for (const [psSlug, medusaSlug] of Object.entries(categoryMappings)) {
    redirects.push({
      source: `/${psSlug}`,
      target: `/collections/${medusaSlug}`,
      note: "PS catégorie → Medusa collection",
    })
  }

  // ========================================
  // 2. PRODUCT PAGES (/category-slug/product-slug → /products/product-slug)
  // ========================================
  const products = await productService.listProducts({}, { take: 200 })
  const categoryKeys = Object.keys(categoryMappings)

  for (const product of products) {
    const handle = product.handle
    // Each product could be under any category prefix
    for (const catSlug of categoryKeys) {
      redirects.push({
        source: `/${catSlug}/${handle}`,
        target: `/products/${handle}`,
        note: "PS catégorie/produit → Medusa produit",
      })
    }
  }

  // ========================================
  // 3. BLOG ARTICLES (/blog/article/slug → /blog/slug)
  // ========================================
  // PrestaShop YBC Blog used /blog/article/slug
  const blogService = container.resolve("blog") as any
  try {
    const posts = await blogService.listBlogPosts({}, { take: 200 })
    for (const post of posts) {
      redirects.push({
        source: `/blog/article/${post.handle}`,
        target: `/blog/${post.handle}`,
        note: "PS blog/article → Medusa blog",
      })
    }
  } catch (e) {
    console.log("  Could not load blog posts:", e)
  }

  // ========================================
  // 4. SPECIAL PAGES
  // ========================================
  const specialRedirects = [
    // Brand pages (don't exist in Medusa)
    { source: "/marque", target: "/collections", note: "PS marques → collections" },
    { source: "/marque/medela", target: "/collections/tire-lait", note: "PS marque Medela" },
    { source: "/marque/lansinoh", target: "/collections/soins-allaitement", note: "PS marque Lansinoh" },
    { source: "/marque/alpine", target: "/collections/casque-anti-bruit-bebe", note: "PS marque Alpine" },

    // Promo page
    { source: "/promotions", target: "/collections", note: "PS promotions" },
    { source: "/promo", target: "/collections", note: "PS promo" },

    // Plan du site
    { source: "/plan-site", target: "/sitemap.xml", note: "PS plan du site" },
    { source: "/plan-du-site", target: "/sitemap.xml", note: "PS plan du site" },

    // Recherche
    { source: "/recherche", target: "/search", note: "PS recherche" },

    // Commandes / Compte
    { source: "/historique-commandes", target: "/account", note: "PS historique" },
    { source: "/mon-compte", target: "/account", note: "PS compte" },
    { source: "/connexion", target: "/account", note: "PS connexion" },
    { source: "/inscription", target: "/account", note: "PS inscription" },
    { source: "/panier", target: "/cart", note: "PS panier" },
    { source: "/commande", target: "/checkout", note: "PS commande" },
    { source: "/nous-contacter", target: "/contact", note: "PS contact" },

    // Legal
    { source: "/content/1-livraison", target: "/livraison", note: "PS livraison" },
    { source: "/content/2-mentions-legales", target: "/mentions-legales", note: "PS mentions" },
    { source: "/content/3-conditions-generales-de-vente", target: "/cgv", note: "PS CGV" },

    // Coquillage variant slug
    { source: "/coquillage-allaitement/coquillages-allaitement-bebe-nacre", target: "/products/coquillages-allaitement-nacre-yemma-shell", note: "PS coquillage nacre bébé" },
  ]
  redirects.push(...specialRedirects)

  // ========================================
  // INSERT ALL (skip existing)
  // ========================================
  const seen = new Set<string>()
  const unique = redirects.filter(r => {
    if (seen.has(r.source)) return false
    seen.add(r.source)
    return true
  })

  console.log(`  ${unique.length} redirections à créer...`)

  let created = 0
  let skipped = 0
  for (const r of unique) {
    try {
      const existing = await redirectService.listRedirects({ source: r.source }, { take: 1 })
      if (existing.length > 0) { skipped++; continue }
      await redirectService.createRedirects({
        source: r.source,
        target: r.target,
        status_code: 301,
        is_active: true,
        hit_count: 0,
        note: r.note,
      })
      created++
    } catch { skipped++ }
  }

  console.log(`  ${created} créées, ${skipped} ignorées (doublons)`)
  console.log("Done!")
}
