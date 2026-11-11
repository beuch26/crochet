/**
 * Setup shipping options Medusa pour Magic Crochet Kit.
 *
 * Crée :
 * - Un fulfillment set "MCK Shipping" (type: shipping)
 * - Une service zone "France" qui couvre FR
 * - 3 shipping options :
 *   - Colissimo standard : 4,90 €
 *   - Colissimo express : 7,90 €
 *   - Livraison gratuite : 0 € (avec règle "panier > 50 €")
 *
 * Usage sur le VPS :
 *   TOKEN=$(curl ... auth/emailpass ... | jq -r .token)
 *   MEDUSA_ADMIN_TOKEN=$TOKEN node setup-shipping.mjs
 */

const MEDUSA_TOKEN = process.env.MEDUSA_ADMIN_TOKEN
const MEDUSA_URL = process.env.MEDUSA_URL || 'http://localhost:9100'

async function api(path, method = 'GET', body) {
  const r = await fetch(MEDUSA_URL + '/admin' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + MEDUSA_TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${await r.text()}`)
  return r.json()
}

// 1. Stock location with fulfillment_sets included
const slListResp = await api('/stock-locations?limit=1')
const stockLocationId = slListResp.stock_locations[0].id
const slResp = await api(`/stock-locations/${stockLocationId}?fields=id,name,fulfillment_sets.id,fulfillment_sets.name,fulfillment_sets.type,fulfillment_sets.service_zones.id,fulfillment_sets.service_zones.name`)
const stockLocation = slResp.stock_location
console.log(`Stock location: ${stockLocation.id}, fulfillment_sets: ${stockLocation.fulfillment_sets?.length || 0}`)

// 2. Get the manual fulfillment provider id (already linked to stock location)
const fpResp = await api('/fulfillment-providers?limit=10')
const manual = fpResp.fulfillment_providers.find(p => p.id.includes('manual'))
console.log(`Fulfillment provider: ${manual.id}`)

// 3. Get the default shipping profile
const spResp = await api('/shipping-profiles?limit=5')
const shippingProfile = spResp.shipping_profiles.find(p => p.type === 'default') || spResp.shipping_profiles[0]
console.log(`Shipping profile: ${shippingProfile.id}`)

// 4. Create or get fulfillment set
let fulfillmentSet = stockLocation.fulfillment_sets?.find(fs => fs.name === 'MCK France Shipping')
if (!fulfillmentSet) {
  const created = await api(`/stock-locations/${stockLocation.id}/fulfillment-sets`, 'POST', {
    name: 'MCK France Shipping',
    type: 'shipping',
  })
  // Re-fetch
  const refresh = await api(`/stock-locations/${stockLocation.id}?fields=fulfillment_sets.id,fulfillment_sets.name,fulfillment_sets.service_zones.id,fulfillment_sets.service_zones.name`)
  fulfillmentSet = refresh.stock_location.fulfillment_sets.find(fs => fs.name === 'MCK France Shipping')
  console.log(`+ Created fulfillment set: ${fulfillmentSet.id}`)
} else {
  console.log(`= Existing fulfillment set: ${fulfillmentSet.id}`)
}

// 5. Create or get the service zone for France
let serviceZone = fulfillmentSet.service_zones?.find(sz => sz.name === 'France')
if (!serviceZone) {
  await api(`/fulfillment-sets/${fulfillmentSet.id}/service-zones`, 'POST', {
    name: 'France',
    geo_zones: [{ type: 'country', country_code: 'fr' }],
  })
  // Re-fetch
  const refresh = await api(`/stock-locations/${stockLocation.id}?fields=fulfillment_sets.id,fulfillment_sets.service_zones.id,fulfillment_sets.service_zones.name`)
  const fs = refresh.stock_location.fulfillment_sets.find(fs => fs.id === fulfillmentSet.id)
  serviceZone = fs.service_zones.find(sz => sz.name === 'France')
  console.log(`+ Created service zone: ${serviceZone.id}`)
} else {
  console.log(`= Existing service zone: ${serviceZone.id}`)
}

// 6. Create the 3 shipping options
const options = [
  {
    name: 'Livraison standard (Colissimo)',
    price_type: 'flat',
    amount: 4.9,
    rules: [], // no rules = always applies
  },
  {
    name: 'Livraison express (Colissimo)',
    price_type: 'flat',
    amount: 7.9,
    rules: [],
  },
  {
    name: 'Livraison gratuite (dès 50€)',
    price_type: 'flat',
    amount: 0,
    rules: [
      { attribute: 'item_total', operator: 'gte', value: '50' },
    ],
  },
]

for (const opt of options) {
  try {
    const resp = await api('/shipping-options', 'POST', {
      name: opt.name,
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      provider_id: manual.id,
      type: { label: 'Standard', description: opt.name, code: 'manual' },
      price_type: opt.price_type,
      prices: [
        { currency_code: 'eur', amount: opt.amount },
      ],
      rules: opt.rules,
    })
    console.log(`+ Shipping option: ${opt.name} (${(opt.amount/100).toFixed(2)} €) ${resp.shipping_option?.id}`)
  } catch (e) {
    if (String(e).includes('unique') || String(e).includes('exist')) {
      console.log(`= Skipped (exists): ${opt.name}`)
    } else {
      console.log(`! ${opt.name}: ${e.message}`)
    }
  }
}

console.log('\nDone.')
