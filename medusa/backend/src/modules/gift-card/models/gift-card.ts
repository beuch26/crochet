import { model } from "@medusajs/framework/utils"

const GiftCard = model.define("gift_card", {
  id: model.id().primaryKey(),
  code: model.text().unique(),
  initial_amount: model.number(),    // cents
  current_balance: model.number(),   // cents
  currency_code: model.text().default("eur"),
  recipient_email: model.text().nullable(),
  recipient_name: model.text().nullable(),
  sender_name: model.text().nullable(),
  message: model.text().nullable(),
  is_active: model.boolean().default(true),
  expires_at: model.dateTime().nullable(),
  redeemed_at: model.dateTime().nullable(),
})

export default GiftCard
