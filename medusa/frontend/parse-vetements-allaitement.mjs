/**
 * Parse Vertbaudet feed and extract top 15 products per sub-collection
 * for "Vêtements de grossesse > Allaitement". Outputs JSON file.
 *
 * Run: node parse-vetements-allaitement.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const CSV_PATH = 'C:/Users/Matthieu/Desktop/products_405179772.csv'
const OUT_JSON = 'vetements-data.json'
const MAX_PER_COLLECTION = 15

// Sub-collection rules based on title keywords
const SUBCOL_RULES = [
  { handle: 'robe-allaitement', regex: /\brobe\b/i },
  { handle: 'tunique-allaitement', regex: /\b(tunique|chemisier|blouse)\b/i },
  { handle: 'pyjama-allaitement', regex: /\b(pyjama|nuisette|chemise de nuit|homewear)\b/i },
  { handle: 'pull-allaitement', regex: /\b(pull|gilet|sweat|cardigan)\b/i },
  { handle: 't-shirt-allaitement', regex: /\b(t-shirt|tee-shirt|tee shirt|teeshirt|t shirt|debardeur|débardeur|top)\b/i },
  { handle: 'salopette-allaitement', regex: /\b(salopette|combinaison)\b/i },
  { handle: 'maillot-bain-allaitement', regex: /\b(maillot|bikini|tankini)\b/i },
  { handle: 'pantalon-allaitement', regex: /\b(pantalon|legging|jean)\b/i },
]

function parseCSVLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (c === ';' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}

console.log('Reading CSV...')
const raw = readFileSync(CSV_PATH, 'utf8')
const lines = raw.split('\n')
const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, ''))

// Find column indices we need
const colIdx = (name) => headers.indexOf(name)
const COL = {
  category: colIdx('category'),
  category2: colIdx('category_level2'),
  category3: colIdx('category_level3'),
  brand: colIdx('brand'),
  color: colIdx('color'),
  size: colIdx('size'),
  title: colIdx('title'),
  description: colIdx('description'),
  price: colIdx('price'),
  image_link: colIdx('image_link'),
  add1: colIdx('additional_image_link'),
  add2: colIdx('additional_image_link2'),
  add3: colIdx('additional_image_link3'),
  add4: colIdx('additional_image_link4'),
  link: colIdx('link'),
  id: colIdx('id'),
  item_group_id: colIdx('item_group_id'),
  gtin: colIdx('gtin'),
  material: colIdx('material'),
}

console.log('Parsing rows...')
// Group rows by item_group_id
const groups = new Map() // item_group_id -> { title, brand, ..., variants: [{color, size, price, gtin, images, link}] }

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line.trim()) continue
  const cells = parseCSVLine(line).map((c) => c.replace(/^"|"$/g, ''))

  const cat1 = cells[COL.category]
  const cat2 = cells[COL.category2]
  if (cat1 !== 'Vêtements de grossesse' || cat2 !== 'Allaitement') continue

  const groupId = cells[COL.item_group_id]
  if (!groupId) continue

  const title = cells[COL.title]
  const desc = cells[COL.description] || ''
  const imgs = [
    cells[COL.image_link],
    cells[COL.add1],
    cells[COL.add2],
    cells[COL.add3],
    cells[COL.add4],
  ].filter((u) => u && u.startsWith('http'))
  const variant = {
    sku: cells[COL.id],
    color: cells[COL.color] || '',
    size: cells[COL.size] || '',
    price: parseFloat(cells[COL.price]) || 0,
    gtin: cells[COL.gtin] || '',
    images: imgs,
    link: cells[COL.link] || '',
  }

  if (!groups.has(groupId)) {
    groups.set(groupId, {
      groupId,
      title,
      brand: cells[COL.brand] || '',
      description: desc,
      material: cells[COL.material] || '',
      variants: [],
    })
  }
  groups.get(groupId).variants.push(variant)
}

console.log(`Total products grouped: ${groups.size}`)

// Categorize each product into a sub-collection
function getSubCollection(title) {
  const lower = title.toLowerCase()
  for (const rule of SUBCOL_RULES) {
    if (rule.regex.test(lower)) return rule.handle
  }
  return null
}

const buckets = {}
for (const rule of SUBCOL_RULES) buckets[rule.handle] = []
for (const product of groups.values()) {
  const subcol = getSubCollection(product.title)
  if (!subcol) continue
  buckets[subcol].push(product)
}

console.log('\nProducts per sub-collection:')
for (const [handle, items] of Object.entries(buckets)) {
  console.log(`  ${handle}: ${items.length} candidates`)
}

// Score and pick top N: prefer products with most unique images and most variants
function scoreProduct(p) {
  const allImages = new Set()
  for (const v of p.variants) v.images.forEach((u) => allImages.add(u))
  const variantsScore = Math.min(p.variants.length, 6) // cap at 6
  const imagesScore = Math.min(allImages.size, 5)
  const descBonus = p.description.length > 100 ? 1 : 0
  const brandBonus = p.brand && p.brand !== 'Vertbaudet' ? 1 : 0
  return variantsScore * 2 + imagesScore + descBonus + brandBonus
}

const selected = {}
for (const [handle, items] of Object.entries(buckets)) {
  const sorted = items.sort((a, b) => scoreProduct(b) - scoreProduct(a))
  selected[handle] = sorted.slice(0, MAX_PER_COLLECTION)
}

console.log('\nTop 15 per sub-collection selected.')
console.log('Total products to import:', Object.values(selected).reduce((s, arr) => s + arr.length, 0))

// Write output
writeFileSync(OUT_JSON, JSON.stringify(selected, null, 2))
console.log(`\nOutput: ${OUT_JSON}`)
