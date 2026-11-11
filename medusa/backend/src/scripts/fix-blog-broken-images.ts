import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Fix broken blog images on /blog/meilleur-tire-lait:
 *   - Two Supabase URLs with %C3%A9 (encoded "é") return 400.
 *   - Replace each with the actual product thumbnail and wrap in a link
 *     to the product page so readers can reach the affiliate product.
 */

const REPLACEMENTS: Array<{ oldSrc: string; product: string; thumb: string; alt: string }> = [
  {
    oldSrc: "https://dihvqaqvsppqkfxtaiyj.supabase.co/storage/v1/object/public/featured-images/image-tire-lait-électrique-double-medela-freestyle-1767606980532_980655.webp",
    product: "tire-lait-electrique-double-medela",
    thumb: "https://magic-crochet-kit.com/images/products/731-large_default.webp",
    alt: "Tire-lait électrique double Medela avec coques compactes et écran digital",
  },
  {
    oldSrc: "https://dihvqaqvsppqkfxtaiyj.supabase.co/storage/v1/object/public/featured-images/image-flatlay-élégant-presentant-un-tire-lait-et-s-1767607142587_143073.webp",
    product: "tire-lait-manuel-harmony-flex-medela",
    thumb: "https://magic-crochet-kit.com/images/products/743-large_default.webp",
    alt: "Tire-lait manuel Medela Harmony Flex avec ses accessoires",
  },
]

// Also wrap already-working Medela product images so they become clickable.
const WRAP_LINKS: Array<{ src: string; product: string }> = [
  {
    src: "https://dihvqaqvsppqkfxtaiyj.supabase.co/storage/v1/object/public/featured-images/image-tire-lait-manuel-medela-harmony-pose-sur-une-1767607013400_013554.webp",
    product: "tire-lait-manuel-harmony-flex-medela",
  },
]

export default async function fixBlogImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const res = await pg.raw(`SELECT id, content FROM blog_post WHERE handle = 'meilleur-tire-lait' AND deleted_at IS NULL LIMIT 1`)
  const row = res.rows?.[0]
  if (!row) { logger.warn("Blog post not found"); return }

  let content: string = row.content

  for (const r of REPLACEMENTS) {
    // Find the <img ...src="OLD"...> tag and replace by a linked product image
    const imgRegex = new RegExp(`<img[^>]*src=["']${r.oldSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "gi")
    const replacement = `<a href="/products/${r.product}" aria-label="${r.alt}"><img src="${r.thumb}" alt="${r.alt}" style="height:auto;border-radius:12px;" loading="lazy" /></a>`
    const before = content
    content = content.replace(imgRegex, replacement)
    if (before !== content) logger.info(`  + replaced broken image → /products/${r.product}`)
    else logger.warn(`  ! no match for ${r.oldSrc.substring(0, 80)}`)
  }

  for (const w of WRAP_LINKS) {
    // Only wrap if not already wrapped in an <a>
    const imgRegex = new RegExp(`(?<!<a[^>]*>\\s*)<img([^>]*src=["']${w.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*)>`, "gi")
    const replacement = `<a href="/products/${w.product}"><img$1 style="height:auto;border-radius:12px;cursor:pointer;" /></a>`
    const before = content
    content = content.replace(imgRegex, replacement)
    if (before !== content) logger.info(`  + wrapped image with link → /products/${w.product}`)
  }

  await pg.raw(`UPDATE blog_post SET content = ?, updated_at = NOW() WHERE id = ?`, [content, row.id])
  logger.info("\nBlog post updated.")
}
