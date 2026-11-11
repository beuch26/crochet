/**
 * Migrate product images from PrestaShop to Medusa
 *
 * Run: npx medusa exec src/scripts/migrate-product-images.ts
 *
 * This script scrapes magic-crochet-kit.com product pages to find all product images,
 * then updates each product in Medusa with the found images.
 */

import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const PS_BASE = "https://magic-crochet-kit.com"

async function scrapeProductImages(handle: string, collectionHandle: string): Promise<string[]> {
  const urls = [
    `${PS_BASE}/${collectionHandle}/${handle}`,
    `${PS_BASE}/${handle}`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: "follow" })
      if (!res.ok) continue

      const html = await res.text()

      // Extract unique image IDs from large_default URLs
      const matches = html.match(/\/(\d+)-large_default\//g) || []
      const ids = [...new Set(matches.map((m: string) => {
        const match = m.match(/\/(\d+)-/)
        return match ? match[1] : null
      }).filter(Boolean))] as string[]

      if (ids.length === 0) continue

      // Build image URLs using large_default format
      return ids.map(id => `${PS_BASE}/${id}-large_default/${handle}.jpg`)
    } catch {
      continue
    }
  }

  return []
}

export default async function migrateProductImages({ container }: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT)

  console.log("=== Migrating product images from PrestaShop ===\n")

  const products = await productService.listProducts(
    {},
    { take: 200, relations: ["images", "collection"] }
  )

  console.log(`Found ${products.length} products\n`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const product of products) {
    // Skip if already has images
    if (product.images && product.images.length > 0) {
      console.log(`  = ${product.handle} (already has ${product.images.length} images)`)
      skipped++
      continue
    }

    const collectionHandle = (product as any).collection?.handle || ""
    const images = await scrapeProductImages(product.handle, collectionHandle)

    if (images.length === 0) {
      console.log(`  - ${product.handle} (no images found)`)
      failed++
      continue
    }

    try {
      await productService.updateProducts(product.id, {
        images: images.map(url => ({ url })),
      })
      console.log(`  + ${product.handle} (${images.length} images)`)
      updated++
    } catch (e: any) {
      console.log(`  ! ${product.handle} (error: ${e.message})`)
      failed++
    }

    // Rate limit to not hammer PrestaShop
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`)
}
