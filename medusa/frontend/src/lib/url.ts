/**
 * Add a trailing slash to internal paths so they hit the canonical URL
 * directly (the server enforces trailing slash → without it, every link
 * is a 301 hop). Safe to call with CMS-supplied values: external URLs,
 * `mailto:`, `tel:`, and `#anchor` links are returned untouched.
 */
export function normalizeHref(href: string | null | undefined): string {
  if (!href) return ''
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href

  // Split path from query/hash so the slash lands before the `?` or `#`.
  const m = href.match(/^([^?#]*)([?#].*)?$/)
  const path = m ? m[1] : href
  const tail = m ? (m[2] || '') : ''

  if (!path || path.endsWith('/')) return href
  return path + '/' + tail
}

/**
 * Strip accents + lowercase + hyphenate. Used to slugify category names
 * for URL params (e.g. "Pour Bébé" → "pour-bebe") so we don't ship URLs
 * with non-ASCII chars or spaces.
 */
export function slugify(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Rewrite every `<a href="/...">` in user-authored HTML so internal links
 * end with a trailing slash. Leaves external URLs, mailto/tel, anchors,
 * and file URLs (anything with a recognised extension) untouched.
 *
 * Used to clean up CMS-stored content (collection intro text, blog post
 * body, page builder rich text) without forcing the editor to remember
 * the trailing-slash convention.
 */
export function normalizeInternalHrefsInHTML(html: string | null | undefined): string {
  if (!html) return ''
  return html.replace(
    /href=(["'])(\/[^"'#?\s]*?)([?#][^"']*)?\1/g,
    (full, quote, path, tail = '') => {
      // skip files (image, pdf, sitemap, etc.) — only normalize page paths
      if (/\.[a-z0-9]{2,5}$/i.test(path)) return full
      if (path.endsWith('/')) return full
      return `href=${quote}${path}/${tail}${quote}`
    }
  )
}
