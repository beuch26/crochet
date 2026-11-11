import { model } from "@medusajs/framework/utils"

/**
 * page_layout — represents a page composed of ordered sections.
 *
 * One row per (page_key + status) couple :
 *   - page_key: "homepage", "collection", "product", "blog", or any custom key
 *   - status: "published" (live on the site) or "draft" (preview only)
 *
 * The "sections" JSON column stores the ordered list:
 * [
 *   { "id": "uuid", "type": "hero", "props": { ... }, "visible": true },
 *   { "id": "uuid", "type": "marquee", "props": { ... }, "visible": true },
 *   ...
 * ]
 *
 * Each section's `props` shape is validated client-side against the
 * section schemas (defined in src/admin/page-builder/schemas).
 */
const PageLayout = model.define("page_layout", {
  id: model.id().primaryKey(),
  page_key: model.text(),                          // "homepage", "product", etc.
  status: model.text().default("published"),       // "published" | "draft"
  sections: model.json().nullable() as any,        // ordered array of sections (JSON)
  custom_css: model.text().nullable(),             // custom CSS injected on the page
  custom_js: model.text().nullable(),              // custom JS (head) — power users only
  meta_title: model.text().nullable(),             // optional SEO override
  meta_description: model.text().nullable(),
  published_at: model.dateTime().nullable(),       // last publish timestamp
  edited_by: model.text().nullable(),              // admin user id who last edited
})

export default PageLayout
