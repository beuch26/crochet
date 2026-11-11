/**
 * Download + WebP convert all images for vetements-allaitement products.
 * Output: public/images/products/vertbaudet/vetements/{groupId}/{color-slug}/{N}.webp
 */
import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const data = JSON.parse(readFileSync('vetements-data.json', 'utf8'))
const ROOT = path.resolve('public/images/products/vertbaudet/vetements')

function slugify(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

let totalOk = 0, totalSkip = 0, totalFail = 0

for (const [collection, products] of Object.entries(data)) {
  console.log(`\n=== ${collection} (${products.length} products) ===`)
  for (const product of products) {
    const groupId = product.groupId
    // Group variants by color, dedupe images
    const colorImages = new Map() // color slug -> Set of image URLs
    for (const v of product.variants) {
      const colorSlug = slugify(v.color || 'default')
      if (!colorImages.has(colorSlug)) colorImages.set(colorSlug, new Set())
      v.images.forEach((u) => {
        const cleanUrl = u.split('?')[0]
        colorImages.get(colorSlug).add(cleanUrl)
      })
    }

    const dir = path.join(ROOT, groupId)
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })

    for (const [colorSlug, urls] of colorImages) {
      const arr = Array.from(urls)
      for (let i = 0; i < arr.length; i++) {
        const url = arr[i]
        const filename = `${colorSlug}-${i + 1}.webp`
        const outPath = path.join(dir, filename)
        if (existsSync(outPath)) { totalSkip++; continue }
        try {
          const res = await fetch(url)
          if (!res.ok) { console.error(`  x ${groupId}/${filename}: ${res.status}`); totalFail++; continue }
          const buf = Buffer.from(await res.arrayBuffer())
          await sharp(buf).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(outPath)
          totalOk++
          if (totalOk % 20 === 0) console.log(`  ${totalOk} downloaded so far...`)
        } catch (e) {
          console.error(`  x ${groupId}/${filename}: ${e.message}`)
          totalFail++
        }
      }
    }
  }
}

console.log(`\n\nDone: ${totalOk} downloaded, ${totalSkip} skipped, ${totalFail} failed`)
