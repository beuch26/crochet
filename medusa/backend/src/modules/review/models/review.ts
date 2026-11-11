import { model } from "@medusajs/framework/utils"

const Review = model.define("review", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  customer_name: model.text(),
  customer_email: model.text(),
  rating: model.number(),
  title: model.text().nullable(),
  body: model.text().nullable(),
  is_verified: model.boolean().default(false),
  is_published: model.boolean().default(false),
  admin_reply: model.text().nullable(),
  replied_at: model.dateTime().nullable(),
})

export default Review
