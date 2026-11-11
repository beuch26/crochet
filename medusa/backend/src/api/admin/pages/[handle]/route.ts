import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../../modules/page"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pageService = req.scope.resolve(PAGE_MODULE)
  const { handle } = req.params

  const pages = await pageService.listPages({ handle })
  if (!pages.length) {
    return res.status(404).json({ message: "Page not found" })
  }

  res.json({ page: pages[0] })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const pageService = req.scope.resolve(PAGE_MODULE)
  const { handle } = req.params

  const pages = await pageService.listPages({ handle })
  if (!pages.length) {
    return res.status(404).json({ message: "Page not found" })
  }

  const page = await pageService.updatePages({
    id: pages[0].id,
    ...(req.body as Record<string, unknown>),
  })

  res.json({ page })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const pageService = req.scope.resolve(PAGE_MODULE)
  const { handle } = req.params

  const pages = await pageService.listPages({ handle })
  if (!pages.length) {
    return res.status(404).json({ message: "Page not found" })
  }

  await pageService.deletePages(pages[0].id)
  res.json({ handle, deleted: true })
}
