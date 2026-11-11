import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Two blog posts contain bare YouTube URLs left over from PrestaShop's
 * text-only migration (the original iframe embed was stripped).
 * Convert each bare URL into a responsive 16:9 iframe embed.
 */

function embed(videoId: string): string {
  return `<div class="my-6 w-full aspect-video rounded-2xl overflow-hidden shadow-lg"><iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="w-full h-full"></iframe></div>`
}

function transform(html: string): { html: string; count: number } {
  let count = 0
  // https://youtu.be/ID  (optionally wrapped in <p>…</p>)
  html = html.replace(
    /(?:<p>\s*)?https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{6,})(?:[?&][^\s<]*)?(?:\s*<\/p>)?/g,
    (_m, id) => { count++; return embed(id) }
  )
  // https://www.youtube.com/watch?v=ID  (optionally wrapped in <p>…</p>)
  html = html.replace(
    /(?:<p>\s*)?https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,})(?:&[^\s<]*)?(?:\s*<\/p>)?/g,
    (_m, id) => { count++; return embed(id) }
  )
  return { html, count }
}

export default async function embedYouTube({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const res = await pg.raw(`
    SELECT id, handle, content FROM blog_post
    WHERE deleted_at IS NULL AND content ~ 'youtu(be\\.com|\\.be)'
  `)

  let updated = 0
  for (const row of res.rows || []) {
    const { html, count } = transform(row.content || "")
    if (count === 0) continue
    await pg.raw(`UPDATE blog_post SET content = ?, updated_at = NOW() WHERE id = ?`, [html, row.id])
    logger.info(`  + ${row.handle} — ${count} embed(s) inserted`)
    updated++
  }

  logger.info(`\nEmbedded YouTube URLs in ${updated} posts.`)
}
