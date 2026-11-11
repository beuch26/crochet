import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../modules/review"

// POST /admin/reviews/:id — update a review (publish, reply, etc.)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const reviewService = req.scope.resolve(REVIEW_MODULE)
  const { id } = req.params
  const body = req.body as any

  const updateData: any = {}
  if (body.is_published !== undefined) updateData.is_published = body.is_published
  if (body.is_verified !== undefined) updateData.is_verified = body.is_verified
  if (body.admin_reply !== undefined) {
    updateData.admin_reply = body.admin_reply
    updateData.replied_at = body.admin_reply ? new Date() : null
  }

  const review = await reviewService.updateReviews({ id, ...updateData })

  res.json({ review })
}

// DELETE /admin/reviews/:id — delete a review
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const reviewService = req.scope.resolve(REVIEW_MODULE)
  const { id } = req.params

  await reviewService.deleteReviews(id)

  res.json({ id, deleted: true })
}
