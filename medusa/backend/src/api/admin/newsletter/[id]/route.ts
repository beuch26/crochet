import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NEWSLETTER_MODULE } from "../../../../modules/newsletter"

// POST — toggle active or update
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const newsletterService = req.scope.resolve(NEWSLETTER_MODULE) as any
  const { id } = req.params
  const body = req.body as { is_active?: boolean }

  const updateData: any = { id }
  if (body.is_active !== undefined) updateData.is_active = body.is_active

  const subscriber = await newsletterService.updateNewsletterSubscribers(updateData)

  res.json({ subscriber })
}

// DELETE — remove subscriber
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const newsletterService = req.scope.resolve(NEWSLETTER_MODULE) as any
  const { id } = req.params

  await newsletterService.deleteNewsletterSubscribers(id)

  res.json({ id, deleted: true })
}
