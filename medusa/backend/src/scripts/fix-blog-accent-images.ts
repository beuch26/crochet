import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * All blog images hosted on Supabase were uploaded with accent-stripped
 * filenames, but the HTML content references them with accents (é, è, à…).
 * Result: 34+ images return HTTP 400 across 22+ blog posts.
 *
 * Fix: strip diacritics inside every Supabase image URL found in content
 * and featured_image. Leaves surrounding text untouched.
 */

function stripAccentsInUrls(html: string): { html: string; changed: number } {
  let changed = 0
  const replaced = html.replace(
    /(src=["'])(https:\/\/dihvqaqvsppqkfxtaiyj\.supabase\.co\/[^"']+)/g,
    (_m, prefix, url) => {
      const clean = url.normalize("NFD").replace(/[̀-ͯ]/g, "")
      if (clean !== url) changed++
      return prefix + clean
    }
  )
  return { html: replaced, changed }
}

function stripAccentsInUrl(url: string | null): string | null {
  if (!url) return url
  if (!url.includes("supabase.co")) return url
  return url.normalize("NFD").replace(/[̀-ͯ]/g, "")
}

export default async function fixBlogAccentImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const res = await pg.raw(`SELECT id, handle, content, featured_image FROM blog_post WHERE deleted_at IS NULL`)
  let posts = 0
  let totalImgs = 0
  let featuredFixed = 0

  for (const row of res.rows || []) {
    const { html, changed } = stripAccentsInUrls(row.content || "")
    const newFeatured = stripAccentsInUrl(row.featured_image)

    const contentChanged = changed > 0
    const featuredChanged = newFeatured !== row.featured_image

    if (!contentChanged && !featuredChanged) continue

    await pg.raw(
      `UPDATE blog_post SET content = ?, featured_image = ?, updated_at = NOW() WHERE id = ?`,
      [html, newFeatured, row.id]
    )
    posts++
    totalImgs += changed
    if (featuredChanged) featuredFixed++
    logger.info(`  + ${row.handle} — ${changed} image(s)${featuredChanged ? " + featured" : ""}`)
  }

  logger.info(`\nDone: ${posts} posts updated, ${totalImgs} image URLs fixed, ${featuredFixed} featured images fixed`)
}
