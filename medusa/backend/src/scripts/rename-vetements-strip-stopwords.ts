import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Strip French stop words from vetements product handles.
 * - Remove articles: de, du, des, la, le, les, un, une
 * - Remove prepositions: en, a, au, aux, et
 * - Keep numbers, colors, descriptive adjectives
 *
 * Example:
 *   Before: pyjama-grossesse-2-pieces-en-gaze-de-coton-ecru
 *   After:  pyjama-grossesse-2-pieces-gaze-coton-ecru
 *
 * Updates existing 301 redirects to point directly to the new URL
 * (avoids redirect chain).
 */
export default async function stripStopwords({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const STOP_WORDS = new Set([
    "de", "du", "des", "d",
    "la", "le", "les", "l",
    "un", "une",
    "en", "a", "au", "aux", "et", "ou",
    "pour", "avec", "sur", "sous", "par",
    "ce", "cette", "ces",
    "son", "sa", "ses",
  ])

  function stripStopwords(slug: string): string {
    return slug
      .split("-")
      .filter((w) => w && !STOP_WORDS.has(w))
      .join("-")
  }

  function slugify(s: string): string {
    return String(s)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " et ")
      .replace(/['\u2019]/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
  }

  // Get all products that were renamed (they have clean handles, no "vb-" prefix)
  // Identify them by their Vertbaudet affiliate metadata
  const products = await pg.raw(
    `SELECT id, handle, title FROM product
     WHERE metadata->>'affiliate_source' = 'vertbaudet'
       AND handle NOT LIKE 'vb-%'
       AND deleted_at IS NULL
       AND handle NOT LIKE 'casque-antibruit-%'
     ORDER BY id`
  )

  const existingHandles = new Set<string>()
  const allHandles = await pg.raw(`SELECT handle FROM product WHERE deleted_at IS NULL`)
  for (const p of allHandles.rows || []) existingHandles.add(p.handle)

  let renamed = 0
  let skipped = 0

  for (const p of products.rows || []) {
    const rawSlug = slugify(p.title)
    const stripped = stripStopwords(rawSlug)
    // Truncate at word boundary to 80 chars max
    let newHandle = stripped.substring(0, 80).replace(/-[^-]*$/, (m) => (m.length > 8 ? "" : m))

    // Ensure uniqueness
    let suffix = 0
    while (existingHandles.has(newHandle) && newHandle !== p.handle) {
      suffix++
      newHandle = `${stripped.substring(0, 77)}-${suffix}`
    }

    if (newHandle === p.handle) {
      skipped++
      continue
    }

    // Rename product
    await pg.raw(`UPDATE product SET handle = ? WHERE id = ?`, [newHandle, p.id])
    existingHandles.delete(p.handle)
    existingHandles.add(newHandle)

    const oldPath = `/products/${p.handle}`
    const newPath = `/products/${newHandle}`

    // 1. Update any existing redirect that TARGETS the old URL → now targets new URL
    await pg.raw(
      `UPDATE redirect SET target = ?, updated_at = NOW() WHERE target = ? AND deleted_at IS NULL`,
      [newPath, oldPath]
    )

    // 2. Add a new 301 redirect from old (pre-stopword) URL → new URL
    const exists = await pg.raw(`SELECT id FROM redirect WHERE source = ? AND deleted_at IS NULL`, [oldPath])
    if (!exists.rows?.length) {
      const redirectId = `red_${Math.random().toString(36).substring(2, 14)}${Date.now().toString(36)}`
      await pg.raw(
        `INSERT INTO redirect (id, source, target, status_code, is_active, hit_count, note, created_at, updated_at)
         VALUES (?, ?, ?, 301, true, 0, 'SEO strip stopwords', NOW(), NOW())`,
        [redirectId, oldPath, newPath]
      )
    }

    renamed++
    if (renamed <= 5 || renamed % 20 === 0) {
      logger.info(`  + ${p.handle.substring(0, 50)}... → ${newHandle}`)
    }
  }

  logger.info(`\nDone! ${renamed} renamed, ${skipped} unchanged.`)
  logger.info(`Existing redirect chains updated to point directly to new URLs.`)
}
