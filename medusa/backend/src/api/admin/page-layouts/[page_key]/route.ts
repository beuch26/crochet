import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_LAYOUT_MODULE } from "../../../../modules/page-layout"

/**
 * GET /admin/page-layouts/:page_key?status=draft|published
 *
 * Returns one layout. Defaults to draft. If draft doesn't exist, falls back to published.
 * If neither exists, returns 404.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(PAGE_LAYOUT_MODULE) as any
  const { page_key } = req.params
  const status = (req.query.status as string) || "draft"

  // Try requested status first
  let layouts = await service.listPageLayouts({ page_key, status }, { take: 1 })
  let layout = layouts[0]

  // Fallback to published if draft requested but not found
  if (!layout && status === "draft") {
    const pub = await service.listPageLayouts({ page_key, status: "published" }, { take: 1 })
    layout = pub[0] || null
  }

  if (!layout) {
    return res.status(404).json({ message: "Layout introuvable" })
  }

  res.json({ layout })
}

/**
 * POST /admin/page-layouts/:page_key
 * Body: { sections, custom_css?, custom_js?, meta_title?, meta_description? }
 *
 * Saves to the DRAFT layout. If draft doesn't exist, creates it.
 * Use POST /publish to push the draft to published.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(PAGE_LAYOUT_MODULE) as any
  const { page_key } = req.params
  const body = req.body as {
    sections?: any[]
    custom_css?: string | null
    custom_js?: string | null
    meta_title?: string | null
    meta_description?: string | null
  }

  if (body.sections && !Array.isArray(body.sections)) {
    return res.status(400).json({ message: "sections doit etre un tableau" })
  }

  // Find existing draft
  const existing = await service.listPageLayouts({ page_key, status: "draft" }, { take: 1 })

  let layout
  if (existing[0]) {
    // Update draft
    layout = await service.updatePageLayouts({
      id: existing[0].id,
      ...(body.sections !== undefined ? { sections: body.sections } : {}),
      ...(body.custom_css !== undefined ? { custom_css: body.custom_css } : {}),
      ...(body.custom_js !== undefined ? { custom_js: body.custom_js } : {}),
      ...(body.meta_title !== undefined ? { meta_title: body.meta_title } : {}),
      ...(body.meta_description !== undefined ? { meta_description: body.meta_description } : {}),
    })
  } else {
    // Create draft
    layout = await service.createPageLayouts({
      page_key,
      status: "draft",
      sections: body.sections || [],
      custom_css: body.custom_css || null,
      custom_js: body.custom_js || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
    })
  }

  res.json({ layout })
}

/**
 * DELETE /admin/page-layouts/:page_key?status=draft|published
 * Defaults to draft (safer).
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(PAGE_LAYOUT_MODULE) as any
  const { page_key } = req.params
  const status = (req.query.status as string) || "draft"

  const existing = await service.listPageLayouts({ page_key, status }, { take: 1 })
  if (!existing[0]) {
    return res.status(404).json({ message: "Layout introuvable" })
  }

  await service.deletePageLayouts(existing[0].id)
  res.json({ deleted: true, id: existing[0].id })
}
