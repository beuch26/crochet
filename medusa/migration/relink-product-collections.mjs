/**
 * Re-link Medusa products to their Shopify collections.
 *
 * Usage (sur le VPS, le serveur Medusa doit tourner) :
 *   cd /opt/magic-crochet-medusa/migration
 *   TOKEN=$(curl -s -X POST https://api.magic-crochet-kit.com/auth/user/emailpass \
 *     -H 'Content-Type: application/json' \
 *     -d '{"email":"admin@magic-crochet-kit.fr","password":"<pwd>"}' \
 *     | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')
 *   MEDUSA_ADMIN_TOKEN=$TOKEN \
 *     SHOPIFY_ADMIN_TOKEN=shpat_xxx \
 *     node relink-product-collections.mjs
 *
 * Bug fixé : la première exécution de `migrate:shopify ONLY=products` ne passe pas
 * par migrateCollections() donc le `collectionMap` est vide → tous les produits
 * sont créés avec collection_id = null. Ce script corrige a posteriori en
 * récupérant le mapping handle ↔ id depuis l'API Medusa.
 */

const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN
const MEDUSA_TOKEN = process.env.MEDUSA_ADMIN_TOKEN
const SHOPIFY_URL = 'https://crochetbox-2.myshopify.com/admin/api/2024-01/graphql.json'
const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9100'

async function gql(q, vars = {}) {
  const r = await fetch(SHOPIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_TOKEN },
    body: JSON.stringify({ query: q, variables: vars }),
  })
  return (await r.json()).data
}

async function medusa(path, method = 'GET', body) {
  const r = await fetch(MEDUSA_URL + '/admin' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + MEDUSA_TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) throw new Error(r.status + ' ' + (await r.text()))
  return r.json()
}

const collsResp = await medusa('/collections?limit=100&fields=id,handle,metadata')
const handleToId = new Map()
for (const c of collsResp.collections) {
  handleToId.set(c.handle, c.id)
  if (c.metadata?.shopify_handle && c.metadata.shopify_handle !== c.handle) {
    handleToId.set(c.metadata.shopify_handle, c.id)
  }
}
console.log('Medusa collections indexed:', handleToId.size)

let cursor = null
let updated = 0
let skipped = 0
while (true) {
  const data = await gql(
    `query ($c: String) {
      products(first: 50, after: $c) {
        pageInfo { hasNextPage endCursor }
        edges { node { handle collections(first: 5) { edges { node { handle } } } } }
      }
    }`,
    { c: cursor }
  )
  for (const { node } of data.products.edges) {
    const colHandle = node.collections.edges[0]?.node?.handle
    if (!colHandle) {
      skipped++
      continue
    }
    const colId = handleToId.get(colHandle)
    if (!colId) {
      console.log('  ?', node.handle, '-> no Medusa col for handle:', colHandle)
      skipped++
      continue
    }
    const prodResp = await medusa('/products?handle=' + encodeURIComponent(node.handle) + '&fields=id&limit=1')
    const prod = prodResp.products[0]
    if (!prod) {
      skipped++
      continue
    }
    await medusa('/products/' + prod.id, 'POST', { collection_id: colId })
    updated++
  }
  if (!data.products.pageInfo.hasNextPage) break
  cursor = data.products.pageInfo.endCursor
}
console.log('Done. updated:', updated, '/ skipped:', skipped)
