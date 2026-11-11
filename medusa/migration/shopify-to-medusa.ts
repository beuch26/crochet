/**
 * Script de migration Shopify -> Medusa.js
 *
 * Usage:
 *   npm install
 *   cp .env.example .env  # puis remplir
 *   npm run migrate:shopify
 *
 * Variables d'environnement requises (.env) :
 *   SHOPIFY_SHOP_DOMAIN     ex: crochetbox-2.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN     shpat_xxxxx (Admin API access token)
 *   SHOPIFY_API_VERSION     ex: 2024-01 (par défaut)
 *   MEDUSA_URL              ex: http://localhost:9000
 *   MEDUSA_ADMIN_TOKEN      JWT admin (obtenu via `npx medusa user`)
 *
 * Variables d'environnement optionnelles :
 *   DRY_RUN=1               n'écrit rien dans Medusa, log seulement
 *   ONLY=collections|products|pages|customers|orders|redirects   limiter à une étape
 *   PRODUCT_LIMIT=10        limiter le nombre de produits (test)
 *
 * Idempotence : skip basé sur le `handle` Shopify (qui devient le handle Medusa).
 * Si une création échoue avec "handle already exists", l'entité est considérée
 * déjà migrée et l'erreur est silenciée.
 */

import 'dotenv/config'

const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN!
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01'
const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9000'
const MEDUSA_ADMIN_TOKEN = process.env.MEDUSA_ADMIN_TOKEN || ''

const DRY_RUN = process.env.DRY_RUN === '1'
const ONLY = process.env.ONLY?.split(',').map((s: string) => s.trim()) || []
const PRODUCT_LIMIT = process.env.PRODUCT_LIMIT ? parseInt(process.env.PRODUCT_LIMIT) : Infinity

const SHOPIFY_ENDPOINT = `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`

// ============================================================
// Shopify Admin GraphQL Client (avec gestion rate limit)
// ============================================================

async function shopify<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(SHOPIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (res.status === 429) {
      const wait = 2000 * (attempt + 1)
      console.log(`  [rate-limit] backoff ${wait}ms`)
      await sleep(wait)
      continue
    }
    if (!res.ok) {
      throw new Error(`Shopify ${res.status}: ${await res.text()}`)
    }

    const json = await res.json()
    if (json.errors) {
      throw new Error(`Shopify GraphQL: ${JSON.stringify(json.errors)}`)
    }
    return json.data as T
  }
  throw new Error('Shopify: trop de retries après rate-limit')
}

// ============================================================
// Medusa Admin API Client
// ============================================================

async function medusaAdmin<T = any>(endpoint: string, method = 'GET', body?: any): Promise<T> {
  if (DRY_RUN && method !== 'GET') {
    console.log(`  [dry-run] ${method} ${endpoint}`)
    return {} as T
  }

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
    const err: any = new Error(`Medusa ${res.status} ${endpoint}: ${error}`)
    err.status = res.status
    err.body = error
    throw err
  }

  return res.json()
}

function isDuplicateHandleError(err: any): boolean {
  if (!err) return false
  const msg = String(err.body || err.message || '').toLowerCase()
  return (
    err.status === 409 ||
    msg.includes('handle') && (msg.includes('exist') || msg.includes('unique') || msg.includes('duplicate'))
  )
}

// ============================================================
// Migration: Collections
// ============================================================

const COLLECTIONS_QUERY = `
  query Collections($cursor: String) {
    collections(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          descriptionHtml
          image { url altText }
          seo { title description }
        }
      }
    }
  }
`

async function migrateCollections(): Promise<Map<string, string>> {
  console.log('\n--- Collections Shopify -> Medusa ---')
  const map = new Map<string, string>() // shopify_handle -> medusa_collection_id

  let cursor: string | null = null
  let created = 0
  let skipped = 0
  let failed = 0

  while (true) {
    const data: any = await shopify(COLLECTIONS_QUERY, { cursor })

    for (const { node } of data.collections.edges) {
      try {
        const result: any = await medusaAdmin('/collections', 'POST', {
          title: node.title,
          handle: node.handle,
          metadata: {
            shopify_id: node.id,
            shopify_handle: node.handle,
            description_html: node.descriptionHtml || '',
            image_url: node.image?.url || null,
            seo_title: node.seo?.title || '',
            seo_description: node.seo?.description || '',
          },
        })

        if (!DRY_RUN && result.collection?.id) {
          map.set(node.handle, result.collection.id)
        }
        created++
        console.log(`  + ${node.title}`)
      } catch (err: any) {
        if (isDuplicateHandleError(err)) {
          // Récupérer l'id existant pour le mapping
          try {
            const existing: any = await medusaAdmin(`/collections?handle=${encodeURIComponent(node.handle)}&limit=1`)
            const found = existing.collections?.[0]
            if (found) map.set(node.handle, found.id)
          } catch { /* ignore */ }
          skipped++
          console.log(`  = ${node.title} (déjà existant)`)
        } else {
          failed++
          console.log(`  ! ${node.title}: ${err.message}`)
        }
      }
    }

    if (!data.collections.pageInfo.hasNextPage) break
    cursor = data.collections.pageInfo.endCursor
  }

  console.log(`  => ${created} créées, ${skipped} skippées, ${failed} erreurs`)
  return map
}

// ============================================================
// Migration: Products + Variants + Images + Metafields
// ============================================================

const PRODUCTS_QUERY = `
  query Products($cursor: String) {
    products(first: 25, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          descriptionHtml
          vendor
          productType
          status
          tags
          seo { title description }
          options { name values }
          variants(first: 100) {
            edges {
              node {
                id
                sku
                title
                price
                compareAtPrice
                selectedOptions { name value }
                image { url }
                inventoryQuantity
                inventoryItem {
                  measurement {
                    weight { value unit }
                  }
                }
              }
            }
          }
          images(first: 50) {
            edges { node { url altText } }
          }
          metafields(first: 100) {
            edges {
              node { namespace key value type }
            }
          }
          collections(first: 20) {
            edges { node { handle } }
          }
        }
      }
    }
  }
`

async function migrateProducts(collectionMap: Map<string, string>) {
  console.log('\n--- Produits Shopify -> Medusa ---')

  let cursor: string | null = null
  let created = 0
  let skipped = 0
  let failed = 0

  outer: while (true) {
    const data: any = await shopify(PRODUCTS_QUERY, { cursor })

    for (const { node } of data.products.edges) {
      if (created + skipped + failed >= PRODUCT_LIMIT) break outer

      try {
        const metafields = node.metafields.edges.reduce((acc: Record<string, any>, { node: m }: any) => {
          acc[`${m.namespace}__${m.key}`] = m.value
          return acc
        }, {})

        const variants = node.variants.edges.map(({ node: v }: any) => {
          const optionsMap: Record<string, string> = {}
          for (const opt of v.selectedOptions) optionsMap[opt.name] = opt.value

          const weightInfo = v.inventoryItem?.measurement?.weight
          const weightGrams = weightInfo
            ? Math.round(toGrams(weightInfo.value, weightInfo.unit))
            : undefined

          return {
            title: v.title,
            sku: v.sku || undefined,
            manage_inventory: true,
            // Medusa v2: inventory_quantity is set separately via /admin/inventory-items;
            // we keep the Shopify quantity in metadata for a later sync step.
            prices: [
              {
                amount: Math.round(parseFloat(v.price) * 100),
                currency_code: 'eur',
              },
            ],
            options: optionsMap,
            weight: weightGrams,
            metadata: {
              shopify_id: v.id,
              shopify_image_url: v.image?.url || null,
              shopify_inventory_quantity: v.inventoryQuantity ?? 0,
            },
          }
        })

        const options = node.options.map((o: any) => ({ title: o.name, values: o.values }))

        const collectionId =
          node.collections.edges.length > 0
            ? collectionMap.get(node.collections.edges[0].node.handle)
            : undefined

        // Images : direct dans le payload via {url}, plus simple que upload séparé
        const images = node.images.edges.map(({ node: i }: any) => ({ url: i.url }))

        // Medusa v2 expects `tags` to be an array of existing tag IDs, not new tag values.
        // We keep the raw Shopify tags in metadata.shopify_tags so the storefront can
        // still display them (or a follow-up script can seed them as Medusa tags).
        await medusaAdmin('/products', 'POST', {
          title: node.title,
          handle: node.handle,
          description: node.descriptionHtml || '',
          status: node.status === 'ACTIVE' ? 'published' : 'draft',
          collection_id: collectionId,
          options,
          variants,
          images,
          metadata: {
            shopify_id: node.id,
            shopify_handle: node.handle,
            shopify_tags: node.tags || [],
            vendor: node.vendor,
            product_type: node.productType,
            seo_title: node.seo?.title || '',
            seo_description: node.seo?.description || '',
            ...metafields,
          },
        })

        created++
        console.log(`  + ${node.title} (${variants.length} variantes, ${images.length} images)`)
      } catch (err: any) {
        if (isDuplicateHandleError(err)) {
          skipped++
          console.log(`  = ${node.title} (déjà existant)`)
        } else {
          failed++
          console.log(`  ! ${node.handle}: ${err.message}`)
        }
      }
    }

    if (!data.products.pageInfo.hasNextPage) break
    cursor = data.products.pageInfo.endCursor
  }

  console.log(`  => ${created} créés, ${skipped} skippés, ${failed} erreurs`)
}

// ============================================================
// Migration: Pages CMS
// ============================================================

const PAGES_QUERY = `
  query Pages($cursor: String) {
    pages(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          body
          isPublished
        }
      }
    }
  }
`

async function migratePages() {
  console.log('\n--- Pages CMS Shopify -> Medusa ---')

  let cursor: string | null = null
  let created = 0
  let skipped = 0
  let failed = 0

  while (true) {
    const data: any = await shopify(PAGES_QUERY, { cursor })

    for (const { node } of data.pages.edges) {
      try {
        await medusaAdmin('/pages', 'POST', {
          title: node.title,
          handle: node.handle,
          content: node.body || '',
          is_published: node.isPublished,
        })

        created++
        console.log(`  + ${node.title}`)
      } catch (err: any) {
        if (isDuplicateHandleError(err)) {
          skipped++
          console.log(`  = ${node.title} (déjà existante)`)
        } else {
          failed++
          console.log(`  ! ${node.handle}: ${err.message}`)
        }
      }
    }

    if (!data.pages.pageInfo.hasNextPage) break
    cursor = data.pages.pageInfo.endCursor
  }

  console.log(`  => ${created} créées, ${skipped} skippées, ${failed} erreurs`)
}

// ============================================================
// Migration: Customers
// ============================================================

const CUSTOMERS_QUERY = `
  query Customers($cursor: String) {
    customers(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          email
          firstName
          lastName
          phone
          state
          tags
          createdAt
          defaultAddress {
            address1
            address2
            city
            province
            country
            zip
            phone
            company
          }
        }
      }
    }
  }
`

async function migrateCustomers() {
  console.log('\n--- Clients Shopify -> Medusa ---')
  console.log('  (note: les hashes de mot de passe Shopify ne sont pas portables —')
  console.log('   les clients devront utiliser "mot de passe oublié" à leur première connexion)')

  let cursor: string | null = null
  let created = 0
  let skipped = 0
  let failed = 0

  while (true) {
    const data: any = await shopify(CUSTOMERS_QUERY, { cursor })

    for (const { node } of data.customers.edges) {
      try {
        const addresses = node.defaultAddress
          ? [{
              first_name: node.firstName || '',
              last_name: node.lastName || '',
              address_1: node.defaultAddress.address1 || '',
              address_2: node.defaultAddress.address2 || '',
              city: node.defaultAddress.city || '',
              province: node.defaultAddress.province || '',
              country_code: node.defaultAddress.country?.toLowerCase()?.slice(0, 2) || 'fr',
              postal_code: node.defaultAddress.zip || '',
              phone: node.defaultAddress.phone || node.phone || '',
              company: node.defaultAddress.company || '',
            }]
          : []

        await medusaAdmin('/customers', 'POST', {
          email: node.email,
          first_name: node.firstName || '',
          last_name: node.lastName || '',
          phone: node.phone || '',
          addresses,
          metadata: {
            shopify_id: node.id,
            shopify_state: node.state,
            shopify_tags: node.tags || [],
            imported_at: new Date().toISOString(),
          },
        })

        created++
        console.log(`  + ${node.email}`)
      } catch (err: any) {
        const msg = String(err.body || err.message || '').toLowerCase()
        if (msg.includes('email') && (msg.includes('exist') || msg.includes('unique'))) {
          skipped++
          console.log(`  = ${node.email} (déjà existant)`)
        } else {
          failed++
          console.log(`  ! ${node.email}: ${err.message}`)
        }
      }
    }

    if (!data.customers.pageInfo.hasNextPage) break
    cursor = data.customers.pageInfo.endCursor
  }

  console.log(`  => ${created} créés, ${skipped} skippés, ${failed} erreurs`)
}

// ============================================================
// Migration: Orders (mode "historique")
// ============================================================

const ORDERS_QUERY = `
  query Orders($cursor: String) {
    orders(first: 25, after: $cursor, sortKey: PROCESSED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          name
          processedAt
          displayFinancialStatus
          displayFulfillmentStatus
          totalPriceSet { shopMoney { amount currencyCode } }
          customer { email }
          shippingAddress { firstName lastName address1 city province country zip phone }
          lineItems(first: 50) {
            edges {
              node {
                title
                quantity
                sku
                originalUnitPriceSet { shopMoney { amount currencyCode } }
              }
            }
          }
        }
      }
    }
  }
`

async function migrateOrders() {
  console.log('\n--- Commandes Shopify -> Medusa (archivage en metadata) ---')
  console.log('  (note: les commandes Shopify sont stockées en mode "historique"')
  console.log('   sur les fiches client/produit via metadata — pas dans le tunnel order Medusa)')

  // Stratégie : on stocke les commandes Shopify sous forme de JSON en metadata
  // sur la customer correspondante. Pas de tentative de recréer un order
  // Medusa complet (workflow_payment/fulfillment trop complexe et inutile
  // pour des commandes déjà payées et expédiées).

  let cursor: string | null = null
  let processed = 0
  let failed = 0
  const customerOrders = new Map<string, any[]>() // email -> [shopify orders]

  while (true) {
    const data: any = await shopify(ORDERS_QUERY, { cursor })

    for (const { node } of data.orders.edges) {
      try {
        const email = node.customer?.email?.toLowerCase()
        if (!email) continue

        const orderSummary = {
          shopify_id: node.id,
          shopify_name: node.name,
          processed_at: node.processedAt,
          financial_status: node.displayFinancialStatus,
          fulfillment_status: node.displayFulfillmentStatus,
          total: parseFloat(node.totalPriceSet?.shopMoney?.amount || '0'),
          currency: node.totalPriceSet?.shopMoney?.currencyCode || 'EUR',
          shipping_address: node.shippingAddress || null,
          line_items: node.lineItems.edges.map(({ node: li }: any) => ({
            title: li.title,
            quantity: li.quantity,
            sku: li.sku,
            unit_price: parseFloat(li.originalUnitPriceSet?.shopMoney?.amount || '0'),
          })),
        }

        const arr = customerOrders.get(email) || []
        arr.push(orderSummary)
        customerOrders.set(email, arr)

        processed++
      } catch (err: any) {
        failed++
        console.log(`  ! ${node.name}: ${err.message}`)
      }
    }

    if (!data.orders.pageInfo.hasNextPage) break
    cursor = data.orders.pageInfo.endCursor
  }

  console.log(`  ${processed} commandes traitées (${customerOrders.size} clients)`)

  // Patch metadata sur chaque customer
  let patched = 0
  for (const [email, orders] of customerOrders) {
    try {
      const res: any = await medusaAdmin(`/customers?email=${encodeURIComponent(email)}&limit=1`)
      const customer = res.customers?.[0]
      if (!customer) {
        console.log(`  ? customer introuvable: ${email}`)
        continue
      }
      await medusaAdmin(`/customers/${customer.id}`, 'POST', {
        metadata: {
          ...customer.metadata,
          shopify_orders: orders,
          shopify_orders_count: orders.length,
          shopify_orders_total: orders.reduce((sum, o) => sum + o.total, 0),
        },
      })
      patched++
    } catch (err: any) {
      console.log(`  ! patch ${email}: ${err.message}`)
    }
  }

  console.log(`  => ${patched} clients enrichis avec leur historique Shopify, ${failed} erreurs`)
}

// ============================================================
// Migration: Redirects 301 (anciennes URLs Shopify → nouvelles)
// ============================================================

async function migrateRedirects(_collectionMap: Map<string, string>) {
  console.log('\n--- Redirections 301 Shopify -> Medusa ---')

  // Stratégie : on construit les redirects depuis les handles produits / collections / pages.
  // Pattern Shopify : /products/<handle>, /collections/<handle>, /pages/<handle>
  // Pattern Astro/Medusa cible : /p/<handle>, /collections/<handle>, /<handle>

  let created = 0
  let skipped = 0
  let failed = 0

  // 1) Redirects produits
  let cursor: string | null = null
  while (true) {
    const data: any = await shopify(
      `query($cursor:String){ products(first:100, after:$cursor){ pageInfo{hasNextPage endCursor} edges{node{handle}} } }`,
      { cursor }
    )
    for (const { node } of data.products.edges) {
      try {
        await medusaAdmin('/redirects', 'POST', {
          source: `/products/${node.handle}`,
          target: `/p/${node.handle}`,
          status_code: 301,
          note: 'Shopify -> Medusa migration',
        })
        created++
      } catch (err: any) {
        if (isDuplicateHandleError(err) || String(err.body || '').toLowerCase().includes('source')) {
          skipped++
        } else {
          failed++
          console.log(`  ! /products/${node.handle}: ${err.message}`)
        }
      }
    }
    if (!data.products.pageInfo.hasNextPage) break
    cursor = data.products.pageInfo.endCursor
  }

  // 2) Redirects pages
  cursor = null
  while (true) {
    const data: any = await shopify(
      `query($cursor:String){ pages(first:100, after:$cursor){ pageInfo{hasNextPage endCursor} edges{node{handle}} } }`,
      { cursor }
    )
    for (const { node } of data.pages.edges) {
      try {
        await medusaAdmin('/redirects', 'POST', {
          source: `/pages/${node.handle}`,
          target: `/${node.handle}`,
          status_code: 301,
          note: 'Shopify -> Medusa migration',
        })
        created++
      } catch (err: any) {
        if (isDuplicateHandleError(err) || String(err.body || '').toLowerCase().includes('source')) {
          skipped++
        } else { failed++ }
      }
    }
    if (!data.pages.pageInfo.hasNextPage) break
    cursor = data.pages.pageInfo.endCursor
  }

  console.log(`  => ${created} redirects créés, ${skipped} skippés, ${failed} erreurs`)
}

// ============================================================
// Helpers
// ============================================================

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function toGrams(weight: number, unit: string): number {
  switch ((unit || '').toUpperCase()) {
    case 'KILOGRAMS':
    case 'KG': return weight * 1000
    case 'POUNDS':
    case 'LB': return weight * 453.592
    case 'OUNCES':
    case 'OZ': return weight * 28.3495
    case 'GRAMS':
    case 'G':
    default: return weight
  }
}

function shouldRun(step: string): boolean {
  return ONLY.length === 0 || ONLY.includes(step)
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('=== Migration Shopify -> Medusa ===')
  console.log(`Shopify: ${SHOPIFY_SHOP_DOMAIN} (API ${SHOPIFY_API_VERSION})`)
  console.log(`Medusa : ${MEDUSA_URL}`)
  if (DRY_RUN) console.log('Mode   : DRY-RUN (aucune écriture)')
  if (ONLY.length > 0) console.log(`Étapes : ${ONLY.join(', ')}`)
  if (PRODUCT_LIMIT !== Infinity) console.log(`Limite : ${PRODUCT_LIMIT} produits max`)

  if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
    console.error('Erreur: configurez SHOPIFY_SHOP_DOMAIN et SHOPIFY_ADMIN_TOKEN dans .env')
    process.exit(1)
  }
  if (!DRY_RUN && !MEDUSA_ADMIN_TOKEN) {
    console.error('Erreur: configurez MEDUSA_ADMIN_TOKEN dans .env (ou utilisez DRY_RUN=1)')
    process.exit(1)
  }

  let collectionMap = new Map<string, string>()

  if (shouldRun('collections')) {
    collectionMap = await migrateCollections()
  }
  if (shouldRun('products')) {
    await migrateProducts(collectionMap)
  }
  if (shouldRun('pages')) {
    await migratePages()
  }
  if (shouldRun('customers')) {
    await migrateCustomers()
  }
  if (shouldRun('orders')) {
    await migrateOrders()
  }
  if (shouldRun('redirects')) {
    await migrateRedirects(collectionMap)
  }

  console.log('\n=== Migration terminée ===')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
