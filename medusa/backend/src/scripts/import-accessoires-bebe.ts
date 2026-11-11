import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { readFileSync } from "node:fs"
import path from "node:path"

/**
 * Import accessoires bebe from Vertbaudet feed into existing collections:
 * biberons-tetines, vaisselle-bebe, tresse-de-lit-bebe, trousse-de-soin-bebe,
 * bola-de-grossesse.
 *
 * Template SEO: unique paraphrase + benefits + FAQs + keyword-rich anchors.
 * NO size options (accessories don't have clothing sizes).
 */

const STOP_WORDS = new Set([
  "de", "du", "des", "d", "la", "le", "les", "l", "un", "une",
  "en", "a", "au", "aux", "et", "ou", "pour", "avec", "sur", "sous", "par",
  "ce", "cette", "ces",
])

const COLLECTION_CONFIG: Record<string, {
  sing: string
  plural: string
  gender: "m" | "f"
  focus: string
}> = {
  "biberons-tetines": { sing: "biberon", plural: "biberons et tétines", gender: "m", focus: "ce biberon" },
  "vaisselle-bebe": { sing: "article de vaisselle bébé", plural: "vaisselles bébé", gender: "f", focus: "cette vaisselle" },
  "tresse-de-lit-bebe": { sing: "tresse de lit bébé", plural: "tresses de lit bébé", gender: "f", focus: "cette tresse" },
  "trousse-de-soin-bebe": { sing: "accessoire de soin bébé", plural: "trousses de soin bébé", gender: "m", focus: "ce produit" },
  "bola-de-grossesse": { sing: "bola de grossesse", plural: "bolas de grossesse", gender: "m", focus: "ce bola" },
}

function slugify(s: string): string {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " et ").replace(/['\u2019]/g, " ")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-")
}

function stripStopwords(slug: string): string {
  return slug.split("-").filter((w) => w && !STOP_WORDS.has(w)).join("-")
}

function paraphraseSource(raw: string, title: string): string {
  if (!raw || raw.length < 50) return ""
  let s = raw.replace(/\s+/g, " ").replace(/\?!/g, "!").trim()
  const titleStart = title.substring(0, Math.min(title.length, 40)).toLowerCase()
  if (s.toLowerCase().startsWith(titleStart)) s = s.substring(Math.min(s.length, 60))
  const subs: Array<[RegExp, string]> = [
    [/Must-have/gi, "Incontournable"], [/Coup de coeur/gi, "Notre sélection"],
    [/pile dans la tendance/g, "parfaitement tendance"],
    [/accompagnera/g, "accompagne"], [/on adore/g, "nous adorons"],
  ]
  for (const [p, r] of subs) s = s.replace(p, r)
  const sentences = s.split(/(?<=[.!?])\s+/).filter((x) => x.trim().length > 20)
  return sentences.slice(0, 3).join(" ").trim()
}

function generateDescription(title: string, brand: string, sourceDesc: string, collectionHandle: string, colorCount: number, hash: number): string {
  const cfg = COLLECTION_CONFIG[collectionHandle]
  const d = cfg.gender === "f"
    ? { un: "une", ce: "cette", nouveau: "nouvelle", signe: "signée", pense: "pensée" }
    : { un: "un", ce: "ce", nouveau: "nouveau", signe: "signé", pense: "pensé" }

  const intros = [
    `<p><strong>${title}</strong> — ${d.un} ${cfg.sing} ${d.signe} ${brand}. ${d.un.charAt(0).toUpperCase() + d.un.slice(1)} pièce ${d.pense} pour accompagner le quotidien des parents et le bien-être de bébé.</p>`,
    `<p>${d.un.charAt(0).toUpperCase() + d.un.slice(1)} ${d.nouveau} ${cfg.sing} dans votre sélection : <strong>${title}</strong> de ${brand}. Un choix pratique et durable pour les jeunes parents.</p>`,
    `<p>Découvrez <strong>${title}</strong>, ${d.un} ${cfg.sing} ${brand} à la fois pratique et bien pensé${cfg.gender === "f" ? "e" : ""}.</p>`,
    `<p>${brand} propose avec <strong>${title}</strong> ${d.un} ${cfg.sing} qui allie simplicité d'utilisation et qualité de fabrication. Un indispensable de la puériculture moderne.</p>`,
  ]
  const intro = intros[hash % intros.length]

  const paraphrase = paraphraseSource(sourceDesc, title)
  const paraphraseBlock = paraphrase ? `<h2>Présentation</h2>\n<p>${paraphrase}</p>\n\n` : ""

  const benefits = [
    `Signé ${brand} — marque reconnue en puériculture`,
    colorCount > 1 ? `${colorCount} coloris disponibles` : null,
    collectionHandle === "biberons-tetines" ? "Compatible avec les principaux modèles de tétines et tire-laits" : null,
    collectionHandle === "vaisselle-bebe" ? "Matériaux adaptés à la diversification et sans BPA" : null,
    collectionHandle === "tresse-de-lit-bebe" ? "Décoration douce et sécurisée pour le lit de bébé" : null,
    collectionHandle === "trousse-de-soin-bebe" ? "Essentiel pour les premiers soins du quotidien" : null,
    collectionHandle === "bola-de-grossesse" ? "Son doux apaisant pour bébé dès la 20e semaine de grossesse" : null,
    "Qualité de fabrication soignée, pensée pour durer",
  ].filter(Boolean) as string[]

  const benefitsHtml = benefits.map((b) => `<li>${b}</li>`).join("\n")

  const crossLinkTargets: Record<string, Array<{ label: string; href: string }>> = {
    "biberons-tetines": [
      { label: "biberons pour bébé", href: "/collections/biberons-tetines" },
      { label: "vaisselle bébé pour la diversification", href: "/collections/vaisselle-bebe" },
    ],
    "vaisselle-bebe": [
      { label: "vaisselle bébé en silicone", href: "/collections/vaisselle-bebe" },
      { label: "biberons et tétines", href: "/collections/biberons-tetines" },
    ],
    "tresse-de-lit-bebe": [
      { label: "tresses de lit pour bébé", href: "/collections/tresse-de-lit-bebe" },
      { label: "sélection bébé", href: "/collections/bebe" },
    ],
    "trousse-de-soin-bebe": [
      { label: "trousses de soin bébé", href: "/collections/trousse-de-soin-bebe" },
      { label: "casques anti-bruit bébé", href: "/collections/casque-anti-bruit-bebe" },
    ],
    "bola-de-grossesse": [
      { label: "bolas de grossesse", href: "/collections/bola-de-grossesse" },
      { label: "bijoux de maternité", href: "/collections/bijoux" },
    ],
  }
  const crossLinks = crossLinkTargets[collectionHandle] || []
  const crossLinkBlock = `<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>Vous aimerez aussi :</strong> découvrez notre sélection complète de ${crossLinks.map((l) => `<a href="${l.href}" class="text-primary hover:underline font-medium">${l.label}</a>`).join(" ou nos ")}.</p>
</div>`

  return `${intro}

<h2>Pourquoi choisir ${cfg.focus} ?</h2>
<ul>
${benefitsHtml}
</ul>

${paraphraseBlock}${crossLinkBlock}`
}

function generateFaqs(brand: string, collectionHandle: string, colorCount: number): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = []
  const cfg = COLLECTION_CONFIG[collectionHandle]

  if (collectionHandle === "biberons-tetines") {
    faqs.push({ q: `Ce biberon est-il compatible avec l'allaitement mixte ?`, a: `Oui, les biberons ${brand} sont conçus pour faciliter la transition entre le sein et le biberon. La forme de la tétine imite le rythme naturel de succion et minimise le risque de confusion sein-biberon.` })
    faqs.push({ q: `Comment stériliser ce biberon ?`, a: `Le biberon peut être stérilisé à la vapeur, au stérilisateur électrique, au micro-ondes ou par ébullition pendant 5 minutes. Consultez la notice du produit pour les recommandations précises de la marque ${brand}.` })
  } else if (collectionHandle === "vaisselle-bebe") {
    faqs.push({ q: `À partir de quel âge utiliser cette vaisselle bébé ?`, a: `Dès le début de la diversification, généralement vers 4-6 mois. Les produits sont conçus pour les petites mains et les bouches sensibles.` })
    faqs.push({ q: `Passe-t-elle au lave-vaisselle ?`, a: `La plupart des produits ${brand} passent au lave-vaisselle dans le panier supérieur. Pour une durée de vie optimale, un lavage à la main est recommandé.` })
  } else if (collectionHandle === "tresse-de-lit-bebe") {
    faqs.push({ q: `La tresse de lit est-elle sans danger pour bébé ?`, a: `Oui, les tresses de lit modernes sont conçues pour amortir les contacts entre bébé et les barreaux du lit. Elles sont rembourrées sans danger d'étouffement et fixées solidement.` })
    faqs.push({ q: `Comment l'entretenir ?`, a: `Nettoyage à la main avec un chiffon humide et savon doux. Certains modèles ont une housse déhoussable qui passe en machine à 30°C.` })
  } else if (collectionHandle === "trousse-de-soin-bebe") {
    faqs.push({ q: `Quel est l'âge minimum recommandé ?`, a: `Dès la naissance. Ces produits sont conçus pour accompagner les soins quotidiens de bébé en toute sécurité : ongles, narines, température.` })
    faqs.push({ q: `Comment nettoyer ces accessoires ?`, a: `À l'eau tiède savonneuse. Certains passent au stérilisateur. Toujours bien sécher avant rangement.` })
  } else if (collectionHandle === "bola-de-grossesse") {
    faqs.push({ q: `À partir de quel mois de grossesse porter le bola ?`, a: `Bébé perçoit le tintement du bola à partir de la 20e semaine de grossesse, lorsque son système auditif est suffisamment développé. Vous pouvez le porter dès le début si vous le souhaitez — c'est aussi un beau souvenir de la grossesse.` })
    faqs.push({ q: `Que faire du bola après l'accouchement ?`, a: `Accrochez-le au berceau ou cousez-le dans le doudou de bébé. Le son familier, qu'il connaît depuis la grossesse, l'aide à se calmer et à s'apaiser après la naissance.` })
  }

  faqs.push({ q: `Pourquoi choisir la marque ${brand} ?`, a: `${brand} est reconnue dans l'univers de la puériculture pour la qualité de ses produits et leur praticité au quotidien. La marque est plébiscitée par de nombreux parents.` })

  if (colorCount > 1) {
    faqs.push({ q: `Combien de coloris sont disponibles ?`, a: `${colorCount} coloris sont proposés pour vous permettre de choisir celui qui s'accorde le mieux avec votre univers ou la chambre de bébé.` })
  }

  return faqs
}

export default async function importAccessoires({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  const dataPath = path.resolve(__dirname, "accessoires-data.json")
  const data = JSON.parse(readFileSync(dataPath, "utf8"))

  const [defaultChannel] = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" })
  if (!defaultChannel) throw new Error("Default Sales Channel not found")

  const IMAGE_BASE = "https://magic-crochet-kit.com/images/products/vertbaudet/accessoires"
  const AFFILIATE_TRACKER = "https://track.effiliation.com/servlet/effi.redir?id_compteur=23257207&url="

  const existingHandles = new Set<string>()
  const allHandles = await pg.raw(`SELECT handle FROM product WHERE deleted_at IS NULL`)
  for (const p of allHandles.rows || []) existingHandles.add(p.handle)

  let total = 0
  let skipped = 0
  let errors = 0

  for (const [collectionHandle, products] of Object.entries(data) as Array<[string, any[]]>) {
    const colRes = await pg.raw(`SELECT id FROM product_collection WHERE handle = '${collectionHandle}' AND deleted_at IS NULL`)
    const collectionId = colRes.rows?.[0]?.id
    if (!collectionId) { logger.warn(`Collection ${collectionHandle} not found`); continue }
    logger.info(`\n=== ${collectionHandle} (${products.length}) ===`)

    for (const p of products) {
      const groupId = p.groupId // keep original case: disk folders use it as-is
      const baseSlug = stripStopwords(slugify(p.title)).substring(0, 80).replace(/-[^-]*$/, (m) => (m.length > 8 ? "" : m))
      let handle = baseSlug
      let suffix = 0
      while (existingHandles.has(handle)) { suffix++; handle = `${baseSlug.substring(0, 77)}-${suffix}` }

      // Group variants by (color, size)
      const unique = new Map<string, any>()
      for (const v of p.variants) {
        const key = `${v.color}|${v.size}`
        if (!unique.has(key)) unique.set(key, v)
      }
      const variants = Array.from(unique.values())
      const colors = new Set(variants.map((v: any) => v.color).filter(Boolean))
      const sizes = new Set(variants.map((v: any) => v.size).filter(Boolean))
      const hasMultiColor = colors.size > 1
      const hasMultiSize = sizes.size > 1

      // Images per color
      const colorImageMap: Record<string, string[]> = {}
      const allImagesList: string[] = []
      const seen = new Set<string>()
      for (const v of p.variants) {
        const cs = slugify(v.color || "default")
        if (!colorImageMap[cs]) {
          const urls = new Set<string>()
          for (const vv of p.variants) {
            if (slugify(vv.color || "default") === cs) {
              vv.images.forEach((u: string) => urls.add(u.split("?")[0]))
            }
          }
          const imgs = Array.from(urls).map((_, i) => `${IMAGE_BASE}/${groupId}/${cs}-${i + 1}.webp`)
          colorImageMap[cs] = imgs
          imgs.forEach((url) => { if (!seen.has(url)) { seen.add(url); allImagesList.push(url) } })
        }
      }
      const thumbnail = allImagesList[0]
      if (!thumbnail) { skipped++; continue }

      const hash = groupId.split("").reduce((h, c) => h + c.charCodeAt(0), 0)
      const title = p.title.charAt(0).toUpperCase() + p.title.slice(1)
      const description = generateDescription(title, p.brand, p.description || "", collectionHandle, colors.size, hash)
      const faqs = generateFaqs(p.brand, collectionHandle, colors.size)
      const cfg = COLLECTION_CONFIG[collectionHandle]

      const options: any[] = []
      if (hasMultiColor) options.push({ title: "Couleur", values: Array.from(colors) as string[] })
      if (hasMultiSize) options.push({ title: "Taille", values: Array.from(sizes) as string[] })
      if (options.length === 0) options.push({ title: "Couleur", values: [variants[0]?.color || "Unique"] })

      const variantInput = variants.map((v: any) => {
        const cs = slugify(v.color || "default")
        const vImgs = colorImageMap[cs] || []
        const optionsObj: Record<string, string> = {}
        if (hasMultiColor) optionsObj["Couleur"] = v.color
        if (hasMultiSize) optionsObj["Taille"] = v.size
        if (!hasMultiColor && !hasMultiSize) optionsObj["Couleur"] = v.color || "Unique"
        const affUrl = v.link ? (v.link.startsWith("http") ? v.link : AFFILIATE_TRACKER + encodeURIComponent(v.link)) : ""
        return {
          title: [hasMultiColor ? v.color : null, hasMultiSize ? v.size : null].filter(Boolean).join(" / ") || "Default",
          sku: v.sku || `VB-${groupId}-${cs}-${v.size || "OS"}`.substring(0, 50),
          ...(v.gtin ? { barcode: v.gtin } : {}),
          manage_inventory: false,
          allow_backorder: true,
          options: Object.keys(optionsObj).length > 0 ? optionsObj : undefined,
          prices: [{ amount: Number(v.price), currency_code: "eur" }],
          metadata: {
            affiliate_url: affUrl, images: vImgs, thumbnail: vImgs[0] || thumbnail,
          },
        }
      })

      const benefitsList = [
        `Signé ${p.brand}`,
        colors.size > 1 ? `${colors.size} coloris` : null,
        "Affilié partenaire Vertbaudet",
      ].filter(Boolean) as string[]

      const productInput = {
        title: title.substring(0, 200),
        subtitle: `${cfg.sing.charAt(0).toUpperCase() + cfg.sing.slice(1)} ${p.brand}`.substring(0, 180),
        description,
        handle,
        status: "published" as const,
        thumbnail,
        collection_id: collectionId,
        metadata: {
          meta_title: `${title.substring(0, 50)} | Magic Crochet Kit`,
          meta_description: `${title} - ${p.brand}. ${cfg.sing.charAt(0).toUpperCase() + cfg.sing.slice(1)} pour bébé et maman. Livraison rapide.`.substring(0, 160),
          affiliate_enabled: "true",
          affiliate_source: "vertbaudet",
          affiliate_brand: p.brand,
          brand: p.brand,
          affiliate_url: variants[0]?.link || "",
          affiliate_label: "Voir sur Vertbaudet",
          benefits: benefitsList,
          faqs,
        },
        images: allImagesList.map((url) => ({ url })),
        options,
        variants: variantInput,
        sales_channels: [{ id: defaultChannel.id }],
      }

      try {
        await createProductsWorkflow(container).run({ input: { products: [productInput] as any } })
        existingHandles.add(handle)
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
