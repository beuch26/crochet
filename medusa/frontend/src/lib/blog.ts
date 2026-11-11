import { slugify } from "./url"

/** URL segment used for posts that have no category set. */
export const UNCATEGORIZED_SLUG = "articles"

/**
 * Canonical public path for a blog post: `/blog/<category-slug>/<handle>/`.
 * The category is slugified (e.g. "Apprendre le crochet" → "apprendre-le-crochet");
 * posts without a category fall back to `/blog/articles/<handle>/`.
 * Single source of truth — used by both the route's getStaticPaths and every link.
 */
export function blogPostPath(post: { handle: string; category?: string | null }): string {
  const cat = slugify(post.category) || UNCATEGORIZED_SLUG
  return `/blog/${cat}/${post.handle}/`
}

/**
 * Resolve a blog post's featured_image value.
 *   - empty / null → null
 *   - full URL (http...) or absolute path (/...) → use as-is
 *   - plain filename → prepend /images/blog-posts/
 */
export function blogImageUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const v = String(value).trim()
  if (!v) return null
  if (v.startsWith("http") || v.startsWith("/")) return v
  return `/images/blog-posts/${v}`
}

/**
 * Blog categories are a free-text field, so the same category can arrive in
 * inconsistent forms — a slug ("apprendre-le-crochet") on some posts and a
 * human label ("Apprendre le crochet") on others. That produced duplicate
 * filter buttons and raw dashes in the UI.
 *
 * `canonicalCategory` collapses any raw value to a single accented label,
 * keyed by its slug, so every consumer (blog filters, sidebar, breadcrumb,
 * related posts, URLs) sees one clean entry per category. Because the label
 * still slugifies to the same value, existing `/blog/<slug>/` URLs are
 * unchanged. Add new categories to CATEGORY_LABELS as they're created in the
 * back office; unknown ones fall back to a prettified slug.
 */
const CATEGORY_LABELS: Record<string, string> = {
  "idee-crochet": "Idée crochet",
  "apprendre-le-crochet": "Apprendre le crochet",
}

export function canonicalCategory(raw: string | null | undefined): string {
  const src = String(raw || "").trim()
  if (!src) return ""
  const known = CATEGORY_LABELS[slugify(src)]
  if (known) return known
  // Unknown category: keep it if it already reads like a label (has a space or
  // an uppercase letter); otherwise turn the slug's dashes into words.
  if (/\s/.test(src) || /[A-ZÀ-Ÿ]/.test(src)) return src
  const words = src.replace(/-+/g, " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * Split author fields written as "Firstname — Role" (em-dash separator)
 * into { name, role }. Falls back to the default role if none encoded.
 */
export function splitAuthor(author: string | null | undefined, fallbackRole: string): { name: string; role: string } {
  const src = String(author || "").trim()
  if (!src) return { name: "", role: fallbackRole }
  const m = src.match(/^(.+?)\s+[—–-]\s+(.+)$/)
  if (m) return { name: m[1].trim(), role: m[2].trim() }
  return { name: src, role: fallbackRole }
}
