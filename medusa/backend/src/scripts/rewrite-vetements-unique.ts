import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { readFileSync } from "node:fs"
import path from "node:path"

/**
 * Rewrite all vetements descriptions using the source description from
 * Vertbaudet as the main content (which IS unique per product), wrapped
 * with minimal template around it. Drops the repeating generic sections.
 */

const COLLECTION_LABELS: Record<string, { sing: string; plural: string }> = {
  "robe-allaitement": { sing: "robe d'allaitement", plural: "robes d'allaitement" },
  "tunique-allaitement": { sing: "tunique d'allaitement", plural: "tuniques d'allaitement" },
  "pyjama-allaitement": { sing: "pyjama d'allaitement", plural: "pyjamas d'allaitement" },
  "pull-allaitement": { sing: "pull d'allaitement", plural: "pulls d'allaitement" },
  "t-shirt-allaitement": { sing: "t-shirt d'allaitement", plural: "t-shirts d'allaitement" },
  "salopette-allaitement": { sing: "salopette d'allaitement", plural: "salopettes d'allaitement" },
  "maillot-bain-allaitement": { sing: "maillot de bain d'allaitement", plural: "maillots de bain d'allaitement" },
  "pantalon-allaitement": { sing: "pantalon d'allaitement", plural: "pantalons d'allaitement" },
}

function cleanSourceDesc(raw: string): string {
  if (!raw) return ""
  let s = raw
    .replace(/\?!/g, "!")
    .replace(/\s+/g, " ")
    .trim()

  // Try to split into paragraphs at natural breaks
  // Common separators in Vertbaudet descs: capital letter after period, double spaces, etc.
  // Simple heuristic: split on ". " where next starts with capital
  const sentences = s.split(/(?<=[.!?])\s+/)

  // Group into paragraphs of ~2-3 sentences
  const paragraphs: string[] = []
  for (let i = 0; i < sentences.length; i += 2) {
    const p = sentences.slice(i, i + 2).join(" ").trim()
    if (p) paragraphs.push(p)
  }
  return paragraphs.map((p) => `<p>${p}</p>`).join("\n")
}

export default async function rewriteVetementsUnique({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const dataPath = path.resolve(__dirname, "vetements-data.json")
  const data = JSON.parse(readFileSync(dataPath, "utf8"))

  // Build a map: groupId -> { title, brand, description, collection }
  const sourceMap = new Map<string, { title: string; brand: string; description: string; collection: string; variantCount: number; colorCount: number; sizeCount: number }>()
  for (const [col, products] of Object.entries(data) as Array<[string, any[]]>) {
    for (const p of products) {
      const colors = new Set(p.variants.map((v: any) => v.color).filter(Boolean))
      const sizes = new Set(p.variants.map((v: any) => v.size).filter(Boolean))
      sourceMap.set(p.groupId, {
        title: p.title,
        brand: p.brand,
        description: p.description || "",
        collection: col,
        variantCount: p.variants.length,
        colorCount: colors.size,
        sizeCount: sizes.size,
      })
    }
  }

  // Get all vetements products from DB
  const res = await pg.raw(
    `SELECT id, handle FROM product WHERE handle LIKE 'vb-%' AND deleted_at IS NULL`
  )

  let updated = 0
  let skipped = 0

  for (const p of res.rows || []) {
    // Extract groupId from handle (vb-{groupId}-...)
    // groupId is first segment after "vb-", no hyphens in the ID itself
    const match = /^vb-([^-]+)-/.exec(p.handle)
    if (!match) { skipped++; continue }
    const possibleLowerId = match[1].toLowerCase()

    // Try to find the source by matching groupId (case-insensitive)
    let src: any = null
    for (const [gid, data] of sourceMap) {
      if (gid.toLowerCase() === possibleLowerId) { src = { gid, ...data }; break }
    }
    if (!src) { skipped++; continue }

    const labels = COLLECTION_LABELS[src.collection]
    const sing = labels?.sing || "pièce d'allaitement"
    const plural = labels?.plural || "vêtements d'allaitement"

    // Build description: source description as body + small footer
    const sourceFormatted = cleanSourceDesc(src.description)

    const infoBlock = `<div class="mt-6 p-4 bg-bg-light rounded-xl text-sm">
<p><strong>Marque :</strong> ${src.brand} · <strong>Disponible en :</strong> ${src.colorCount} coloris et ${src.sizeCount} tailles.</p>
</div>`

    const crossLinkBlock = `<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>Vous aimerez aussi :</strong> découvrez toute notre sélection de <a href="/collections/${src.collection}" class="text-primary hover:underline font-medium">${plural}</a> ou notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline font-medium">vêtements d'allaitement</a>.</p>
</div>`

    // Final description: source as main content + info + cross-link
    const description = (sourceFormatted || `<p>${src.title} signé ${src.brand} — une ${sing} pensée pour faciliter les tétées au quotidien.</p>`)
      + "\n\n" + infoBlock
      + "\n\n" + crossLinkBlock

    await pg.raw(`UPDATE product SET description = ? WHERE id = ?`, [description, p.id])
    updated++
  }

  logger.info(`  + ${updated} products rewritten (unique content from source)`)
  logger.info(`  = ${skipped} products skipped (no source match)`)
  logger.info("Done!")
}
