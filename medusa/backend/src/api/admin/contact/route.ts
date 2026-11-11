import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MODULE } from "../../../modules/contact"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contactService = req.scope.resolve(CONTACT_MODULE)

  const limit = parseInt(req.query.limit as string) || 50
  const offset = parseInt(req.query.offset as string) || 0

  const filters: Record<string, unknown> = {}
  if (req.query.is_read !== undefined) {
    filters.is_read = req.query.is_read === "true"
  }
  if (req.query.customer_id) {
    filters.customer_id = req.query.customer_id
  }
  if (req.query.email) {
    filters.email = (req.query.email as string).toLowerCase()
  }

  const [messages, count] = await contactService.listAndCountContactMessages(
    filters,
    {
      order: { created_at: "DESC" },
      skip: offset,
      take: limit,
    }
  )

  res.json({ contact_messages: messages, count, limit, offset })
}
