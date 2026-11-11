import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * 8 blog posts reference images at /img/cms/... from the old PrestaShop site.
 * Those files were never migrated and Apache's SPA fallback returns the 404
 * HTML page with status 200 → images appear broken in the browser.
 *
 * No replacements available — strip the <img> tags entirely. The surrounding
 * text carries the article on its own.
 */

export default async function stripCmsImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const res = await pg.raw(`
    SELECT id, handle, content FROM blog_post
    WHERE deleted_at IS NULL AND content ~ '<img[^>]*/img/cms/'
  `)

  // Remove each <img ... src="...(/img/cms/)..."> (with optional closing /).
  // Also collapse the occasional wrapping <p> that only contained the image.
  const imgRe = /<img[^>]*src=["'][^"']*\/img\/cms\/[^"']*["'][^>]*\/?>/gi
  const emptyP = /<p>\s*<\/p>/gi

  let updated = 0
  for (const row of res.rows || []) {
    let html: string = row.content
    const before = html
    html = html.replace(imgRe, "").replace(emptyP, "")
    if (html === before) continue
    await pg.raw(`UPDATE blog_post SET content = ?, updated_at = NOW() WHERE id = ?`, [html, row.id])
    logger.info(`  + ${row.handle}`)
    updated++
  }

  logger.info(`\nStripped broken /img/cms/ images from ${updated} posts.`)
}
