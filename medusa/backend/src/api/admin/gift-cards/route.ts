import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_CARD_MODULE } from "../../../modules/gift-card"

function generateCode(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code.match(/.{1,4}/g)?.join("-") || code
}

// GET — list gift cards
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const giftService = req.scope.resolve(GIFT_CARD_MODULE) as any
  const { is_active } = req.query as any

  const filters: any = {}
  if (is_active !== undefined) filters.is_active = is_active === "true"

  const cards = await giftService.listGiftCards(filters, { order: { created_at: "DESC" }, take: 200 })

  // Stats
  const allCards = await giftService.listGiftCards({})
  const totalIssued = allCards.reduce((s: number, c: any) => s + (c.initial_amount || 0), 0)
  const totalBalance = allCards.reduce((s: number, c: any) => s + (c.current_balance || 0), 0)
  const totalUsed = totalIssued - totalBalance

  res.json({
    gift_cards: cards,
    stats: {
      count: allCards.length,
      active: allCards.filter((c: any) => c.is_active).length,
      total_issued: totalIssued,
      total_balance: totalBalance,
      total_used: totalUsed,
    },
  })
}

// POST — create a new gift card
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const giftService = req.scope.resolve(GIFT_CARD_MODULE) as any
  const body = req.body as {
    amount: number
    currency_code?: string
    recipient_email?: string
    recipient_name?: string
    sender_name?: string
    message?: string
    expires_at?: string
    code?: string
  }

  if (!body.amount || body.amount <= 0) {
    return res.status(400).json({ message: "Montant invalide" })
  }

  const code = body.code || generateCode()
  const amountCents = Math.round(body.amount * 100)

  const giftCard = await giftService.createGiftCards({
    code,
    initial_amount: amountCents,
    current_balance: amountCents,
    currency_code: body.currency_code || "eur",
    recipient_email: body.recipient_email || null,
    recipient_name: body.recipient_name || null,
    sender_name: body.sender_name || null,
    message: body.message || null,
    is_active: true,
    expires_at: body.expires_at ? new Date(body.expires_at) : null,
  })

  res.status(201).json({ gift_card: giftCard })
}
