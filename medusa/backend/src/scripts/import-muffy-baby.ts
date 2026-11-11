import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Import Casque antibruit Alpine Muffy Baby (affiliate / Vertbaudet)
 * — 3 color variants, 9 images, SEO-optimized content
 *
 * Run: npx medusa exec src/scripts/import-muffy-baby.ts
 */
export default async function importMuffyBaby({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  const HANDLE = "casque-antibruit-alpine-muffy-baby"
  const COLLECTION_HANDLE = "casque-anti-bruit-bebe"
  const PRICE_EUR = 2995 // 29,95 €
  const BASE_AFFILIATE_URL = "https://track.effiliation.com/servlet/effi.redir?id_compteur=23257207&url=https%3A%2F%2Fwww.vertbaudet.fr%2Fcasque-antibruit-muffy-baby"

  // Check if product already exists
  const existing = await pg.raw(`SELECT id FROM product WHERE handle = '${HANDLE}' AND deleted_at IS NULL`)
  if (existing.rows?.length > 0) {
    logger.info(`Product ${HANDLE} already exists (id: ${existing.rows[0].id}), deleting first...`)
    await pg.raw(`UPDATE product SET deleted_at = NOW() WHERE handle = '${HANDLE}'`)
  }

  // Get collection id
  const col = await pg.raw(`SELECT id FROM product_collection WHERE handle = '${COLLECTION_HANDLE}'`)
  const collectionId = col.rows?.[0]?.id
  if (!collectionId) throw new Error(`Collection ${COLLECTION_HANDLE} not found`)

  // Get default sales channel
  const [defaultChannel] = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" })
  if (!defaultChannel) throw new Error("Default Sales Channel not found")

  const title = "Casque antibruit bébé Alpine Muffy Baby - 23 dB"
  const subtitle = "Protection auditive 23 dB pour les tout-petits — Certifié CE EN 352-1:2020, léger et sans pression sur la fontanelle"

  const description = `<p><strong>Pour que bébé profite de chaque moment en toute sérénité.</strong> Concerts, festivals, feux d'artifice, mariages, fêtes de famille — le casque antibruit Alpine Muffy Baby protège l'audition ultra-sensible de votre bébé jusqu'à 3 ans tout en restant confortable pendant des heures.</p>

<h2>Pourquoi choisir le casque Alpine Muffy Baby ?</h2>
<ul>
<li><strong>Protection auditive certifiée</strong> : réduction du bruit de 23 dB, conforme à la norme européenne EN 352-1:2020 (CE).</li>
<li><strong>Zéro pression sur la fontanelle</strong> : bandeau antidérapant doux et réglable par patte auto-agrippante, spécialement conçu pour la tête fragile des nourrissons.</li>
<li><strong>Coussinets ultra-confortables</strong> : plusieurs couches de mousse rembourrée pour un ajustement optimal et une bonne insonorisation autour des oreilles.</li>
<li><strong>Utilisable dès la naissance</strong> et jusqu'à 3 ans — votre bébé peut même s'endormir paisiblement grâce au confort du casque.</li>
<li><strong>Coques en plastique</strong> faciles à nettoyer pour un entretien rapide après chaque sortie.</li>
<li><strong>Étui Protect&Go inclus</strong> : pochette douillette pour transporter et ranger le casque sans l'abîmer.</li>
</ul>

<h2>Dans quelles situations l'utiliser ?</h2>
<p>Le Muffy Baby a été pensé pour tous les environnements bruyants qui peuvent mettre en danger l'audition fragile des plus petits :</p>
<ul>
<li>Concerts, festivals de musique, spectacles</li>
<li>Feux d'artifice du 14 juillet, du Nouvel An</li>
<li>Fêtes foraines, meetings aériens, courses automobiles</li>
<li>Mariages, fêtes de famille, événements sportifs</li>
<li>Voyages en avion (décollage et atterrissage)</li>
<li>Travaux à la maison ou à proximité</li>
</ul>

<h2>Caractéristiques techniques</h2>
<ul>
<li><strong>Marque :</strong> Alpine (référence en matière de protection auditive depuis 1995)</li>
<li><strong>Âge recommandé :</strong> de la naissance à 3 ans</li>
<li><strong>Réduction du bruit :</strong> 23 dB (SNR)</li>
<li><strong>Norme :</strong> CE — EN 352-1:2020</li>
<li><strong>Matériaux :</strong> coques en plastique ABS, coussinets en mousse, bandeau en tissu doux</li>
<li><strong>Livré avec :</strong> étui de transport Protect&Go</li>
</ul>

<p><em>Un casque antibruit bébé est indispensable dès que le niveau sonore dépasse 80 dB. À titre de comparaison, un feu d'artifice produit entre 120 et 150 dB, un concert entre 100 et 120 dB — bien au-delà du seuil de tolérance des oreilles d'un nourrisson. Avec le Muffy Baby, vous profitez de vos sorties en famille sans compromettre la santé auditive de votre enfant.</em></p>`

  const metaDescription = "Casque antibruit Alpine Muffy Baby : 23 dB de protection pour bébé 0-3 ans. Bandeau doux sans pression sur la fontanelle, certifié CE EN 352-1:2020."

  const variants = [
    { color: "Vert", hex: "#7fc97f", handle: "vert", urlSuffix: "-vert.htm?ProductId=341015567&FiltreCouleur=1321&FiltreTaille=TU", barcode: "3410155671321003" },
    { color: "Noir", hex: "#000000", handle: "noir", urlSuffix: "-noir.htm?ProductId=341015567&FiltreCouleur=0901&FiltreTaille=TU", barcode: "3410155670901001" },
    { color: "Rose", hex: "#f4a6c2", handle: "rose", urlSuffix: "-rose.htm?ProductId=341015567&FiltreCouleur=1114&FiltreTaille=TU", barcode: "3410155671114002" },
  ]

  const IMAGE_BASE = "https://magic-crochet-kit.com/images/products/vertbaudet"
  const getImagesForColor = (c: string) => [
    `${IMAGE_BASE}/muffy-baby-${c}-1.webp`,
    `${IMAGE_BASE}/muffy-baby-${c}-2.webp`,
    `${IMAGE_BASE}/muffy-baby-${c}-3.webp`,
  ]

  // Build product input using Medusa workflow
  const productInput = {
    title,
    subtitle,
    description,
    handle: HANDLE,
    status: "published" as const,
    thumbnail: `${IMAGE_BASE}/muffy-baby-vert-1.webp`,
    collection_id: collectionId,
    metadata: {
      meta_title: title + " | Magic Crochet Kit",
      meta_description: metaDescription,
      affiliate_enabled: "true",
      affiliate_source: "vertbaudet",
      affiliate_brand: "Alpine",
      affiliate_url: `${BASE_AFFILIATE_URL}-vert.htm%3FProductId%3D341015567`,
      affiliate_label: "Voir sur Vertbaudet",
    },
    images: variants.flatMap((v) => getImagesForColor(v.handle)).map((url) => ({ url })),
    options: [
      { title: "Couleur", values: variants.map((v) => v.color) },
    ],
    variants: variants.map((v) => ({
      title: v.color,
      sku: `MUFFY-BABY-${v.color.toUpperCase()}`,
      barcode: v.barcode,
      manage_inventory: false,
      allow_backorder: true,
      options: { Couleur: v.color },
      prices: [{ amount: PRICE_EUR, currency_code: "eur" }],
      metadata: {
        affiliate_url: encodeURI(`https://track.effiliation.com/servlet/effi.redir?id_compteur=23257207&url=https://www.vertbaudet.fr/casque-antibruit-muffy-baby${v.urlSuffix}`),
      },
    })),
    sales_channels: [{ id: defaultChannel.id }],
  }

  logger.info(`Creating product "${title}"...`)
  const { result } = await createProductsWorkflow(container).run({
    input: { products: [productInput] as any },
  })
  const product = result[0]
  logger.info(`  + Created product ${product.id}`)

  logger.info(`Done! Product handle: /products/${HANDLE}`)
  logger.info(`       Collection: /collections/${COLLECTION_HANDLE}`)
}
