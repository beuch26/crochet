import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Fixes product thumbnails and images URLs.
 * Replaces broken PrestaShop URLs (https://magic-crochet-kit.com/XXX-large_default/...)
 * with local WebP paths (/images/products/XXX-large_default.webp).
 *
 * The WebP files must be placed in frontend/public/images/products/ first.
 */
export default async function fixProductImages({ container }: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT) as any

  console.log("Fixing product image URLs...")

  const products = await productService.listProducts({}, { take: 500, relations: ["images"] })

  let thumbnailsFixed = 0
  let imagesFixed = 0

  for (const product of products) {
    let needsUpdate = false
    const updates: any = {}

    // Fix thumbnail
    if (product.thumbnail && product.thumbnail.includes("magic-crochet-kit.com")) {
      const match = product.thumbnail.match(/\/(\d+)-large_default\//)
      if (match) {
        updates.thumbnail = `/images/products/${match[1]}-large_default.webp`
        needsUpdate = true
        thumbnailsFixed++
      }
    }

    if (needsUpdate) {
      try {
        await productService.updateProducts(product.id, updates)
      } catch (e: any) {
        console.error(`  Failed to update ${product.handle}:`, e.message)
      }
    }

    // Fix images in the image table
    if (product.images) {
      for (const img of product.images) {
        if (img.url && img.url.includes("magic-crochet-kit.com")) {
          const match = img.url.match(/\/(\d+)-large_default/)
          if (match) {
            const newUrl = `/images/products/${match[1]}-large_default.webp`
            try {
              // Direct DB update via the product module
              await productService.updateProducts(product.id, {
                images: product.images.map((i: any) =>
                  i.id === img.id ? { ...i, url: newUrl } : i
                ),
              })
              imagesFixed++
            } catch {}
          }
        }
      }
    }
  }

  console.log(`  Thumbnails fixed: ${thumbnailsFixed}`)
  console.log(`  Images fixed: ${imagesFixed}`)
  console.log("Done!")
}
