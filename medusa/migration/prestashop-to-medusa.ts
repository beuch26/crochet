/**
 * Script de migration PrestaShop + Blog -> Medusa.js
 *
 * Usage:
 *   npm install && npm run migrate
 *
 * Migre :
 *   - 18 catégories -> Medusa collections
 *   - 75 produits actifs -> Medusa products
 *   - 47 articles de blog -> Medusa blog module custom
 */

import 'dotenv/config'

const PRESTASHOP_URL = process.env.PRESTASHOP_URL!
const PRESTASHOP_KEY = process.env.PRESTASHOP_KEY!
const BLOG_API_URL = process.env.BLOG_API_URL!
const BLOG_API_KEY = process.env.BLOG_API_KEY!
const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9000'
const MEDUSA_ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN || ''

// ============================================================
// PrestaShop API Client
// ============================================================

async function psGet<T>(resource: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${PRESTASHOP_URL}/${resource}`)
  url.searchParams.set('output_format', 'JSON')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${Buffer.from(`${PRESTASHOP_KEY}:`).toString('base64')}`,
    },
  })

  if (!res.ok) throw new Error(`PrestaShop API ${res.status}: ${resource}`)
  return res.json()
}

// ============================================================
// Blog API Client
// ============================================================

async function blogGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(BLOG_API_URL)
  url.searchParams.set('action', action)
  url.searchParams.set('api_key', BLOG_API_KEY)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Blog API ${res.status}: ${action}`)
  return res.json()
}

// ============================================================
// Medusa Admin API Client
// ============================================================

async function medusaAdmin<T = any>(endpoint: string, method = 'GET', body?: any): Promise<T> {
  const res = await fetch(`${MEDUSA_URL}/admin${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEDUSA_ADMIN_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Medusa ${res.status} ${endpoint}: ${error}`)
  }

  return res.json()
}

// ============================================================
// Migration: Categories -> Collections
// ============================================================

async function migrateCategories(): Promise<Map<number, string>> {
  console.log('\n--- Catégories -> Collections Medusa ---')

  const data = await psGet<any>('categories', {
    display: '[id,name,link_rewrite,active,level_depth,id_parent]',
    'filter[active]': '1',
    'filter[level_depth]': '[2,99]',
    language: '2',
  })

  const categories = data.categories || []
  console.log(`  ${categories.length} catégories trouvées`)

  const categoryMap = new Map<number, string>() // ps_id -> medusa_collection_id

  for (const cat of categories) {
    try {
      const result = await medusaAdmin('/collections', 'POST', {
        title: cat.name,
        handle: cat.link_rewrite,
      })
      categoryMap.set(parseInt(cat.id), result.collection.id)
      console.log(`  + ${cat.name}`)
    } catch (err: any) {
      console.log(`  ! ${cat.name}: ${err.message}`)
    }
  }

  return categoryMap
}

// ============================================================
// Migration: Products
// ============================================================

async function migrateProducts(categoryMap: Map<number, string>) {
  console.log('\n--- Produits -> Medusa ---')

  const data = await psGet<any>('products', {
    display: 'full',
    'filter[active]': '1',
    language: '2',
  })

  const products = data.products || []
  console.log(`  ${products.length} produits actifs`)

  let success = 0
  let failed = 0

  for (const product of products) {
    try {
      const name = extractLangValue(product.name)
      const handle = extractLangValue(product.link_rewrite)
      const description = extractLangValue(product.description) || ''
      const shortDesc = extractLangValue(product.description_short) || ''
      const metaTitle = extractLangValue(product.meta_title) || ''
      const metaDesc = extractLangValue(product.meta_description) || ''
      const price = Math.round(parseFloat(product.price) * 100)

      const collectionId = categoryMap.get(parseInt(product.id_category_default))

      const result = await medusaAdmin('/products', 'POST', {
        title: name,
        handle,
        subtitle: shortDesc.replace(/<[^>]*>/g, '').substring(0, 255),
        description,
        status: 'published',
        collection_id: collectionId || undefined,
        metadata: {
          ps_id: product.id,
          meta_title: metaTitle,
          meta_description: metaDesc,
        },
        options: [{ title: 'Default', values: ['Default'] }],
        variants: [
          {
            title: 'Default',
            prices: [{ amount: price, currency_code: 'eur' }],
            options: { Default: 'Default' },
            manage_inventory: true,
          },
        ],
      })

      // Upload image si disponible
      if (product.id_default_image) {
        try {
          const imageUrl = `${PRESTASHOP_URL}/images/products/${product.id}/${product.id_default_image}`
          const imgRes = await fetch(imageUrl, {
            headers: {
              Authorization: `Basic ${Buffer.from(`${PRESTASHOP_KEY}:`).toString('base64')}`,
            },
          })
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            const formData = new FormData()
            formData.append('files', blob, `${handle}.jpg`)
            await fetch(`${MEDUSA_URL}/admin/products/${result.product.id}/images`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${MEDUSA_ADMIN_TOKEN}` },
              body: formData,
            })
          }
        } catch {
          // Image upload optionnel
        }
      }

      success++
      console.log(`  + ${name} (${(price / 100).toFixed(2)}€)`)
    } catch (err: any) {
      failed++
      console.log(`  ! Produit ${product.id}: ${err.message}`)
    }
  }

  console.log(`  => ${success} importés, ${failed} erreurs`)
}

// ============================================================
// Migration: Blog Posts via API
// ============================================================

async function migrateBlog() {
  console.log('\n--- Articles de blog -> Medusa Blog Module ---')

  // Récupérer les catégories blog
  const catData = await blogGet<any>('categories')
  const blogCategories = catData.categories || []
  const catMap = new Map<number, string>()
  for (const cat of blogCategories) {
    catMap.set(cat.id_category, cat.title)
  }
  console.log(`  ${blogCategories.length} catégories blog: ${blogCategories.map((c: any) => c.title).join(', ')}`)

  // Récupérer tous les articles (paginer)
  let allPosts: any[] = []
  let page = 1
  while (true) {
    const data = await blogGet<any>('list', { page: String(page) })
    allPosts = allPosts.concat(data.posts || [])
    if (page >= data.pages) break
    page++
  }
  console.log(`  ${allPosts.length} articles récupérés`)

  let success = 0
  let failed = 0

  for (const post of allPosts) {
    try {
      // Récupérer le contenu complet
      const fullPost = await blogGet<any>('get', { id: String(post.id_post) })

      const categoryName = catMap.get(parseInt(post.id_category_default)) || ''

      await medusaAdmin('/blog/posts', 'POST', {
        title: fullPost.title,
        handle: fullPost.url_alias,
        content: fullPost.description || '',
        excerpt: stripHtml(fullPost.short_description || '').substring(0, 500),
        featured_image: fullPost.image || null,
        author: 'Geniuz',
        published_at: fullPost.datetime_added,
        is_published: fullPost.enabled === '1',
        seo_title: fullPost.meta_title || fullPost.title,
        seo_description: fullPost.meta_description || '',
        tags: fullPost.tags ? (Array.isArray(fullPost.tags) ? fullPost.tags : [fullPost.tags]) : [],
        category: categoryName,
      })

      success++
      console.log(`  + ${fullPost.title}`)
    } catch (err: any) {
      failed++
      console.log(`  ! Article ${post.id_post}: ${err.message}`)
    }
  }

  console.log(`  => ${success} importés, ${failed} erreurs`)
}

// ============================================================
// Helpers
// ============================================================

function extractLangValue(field: any): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  // PrestaShop multi-lang: {language: [{attrs: {id: "1"}, value: "..."}, {attrs: {id: "2"}, value: "..."}]}
  if (field.language) {
    const langs = Array.isArray(field.language) ? field.language : [field.language]
    // Préférer français (id=2), sinon premier disponible
    const fr = langs.find((l: any) => l['@attributes']?.id === '2' || l.attrs?.id === '2' || l.id === '2')
    return fr?.value || fr?.['#text'] || fr || langs[0]?.value || langs[0]?.['#text'] || String(field)
  }
  return String(field)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('=== Migration PrestaShop -> Medusa.js ===')
  console.log(`PrestaShop: ${PRESTASHOP_URL}`)
  console.log(`Blog API: ${BLOG_API_URL}`)
  console.log(`Medusa: ${MEDUSA_URL}`)

  if (!PRESTASHOP_KEY || !BLOG_API_KEY) {
    console.error('Configurez PRESTASHOP_KEY et BLOG_API_KEY dans .env')
    process.exit(1)
  }

  if (!MEDUSA_ADMIN_TOKEN) {
    console.error('Configurez MEDUSA_ADMIN_TOKEN dans .env (npx medusa user -e admin@geniuz.fr -p <password>)')
    process.exit(1)
  }

  const categoryMap = await migrateCategories()
  await migrateProducts(categoryMap)
  await migrateBlog()

  console.log('\n=== Migration terminée ===')
}

main().catch(console.error)
