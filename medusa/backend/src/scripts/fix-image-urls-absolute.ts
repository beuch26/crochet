import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Convert relative image URLs to absolute URLs so they display
 * correctly in both the frontend (magic-crochet-kit.com) and admin (api-hetzner).
 *
 * /images/products/XXX.webp → https://magic-crochet-kit.com/images/products/XXX.webp
 */
export default async function fixImageUrlsAbsolute({ container }: ExecArgs) {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
  const DOMAIN = "https://magic-crochet-kit.com"

  console.log("Converting relative image URLs to absolute...")

  // Fix product thumbnails
  const thumbResult = await pg.raw(`
    UPDATE product
    SET thumbnail = '${DOMAIN}' || thumbnail
    WHERE thumbnail LIKE '/images/%'
    AND thumbnail NOT LIKE 'http%'
    AND deleted_at IS NULL
  `)
  console.log("  Thumbnails:", thumbResult.rowCount ?? "done")

  // Fix image table
  const imgResult = await pg.raw(`
    UPDATE image
    SET url = '${DOMAIN}' || url
    WHERE url LIKE '/images/%'
    AND url NOT LIKE 'http%'
    AND deleted_at IS NULL
  `)
  console.log("  Images:", imgResult.rowCount ?? "done")

  console.log("Done!")
}
