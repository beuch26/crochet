import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REDIRECT_MODULE } from "../../../../modules/redirect"

// POST — update
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(REDIRECT_MODULE) as any
  const { id } = req.params
  const body = req.body as any

  const updateData: any = { id }
  if (body.source !== undefined) updateData.source = body.source
  if (body.target !== undefined) updateData.target = body.target
  if (body.status_code !== undefined) updateData.status_code = body.status_code
  if (body.is_active !== undefined) updateData.is_active = body.is_active
  if (body.note !== undefined) updateData.note = body.note

  const redirect = await service.updateRedirects(updateData)
  res.json({ redirect })
}

// DELETE
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(REDIRECT_MODULE) as any
  const { id } = req.params
  await service.deleteRedirects(id)
  res.json({ id, deleted: true })
}
