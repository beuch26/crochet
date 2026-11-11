import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_CARD_MODULE } from "../../../../modules/gift-card"

// POST — validate a gift card code (returns balance)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const giftService = req.scope.resolve(GIFT_CARD_MODULE) as any
  const { code } = req.body as { code: string }

  if (!code) return res.status(400).json({ message: "Code requis" })

  const cards = await giftService.listGiftCards({ code: code.trim().toUpperCase() }, { take: 1 })
  if (cards.length === 0) {
    return res.status(404).json({ message: "Code invalide" })
  }

  const card = cards[0]
  if (!card.is_active) {
    return res.status(400).json({ message: "Cette carte cadeau n'est plus active" })
  }
  if (card.expires_at && new Date(card.expires_at) < new Date()) {
    return res.status(400).json({ message: "Cette carte cadeau a expire" })
  }
  if (card.current_balance <= 0) {
    return res.status(400).json({ message: "Cette carte cadeau est epuisee" })
  }

  res.json({
    valid: true,
    code: card.code,
    balance: card.current_balance,
    currency: card.currency_code,
  })
}
