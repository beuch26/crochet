import { getProducts, getProductPrice } from '../lib/medusa'

/**
 * Google Merchant Center product feed (RSS 2.0 with g: namespace).
 * Exposes only stock products (excludes affiliate products per GMC rules).
 * Generates one <item> per variant with item_group_id for color grouping.
 *
 * Register in Google Merchant Center:
 *   https://magic-crochet-kit.com/feed-google-merchant.xml
 */

const SITE = 'https://magic-crochet-kit.com'

function xmlEscape(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string): string {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Map collection handle → Google taxonomy category
const CATEGORY_MAP: Record<string, string> = {
  'casque-anti-bruit-bebe': 'Baby & Toddler > Baby Safety > Baby Safety Ear Muffs',
  'tire-lait': 'Baby & Toddler > Nursing & Feeding > Baby Bottle Nursers',
  'coquillage-allaitement-nacre': 'Baby & Toddler > Nursing & Feeding > Nursing Pads',
  'bout-de-sein': 'Baby & Toddler > Nursing & Feeding',
  'coussinet-allaitement': 'Baby & Toddler > Nursing & Feeding > Nursing Pads',
  'soutien-gorge-allaitement': 'Apparel & Accessories > Clothing > Underwear & Socks > Bras',
  'soins-allaitement': 'Health & Beauty > Personal Care > Cosmetics > Skin Care',
  'soins-grossesse': 'Health & Beauty > Personal Care > Cosmetics > Skin Care',
  'biberons-tetines': 'Baby & Toddler > Nursing & Feeding > Baby Bottles',
  'vaisselle-bebe': 'Baby & Toddler > Nursing & Feeding > Baby & Toddler Cups',
  'tresse-de-lit-bebe': 'Baby & Toddler > Baby Bedding',
  'trousse-de-soin-bebe': 'Baby & Toddler > Bathing & Grooming',
  'attache-tetine': 'Baby & Toddler > Pacifiers & Teethers',
  'bola-de-grossesse': 'Apparel & Accessories > Jewelry > Necklaces',
  'conservation-lait-maternel': 'Baby & Toddler > Nursing & Feeding > Baby Bottles',
  'bijoux': 'Apparel & Accessories > Jewelry',
  'pour-maman': 'Apparel & Accessories',
  'bebe': 'Baby & Toddler',
}

export async function GET() {
  let products: any[] = []
  try {
    const data = await getProducts(500)
    products = data.products || []
  } catch (e) {
    console.error('GMC feed fetch error:', e)
  }

  // Exclude affiliate products (GMC forbids them for Shopping ads).
  // Store API already filters by status=published, no need to recheck.
  const stockProducts = products.filter((p: any) => {
    return p.metadata?.affiliate_enabled !== 'true'
  })

  const items: string[] = []

  for (const product of stockProducts) {
    const collectionHandle = product.collection?.handle || ''
    const category = CATEGORY_MAP[collectionHandle] || 'Baby & Toddler'
    const brand = xmlEscape(product.metadata?.brand || product.metadata?.affiliate_brand || 'Magic Crochet Kit')
    const productUrl = `${SITE}/products/${product.handle}`
    const description = xmlEscape(stripHtml(product.description || product.subtitle || product.title).substring(0, 5000))

    const variants = product.variants || []
    const productGroupId = product.id

    // If no variants, emit a single item using the product itself
    const items_to_process = variants.length > 0 ? variants : [null]

    for (const variant of items_to_process) {
      const sku = variant?.sku || product.id
      const barcode = variant?.barcode || variant?.ean || ''
      const price = variant
        ? (variant.calculated_price?.calculated_amount || getProductPrice(product))
        : getProductPrice(product)

      if (price <= 0) continue // Skip if no price

      const variantTitle = variant?.title && variant.title !== 'Default' ? ` - ${variant.title}` : ''
      const title = xmlEscape((product.title + variantTitle).substring(0, 150))

      // Main image
      const imageLink = xmlEscape(variant?.metadata?.thumbnail || product.thumbnail || '')
      if (!imageLink) continue // Skip if no image

      // Additional images (max 10)
      let additionalImages = ''
      const variantImages = variant?.metadata?.images
      let extraImages: string[] = []
      if (Array.isArray(variantImages)) {
        extraImages = variantImages.slice(1, 10)
      } else {
        extraImages = (product.images || [])
          .slice(1, 10)
          .map((img: any) => img.url)
          .filter((u: string) => u && u !== imageLink)
      }
      additionalImages = extraImages
        .map((url: string) => `    <g:additional_image_link>${xmlEscape(url)}</g:additional_image_link>`)
        .join('\n')

      // Color from variant option
      const colorOption = variant?.options?.find((o: any) =>
        /couleur|color|colour/i.test(o.option?.title || '')
      )
      const color = colorOption?.value ? `    <g:color>${xmlEscape(colorOption.value)}</g:color>` : ''

      // item_group_id: only needed if product has multiple variants
      const itemGroup = variants.length > 1 ? `    <g:item_group_id>${xmlEscape(productGroupId)}</g:item_group_id>` : ''

      // GTIN / MPN
      const gtin = barcode ? `    <g:gtin>${xmlEscape(barcode)}</g:gtin>` : ''
      const mpn = sku ? `    <g:mpn>${xmlEscape(sku)}</g:mpn>` : ''

      items.push(`  <item>
    <g:id>${xmlEscape(sku)}</g:id>
    <title>${title}</title>
    <description>${description}</description>
    <link>${xmlEscape(productUrl)}</link>
    <g:image_link>${imageLink}</g:image_link>
${additionalImages ? additionalImages + '\n' : ''}    <g:availability>in_stock</g:availability>
    <g:price>${price.toFixed(2)} EUR</g:price>
    <g:brand>${brand}</g:brand>
    <g:condition>new</g:condition>
${gtin ? gtin + '\n' : ''}${mpn ? mpn + '\n' : ''}${color ? color + '\n' : ''}${itemGroup ? itemGroup + '\n' : ''}    <g:google_product_category>${xmlEscape(category)}</g:google_product_category>
    <g:shipping>
      <g:country>FR</g:country>
      <g:service>Standard</g:service>
      <g:price>4.99 EUR</g:price>
    </g:shipping>
    <g:identifier_exists>${barcode ? 'yes' : 'no'}</g:identifier_exists>
  </item>`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
  <title>Magic Crochet Kit — Boutique bébé et maman</title>
  <link>${SITE}</link>
  <description>Catalogue produits Magic Crochet Kit — tout pour bébé et maman, livraison France.</description>
${items.join('\n')}
</channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
