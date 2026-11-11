import { ExecArgs } from "@medusajs/framework/types"
import { REDIRECT_MODULE } from "../modules/redirect"
import { Modules } from "@medusajs/framework/utils"

/**
 * Seeds redirections from PrestaShop URLs to Medusa URLs.
 *
 * PrestaShop URL patterns for magic-crochet-kit.com:
 * - Categories: /fr/XX-category-name or /XX-category-name
 * - Products: /fr/category/XX-product-name.html or /product-name.html
 * - Blog: /blog/article-slug (YBC Blog module)
 * - Static: /content/XX-page-name
 *
 * Also handles:
 * - /fr/ prefix (PrestaShop multilang)
 * - .html suffix
 * - /module/ybc_blog/blog?id_post=XX
 */
export default async function seedRedirects({ container }: ExecArgs) {
  const redirectService = container.resolve(REDIRECT_MODULE) as any
  const productService = container.resolve(Modules.PRODUCT) as any

  console.log("Seeding PrestaShop → Medusa redirects...")

  // Check how many already exist
  const existing = await redirectService.listRedirects({}, { take: 1 })
  if (existing.length > 0) {
    console.log("  Redirections deja presentes. Skipping.")
    return
  }

  const redirects: { source: string; target: string; note: string }[] = []

  // ========================================
  // 1. STATIC PAGES
  // ========================================
  const staticRedirects = [
    // Homepage variants
    { source: "/fr/", target: "/", note: "PrestaShop FR homepage" },
    { source: "/fr/accueil", target: "/", note: "PrestaShop accueil" },
    { source: "/index.php", target: "/", note: "PrestaShop index" },

    // Legal/info pages
    { source: "/fr/content/1-livraison", target: "/livraison", note: "PS livraison" },
    { source: "/fr/content/2-mentions-legales", target: "/mentions-legales", note: "PS mentions" },
    { source: "/fr/content/3-conditions-generales-de-vente", target: "/cgv", note: "PS CGV" },
    { source: "/content/1-livraison", target: "/livraison", note: "PS livraison" },
    { source: "/content/2-mentions-legales", target: "/mentions-legales", note: "PS mentions" },
    { source: "/content/3-conditions-generales-de-vente", target: "/cgv", note: "PS CGV" },
    { source: "/fr/nous-contacter", target: "/contact", note: "PS contact" },
    { source: "/nous-contacter", target: "/contact", note: "PS contact" },
    { source: "/contactez-nous", target: "/contact", note: "PS contact" },

    // Account
    { source: "/fr/mon-compte", target: "/account", note: "PS account" },
    { source: "/mon-compte", target: "/account", note: "PS account" },
    { source: "/fr/connexion", target: "/account", note: "PS login" },
    { source: "/connexion", target: "/account", note: "PS login" },
    { source: "/fr/panier", target: "/cart", note: "PS cart" },
    { source: "/panier", target: "/cart", note: "PS cart" },
    { source: "/fr/commande", target: "/checkout", note: "PS checkout" },

    // Blog index
    { source: "/fr/blog", target: "/blog", note: "PS blog" },
    { source: "/module/ybc_blog/blog", target: "/blog", note: "PS blog module" },
  ]
  redirects.push(...staticRedirects)

  // ========================================
  // 2. COLLECTION / CATEGORY REDIRECTS
  // ========================================
  // PrestaShop categories often have numeric prefix: /fr/XX-nom-categorie
  const categoryMappings: Record<string, string> = {
    "tire-lait": "tire-lait",
    "coquillage-allaitement": "coquillage-allaitement-nacre",
    "coquillages-allaitement-nacre": "coquillage-allaitement-nacre",
    "soins-allaitement": "soins-allaitement",
    "soins-grossesse": "soins-grossesse",
    "casque-anti-bruit-bebe": "casque-anti-bruit-bebe",
    "casques-anti-bruit-bebe": "casque-anti-bruit-bebe",
    "bola-de-grossesse": "bola-de-grossesse",
    "bijoux": "bijoux",
    "bola-grossesse": "bola-de-grossesse",
    "bout-de-sein": "bout-de-sein",
    "bouts-de-sein": "bout-de-sein",
    "coussinet-allaitement": "coussinet-allaitement",
    "coussinets-allaitement": "coussinet-allaitement",
    "soutien-gorge-allaitement": "soutien-gorge-allaitement",
    "soutiens-gorge-allaitement": "soutien-gorge-allaitement",
    "conservation-lait-maternel": "conservation-lait-maternel",
    "biberons-tetines": "biberons-tetines",
    "vaisselle-bebe": "vaisselle-bebe",
    "tresse-de-lit-bebe": "tresse-de-lit-bebe",
    "trousse-de-soin-bebe": "trousse-de-soin-bebe",
    "attache-tetine": "attache-tetine",
    "bebe": "bebe",
    "maman": "pour-maman",
    "pour-maman": "pour-maman",
  }

  for (const [psSlug, medusaSlug] of Object.entries(categoryMappings)) {
    // Without /fr/ prefix
    redirects.push({ source: `/${psSlug}`, target: `/collections/${medusaSlug}`, note: "PS category" })
    // With /fr/ prefix
    redirects.push({ source: `/fr/${psSlug}`, target: `/collections/${medusaSlug}`, note: "PS category FR" })
    // With numeric prefix (common PS pattern: /XX-slug)
    for (let i = 1; i <= 50; i++) {
      redirects.push({ source: `/${i}-${psSlug}`, target: `/collections/${medusaSlug}`, note: "PS category ID" })
      redirects.push({ source: `/fr/${i}-${psSlug}`, target: `/collections/${medusaSlug}`, note: "PS category FR ID" })
    }
  }

  // ========================================
  // 3. PRODUCT REDIRECTS
  // ========================================
  // Get all products to create mappings
  try {
    const products = await productService.listProducts({}, { take: 200 })
    for (const product of products) {
      const handle = product.handle
      // Common PS patterns:
      // /fr/category/XX-product-slug.html
      // /product-slug.html
      // /fr/XX-product-slug.html
      redirects.push({ source: `/${handle}.html`, target: `/products/${handle}`, note: "PS product .html" })
      redirects.push({ source: `/fr/${handle}.html`, target: `/products/${handle}`, note: "PS product FR .html" })
      // With numeric prefix
      for (let i = 1; i <= 100; i++) {
        redirects.push({ source: `/${i}-${handle}.html`, target: `/products/${handle}`, note: "PS product ID" })
        redirects.push({ source: `/fr/${i}-${handle}.html`, target: `/products/${handle}`, note: "PS product FR ID" })
      }
    }
  } catch (e) {
    console.error("  Failed to load products for redirect mapping:", e)
  }

  // ========================================
  // 4. BLOG REDIRECTS
  // ========================================
  // YBC Blog module: /blog/article-slug (usually same slugs)
  // Already handled since blog handles should be the same

  // ========================================
  // INSERT ALL
  // ========================================
  console.log(`  Preparing ${redirects.length} redirections...`)

  // Deduplicate by source
  const seen = new Set<string>()
  const unique = redirects.filter(r => {
    if (seen.has(r.source)) return false
    seen.add(r.source)
    return true
  })

  console.log(`  ${unique.length} unique redirections after dedup`)

  // Batch insert
  let created = 0
  for (const r of unique) {
    try {
      await redirectService.createRedirects({
        source: r.source,
        target: r.target,
        status_code: 301,
        is_active: true,
        hit_count: 0,
        note: r.note,
      })
      created++
    } catch {}
  }

  console.log(`  Created ${created} redirections`)
  console.log("Done!")
}
