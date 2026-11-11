import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_LAYOUT_MODULE } from "../../../../modules/page-layout"

/**
 * GET /store/page-layouts/:page_key?preview=draft
 *
 * Returns the published layout by default.
 * If ?preview=draft is set, returns the draft (used by the admin preview iframe).
 *
 * Strips internal fields (edited_by) before returning.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(PAGE_LAYOUT_MODULE) as any
  const { page_key } = req.params
  const preview = req.query.preview === "draft"

  const status = preview ? "draft" : "published"

  const layouts = await service.listPageLayouts({ page_key, status }, { take: 1 })
  let layout = layouts[0]

  // Fallback to published if draft requested but not found
  if (!layout && preview) {
    const pub = await service.listPageLayouts({ page_key, status: "published" }, { take: 1 })
    layout = pub[0] || null
  }

  if (!layout) {
    return res.json({
      layout: {
        page_key,
        sections: [],
        custom_css: null,
        meta_title: null,
        meta_description: null,
      },
    })
  }

  // Strip internal fields
  res.json({
    layout: {
      page_key: layout.page_key,
      sections: layout.sections || [],
      custom_css: layout.custom_css,
      meta_title: layout.meta_title,
      meta_description: layout.meta_description,
      published_at: layout.published_at,
    },
  })
}
