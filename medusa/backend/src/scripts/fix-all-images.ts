import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Fix ALL remaining product images that still point to magic-crochet-kit.com.
 * Uses direct SQL since the Medusa product module's updateProducts
 * doesn't reliably update the image table.
 */
export default async function fixAllImages({ container }: ExecArgs) {
  const pgConnection = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  console.log("Fixing ALL product images pointing to magic-crochet-kit.com...")

  // Fix image table
  const imageResult = await pgConnection.raw(`
    UPDATE image
    SET url = '/images/products/' || (regexp_match(url, '/(\\d+)-large_default'))[1] || '-large_default.webp'
    WHERE url LIKE '%magic-crochet-kit.com%'
    AND url ~ '\\d+-large_default'
    AND deleted_at IS NULL
  `)
  console.log("  Images fixed:", imageResult.rowCount || imageResult[0]?.rowCount || "done")

  // Fix product thumbnails (double check)
  const thumbResult = await pgConnection.raw(`
    UPDATE product
    SET thumbnail = '/images/products/' || (regexp_match(thumbnail, '/(\\d+)-large_default'))[1] || '-large_default.webp'
    WHERE thumbnail LIKE '%magic-crochet-kit.com%'
    AND thumbnail ~ '\\d+-large_default'
    AND deleted_at IS NULL
  `)
  console.log("  Thumbnails fixed:", thumbResult.rowCount || thumbResult[0]?.rowCount || "done")

  // Verify
  const remaining = await pgConnection.raw(`
    SELECT count(*) as cnt FROM image WHERE url LIKE '%magic-crochet-kit.com%' AND deleted_at IS NULL
  `)
  const remainingThumb = await pgConnection.raw(`
    SELECT count(*) as cnt FROM product WHERE thumbnail LIKE '%magic-crochet-kit.com%' AND deleted_at IS NULL
  `)

  const imgCount = remaining.rows?.[0]?.cnt || remaining[0]?.[0]?.cnt || "?"
  const thumbCount = remainingThumb.rows?.[0]?.cnt || remainingThumb[0]?.[0]?.cnt || "?"

  console.log("  Remaining broken images:", imgCount)
  console.log("  Remaining broken thumbnails:", thumbCount)
  console.log("Done!")
}
