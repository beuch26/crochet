/**
 * Parse Vertbaudet CSV — extract accessoires bebe for existing empty collections.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const CSV_PATH = 'C:/Users/Matthieu/Desktop/products_405179772.csv'
const OUT_JSON = 'accessoires-data.json'
const MAX_PER_COLLECTION = 15

const RULES = [
  { handle: 'tresse-de-lit-bebe', regex: /\b(tour de lit|tresse de lit|bordure de lit)\b/i },
  { handle: 'trousse-de-soin-bebe', regex: /\b(trousse de soin|thermometre|coupe.ongles|mouche.bebe|serum physiologique)\b/i },
  { handle: 'vaisselle-bebe', regex: /\b(vaisselle|assiette b[eé]b[eé]|bol b[eé]b[eé]|coffret repas|set repas b[eé]b[eé])\b/i },
  { handle: 'biberons-tetines', regex: /\b(biberon|t[eé]tine silicone|t[eé]tine naturelle|t[eé]tine natural|chauffe.biberon|st[eé]rilisateur)\b/i },
  { handle: 'bola-de-grossesse', regex: /\b(bola de grossesse|bola grossesse)\b/i },
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
      out.push(cur); cur = ''
    } else cur += c
  }
  out.push(cur)
  return out
}

console.log('Reading CSV...')
const raw = readFileSync(CSV_PATH, 'utf8')
const lines = raw.split('\n')
const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, ''))

const idx = (n) => headers.indexOf(n)
const COL = {
  brand: idx('brand'), color: idx('color'), size: idx('size'),
  title: idx('title'), description: idx('description'), price: idx('price'),
  image_link: idx('image_link'),
  add1: idx('additional_image_link'), add2: idx('additional_image_link2'),
  add3: idx('additional_image_link3'), add4: idx('additional_image_link4'),
  link: idx('link'), id: idx('id'), item_group_id: idx('item_group_id'), gtin: idx('gtin'),
}

const groups = new Map()

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line.trim()) continue
  const cells = parseCSVLine(line).map((c) => c.replace(/^"|"$/g, ''))

  const title = cells[COL.title]
  if (!title) continue

  const groupId = cells[COL.item_group_id]
  if (!groupId) continue

  const imgs = [cells[COL.image_link], cells[COL.add1], cells[COL.add2], cells[COL.add3], cells[COL.add4]]
    .filter((u) => u && u.startsWith('http'))

  const variant = {
    sku: cells[COL.id], color: cells[COL.color] || '', size: cells[COL.size] || '',
    price: parseFloat(cells[COL.price]) || 0, gtin: cells[COL.gtin] || '',
    images: imgs, link: cells[COL.link] || '',
  }

  if (!groups.has(groupId)) {
    groups.set(groupId, {
      groupId, title, brand: cells[COL.brand] || '',
      description: cells[COL.description] || '', variants: [],
    })
  }
  groups.get(groupId).variants.push(variant)
}

console.log(`${groups.size} products grouped`)

const buckets = {}
for (const rule of RULES) buckets[rule.handle] = []
for (const p of groups.values()) {
  for (const rule of RULES) {
    if (rule.regex.test(p.title)) { buckets[rule.handle].push(p); break }
  }
}

function score(p) {
  const allImgs = new Set()
  for (const v of p.variants) v.images.forEach((u) => allImgs.add(u))
  return p.variants.length + Math.min(allImgs.size, 5) + (p.description.length > 100 ? 2 : 0) + (p.brand && p.brand !== 'Vertbaudet' ? 1 : 0)
}

const selected = {}
for (const [h, items] of Object.entries(buckets)) {
  selected[h] = items.sort((a, b) => score(b) - score(a)).slice(0, MAX_PER_COLLECTION)
  console.log(`  ${h}: ${items.length} candidates → ${selected[h].length} selected`)
}

writeFileSync(OUT_JSON, JSON.stringify(selected, null, 2))
console.log(`Output: ${OUT_JSON}`)
