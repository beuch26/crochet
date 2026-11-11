import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { readFileSync } from "node:fs"
import path from "node:path"

/**
 * V3: gender-aware templates + paraphrased source description + varied H2s
 * + fix miscategorization (chemise → tunique).
 */

// Product types with gender + determiners
const TYPES: Record<string, {
  sing: string
  plural: string
  gender: "m" | "f"
  det: { un_une: string; ce_cette: string; nouveau_nouvelle: string; favori_favorite: string; signe_signee: string; pense_pensee: string; confectionne_confectionnee: string; adapte_adaptee: string }
  focusQ: string // H2 focus wording
  collection: string
}> = {
  "robe-allaitement": {
    sing: "robe d'allaitement", plural: "robes d'allaitement", gender: "f",
    det: { un_une: "une", ce_cette: "cette", nouveau_nouvelle: "nouvelle", favori_favorite: "favorite", signe_signee: "signée", pense_pensee: "pensée", confectionne_confectionnee: "confectionnée", adapte_adaptee: "adaptée" },
    focusQ: "cette robe", collection: "robe-allaitement",
  },
  "tunique-allaitement": {
    sing: "tunique d'allaitement", plural: "tuniques d'allaitement", gender: "f",
    det: { un_une: "une", ce_cette: "cette", nouveau_nouvelle: "nouvelle", favori_favorite: "favorite", signe_signee: "signée", pense_pensee: "pensée", confectionne_confectionnee: "confectionnée", adapte_adaptee: "adaptée" },
    focusQ: "cette tunique", collection: "tunique-allaitement",
  },
  "pyjama-allaitement": {
    sing: "pyjama d'allaitement", plural: "pyjamas d'allaitement", gender: "m",
    det: { un_une: "un", ce_cette: "ce", nouveau_nouvelle: "nouveau", favori_favorite: "favori", signe_signee: "signé", pense_pensee: "pensé", confectionne_confectionnee: "confectionné", adapte_adaptee: "adapté" },
    focusQ: "ce pyjama", collection: "pyjama-allaitement",
  },
  "pull-allaitement": {
    sing: "pull d'allaitement", plural: "pulls d'allaitement", gender: "m",
    det: { un_une: "un", ce_cette: "ce", nouveau_nouvelle: "nouveau", favori_favorite: "favori", signe_signee: "signé", pense_pensee: "pensé", confectionne_confectionnee: "confectionné", adapte_adaptee: "adapté" },
    focusQ: "ce pull", collection: "pull-allaitement",
  },
  "t-shirt-allaitement": {
    sing: "t-shirt d'allaitement", plural: "t-shirts d'allaitement", gender: "m",
    det: { un_une: "un", ce_cette: "ce", nouveau_nouvelle: "nouveau", favori_favorite: "favori", signe_signee: "signé", pense_pensee: "pensé", confectionne_confectionnee: "confectionné", adapte_adaptee: "adapté" },
    focusQ: "ce t-shirt", collection: "t-shirt-allaitement",
  },
  "salopette-allaitement": {
    sing: "salopette d'allaitement", plural: "salopettes d'allaitement", gender: "f",
    det: { un_une: "une", ce_cette: "cette", nouveau_nouvelle: "nouvelle", favori_favorite: "favorite", signe_signee: "signée", pense_pensee: "pensée", confectionne_confectionnee: "confectionnée", adapte_adaptee: "adaptée" },
    focusQ: "cette salopette", collection: "salopette-allaitement",
  },
  "maillot-bain-allaitement": {
    sing: "maillot de bain d'allaitement", plural: "maillots de bain d'allaitement", gender: "m",
    det: { un_une: "un", ce_cette: "ce", nouveau_nouvelle: "nouveau", favori_favorite: "favori", signe_signee: "signé", pense_pensee: "pensé", confectionne_confectionnee: "confectionné", adapte_adaptee: "adapté" },
    focusQ: "ce maillot", collection: "maillot-bain-allaitement",
  },
  "pantalon-allaitement": {
    sing: "pantalon d'allaitement", plural: "pantalons d'allaitement", gender: "m",
    det: { un_une: "un", ce_cette: "ce", nouveau_nouvelle: "nouveau", favori_favorite: "favori", signe_signee: "signé", pense_pensee: "pensé", confectionne_confectionnee: "confectionné", adapte_adaptee: "adapté" },
    focusQ: "ce pantalon", collection: "pantalon-allaitement",
  },
}

// Extract attributes from title/desc
function extractAttributes(title: string, sourceDesc: string) {
  const txt = (title + " " + sourceDesc).toLowerCase()
  const materials: string[] = []
  const styles: string[] = []
  const patterns: string[] = []
  const seasons: string[] = []

  if (/gaze de coton/.test(txt)) materials.push("gaze de coton")
  else if (/coton bio/.test(txt)) materials.push("coton bio")
  else if (/\bcoton\b/.test(txt)) materials.push("coton")
  if (/jersey/.test(txt)) materials.push("jersey")
  if (/\blin\b/.test(txt)) materials.push("lin")
  if (/molleton/.test(txt)) materials.push("molleton")
  if (/satin/.test(txt)) materials.push("satin")
  if (/dentelle/.test(txt)) materials.push("dentelle")
  if (/broderie/.test(txt)) materials.push("broderie anglaise")
  if (/velours/.test(txt)) materials.push("velours")
  if (/maille/.test(txt)) materials.push("maille")
  if (/viscose/.test(txt)) materials.push("viscose")
  if (/lyocell/.test(txt)) materials.push("lyocell")

  if (/cache.?coeur/.test(txt)) styles.push("cache-cœur")
  if (/portefeuille/.test(txt)) styles.push("portefeuille")
  if (/fluide/.test(txt)) styles.push("coupe fluide")
  if (/ample/.test(txt)) styles.push("coupe ample")
  if (/volants?/.test(txt)) styles.push("à volants")
  if (/manches longues/.test(txt)) styles.push("manches longues")
  if (/manches courtes/.test(txt)) styles.push("manches courtes")
  if (/sans manches/.test(txt)) styles.push("sans manches")
  if (/\blongue?\b/.test(txt) && !styles.includes("coupe fluide")) styles.push("coupe longue")
  if (/\bcourte?\b/.test(txt)) styles.push("coupe courte")
  if (/boutonn/.test(txt)) styles.push("fermeture boutonnée")
  if (/fines bretelles/.test(txt)) styles.push("fines bretelles")
  if (/evolutif|évolutif/.test(txt)) styles.push("évolutif")

  if (/leopard|léopard/.test(txt)) patterns.push("imprimé léopard")
  if (/ray[eé]|rayures?/.test(txt)) patterns.push("rayé")
  if (/pois/.test(txt)) patterns.push("à pois")
  if (/fleuri/.test(txt)) patterns.push("fleuri")

  if (/été|ete\b|estival|plage|vacances|beaux jours/.test(txt)) seasons.push("été")
  if (/hiver|hivernal|froid|chaleur|douillet/.test(txt)) seasons.push("hiver")
  if (/mi.saison|automne|printemps/.test(txt)) seasons.push("mi-saison")

  return { materials, styles, patterns, seasons }
}

// Rewrite the type if miscategorized (e.g., "chemise en jean" classified as pantalon should stay tunique)
function detectRealType(title: string, currentCollection: string): string {
  const lower = title.toLowerCase()
  if (/^chemise\s/.test(lower) || /^blouse\s/.test(lower) || /\bchemisier\b/.test(lower)) return "tunique-allaitement"
  if (/chemise de nuit|nuisette/.test(lower)) return "pyjama-allaitement"
  if (/\brobe\b/.test(lower)) return "robe-allaitement"
  return currentCollection
}

// Paraphrase / clean the source description
function paraphraseSource(raw: string, title: string): string {
  if (!raw || raw.length < 50) return ""
  let s = raw.replace(/\s+/g, " ").replace(/\?!/g, "!").trim()

  // Remove repeats of the title in the body (often Vertbaudet starts with title)
  const titleStart = title.substring(0, Math.min(title.length, 50)).toLowerCase()
  const bodyLower = s.toLowerCase()
  if (bodyLower.startsWith(titleStart.toLowerCase())) {
    s = s.substring(Math.min(s.length, 60))
  }

  // Common Vertbaudet phrasing substitutions (light paraphrase)
  const subs: Array<[RegExp, string]> = [
    [/Must-have/gi, "Incontournable"],
    [/must-have/g, "incontournable"],
    [/Coup de coeur/gi, "Notre sélection"],
    [/coup de coeur/g, "pièce remarquable"],
    [/pile dans la tendance/g, "parfaitement tendance"],
    [/vous enveloppera/g, "vous enveloppe"],
    [/accompagnera/g, "accompagne"],
    [/nos adoré/g, "nos préférés"],
    [/on adore/g, "nous adorons"],
  ]
  for (const [p, r] of subs) s = s.replace(p, r)

  // Split into sentences, take first 2-4 meaningful ones
  const sentences = s.split(/(?<=[.!?])\s+/).filter((x) => x.trim().length > 20)
  const picked = sentences.slice(0, 3).join(" ").trim()

  return picked
}

// Generate varied intro based on attributes + hash
function generateIntro(title: string, brand: string, attrs: ReturnType<typeof extractAttributes>, type: typeof TYPES[string], hash: number): string {
  const d = type.det
  const materialPhrase = attrs.materials[0] ? ` en ${attrs.materials[0]}` : ""
  const stylePhrase = attrs.styles.length > 0 ? `, ${attrs.styles.slice(0, 2).join(" et ")}` : ""
  const patternPhrase = attrs.patterns[0] ? ` avec son motif ${attrs.patterns[0]}` : ""

  const intros = [
    `<p><strong>${title}</strong> — ${d.un_une} ${type.sing}${materialPhrase}${stylePhrase} ${d.signe_signee} ${brand}${patternPhrase}. ${d.un_une.charAt(0).toUpperCase() + d.un_une.slice(1)} pièce ${d.pense_pensee} pour vivre votre maternité avec confort et discrétion.</p>`,
    `<p>${d.un_une.charAt(0).toUpperCase() + d.un_une.slice(1)} ${d.nouveau_nouvelle} ${type.sing} dans votre dressing : <strong>${title}</strong> de ${brand}${materialPhrase}${patternPhrase}. Son ouverture discrète vous permet de donner le sein en quelques secondes, où que vous soyez.</p>`,
    `<p>Craquez pour <strong>${title}</strong>, ${type.sing} ${brand}${patternPhrase}${stylePhrase}. Sa matière ${attrs.materials[0] || "soignée"} et son système d'allaitement invisible en font ${d.un_une} allié idéal pour la maternité.</p>`,
    `<p>${brand} imagine avec <strong>${title}</strong> ${d.un_une} ${type.sing}${stylePhrase}${patternPhrase}, ${d.pense_pensee} pour accompagner chaque étape de votre maternité — grossesse, allaitement et au-delà.</p>`,
    `<p>Découvrez <strong>${title}</strong>, notre sélection ${type.sing} ${brand}${materialPhrase}. ${attrs.seasons[0] === "été" ? "Parfait pour les beaux jours" : attrs.seasons[0] === "hiver" ? "Idéal pour les journées fraîches" : "À porter toute l'année"}, avec ouverture discrète pour les tétées.</p>`,
    `<p><strong>${title}</strong> de ${brand} — ${d.un_une} ${type.sing} qui allie ${attrs.materials[0] ? attrs.materials[0] : "confort"} et praticité. ${attrs.styles.length > 0 ? `Son ${attrs.styles[0]} apporte une touche d'élégance` : "Un incontournable de la maternité moderne"}.</p>`,
  ]
  return intros[hash % intros.length]
}

// Generate varied H2 for the "focus" section (rotated)
function chooseFocusH2(hash: number, type: typeof TYPES[string]): string {
  const options = [
    `Focus sur la matière et la coupe`,
    `Ce que l'on aime dans ${type.focusQ}`,
    `Les détails qui font la différence`,
    `Caractéristiques et style`,
    `Ce qui distingue ${type.focusQ}`,
  ]
  return options[hash % options.length]
}

function chooseWhyH2(hash: number, type: typeof TYPES[string]): string {
  const options = [
    `Pourquoi choisir ${type.focusQ} ?`,
    `Les points forts de ${type.focusQ}`,
    `À qui s'adresse ${type.focusQ} ?`,
    `${type.focusQ.charAt(0).toUpperCase() + type.focusQ.slice(1)} en un coup d'œil`,
    `Le ${type.sing.split(" ")[0]} qu'il vous faut`,
  ]
  return options[hash % options.length]
}

function generateBenefits(attrs: ReturnType<typeof extractAttributes>, type: typeof TYPES[string], colorCount: number, sizeCount: number): string[] {
  const benefits: string[] = []
  benefits.push("Ouverture dédiée allaitement pour des tétées discrètes")
  if (attrs.materials[0]) benefits.push(`Confectionné${type.gender === "f" ? "e" : ""} en ${attrs.materials[0]}${attrs.materials.length > 1 ? ` (avec ${attrs.materials.slice(1).join(", ")})` : ""}`)
  if (attrs.styles.some((s) => s.includes("cache-cœur"))) benefits.push("Décolleté cache-cœur pour accès rapide au sein")
  else if (attrs.styles.includes("coupe fluide")) benefits.push("Coupe fluide qui suit l'évolution de la silhouette")
  else if (attrs.styles.includes("coupe ample")) benefits.push("Coupe ample confortable au quotidien")
  if (attrs.seasons.includes("été")) benefits.push("Matière respirante idéale pour les beaux jours")
  if (attrs.seasons.includes("hiver")) benefits.push("Tissu chaud adapté aux journées froides")
  if (colorCount > 1) benefits.push(`${colorCount} coloris au choix`)
  if (sizeCount > 1) benefits.push(`Disponible en ${sizeCount} tailles`)
  benefits.push("Évolutif : grossesse, allaitement et au-delà")
  return benefits.slice(0, 6)
}

function generateFocusParagraph(attrs: ReturnType<typeof extractAttributes>, type: typeof TYPES[string]): string {
  if (attrs.materials.length === 0 && attrs.styles.length === 0) return ""
  const matInfo = attrs.materials[0]
    ? `Confectionné${type.gender === "f" ? "e" : ""} en <strong>${attrs.materials.join(" et ")}</strong> — ${attrs.materials[0] === "gaze de coton" ? "une matière ultra-légère, respirante et d'une douceur incomparable" : attrs.materials[0] === "jersey" ? "un tissu extensible et confortable qui suit les mouvements" : attrs.materials[0] === "molleton" ? "une maille épaisse et douillette parfaite pour l'hiver" : attrs.materials[0] === "lin" ? "une matière naturelle qui se patine joliment avec le temps" : attrs.materials[0] === "coton bio" ? "un coton certifié respectueux de l'environnement" : "une matière de qualité sélectionnée pour durer"}.`
    : ""
  const styleInfo = attrs.styles.length > 0
    ? ` La ${attrs.styles[0]} ${attrs.styles.some((s) => s.includes("fluide") || s.includes("ample")) ? "s'adapte aux changements de silhouette au fil des mois" : attrs.styles.some((s) => s.includes("cache-cœur") || s.includes("portefeuille")) ? "facilite l'accès au sein en un geste" : "apporte une allure soignée"}.`
    : ""
  const patternInfo = attrs.patterns[0] ? ` Le motif ${attrs.patterns[0]} donne du caractère à la pièce.` : ""
  return `<p>${matInfo}${styleInfo}${patternInfo}</p>`
}

// More variety in FAQ generation based on attributes
function generateFaqs(title: string, brand: string, attrs: ReturnType<typeof extractAttributes>, type: typeof TYPES[string]): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = []

  // FAQ 1: Opening mechanism
  if (attrs.styles.some((s) => s.includes("cache-cœur") || s.includes("portefeuille"))) {
    faqs.push({ q: `Comment donner le sein avec ${type.focusQ} cache-cœur ?`, a: `Le décolleté cache-cœur se soulève ou s'écarte d'une main en quelques secondes, juste le temps d'exposer un sein. Le tissu retombe naturellement ensuite — aucun bouton à défaire, aucune manipulation complexe. Idéal pour allaiter en public ou à l'extérieur.` })
  } else if (attrs.styles.includes("fermeture boutonnée")) {
    faqs.push({ q: `Les boutons sont-ils pratiques pour l'allaitement ?`, a: `Oui, ce sont des boutons placés stratégiquement au niveau de la poitrine : vous défaites uniquement ceux nécessaires pour donner le sein, sans découvrir le reste du corps. Ils peuvent être manipulés d'une seule main, ce qui est précieux pour les tétées de nuit.` })
  } else if (type.sing.includes("maillot")) {
    faqs.push({ q: `Comment allaiter avec ce maillot de bain ?`, a: `Les bonnets s'ouvrent par clips invisibles ou plis croisés. Vous soulevez ou écartez le tissu d'un sein à la fois, tandis que le reste du maillot reste en place. Vous pouvez donner le sein à la plage ou à la piscine sans avoir à vous rhabiller.` })
  } else {
    faqs.push({ q: `Comment fonctionne l'ouverture d'allaitement ?`, a: `L'ouverture est intégrée à la coupe — double épaisseur, plis croisés ou fermeture invisible selon le modèle. Vous accédez au sein discrètement, sans que l'ouverture ne soit visible de l'extérieur. Bébé peut téter en toute tranquillité, même en public.` })
  }

  // FAQ 2: Material care (if material detected)
  if (attrs.materials[0] === "gaze de coton") {
    faqs.push({ q: `Comment entretenir la gaze de coton ?`, a: `Lavage en machine à 30°C, programme délicat de préférence. La gaze de coton peut être froissée après le lavage, ce qui lui donne son charme. Un léger repassage peut suffire si vous préférez un rendu plus lisse. Évitez le sèche-linge qui fragilise la matière.` })
  } else if (attrs.materials.includes("molleton")) {
    faqs.push({ q: `Cette pièce en molleton rétrécit-elle au lavage ?`, a: `Pour préserver la tenue du molleton, lavez à 30°C maximum et privilégiez le séchage à plat ou sur cintre. Évitez le sèche-linge qui peut déformer la matière. Un passage en machine à basse température maintient la qualité sur la durée.` })
  } else if (attrs.materials.includes("jersey")) {
    faqs.push({ q: `Le jersey reste-t-il élastique après plusieurs lavages ?`, a: `Oui, à condition de respecter un lavage à 30°C maximum et d'éviter le sèche-linge. Le jersey conserve son élasticité initiale pendant plusieurs années avec un entretien soigné. C'est une matière qui se bonifie avec le temps.` })
  } else if (attrs.materials.length > 0) {
    faqs.push({ q: `Comment entretenir cette pièce ?`, a: `Lavage en machine à 30°C sur programme délicat, séchage à l'air libre pour préserver la tenue. Évitez le sèche-linge qui peut fragiliser les fibres et les élastomères. Un repassage léger à basse température peut être utile selon la matière.` })
  } else {
    faqs.push({ q: `Quelles sont les recommandations de lavage ?`, a: `Lavage machine à 30°C programme délicat, séchage à l'air libre, pas de sèche-linge. Ces règles simples permettent de conserver la tenue, la couleur et les élastomères sur la durée.` })
  }

  // FAQ 3: Sizing
  faqs.push({ q: `Dans quelle taille commander ?`, a: `Prenez votre taille habituelle avant grossesse. La coupe est conçue pour accompagner les changements de silhouette sans devoir monter en taille. Si vous hésitez entre deux tailles, privilégiez la plus grande pour le confort post-partum. Consultez notre guide des tailles sur la page produit.` })

  // FAQ 4: When/how to wear (season-specific)
  if (attrs.seasons.includes("été")) {
    faqs.push({ q: `Est-ce une pièce d'été uniquement ?`, a: `Principalement oui, grâce à sa matière légère. En mi-saison, vous pouvez la porter avec une veste ou un cardigan d'allaitement. En hiver, il sera plus confortable de privilégier une pièce plus chaude.` })
  } else if (attrs.seasons.includes("hiver")) {
    faqs.push({ q: `Convient-elle aux journées très froides ?`, a: `Oui, la matière chaude offre une bonne tenue thermique. Pour encore plus de chaleur, portez-la par-dessus un t-shirt d'allaitement en couche intermédiaire. Vous pouvez aussi la combiner avec un gilet pour les extérieurs.` })
  } else {
    faqs.push({ q: `Puis-je la porter pendant ma grossesse ?`, a: `Absolument. Cette pièce est conçue pour être évolutive : sa coupe s'adapte à la silhouette de la grossesse, puis à celle du post-partum. Vous la porterez donc pendant les 9 mois et au-delà, y compris après le sevrage.` })
  }

  return faqs
}

export default async function rewriteVetementsV3({ container }: ExecArgs) {
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
    `SELECT id, handle, collection_id FROM product WHERE handle LIKE 'vb-%' AND deleted_at IS NULL`
  )

  let updated = 0
  let reclassified = 0

  for (const p of res.rows || []) {
    const match = /^vb-([^-]+)-/.exec(p.handle)
    if (!match) continue
    const src = sourceMap.get(match[1].toLowerCase())
    if (!src) continue

    const titleCap = src.title.charAt(0).toUpperCase() + src.title.slice(1)
    const realColl = detectRealType(src.title, src.collection)
    const type = TYPES[realColl] || TYPES[src.collection] || TYPES["tunique-allaitement"]
    const attrs = extractAttributes(src.title, src.description)

    // Reclassify if detection differs from current collection
    if (realColl !== src.collection) {
      const newColRes = await pg.raw(`SELECT id FROM product_collection WHERE handle = ? AND deleted_at IS NULL`, [realColl])
      const newColId = newColRes.rows?.[0]?.id
      if (newColId && newColId !== p.collection_id) {
        await pg.raw(`UPDATE product SET collection_id = ? WHERE id = ?`, [newColId, p.id])
        reclassified++
      }
    }

    const hash = match[1].split("").reduce((h, c) => h + c.charCodeAt(0), 0)

    const intro = generateIntro(titleCap, src.brand, attrs, type, hash)
    const benefits = generateBenefits(attrs, type, src.colorCount, src.sizeCount)
    const focusH2 = chooseFocusH2(hash, type)
    const whyH2 = chooseWhyH2(hash, type)
    const paraphrase = paraphraseSource(src.description, src.title)
    const focusPara = generateFocusParagraph(attrs, type)
    const faqs = generateFaqs(titleCap, src.brand, attrs, type)

    const benefitsHtml = benefits.map((b) => `<li>${b}</li>`).join("\n")
    const faqsHtml = faqs.map((f) => `<details class="group border border-border-light rounded-xl bg-white mt-2"><summary class="p-4 cursor-pointer text-sm font-semibold">${f.q}</summary><div class="px-4 pb-4 text-sm text-text-light">${f.a}</div></details>`).join("\n")

    const paraphraseBlock = paraphrase ? `<h2>À propos de cette pièce</h2>\n<p>${paraphrase}</p>\n\n` : ""

    const description = `${intro}

<h2>${whyH2}</h2>
<ul>
${benefitsHtml}
</ul>

${paraphraseBlock}${focusPara ? `<h2>${focusH2}</h2>\n${focusPara}\n\n` : ""}<h2>Questions fréquentes</h2>
${faqsHtml}

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>Vous aimerez aussi :</strong> découvrez toute notre sélection de <a href="/collections/${type.collection}" class="text-primary hover:underline font-medium">${type.plural}</a> ou notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline font-medium">vêtements d'allaitement</a>.</p>
</div>`

    // Subtitle with correct gender
    const subtitle = `${type.sing.charAt(0).toUpperCase() + type.sing.slice(1)} ${src.brand}${attrs.materials[0] ? ` ${type.gender === "f" ? "en" : "en"} ${attrs.materials[0]}` : ""}${attrs.patterns[0] ? ` — ${attrs.patterns[0]}` : ""}`.substring(0, 180)

    await pg.raw(
      `UPDATE product SET description = ?, subtitle = ?, metadata = metadata
         || jsonb_build_object('benefits', ?::jsonb)
         || jsonb_build_object('faqs', ?::jsonb)
       WHERE id = ?`,
      [description, subtitle, JSON.stringify(benefits), JSON.stringify(faqs), p.id]
    )
    updated++
  }

  logger.info(`  + ${updated} products rewritten (v3: gender-aware, paraphrase, varied H2s)`)
  logger.info(`  + ${reclassified} products reclassified (wrong sub-collection)`)
  logger.info("Done!")
}
