import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * 3 tasks:
 * 1. Merge duplicate blog posts calendrier-chinois-* (keep the longer one)
 * 2. Enrich short product titles (<32 chars -> 45-60 chars with keywords)
 * 3. Fix BBTKCARE title double space + trim to <70
 */
export default async function fixTitles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  // ============================================
  // 1. Merge blog duplicates
  // ============================================
  const toDelete = "calendrier-chinois-de-grossesse"
  const toKeep = "calendrier-chinois-grossesse"

  await pg.raw(`UPDATE blog_post SET deleted_at = NOW() WHERE handle = '${toDelete}' AND deleted_at IS NULL`)

  // Add redirect from deleted handle to kept one
  const existsRedirect = await pg.raw(`SELECT id FROM redirect WHERE source = '/blog/${toDelete}' AND deleted_at IS NULL`)
  if (!existsRedirect.rows?.length) {
    const id = `red_${Math.random().toString(36).substring(2, 14)}${Date.now().toString(36)}`
    await pg.raw(
      `INSERT INTO redirect (id, source, target, status_code, is_active, hit_count, note, created_at, updated_at)
       VALUES (?, ?, ?, 301, true, 0, ?, NOW(), NOW())`,
      [id, `/blog/${toDelete}`, `/blog/${toKeep}`, "Fusion doublon blog PS"]
    )
  }
  logger.info(`  + Blog: /blog/${toDelete} -> /blog/${toKeep} (deleted + 301 redirect)`)

  // ============================================
  // 2. Enrich short product titles
  // ============================================
  const titleUpdates: Record<string, string> = {
    "douche-intime-perinee": "Douche intime périnée post-accouchement - Soin post-partum",
    "baume-a-levres-lanoline": "Baume à lèvres Lanoline hydratant - Multi-usage grossesse",
    "creme-lanoline-hpa-lansinoh": "Crème Lanoline HPA Lansinoh 40 ml - Soin mamelons allaitement",
    "patch-hydrogel-cesarienne": "Patch hydrogel césarienne - Cicatrisation post-accouchement",
    "tire-lait-manuel": "Tire-lait manuel Lansinoh - Extraction douce et silencieuse",
    "tetine-natural-wave": "Tétine Natural Wave XS lot de 2 - Sans confusion sein-biberon",
    "poire-mamelons": "Poire Latch Assist Lansinoh - Aide à la prise du sein",
    "tire-lait-silicone": "Tire-lait silicone Lansinoh - Souple et nomade",
    "tire-lait-electrique-2-en-1": "Tire-lait électrique 2-en-1 Lansinoh - Simple ou double pompage",
    "bandeau-maintien-medela": "Bandeau de maintien Medela mains-libres pour tire-lait",
    "bola-de-grossesse-fleur": "Bola de grossesse Fleur dorée - Bijou apaisant pour bébé",
    "bouts-de-sein-medela-contact-taille-s": "Bouts de sein Contact Medela taille S - Aide à l'allaitement",
    "compresses-hydrogel-medela": "Compresses hydrogel Medela - Lot de 4 - Apaise crevasses",
    "bola-de-grossesse-aeonslove-argent": "Bola de grossesse cœur argenté - Bijou musical pour bébé",
    "2-teterelles-comfort-fit": "Téterelles Comfort Fit 21 mm - Lot de 2 pour tire-lait Medela",
    "baume-allaitement-bio": "Baume allaitement BIO Lansinoh - Lanoline naturelle",
    "bola-de-grossesse-mamijux-pieds-argent": "Bola de grossesse Pieds argenté - Mamijux grossesse",
    "biberon-pp-natural-wave": "Biberon PP Natural Wave 160 ml - Compatible allaitement mixte",
  }

  let titlesUpdated = 0
  for (const [handle, newTitle] of Object.entries(titleUpdates)) {
    if (newTitle.length > 65) {
      logger.warn(`  ! ${handle}: new title too long (${newTitle.length} chars)`)
      continue
    }
    await pg.raw(`UPDATE product SET title = ? WHERE handle = ? AND deleted_at IS NULL`, [newTitle, handle])
    logger.info(`  + ${handle}: "${newTitle}" (${newTitle.length} chars)`)
    titlesUpdated++
  }
  logger.info(`  = ${titlesUpdated} short titles enriched`)

  // ============================================
  // 3. Fix BBTKCARE title (double space + too long)
  // ============================================
  const bbtkNewTitle = "Casque anti-bruit BBTKCARE bébé 3 mois à 2 ans"
  await pg.raw(
    `UPDATE product SET title = ? WHERE handle = 'casque-anti-bruit-bebe-bbtkcare' AND deleted_at IS NULL`,
    [bbtkNewTitle]
  )
  logger.info(`  + BBTKCARE: "${bbtkNewTitle}" (${bbtkNewTitle.length} chars)`)

  // Also fix any other lingering double spaces in titles
  await pg.raw(
    `UPDATE product SET title = regexp_replace(title, '\\s+', ' ', 'g') WHERE title ~ '\\s\\s' AND deleted_at IS NULL`
  )
  logger.info(`  + Double spaces stripped from all product titles`)

  logger.info("Done!")
}
