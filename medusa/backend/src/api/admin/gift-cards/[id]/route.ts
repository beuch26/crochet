import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_CARD_MODULE } from "../../../../modules/gift-card"

// POST — update (toggle active, adjust balance)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const giftService = req.scope.resolve(GIFT_CARD_MODULE) as any
  const { id } = req.params
  const body = req.body as { is_active?: boolean; current_balance?: number }

  const updateData: any = { id }
  if (body.is_active !== undefined) updateData.is_active = body.is_active
  if (body.current_balance !== undefined) updateData.current_balance = body.current_balance

  const card = await giftService.updateGiftCards(updateData)
  res.json({ gift_card: card })
}

// DELETE
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const giftService = req.scope.resolve(GIFT_CARD_MODULE) as any
  const { id } = req.params
  await giftService.deleteGiftCards(id)
  res.json({ id, deleted: true })
}
