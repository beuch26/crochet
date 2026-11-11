import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Import Casque antibruit Kidynoise (Kidywolf) — affiliate / Vertbaudet
 * 3 color variants (rose, bleu, vert), SEO-optimized content
 */
export default async function importKidynoise({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  const HANDLE = "casque-antibruit-kidynoise-kidywolf"
  const COLLECTION_HANDLE = "casque-anti-bruit-bebe"
  const PRICE_EUR = 1990 // 19,90 €

  const existing = await pg.raw(`SELECT id FROM product WHERE handle = '${HANDLE}' AND deleted_at IS NULL`)
  if (existing.rows?.length > 0) {
    logger.info(`Product ${HANDLE} already exists, deleting first...`)
    await pg.raw(`UPDATE product SET deleted_at = NOW() WHERE handle = '${HANDLE}'`)
  }

  const col = await pg.raw(`SELECT id FROM product_collection WHERE handle = '${COLLECTION_HANDLE}'`)
  const collectionId = col.rows?.[0]?.id
  if (!collectionId) throw new Error(`Collection ${COLLECTION_HANDLE} not found`)

  const [defaultChannel] = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" })
  if (!defaultChannel) throw new Error("Default Sales Channel not found")

  const title = "Casque antibruit Kidynoise Kidywolf - 25 dB des 4 ans"
  const subtitle = "Casque antibruit ajustable et pliable 25 dB — Des 4 ans, bandeau reglable et reutilisable"

  const description = `<p><strong>Un casque antibruit malin et nomade pour les enfants des 4 ans.</strong> Le Kidynoise de la marque Kidywolf offre une protection auditive efficace contre les bruits forts (concerts, feux d'artifice, parcs d'attractions, trajets en avion) tout en restant compact et facile a transporter.</p>

<h2>Pourquoi choisir le casque Kidywolf Kidynoise ?</h2>
<ul>
<li><strong>Protection de 25 dB (SNR)</strong> : attenue efficacement les bruits nocifs au-dela de 80 dB, permettant a votre enfant de vivre les sorties en toute serenite.</li>
<li><strong>Bandeau ajustable</strong> : s'adapte a la morphologie de tous les enfants, de 4 ans jusqu'a l'adolescence. Confort optimal pour les longues utilisations.</li>
<li><strong>Design pliable et compact</strong> : les oreillettes se replient sur l'arceau pour se glisser facilement dans un sac a dos ou un sac a langer.</li>
<li><strong>Coussinets doux et rembourres</strong> : mousse epaisse pour un port prolonge sans inconfort meme plusieurs heures d'affilee.</li>
<li><strong>Materiaux faciles a nettoyer</strong> : un simple chiffon humide suffit pour entretenir le casque apres chaque sortie.</li>
<li><strong>Styles colores</strong> : 3 coloris (rose, bleu, vert) pour plaire aux enfants et rendre le port du casque plus attractif.</li>
</ul>

<h2>Dans quelles situations l'utiliser ?</h2>
<p>Le Kidynoise est conçu pour accompagner les enfants actifs dans tous leurs environnements bruyants :</p>
<ul>
<li>Concerts, festivals et spectacles musicaux</li>
<li>Feux d'artifice, fetes foraines, meetings aeriens</li>
<li>Evenements sportifs (matchs de foot, courses automobiles)</li>
<li>Voyages en avion ou en train</li>
<li>Salles de classe bruyantes ou environnement surcharge sensoriellement (interessant pour les enfants hypersensibles ou TSA)</li>
<li>Parcs d'attractions</li>
</ul>

<h2>Caracteristiques techniques</h2>
<ul>
<li><strong>Marque :</strong> Kidywolf — specialiste suisse des accessoires enfants</li>
<li><strong>Age recommande :</strong> des 4 ans</li>
<li><strong>Reduction du bruit :</strong> 25 dB (SNR)</li>
<li><strong>Design :</strong> pliable, compact, reutilisable</li>
<li><strong>Couleurs disponibles :</strong> rose, bleu, vert</li>
<li><strong>Bandeau :</strong> reglable sans outil</li>
</ul>

<p><em>A partir de 4 ans, les enfants commencent a participer activement aux sorties familiales. Le Kidynoise protege leur audition sans compromettre leur liberte de mouvement grace a son format pliable. Il devient rapidement un compagnon indispensable pour les familles qui aiment bouger.</em></p>`

  const metaDescription = "Casque antibruit Kidywolf Kidynoise : 25 dB, des 4 ans, pliable et ajustable. 3 coloris (rose, bleu, vert). Protection auditive enfant nomade."

  const variants = [
    { color: "Rose", handle: "rose", urlSuffix: "-rose.htm?ProductId=341014529&FiltreCouleur=1116&FiltreTaille=TU", barcode: "3410145291116003", imageCount: 2 },
    { color: "Bleu", handle: "bleu", urlSuffix: "-bleu.htm?ProductId=341014529&FiltreCouleur=0502&FiltreTaille=TU", barcode: "3410145290502001", imageCount: 3 },
    { color: "Vert", handle: "vert", urlSuffix: "-vert.htm?ProductId=341014529&FiltreCouleur=1321&FiltreTaille=TU", barcode: "3410145291321002", imageCount: 3 },
  ]

  const IMAGE_BASE = "https://magic-crochet-kit.com/images/products/vertbaudet"
  const getImagesForColor = (handle: string, count: number) =>
    Array.from({ length: count }, (_, i) => `${IMAGE_BASE}/kidynoise-${handle}-${i + 1}.webp`)

  const productInput = {
    title,
    subtitle,
    description,
    handle: HANDLE,
    status: "published" as const,
    thumbnail: `${IMAGE_BASE}/kidynoise-rose-1.webp`,
    collection_id: collectionId,
    metadata: {
      meta_title: title + " | Magic Crochet Kit",
      meta_description: metaDescription,
      affiliate_enabled: "true",
      affiliate_source: "vertbaudet",
      affiliate_brand: "Kidywolf",
      affiliate_url: "https://track.effiliation.com/servlet/effi.redir?id_compteur=23257207&url=https%3A%2F%2Fwww.vertbaudet.fr%2Fcasque-antibruit-kidynoise-rose.htm%3FProductId%3D341014529",
      affiliate_label: "Voir sur Vertbaudet",
      benefits: [
        "Reduction du bruit : 25 dB (SNR)",
        "Des 4 ans et jusqu'a l'adolescence",
        "Pliable et compact pour le transport",
        "Bandeau ajustable sans outil",
        "Design colore (3 coloris au choix)",
      ],
      faqs: [
        { q: "A partir de quel age peut-on utiliser le Kidynoise ?", a: "A partir de 4 ans. Le bandeau reglable permet de l'adapter a la tete de votre enfant, et il suivra sa croissance jusqu'a l'adolescence." },
        { q: "Quelle est la reduction de bruit ?", a: "25 dB (SNR). Cela divise par ~4 l'intensite sonore perçue et protege efficacement dans les environnements les plus bruyants (100-150 dB)." },
        { q: "Le casque est-il confortable pour de longues durees ?", a: "Oui, les coussinets sont rembourres de mousse epaisse et le bandeau reglable repartit la pression. De nombreux parents rapportent des utilisations de 3-4 heures sans inconfort." },
        { q: "Peut-on le mettre dans un sac ?", a: "Oui, les oreillettes se replient sur l'arceau pour un format ultra-compact. Il tient dans une pochette de sac a dos." },
        { q: "Comment le nettoyer ?", a: "Un chiffon humide et du savon doux suffisent. Ne pas immerger dans l'eau." },
        { q: "Quelle difference avec le Muffy Baby d'Alpine ?", a: "Le Muffy Baby est conçu pour les tout-petits (0-3 ans) avec un bandeau en tissu doux. Le Kidynoise est pour les plus grands (4 ans+) avec un arceau plus solide et pliable." },
      ],
    },
    images: variants.flatMap((v) => getImagesForColor(v.handle, v.imageCount)).map((url) => ({ url })),
    options: [
      { title: "Couleur", values: variants.map((v) => v.color) },
    ],
    variants: variants.map((v) => ({
      title: v.color,
      sku: `KIDYNOISE-${v.color.toUpperCase()}`,
      barcode: v.barcode,
      manage_inventory: false,
      allow_backorder: true,
      options: { Couleur: v.color },
      prices: [{ amount: PRICE_EUR, currency_code: "eur" }],
      metadata: {
        affiliate_url: encodeURI(`https://track.effiliation.com/servlet/effi.redir?id_compteur=23257207&url=https://www.vertbaudet.fr/casque-antibruit-kidynoise${v.urlSuffix}`),
        images: getImagesForColor(v.handle, v.imageCount),
        thumbnail: `${IMAGE_BASE}/kidynoise-${v.handle}-1.webp`,
      },
    })),
    sales_channels: [{ id: defaultChannel.id }],
  }

  logger.info(`Creating product "${title}"...`)
  const { result } = await createProductsWorkflow(container).run({
    input: { products: [productInput] as any },
  })
  logger.info(`  + Created product ${result[0].id}`)
  logger.info(`Done! /products/${HANDLE}`)
}
