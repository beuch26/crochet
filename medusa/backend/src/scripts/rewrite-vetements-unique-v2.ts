import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { readFileSync } from "node:fs"
import path from "node:path"

/**
 * Re-write vetements products with UNIQUE content (not copied from
 * Vertbaudet). Uses title+brand+description keywords to extract:
 *   - material (gaze de coton, jersey, lin, etc.)
 *   - style (cache-coeur, fluide, ample, à volants...)
 *   - occasion (ete/hiver/soiree)
 * Then generates unique: paraphrase + benefits list + FAQs.
 */

const COLLECTION_LABELS: Record<string, { sing: string; plural: string; h2Focus: string }> = {
  "robe-allaitement": { sing: "robe d'allaitement", plural: "robes d'allaitement", h2Focus: "cette robe" },
  "tunique-allaitement": { sing: "tunique d'allaitement", plural: "tuniques d'allaitement", h2Focus: "cette tunique" },
  "pyjama-allaitement": { sing: "pyjama d'allaitement", plural: "pyjamas d'allaitement", h2Focus: "ce pyjama" },
  "pull-allaitement": { sing: "pull d'allaitement", plural: "pulls d'allaitement", h2Focus: "ce pull" },
  "t-shirt-allaitement": { sing: "t-shirt d'allaitement", plural: "t-shirts d'allaitement", h2Focus: "ce t-shirt" },
  "salopette-allaitement": { sing: "salopette d'allaitement", plural: "salopettes d'allaitement", h2Focus: "cette salopette" },
  "maillot-bain-allaitement": { sing: "maillot de bain d'allaitement", plural: "maillots de bain d'allaitement", h2Focus: "ce maillot" },
  "pantalon-allaitement": { sing: "pantalon d'allaitement", plural: "pantalons d'allaitement", h2Focus: "ce pantalon" },
}

// Extract attributes from title + source description
function extractAttributes(title: string, sourceDesc: string): {
  materials: string[]
  styles: string[]
  patterns: string[]
  seasons: string[]
} {
  const txt = (title + " " + sourceDesc).toLowerCase()
  const materials: string[] = []
  const styles: string[] = []
  const patterns: string[] = []
  const seasons: string[] = []

  // Materials
  if (/\bgaze de coton|gaze\b/.test(txt)) materials.push("gaze de coton")
  if (/\bcoton bio\b/.test(txt)) materials.push("coton bio")
  else if (/\bcoton\b/.test(txt) && !materials.includes("gaze de coton")) materials.push("coton")
  if (/\bjersey\b/.test(txt)) materials.push("jersey")
  if (/\blin\b/.test(txt)) materials.push("lin")
  if (/\bmolleton\b/.test(txt)) materials.push("molleton")
  if (/\bsatin|satine\b/.test(txt)) materials.push("satin")
  if (/\bdentelle\b/.test(txt)) materials.push("dentelle")
  if (/\bbroderie\b/.test(txt)) materials.push("broderie anglaise")
  if (/\bvelours\b/.test(txt)) materials.push("velours")
  if (/\bmaille\b/.test(txt)) materials.push("maille")
  if (/\btricot\b/.test(txt)) materials.push("tricot")

  // Styles
  if (/\bcache-?coeur|cache.coeur\b/.test(txt)) styles.push("cache-cœur")
  if (/\bportefeuille\b/.test(txt)) styles.push("portefeuille")
  if (/\bfluide\b/.test(txt)) styles.push("coupe fluide")
  if (/\bample\b/.test(txt)) styles.push("coupe ample")
  if (/\bdroite?\b/.test(txt)) styles.push("coupe droite")
  if (/\bvolants?\b/.test(txt)) styles.push("à volants")
  if (/\bmanches longues?\b/.test(txt)) styles.push("manches longues")
  if (/\bmanches courtes?\b/.test(txt)) styles.push("manches courtes")
  if (/\bsans manches\b/.test(txt)) styles.push("sans manches")
  if (/\blonge|longue\b/.test(txt)) styles.push("coupe longue")
  if (/\bcourte\b/.test(txt)) styles.push("coupe courte")
  if (/\bbouton/.test(txt)) styles.push("fermeture boutonnée")
  if (/\bzip\b/.test(txt)) styles.push("fermeture zippée")
  if (/\bfines bretelles\b/.test(txt)) styles.push("fines bretelles")

  // Patterns
  if (/\bleopard|léopard\b/.test(txt)) patterns.push("imprimé léopard")
  if (/\bray[ée]|rayures?\b/.test(txt)) patterns.push("rayé")
  if (/\ba pois|à pois\b/.test(txt)) patterns.push("à pois")
  if (/\buni[e]?\b/.test(txt)) patterns.push("uni")
  if (/\bimprim[ée]\b/.test(txt)) patterns.push("imprimé")
  if (/\bfleuri\b/.test(txt)) patterns.push("fleuri")

  // Seasons
  if (/\bété|ete\b|\best[ieu]val|plage|vacances/.test(txt)) seasons.push("été")
  if (/\bhiver|hivernal|froid|chaleur/.test(txt)) seasons.push("hiver")
  if (/\bmi.saison|automne|printemps/.test(txt)) seasons.push("mi-saison")

  return { materials, styles, patterns, seasons }
}

// Generate unique paraphrased intro (4 variants rotated by group hash)
function generateIntro(title: string, brand: string, attrs: ReturnType<typeof extractAttributes>, sing: string, groupIdHash: number): string {
  const materialPhrase = attrs.materials.length > 0
    ? `en ${attrs.materials[0]}`
    : ""
  const stylePhrase = attrs.styles.length > 0 ? `, ${attrs.styles.slice(0, 2).join(" et ")}` : ""
  const patternPhrase = attrs.patterns.length > 0 ? ` avec son motif ${attrs.patterns[0]}` : ""
  const seasonPhrase = attrs.seasons.length > 0 ? ` — idéal${attrs.seasons.includes("été") ? "e pour l'été" : "e pour l'hiver"}` : ""

  const intros = [
    `<p><strong>${title}</strong> — une ${sing} signée ${brand} ${materialPhrase}${stylePhrase}${patternPhrase}${seasonPhrase}. Pensée pour accompagner votre maternité avec élégance et faciliter les tétées au quotidien.</p>`,
    `<p>Craquez pour cette <strong>${sing}</strong> ${brand}${patternPhrase}${stylePhrase}. Sa matière ${attrs.materials[0] || "soignée"} et son ouverture dédiée à l'allaitement en font un allié idéal pendant et après la grossesse.</p>`,
    `<p>Votre nouvelle ${sing} favorite : <strong>${title}</strong> signé ${brand}${materialPhrase ? ", " + materialPhrase : ""}. Une pièce pensée pour vivre votre maternité confortablement${patternPhrase}.</p>`,
    `<p>La marque ${brand} signe avec <strong>${title}</strong> une ${sing} à la fois pratique et élégante${patternPhrase}${stylePhrase}. Son ouverture discrète dédiée à l'allaitement permet de donner le sein en quelques secondes, où que vous soyez.</p>`,
  ]
  return intros[groupIdHash % intros.length]
}

// Build benefits list (3-5 points) based on detected attributes
function generateBenefits(attrs: ReturnType<typeof extractAttributes>, brand: string, colorCount: number, sizeCount: number): string[] {
  const benefits: string[] = []
  benefits.push("Ouverture dédiée allaitement pour tétées discrètes")
  if (attrs.materials.length > 0) {
    benefits.push(`Matière ${attrs.materials[0]}${attrs.materials[0] === "coton bio" ? " certifié" : ""}`)
  }
  if (attrs.styles.some((s) => /cache-cœur|portefeuille/.test(s))) {
    benefits.push("Décolleté cache-cœur pour un accès rapide au sein")
  } else if (attrs.styles.includes("coupe fluide") || attrs.styles.includes("coupe ample")) {
    benefits.push("Coupe fluide qui s'adapte aux changements de silhouette")
  }
  if (attrs.seasons.includes("été")) benefits.push("Léger et respirant, parfait pour l'été")
  if (attrs.seasons.includes("hiver")) benefits.push("Tissu chaud adapté aux journées froides")
  if (colorCount > 1) benefits.push(`${colorCount} coloris disponibles`)
  if (sizeCount > 1) benefits.push(`${sizeCount} tailles (du plus petit au plus grand)`)
  benefits.push("Évolutif : grossesse + allaitement + après sevrage")

  return benefits.slice(0, 6)
}

// Build FAQ specific to the product attributes
function generateFaqs(title: string, brand: string, attrs: ReturnType<typeof extractAttributes>, sing: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = []

  // FAQ 1: How does the opening work (universal but wording varies)
  if (attrs.styles.some((s) => /cache-cœur|portefeuille/.test(s))) {
    faqs.push({
      q: `Comment allaiter avec cette ${sing} cache-cœur ?`,
      a: `Le décolleté cache-cœur se soulève ou s'écarte d'une main en quelques secondes, exposant juste ce qu'il faut pour que bébé puisse téter. Le tissu retombe naturellement ensuite — aucun bouton à défaire, aucune manipulation complexe.`,
    })
  } else if (attrs.styles.includes("fermeture boutonnée")) {
    faqs.push({
      q: `Les boutons de cette ${sing} gênent-ils pour allaiter ?`,
      a: `Au contraire : ce sont des boutons stratégiquement placés qui permettent d'ouvrir uniquement au niveau de la poitrine, sans découvrir le reste du corps. Vous pouvez les manipuler d'une seule main, même dans le noir pour les tétées de nuit.`,
    })
  } else if (sing.includes("maillot")) {
    faqs.push({
      q: `Comment allaiter avec ce maillot de bain ?`,
      a: `Les bonnets sont conçus pour s'ouvrir par clips invisibles ou plis croisés : vous soulevez le tissu au niveau d'un sein pendant que l'autre reste couvert. Le maillot reste en place, aucun risque d'être surprise à moitié dévêtue.`,
    })
  } else {
    faqs.push({
      q: `Comment fonctionne l'ouverture d'allaitement de cette ${sing} ?`,
      a: `L'ouverture est dissimulée dans la coupe : doubles épaisseurs, plis croisés ou fermeture invisible selon le modèle. Vous accédez au sein sans que l'ouverture soit visible de l'extérieur. Bébé peut téter discrètement en public.`,
    })
  }

  // FAQ 2: Material / care
  if (attrs.materials.length > 0) {
    faqs.push({
      q: `Comment entretenir le ${attrs.materials[0]} de cette ${sing} ?`,
      a: `Lavage machine à 30°C, programme délicat, séchage à l'air libre de préférence. Évitez le sèche-linge qui fragilise les fibres et les élastomères. Un repassage léger peut être nécessaire selon la matière.`,
    })
  } else {
    faqs.push({
      q: `Comment entretenir cette ${sing} ?`,
      a: `Lavage en machine à 30°C sur programme délicat, séchage à l'air libre pour préserver la coupe et les élastomères. Éviter le sèche-linge.`,
    })
  }

  // FAQ 3: When can I use it?
  if (attrs.seasons.includes("été")) {
    faqs.push({
      q: `Puis-je la porter toute l'année ?`,
      a: `Cette pièce est conçue principalement pour l'été grâce à sa matière légère. En mi-saison, portez-la avec une veste ou un cardigan d'allaitement. En hiver, préférez une pièce en ${attrs.materials.includes("molleton") ? "autre matière" : "molleton ou maille plus épaisse"}.`,
    })
  } else if (attrs.seasons.includes("hiver")) {
    faqs.push({
      q: `Est-elle adaptée aux journées froides ?`,
      a: `Oui, la matière ${attrs.materials[0] || "épaisse"} offre une bonne tenue thermique. Superposez avec un t-shirt d'allaitement en couche de base pour gagner encore en chaleur sans perdre en praticité.`,
    })
  } else {
    faqs.push({
      q: `Puis-je la porter pendant ma grossesse ?`,
      a: `Oui, cette ${sing} est évolutive : sa coupe s'adapte à la silhouette pendant les 9 mois de grossesse, puis pendant toute la période d'allaitement. Vous pouvez même la garder après le sevrage comme pièce classique.`,
    })
  }

  // FAQ 4: Brand
  faqs.push({
    q: `Pourquoi la marque ${brand} pour l'allaitement ?`,
    a: `${brand} est une marque reconnue dans l'univers maternité pour la qualité de ses tissus et le soin apporté aux ouvertures d'allaitement. Ses pièces sont pensées par et pour les jeunes mamans, avec un vrai souci du détail pratique.`,
  })

  return faqs
}

export default async function rewriteVetementsUniqueV2({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const dataPath = path.resolve(__dirname, "vetements-data.json")
  const data = JSON.parse(readFileSync(dataPath, "utf8"))

  const sourceMap = new Map<string, any>()
  for (const [col, products] of Object.entries(data) as Array<[string, any[]]>) {
    for (const p of products) {
      const colors = new Set(p.variants.map((v: any) => v.color).filter(Boolean))
      const sizes = new Set(p.variants.map((v: any) => v.size).filter(Boolean))
      sourceMap.set(p.groupId.toLowerCase(), {
        title: p.title,
        brand: p.brand,
        description: p.description || "",
        collection: col,
        colorCount: colors.size,
        sizeCount: sizes.size,
      })
    }
  }

  const res = await pg.raw(
    `SELECT id, handle FROM product WHERE handle LIKE 'vb-%' AND deleted_at IS NULL`
  )

  let updated = 0
  for (const p of res.rows || []) {
    const match = /^vb-([^-]+)-/.exec(p.handle)
    if (!match) continue
    const src = sourceMap.get(match[1].toLowerCase())
    if (!src) continue

    const titleCap = src.title.charAt(0).toUpperCase() + src.title.slice(1)
    const attrs = extractAttributes(src.title, src.description)
    const labels = COLLECTION_LABELS[src.collection] || { sing: "pièce d'allaitement", plural: "vêtements d'allaitement", h2Focus: "cette pièce" }

    // Hash for rotating templates
    const hash = match[1].split("").reduce((h, c) => h + c.charCodeAt(0), 0)

    const intro = generateIntro(titleCap, src.brand, attrs, labels.sing, hash)
    const benefits = generateBenefits(attrs, src.brand, src.colorCount, src.sizeCount)
    const faqs = generateFaqs(titleCap, src.brand, attrs, labels.sing)

    // Build description
    const benefitsHtml = benefits.map((b) => `<li>${b}</li>`).join("\n")

    // Feature-specific section (varies per product attributes)
    let featureSection = ""
    if (attrs.materials.length > 0 && attrs.styles.length > 0) {
      featureSection = `<h2>Zoom sur la matière et la coupe</h2>
<p>Cette ${labels.sing} est confectionnée en <strong>${attrs.materials.join(" et ")}</strong> — une matière ${attrs.materials.includes("gaze de coton") ? "ultra-légère et respirante" : attrs.materials.includes("jersey") ? "extensible et confortable" : attrs.materials.includes("molleton") ? "chaude et douillette" : "soignée et durable"}. ${attrs.styles.length > 0 ? `La coupe ${attrs.styles[0]} ${attrs.styles.includes("coupe fluide") || attrs.styles.includes("coupe ample") ? "s'adapte aux changements de silhouette au fil des mois" : "offre un tombé élégant qui flatte la silhouette post-partum"}.` : ""} ${attrs.patterns.length > 0 ? `Le motif ${attrs.patterns[0]} apporte une touche de caractère.` : ""}</p>`
    }

    const faqsHtml = faqs.map((f) => `<details class="group border border-border-light rounded-xl bg-white mt-2"><summary class="p-4 cursor-pointer text-sm font-semibold">${f.q}</summary><div class="px-4 pb-4 text-sm text-text-light">${f.a}</div></details>`).join("\n")

    const description = `${intro}

<h2>Pourquoi choisir ${labels.h2Focus} ?</h2>
<ul>
${benefitsHtml}
</ul>

${featureSection}

<h2>Questions fréquentes</h2>
${faqsHtml}

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>Vous aimerez aussi :</strong> découvrez toute notre sélection de <a href="/collections/${src.collection}" class="text-primary hover:underline font-medium">${labels.plural}</a> ou notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline font-medium">vêtements d'allaitement</a>.</p>
</div>`

    const subtitle = `${labels.sing.charAt(0).toUpperCase() + labels.sing.slice(1)} ${src.brand}${attrs.materials.length > 0 ? ` en ${attrs.materials[0]}` : ""}${attrs.patterns.length > 0 ? ` — ${attrs.patterns[0]}` : ""}`.substring(0, 180)

    // Update product + its metadata (benefits, faqs)
    await pg.raw(
      `UPDATE product SET description = ?, subtitle = ?, metadata = metadata
         || jsonb_build_object('benefits', ?::jsonb)
         || jsonb_build_object('faqs', ?::jsonb)
       WHERE id = ?`,
      [description, subtitle, JSON.stringify(benefits), JSON.stringify(faqs), p.id]
    )
    updated++
  }

  logger.info(`  + ${updated} products rewritten with unique content + FAQs + benefits`)
}
