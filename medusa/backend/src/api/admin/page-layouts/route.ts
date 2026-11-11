import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_LAYOUT_MODULE } from "../../../modules/page-layout"

// GET /admin/page-layouts
// List all page layouts (one entry per page_key + status)
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(PAGE_LAYOUT_MODULE) as any

  const layouts = await service.listPageLayouts({}, { order: { page_key: "ASC", status: "ASC" } })

  // Group by page_key for easier consumption
  const grouped: Record<string, { published?: any; draft?: any }> = {}
  for (const l of layouts) {
    if (!grouped[l.page_key]) grouped[l.page_key] = {}
    grouped[l.page_key][l.status as "published" | "draft"] = l
  }

  res.json({ layouts, grouped })
}
