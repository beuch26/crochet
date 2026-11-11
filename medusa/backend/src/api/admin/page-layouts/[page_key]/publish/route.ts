import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_LAYOUT_MODULE } from "../../../../../modules/page-layout"

/**
 * POST /admin/page-layouts/:page_key/publish
 *
 * Promotes the draft layout to published.
 * The draft is copied over to the published row (or creates one if not existing).
 * The draft row is preserved (so the user can keep editing).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(PAGE_LAYOUT_MODULE) as any
  const { page_key } = req.params

  const drafts = await service.listPageLayouts({ page_key, status: "draft" }, { take: 1 })
  const draft = drafts[0]

  if (!draft) {
    return res.status(404).json({ message: "Aucun brouillon a publier" })
  }

  // Find or create published row
  const existing = await service.listPageLayouts({ page_key, status: "published" }, { take: 1 })

  const dataToCopy = {
    sections: draft.sections,
    custom_css: draft.custom_css,
    custom_js: draft.custom_js,
    meta_title: draft.meta_title,
    meta_description: draft.meta_description,
    published_at: new Date(),
  }

  let published
  if (existing[0]) {
    published = await service.updatePageLayouts({
      id: existing[0].id,
      ...dataToCopy,
    })
  } else {
    published = await service.createPageLayouts({
      page_key,
      status: "published",
      ...dataToCopy,
    })
  }

  res.json({ published, message: "Layout publie" })
}
