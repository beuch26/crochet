import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../../modules/page"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pageService = req.scope.resolve(PAGE_MODULE)
  const { handle } = req.params

  const pages = await pageService.listPages({ handle, is_published: true })
  if (!pages.length) {
    return res.status(404).json({ message: "Page not found" })
  }

  res.json({ page: pages[0] })
}
