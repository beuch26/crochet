import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { readFileSync } from "node:fs"
import path from "node:path"

/**
 * Import vetements allaitement products from vetements-data.json.
 * Apply same SEO template as casques: subtitle, benefits, FAQs,
 * description with H2 sections, "Retours d'experience", internal links.
 */
export default async function importVetements({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  const dataPath = path.resolve(__dirname, "vetements-data.json")
  const data = JSON.parse(readFileSync(dataPath, "utf8"))

  const [defaultChannel] = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" })
  if (!defaultChannel) throw new Error("Default Sales Channel not found")

  const IMAGE_BASE = "https://magic-crochet-kit.com/images/products/vertbaudet/vetements"
  const AFFILIATE_TRACKER = "https://track.effiliation.com/servlet/effi.redir?id_compteur=23257207&url="

  function slugify(s: string): string {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  function capitalize(s: string): string {
    if (!s) return s
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  }

  // Generate SEO content based on collection type
  const COLLECTION_DEFAULTS: Record<string, { type: string; intro: string; usageTags: string[] }> = {
    "robe-allaitement": { type: "robe", intro: "Robe d'allaitement avec ouverture discrete pour faciliter chaque tetee", usageTags: ["bureau", "sortie", "evenement"] },
    "tunique-allaitement": { type: "tunique", intro: "Tunique d'allaitement avec ouverture invisible, parfaite pour le bureau", usageTags: ["bureau", "ville"] },
    "pyjama-allaitement": { type: "pyjama", intro: "Pyjama d'allaitement confortable pour les tetees de nuit", usageTags: ["nuit", "post-partum"] },
    "pull-allaitement": { type: "pull", intro: "Pull d'allaitement avec ouverture pour garder bebe au chaud", usageTags: ["hiver", "automne"] },
    "t-shirt-allaitement": { type: "t-shirt", intro: "T-shirt d'allaitement basique pour le quotidien", usageTags: ["quotidien", "ete"] },
    "salopette-allaitement": { type: "salopette", intro: "Salopette d'allaitement tendance pour mamans actives", usageTags: ["tendance", "decontracte"] },
    "maillot-bain-allaitement": { type: "maillot de bain", intro: "Maillot de bain d'allaitement pour profiter de la piscine et de la plage", usageTags: ["piscine", "plage", "ete"] },
    "pantalon-allaitement": { type: "pantalon", intro: "Pantalon d'allaitement avec ceinture elastique pour le confort post-partum", usageTags: ["quotidien", "post-partum"] },
  }

  function generateDescription(productTitle: string, brand: string, sourceDesc: string, collectionHandle: string, hasMultipleColors: boolean, hasMultipleSizes: boolean): string {
    const cfg = COLLECTION_DEFAULTS[collectionHandle] || { type: "vetement", intro: "", usageTags: [] }
    const cleanSource = sourceDesc.replace(/\s+/g, ' ').trim().substring(0, 600)

    return `<p><strong>${productTitle}</strong> — un ${cfg.type} d'allaitement signe ${brand}, conçu pour faciliter les tetees au quotidien tout en restant elegant et confortable. ${cleanSource ? cleanSource : cfg.intro + '.'}</p>

<h2>Pourquoi cette piece ?</h2>
<ul>
<li><strong>Ouverture discrete dediee allaitement</strong> : zip invisible, double epaisseur ou plis croises selon le modele — donnez le sein en quelques secondes.</li>
<li><strong>Coupe flatteuse post-partum</strong> : tissu fluide qui suit les changements de silhouette des premiers mois.</li>
<li><strong>Marque ${brand}</strong> : selectionnee pour la qualite des tissus et le soin des finitions.</li>
${hasMultipleColors ? '<li><strong>Plusieurs coloris au choix</strong> pour s\'accorder a vos envies du moment.</li>' : ''}
${hasMultipleSizes ? '<li><strong>Toutes les tailles disponibles</strong> du 34/36 au 46/48 (selon stock Vertbaudet).</li>' : ''}
<li><strong>Evolutif grossesse + allaitement</strong> : portez-le tout au long de votre maternite et meme apres le sevrage.</li>
</ul>

<h2>Quand le porter ?</h2>
<p>Cette piece d'allaitement est ideale pour : ${cfg.usageTags.map(t => `<a href="/collections/${collectionHandle}" class="text-primary hover:underline">${t}</a>`).join(', ')}.</p>

<h2>Caracteristiques</h2>
<ul>
<li><strong>Marque :</strong> ${brand}</li>
<li><strong>Type :</strong> ${capitalize(cfg.type)} d'allaitement</li>
<li><strong>Public :</strong> Femmes enceintes et allaitantes</li>
<li><strong>Usage :</strong> Quotidien, evolutif</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>Vous aimerez aussi :</strong> decouvrez notre selection complete de <a href="/collections/vetements-allaitement" class="text-primary hover:underline font-medium">vetements d'allaitement</a> ou parcourez nos autres categories : <a href="/collections/${collectionHandle}" class="text-primary hover:underline font-medium">${cfg.type}s d'allaitement</a>, <a href="/collections/soutien-gorge-allaitement" class="text-primary hover:underline font-medium">soutiens-gorge d'allaitement</a>.</p>
</div>`
  }

  let total = 0
  let skipped = 0
  let errors = 0

  for (const [collectionHandle, products] of Object.entries(data) as Array<[string, any[]]>) {
    const colRes = await pg.raw(`SELECT id FROM product_collection WHERE handle = '${collectionHandle}' AND deleted_at IS NULL`)
    const collectionId = colRes.rows?.[0]?.id
    if (!collectionId) { logger.warn(`  Collection ${collectionHandle} not found`); continue }

    logger.info(`\n=== ${collectionHandle} (${products.length} products) ===`)

    for (const p of products) {
      const groupId = p.groupId
      const handle = `vb-${groupId.toLowerCase()}-${slugify(p.title.substring(0, 40))}`.substring(0, 80)

      // Skip if already exists
      const exists = await pg.raw(`SELECT id FROM product WHERE handle = '${handle.replace(/'/g, "''")}' AND deleted_at IS NULL`)
      if (exists.rows?.length > 0) { skipped++; continue }

      // Group variants by (color, size) to get unique combinations
      const uniqueVariants = new Map<string, any>()
      for (const v of p.variants) {
        const key = `${v.color}|${v.size}`
        if (!uniqueVariants.has(key)) uniqueVariants.set(key, v)
      }
      const variants = Array.from(uniqueVariants.values())

      // Detect option dimensions
      const colors = new Set(variants.map((v) => v.color).filter(Boolean))
      const sizes = new Set(variants.map((v) => v.size).filter(Boolean))
      const hasMultiColor = colors.size > 1
      const hasMultiSize = sizes.size > 1

      // Build options array
      const options: any[] = []
      if (hasMultiColor) options.push({ title: "Couleur", values: Array.from(colors).map((c: any) => capitalize(c)) })
      if (hasMultiSize) options.push({ title: "Taille", values: Array.from(sizes) as string[] })

      // Build images (deduplicated, all colors, ordered) using local paths
      const colorImageMap: Record<string, string[]> = {}
      const allImagesList: string[] = []
      const seen = new Set<string>()
      for (const v of p.variants) {
        const colorSlug = slugify(v.color || 'default')
        if (!colorImageMap[colorSlug]) {
          // Compute how many unique images this color has based on the product variant images
          const colorUrls = new Set<string>()
          for (const vv of p.variants) {
            if (slugify(vv.color || 'default') === colorSlug) {
              vv.images.forEach((u: string) => colorUrls.add(u.split('?')[0]))
            }
          }
          const colorImgs = Array.from(colorUrls).map((_, i) => `${IMAGE_BASE}/${groupId}/${colorSlug}-${i + 1}.webp`)
          colorImageMap[colorSlug] = colorImgs
          colorImgs.forEach((url) => { if (!seen.has(url)) { seen.add(url); allImagesList.push(url) } })
        }
      }

      const thumbnail = allImagesList[0]
      if (!thumbnail) { logger.warn(`  ${handle}: no images, skipping`); skipped++; continue }

      // Build variant input array
      const variantInput = variants.map((v: any) => {
        const colorSlug = slugify(v.color || 'default')
        const variantImages = colorImageMap[colorSlug] || []
        const optionsObj: Record<string, string> = {}
        if (hasMultiColor) optionsObj["Couleur"] = capitalize(v.color)
        if (hasMultiSize) optionsObj["Taille"] = v.size

        // Affiliate URL: use the variant's link from CSV
        const affUrl = v.link
          ? (v.link.startsWith('http') ? v.link : AFFILIATE_TRACKER + encodeURIComponent(v.link))
          : ""

        return {
          title: [hasMultiColor ? capitalize(v.color) : null, hasMultiSize ? v.size : null].filter(Boolean).join(' / ') || 'Default',
          sku: v.sku || `VB-${groupId}-${colorSlug}-${v.size || 'OS'}`.substring(0, 50),
          ...(v.gtin ? { barcode: v.gtin } : {}),
          manage_inventory: false,
          allow_backorder: true,
          options: Object.keys(optionsObj).length > 0 ? optionsObj : undefined,
          prices: [{ amount: Number(v.price), currency_code: "eur" }],
          metadata: {
            affiliate_url: affUrl,
            images: variantImages,
            thumbnail: variantImages[0] || thumbnail,
          },
        }
      })

      // First variant for default affiliate URL
      const defaultAffiliateUrl = variants[0]?.link || ""

      const title = p.title.charAt(0).toUpperCase() + p.title.slice(1)
      const subtitle = `${COLLECTION_DEFAULTS[collectionHandle]?.intro || 'Vetement d\'allaitement'} — ${p.brand}`
      const metaDesc = `${title} - ${p.brand}. Vetement d'allaitement avec ouverture discrete. Tetees faciles au quotidien.`.substring(0, 160)
      const description = generateDescription(title, p.brand, p.description || '', collectionHandle, hasMultiColor, hasMultiSize)

      const productInput = {
        title: title.substring(0, 200),
        subtitle,
        description,
        handle,
        status: "published" as const,
        thumbnail,
        collection_id: collectionId,
        metadata: {
          meta_title: `${title.substring(0, 50)} | Magic Crochet Kit`,
          meta_description: metaDesc,
          affiliate_enabled: "true",
          affiliate_source: "vertbaudet",
          affiliate_brand: p.brand,
          affiliate_url: defaultAffiliateUrl,
          affiliate_label: "Voir sur Vertbaudet",
          benefits: [
            `Ouverture discrete dediee allaitement`,
            `Coupe flatteuse post-partum`,
            `Marque ${p.brand}`,
            hasMultiColor ? `${colors.size} coloris disponibles` : null,
            hasMultiSize ? `${sizes.size} tailles disponibles` : null,
            `Evolutif grossesse + allaitement`,
          ].filter(Boolean),
        },
        images: allImagesList.map((url) => ({ url })),
        ...(options.length > 0 ? { options } : {}),
        variants: variantInput,
        sales_channels: [{ id: defaultChannel.id }],
      }

      try {
        await createProductsWorkflow(container).run({ input: { products: [productInput] as any } })
        total++
        logger.info(`  + ${handle}`)
      } catch (e: any) {
        errors++
        logger.error(`  x ${handle}: ${e.message}`)
      }
    }
  }

  logger.info(`\nDone! Total: ${total} created, ${skipped} skipped, ${errors} errors`)
}
