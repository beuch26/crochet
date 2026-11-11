import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAGE_MODULE } from "../../../modules/page"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pageService = req.scope.resolve(PAGE_MODULE)
  const limit = parseInt(req.query.limit as string) || 50
  const offset = parseInt(req.query.offset as string) || 0

  const [pages, count] = await pageService.listAndCountPages(
    {},
    { order: { title: "ASC" }, skip: offset, take: limit }
  )

  res.json({ pages, count, limit, offset })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const pageService = req.scope.resolve(PAGE_MODULE)
  const page = await pageService.createPages(req.body as Record<string, unknown>)
  res.status(201).json({ page })
}
