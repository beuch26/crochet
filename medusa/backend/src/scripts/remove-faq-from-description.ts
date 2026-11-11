import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Remove the FAQ HTML block from vetements product descriptions.
 * FAQs stay in metadata.faqs (used by the dedicated FAQ tab + schema.org).
 * Avoids duplication between description tab and FAQ tab.
 */
export default async function removeFaqFromDesc({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const res = await pg.raw(
    `SELECT id, handle, description FROM product
     WHERE metadata->>'affiliate_source' = 'vertbaudet'
       AND handle NOT LIKE 'casque-antibruit-%'
       AND description LIKE '%Questions fréquentes%'
       AND deleted_at IS NULL`
  )

  let updated = 0
  for (const p of res.rows || []) {
    let desc: string = p.description
    // Match from <h2>Questions fréquentes</h2> up to (but not including) the final <div class="mt-6 p-5 bg-bg-light">
    const startMarker = "<h2>Questions fréquentes</h2>"
    const endMarker = '<div class="mt-6 p-5 bg-bg-light'
    const start = desc.indexOf(startMarker)
    const end = desc.indexOf(endMarker, start)
    if (start === -1 || end === -1) continue

    const newDesc = (desc.substring(0, start) + desc.substring(end)).replace(/\n{3,}/g, "\n\n").trim()
    await pg.raw(`UPDATE product SET description = ? WHERE id = ?`, [newDesc, p.id])
    updated++
  }

  logger.info(`  + ${updated} descriptions cleaned (FAQ block removed)`)
}
