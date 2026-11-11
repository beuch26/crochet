/**
 * Migrate product images from PrestaShop to Medusa
 *
 * This script scrapes product pages on geniuz.fr to find all image IDs,
 * then pushes them to Medusa via the admin API.
 *
 * Usage: node migrate-images.mjs
 *
 * Environment variables:
 *   MEDUSA_URL - Medusa backend URL (default: http://localhost:9000)
 *   MEDUSA_ADMIN_EMAIL - Admin email
 *   MEDUSA_ADMIN_PASSWORD - Admin password
 */

const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9000'
const PS_BASE = 'https://geniuz.fr'

// Get admin auth token
async function getAdminToken() {
  const email = process.env.MEDUSA_ADMIN_EMAIL || 'admin@medusa-test.com'
  const password = process.env.MEDUSA_ADMIN_PASSWORD || 'supersecret'

  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const { token } = await res.json()
  return token
}

// Get all products from Medusa
async function getProducts(token) {
  const res = await fetch(`${MEDUSA_URL}/admin/products?limit=200`, {
    headers: { 'Authorization': `Bearer ${token}` },
  })
  const { products } = await res.json()
  return products
}

// Scrape image URLs from PrestaShop product page
async function scrapeImages(handle, collectionHandle) {
  // Try to find the product page on PrestaShop
  const urls = [
    `${PS_BASE}/${collectionHandle}/${handle}`,
    `${PS_BASE}/${handle}`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'follow' })
      if (!res.ok) continue

      const html = await res.text()

      // Extract unique image IDs from large_default URLs
      const matches = html.match(/\/(\d+)-large_default\//g) || []
      const ids = [...new Set(matches.map(m => m.match(/\/(\d+)-/)[1]))]

      if (ids.length === 0) continue

      // Build image URLs (use large_default format)
      const slug = handle.replace(/[^a-z0-9-]/g, '')
      const images = ids.map(id => `${PS_BASE}/${id}-large_default/${slug}.jpg`)

      return images
    } catch (e) {
      continue
    }
  }

  return []
}

// Update product images in Medusa
async function updateProductImages(token, productId, imageUrls) {
  const res = await fetch(`${MEDUSA_URL}/admin/products/${productId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: imageUrls.map(url => ({ url })),
    }),
  })

  return res.ok
}

// Main
async function main() {
  console.log('=== Migrate Product Images from PrestaShop ===\n')

  const token = await getAdminToken()
  console.log('Authenticated with Medusa admin\n')

  const products = await getProducts(token)
  console.log(`Found ${products.length} products in Medusa\n`)

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

    const collectionHandle = product.collection?.handle || ''
    const images = await scrapeImages(product.handle, collectionHandle)

    if (images.length === 0) {
      console.log(`  - ${product.handle} (no images found on PS)`)
      failed++
      continue
    }

    const success = await updateProductImages(token, product.id, images)
    if (success) {
      console.log(`  + ${product.handle} (${images.length} images)`)
      updated++
    } else {
      console.log(`  ! ${product.handle} (update failed)`)
      failed++
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`)
}

main().catch(console.error)
