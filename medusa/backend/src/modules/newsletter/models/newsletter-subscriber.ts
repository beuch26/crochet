import { model } from "@medusajs/framework/utils"

const NewsletterSubscriber = model.define("newsletter_subscriber", {
  id: model.id().primaryKey(),
  email: model.text().unique(),
  is_active: model.boolean().default(true),
})

export default NewsletterSubscriber
