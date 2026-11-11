import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Truncate blog post seo_description to max 155 characters.
 * Cuts at the last complete word before 155, adds "..." if truncated.
 */
export default async function fixMetaDescriptions({ container }: ExecArgs) {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const MAX_LENGTH = 155

  // Get all posts with long meta descriptions
  const result = await pg.raw(
    `SELECT id, handle, seo_description FROM blog_post WHERE length(seo_description) > ${MAX_LENGTH}`
  )
  const rows = result.rows || result[0]

  console.log(`Found ${rows.length} blog posts with meta description > ${MAX_LENGTH} chars`)

  for (const post of rows) {
    const original = post.seo_description
    // Truncate at last space before MAX_LENGTH - 3 (for "...")
    let truncated = original.substring(0, MAX_LENGTH - 3)
    const lastSpace = truncated.lastIndexOf(" ")
    if (lastSpace > 100) {
      truncated = truncated.substring(0, lastSpace)
    }
    truncated += "..."

    await pg.raw(`UPDATE blog_post SET seo_description = '${truncated.replace(/'/g, "''")}' WHERE id = '${post.id}'`)
    console.log(`  ${post.handle}: ${original.length} → ${truncated.length} chars`)
  }

  // Also fix the 2 specific posts mentioned in the audit
  // (they might use excerpt as meta, not seo_description)
  const excerptCheck = await pg.raw(
    `SELECT id, handle, excerpt, length(excerpt) as len FROM blog_post WHERE handle IN ('probiotique-enfant', 'jumeaux-nos-astuces-pour-sorganiser-au-quotidien')`
  )
  const excerptRows = excerptCheck.rows || excerptCheck[0]
  for (const post of excerptRows) {
    if (post.excerpt && post.excerpt.length > MAX_LENGTH) {
      let truncated = post.excerpt.substring(0, MAX_LENGTH - 3)
      const lastSpace = truncated.lastIndexOf(" ")
      if (lastSpace > 100) truncated = truncated.substring(0, lastSpace)
      truncated += "..."
      await pg.raw(`UPDATE blog_post SET excerpt = '${truncated.replace(/'/g, "''")}' WHERE id = '${post.id}'`)
      console.log(`  ${post.handle} (excerpt): ${post.len} → ${truncated.length} chars`)
    }
  }

  console.log("Done!")
}
