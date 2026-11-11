import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const data = JSON.parse(readFileSync('accessoires-data.json', 'utf8'))
const ROOT = path.resolve('public/images/products/vertbaudet/accessoires')

function slugify(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

let ok = 0, skip = 0, fail = 0

for (const [col, products] of Object.entries(data)) {
  console.log(`\n=== ${col} (${products.length}) ===`)
  for (const product of products) {
    const groupId = product.groupId
    const colorImgs = new Map()
    for (const v of product.variants) {
      const cs = slugify(v.color || 'default')
      if (!colorImgs.has(cs)) colorImgs.set(cs, new Set())
      v.images.forEach((u) => colorImgs.get(cs).add(u.split('?')[0]))
    }
    const dir = path.join(ROOT, groupId)
    if (!existsSync(dir)) await mkdir(dir, { recursive: true })

    for (const [cs, urls] of colorImgs) {
      const arr = Array.from(urls)
      for (let i = 0; i < arr.length; i++) {
        const filename = `${cs}-${i + 1}.webp`
        const outPath = path.join(dir, filename)
        if (existsSync(outPath)) { skip++; continue }
        try {
          const res = await fetch(arr[i])
          if (!res.ok) { fail++; continue }
          const buf = Buffer.from(await res.arrayBuffer())
          await sharp(buf).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(outPath)
          ok++
          if (ok % 20 === 0) console.log(`  ${ok} done...`)
        } catch (e) { fail++; console.error(`  x ${filename}: ${e.message}`) }
      }
    }
  }
}
console.log(`\nDone: ${ok} ok, ${skip} skipped, ${fail} failed`)
