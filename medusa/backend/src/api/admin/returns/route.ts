import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RETURN_REQUEST_MODULE } from "../../../modules/return-request"

// GET — list returns
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const returnService = req.scope.resolve(RETURN_REQUEST_MODULE) as any
  const { status } = req.query as any

  const filters: any = {}
  if (status) filters.status = status

  const returns = await returnService.listReturnRequests(filters, { order: { created_at: "DESC" }, take: 200 })

  // Stats
  const all = await returnService.listReturnRequests({})
  const pending = all.filter((r: any) => r.status === "pending").length
  const approved = all.filter((r: any) => r.status === "approved").length
  const refunded = all.filter((r: any) => r.status === "refunded").length

  res.json({ returns, stats: { total: all.length, pending, approved, refunded } })
}
