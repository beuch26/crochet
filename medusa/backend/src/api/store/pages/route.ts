import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../modules/page"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pageService = req.scope.resolve(PAGE_MODULE)
  const pages = await pageService.listPages(
    { is_published: true },
    { order: { title: "ASC" } }
  )
  res.json({ pages })
}
