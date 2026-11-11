import { model } from "@medusajs/framework/utils"

const ReturnRequest = model.define("return_request", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  order_display_id: model.text().nullable(),
  customer_email: model.text(),
  customer_name: model.text().nullable(),
  reason: model.text(),  // damaged, wrong_item, not_satisfied, other
  description: model.text().nullable(),
  items: model.json().nullable(),  // [{ item_id, title, quantity }]
  status: model.text().default("pending"), // pending, approved, rejected, refunded, completed
  admin_notes: model.text().nullable(),
  refund_amount: model.number().nullable(),
  processed_at: model.dateTime().nullable(),
})

export default ReturnRequest
