import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Fix vetements-allaitement products:
 *   - Replace broken "Quand le porter" section (bad anchors + unaccented)
 *   - Fix accent issues in descriptions (pieces -> pièce, ideale -> idéale, etc.)
 *   - Better keyword-rich internal link anchors
 */

const COLLECTION_LABELS: Record<string, { label: string; plural: string }> = {
  "robe-allaitement": { label: "robe d'allaitement", plural: "robes d'allaitement" },
  "tunique-allaitement": { label: "tunique d'allaitement", plural: "tuniques d'allaitement" },
  "pyjama-allaitement": { label: "pyjama d'allaitement", plural: "pyjamas d'allaitement" },
  "pull-allaitement": { label: "pull d'allaitement", plural: "pulls d'allaitement" },
  "t-shirt-allaitement": { label: "t-shirt d'allaitement", plural: "t-shirts d'allaitement" },
  "salopette-allaitement": { label: "salopette d'allaitement", plural: "salopettes d'allaitement" },
  "maillot-bain-allaitement": { label: "maillot de bain d'allaitement", plural: "maillots de bain d'allaitement" },
  "pantalon-allaitement": { label: "pantalon d'allaitement", plural: "pantalons d'allaitement" },
}

const QUAND_PORTER: Record<string, string> = {
  "robe-allaitement": `<h2>Quand porter cette robe d'allaitement ?</h2>
<p>Cette robe d'allaitement vous accompagne au <strong>bureau</strong>, lors de vos <strong>sorties en ville</strong>, aux <strong>évènements familiaux</strong> (mariages, baptêmes) et au quotidien. Grâce à son ouverture discrète, vous pouvez allaiter où que vous soyez sans avoir à vous déshabiller.</p>`,
  "tunique-allaitement": `<h2>Quand porter cette tunique d'allaitement ?</h2>
<p>Parfaite pour le <strong>bureau</strong> (les collègues ne verront aucune différence avec une tunique classique), les <strong>sorties en ville</strong> et les <strong>rendez-vous</strong>. À associer à un legging, un pantalon de tailleur ou une jupe selon l'occasion.</p>`,
  "pyjama-allaitement": `<h2>Quand porter ce pyjama d'allaitement ?</h2>
<p>Conçu pour les <strong>tétées de nuit</strong> et le confort <strong>post-partum</strong>. Ouvertures facilement manipulables d'une seule main et dans le noir — idéal quand bébé vous réveille à 3 heures du matin.</p>`,
  "pull-allaitement": `<h2>Quand porter ce pull d'allaitement ?</h2>
<p>Idéal pour les mois d'<strong>automne et d'hiver</strong> : maintenez bébé au chaud lors des tétées en terrasse, au parc ou dans un café. L'ouverture discrète dédiée à l'allaitement évite d'exposer bébé au froid.</p>`,
  "t-shirt-allaitement": `<h2>Quand porter ce t-shirt d'allaitement ?</h2>
<p>Le basique du dressing maternité : à porter au <strong>quotidien</strong>, seul en été ou en couche intermédiaire en hiver. Prévoyez-en plusieurs pour alterner les premiers mois où les fuites de lait sont fréquentes.</p>`,
  "salopette-allaitement": `<h2>Quand porter cette salopette d'allaitement ?</h2>
<p>Pour un look <strong>décontracté tendance</strong> : sorties au parc, pique-niques, courses en ville ou journées à la maison. À associer avec un t-shirt basique ou un body pour un style casual chic.</p>`,
  "maillot-bain-allaitement": `<h2>Quand porter ce maillot de bain d'allaitement ?</h2>
<p>À la <strong>piscine</strong>, à la <strong>plage</strong> ou en <strong>vacances</strong>. Les bonnets ouvrables permettent de donner le sein en toute discrétion sans avoir à retirer le maillot complet.</p>`,
  "pantalon-allaitement": `<h2>Quand porter ce pantalon d'allaitement ?</h2>
<p>Au <strong>quotidien</strong> — la ceinture élastique douce s'adapte parfaitement à la silhouette qui change semaine après semaine en post-partum. À porter avec une tunique d'allaitement pour une tenue complète.</p>`,
}

// Basic accent replacements (targeted to common issues in vetements descriptions)
const ACCENT_FIXES: Array<[RegExp, string]> = [
  [/\bpiece\b/g, "pièce"],
  [/\bpieces\b/g, "pièces"],
  [/\bideale\b/g, "idéale"],
  [/\bevenement\b/g, "événement"],
  [/\bevenements\b/g, "événements"],
  [/\btetees\b/g, "tétées"],
  [/\btetee\b/g, "tétée"],
  [/\belegant\b/g, "élégant"],
  [/\belegante\b/g, "élégante"],
  [/\belegamment\b/g, "élégamment"],
  [/\bdediee\b/g, "dédiée"],
  [/\bdedie\b/g, "dédié"],
  [/\bdiscrete\b/g, "discrète"],
  [/\bDiscrete\b/g, "Discrète"],
  [/\bdiscret\b/g, "discret"],
  [/\bdouble epaisseur\b/g, "double épaisseur"],
  [/\bcroises\b/g, "croisés"],
  [/\bflatteuse\b/g, "flatteuse"], // already correct
  [/\bsilhouette\b/g, "silhouette"], // correct
  [/\bpremiers mois\b/g, "premiers mois"], // correct
  [/\bselectionnee\b/g, "sélectionnée"],
  [/\bselectionne\b/g, "sélectionné"],
  [/\bSelectionne\b/g, "Sélectionné"],
  [/\bselection\b/g, "sélection"],
  [/\bSelection\b/g, "Sélection"],
  [/\bqualite\b/g, "qualité"],
  [/\bfinitions\b/g, "finitions"], // correct
  [/\bporter\b/g, "porter"], // correct (not porté)
  [/\bporte\b/g, "porté"],
  [/\bportee\b/g, "portée"],
  [/\bevolutif\b/g, "évolutif"],
  [/\bevolutive\b/g, "évolutive"],
  [/\bmaternite\b/g, "maternité"],
  [/\bsevrage\b/g, "sevrage"], // correct
  [/\bcaracteristiques\b/g, "caractéristiques"],
  [/\bCaracteristiques\b/g, "Caractéristiques"],
  [/\bdecouvrez\b/g, "découvrez"],
  [/\bDecouvrez\b/g, "Découvrez"],
  [/\bparcourez\b/g, "parcourez"], // correct
  [/\bcategorie\b/g, "catégorie"],
  [/\bcategories\b/g, "catégories"],
  [/\baccede\b/g, "accède"],
  [/\bacces\b/g, "accès"],
  [/\breste\b/g, "reste"], // correct
  [/\bcherie\b/g, "chérie"],
  [/\bdecol\b/g, "décol"],
  [/\bcoupe\b/g, "coupe"], // correct
  [/\bmere\b/g, "mère"],
  [/\bmeres\b/g, "mères"],
]

export default async function fixVetementsDescriptions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  // Get all vb- products
  const res = await pg.raw(
    `SELECT p.id, p.handle, p.description, p.subtitle, pc.handle AS collection_handle
     FROM product p
     LEFT JOIN product_collection pc ON pc.id = p.collection_id
     WHERE p.handle LIKE 'vb-%' AND p.deleted_at IS NULL`
  )

  let updated = 0
  for (const p of res.rows || []) {
    let desc = p.description || ""
    let sub = p.subtitle || ""

    // 1. Replace the old "Quand le porter" / "Cette piece..." section entirely
    const newQuandPorter = QUAND_PORTER[p.collection_handle] || ""
    desc = desc.replace(
      /<h2>Quand le porter \?<\/h2>\s*<p>Cette piece d'allaitement est ideale pour :[\s\S]*?<\/p>/,
      newQuandPorter
    )

    // 2. Apply accent fixes
    for (const [pattern, replacement] of ACCENT_FIXES) {
      desc = desc.replace(pattern, replacement)
      sub = sub.replace(pattern, replacement)
    }

    // 3. Improve "Vous aimerez aussi" block with keyword-rich anchor
    const labels = COLLECTION_LABELS[p.collection_handle]
    if (labels) {
      // Replace the generic "vetements d'allaitement" anchor with more specific
      desc = desc.replace(
        /<a href="\/collections\/([^"]*)" class="text-primary hover:underline font-medium">([^<]*)<\/a>/g,
        (match, href, anchor) => {
          // If the anchor is already keyword-rich (contains "d'allaitement"), keep it
          if (anchor.includes("allaitement") || anchor.includes("soutien")) return match
          // If it points to the sub-collection of this product, use the plural label
          if (href === p.collection_handle) {
            return `<a href="/collections/${href}" class="text-primary hover:underline font-medium">${labels.plural}</a>`
          }
          return match
        }
      )
    }

    if (desc !== p.description || sub !== p.subtitle) {
      await pg.raw(
        `UPDATE product SET description = ?, subtitle = ? WHERE id = ?`,
        [desc, sub, p.id]
      )
      updated++
    }
  }

  logger.info(`  + ${updated} products updated`)

  // Also fix the collection pages intro_text and seo_text for the same issues
  const colsRes = await pg.raw(
    `SELECT id, handle, metadata FROM product_collection
     WHERE handle IN ('vetements-allaitement','robe-allaitement','tunique-allaitement',
                       'pyjama-allaitement','pull-allaitement','t-shirt-allaitement',
                       'salopette-allaitement','maillot-bain-allaitement','pantalon-allaitement')
     AND deleted_at IS NULL`
  )

  let colUpdated = 0
  for (const c of colsRes.rows || []) {
    const meta = c.metadata || {}
    const newMeta: any = { ...meta }
    let changed = false
    for (const key of ["intro_text", "seo_text", "meta_title", "meta_description"]) {
      if (typeof meta[key] === "string") {
        let v = meta[key]
        for (const [pattern, replacement] of ACCENT_FIXES) v = v.replace(pattern, replacement)
        if (v !== meta[key]) { newMeta[key] = v; changed = true }
      }
    }
    if (Array.isArray(meta.faqs)) {
      const newFaqs = meta.faqs.map((f: any) => {
        let q = f.q, a = f.a
        for (const [pattern, replacement] of ACCENT_FIXES) { q = q.replace(pattern, replacement); a = a.replace(pattern, replacement) }
        return { q, a }
      })
      if (JSON.stringify(newFaqs) !== JSON.stringify(meta.faqs)) { newMeta.faqs = newFaqs; changed = true }
    }
    if (changed) {
      await pg.raw(`UPDATE product_collection SET metadata = ?::jsonb WHERE id = ?`, [JSON.stringify(newMeta), c.id])
      colUpdated++
    }
  }
  logger.info(`  + ${colUpdated} collections updated`)

  logger.info("Done!")
}
