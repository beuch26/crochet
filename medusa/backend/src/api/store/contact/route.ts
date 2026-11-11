import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MODULE } from "../../../modules/contact"
import { Modules } from "@medusajs/framework/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const contactService = req.scope.resolve(CONTACT_MODULE)
  const customerService = req.scope.resolve(Modules.CUSTOMER) as any

  const { name, email, subject, message } = req.body as {
    name: string
    email: string
    subject?: string
    message: string
  }

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Nom, email et message sont requis" })
  }

  const subjectVal = subject || "Service client"

  // Try to find existing customer by email
  let customerId: string | null = null
  try {
    const customers = await customerService.listCustomers({ email: email.toLowerCase() }, { take: 1 })
    if (customers && customers.length > 0) customerId = customers[0].id
  } catch {}

  const contactMessage = await contactService.createContactMessages({
    name,
    email: email.toLowerCase(),
    subject: subjectVal,
    message,
    customer_id: customerId,
  })

  // Emit so the subscriber sends the auto-reply (to the customer) AND
  // the admin notification. Medusa v2's event_bus.emit expects
  // { name, data } — the old `emit("name", data)` form was a silent no-op.
  try {
    const eventBus = req.scope.resolve("event_bus") as any
    await eventBus.emit({
      name: "contact.received",
      data: { id: contactMessage.id, name, email, subject: subjectVal, message },
    })
  } catch (e) {
    console.error("[contact] event emit failed:", e)
  }

  res.status(201).json({ contact_message: contactMessage })
}
