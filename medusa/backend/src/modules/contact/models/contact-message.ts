import { model } from "@medusajs/framework/utils"

const ContactMessage = model.define("contact_message", {
  id: model.id().primaryKey(),
  name: model.text(),
  email: model.text(),
  subject: model.text().nullable(),
  message: model.text(),
  is_read: model.boolean().default(false),
  customer_id: model.text().nullable(),
  admin_reply: model.text().nullable(),
  replied_at: model.dateTime().nullable(),
  replied_by: model.text().nullable(),
})

export default ContactMessage
