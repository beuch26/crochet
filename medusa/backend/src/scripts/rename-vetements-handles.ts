import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Rename vb-{groupId}-{truncated} handles to clean SEO slugs based on title.
 * Creates 301 redirects from old → new handle so Google keeps indexing.
 */
export default async function renameVetementsHandles({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  function slugify(s: string): string {
    return String(s)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
      .replace(/&/g, " et ")
      .replace(/['\u2019]/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
  }

  const products = await pg.raw(
    `SELECT id, handle, title FROM product WHERE handle LIKE 'vb-%' AND deleted_at IS NULL ORDER BY id`
  )

  const existingHandles = new Set<string>()
  const allProductsHandles = await pg.raw(
    `SELECT handle FROM product WHERE deleted_at IS NULL AND NOT handle LIKE 'vb-%'`
  )
  for (const p of allProductsHandles.rows || []) existingHandles.add(p.handle)

  let renamed = 0
  let skipped = 0
  const redirects: Array<{ old: string; new: string }> = []

  for (const p of products.rows || []) {
    const baseSlug = slugify(p.title).substring(0, 80).replace(/-[^-]*$/, (m) => (m.length > 8 ? "" : m))
    // Ensure we don't end on a mid-word truncation: trim to last complete word
    let newHandle = baseSlug

    // Handle uniqueness
    let suffix = 0
    while (existingHandles.has(newHandle) && newHandle !== p.handle) {
      suffix++
      newHandle = `${baseSlug}-${suffix}`
    }

    if (newHandle === p.handle) {
      skipped++
      continue
    }

    // Rename product
    await pg.raw(`UPDATE product SET handle = ? WHERE id = ?`, [newHandle, p.id])
    existingHandles.add(newHandle)

    // Create 301 redirect from old to new
    const redirectId = `red_${Math.random().toString(36).substring(2, 14)}${Date.now().toString(36)}`
    const oldPath = `/products/${p.handle}`
    const newPath = `/products/${newHandle}`

    // Avoid duplicate redirects
    const exists = await pg.raw(`SELECT id FROM redirect WHERE source = ? AND deleted_at IS NULL`, [oldPath])
    if (!exists.rows?.length) {
      await pg.raw(
        `INSERT INTO redirect (id, source, target, status_code, is_active, hit_count, note, created_at, updated_at)
         VALUES (?, ?, ?, 301, true, 0, ?, NOW(), NOW())`,
        [redirectId, oldPath, newPath, "Clean SEO handle (was vb-prefix)"]
      )
    }

    redirects.push({ old: p.handle, new: newHandle })
    renamed++
    if (renamed <= 5 || renamed % 20 === 0) {
      logger.info(`  + ${p.handle.substring(0, 40)}... → ${newHandle}`)
    }
  }

  logger.info(`\nDone! ${renamed} renamed, ${skipped} unchanged.`)
  logger.info(`${redirects.length} 301 redirects added.`)
}
