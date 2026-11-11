import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { CONTACT_MODULE } from "../../../modules/contact"
import { REVIEW_MODULE } from "../../../modules/review"
import { RETURN_REQUEST_MODULE } from "../../../modules/return-request"

// GET /admin/customer-360?customer_id=xxx OR ?email=xxx
// Returns aggregated data for a single customer
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderService = req.scope.resolve(Modules.ORDER) as any
  const customerService = req.scope.resolve(Modules.CUSTOMER) as any
  const contactService = req.scope.resolve(CONTACT_MODULE) as any
  const reviewService = req.scope.resolve(REVIEW_MODULE) as any
  const returnService = req.scope.resolve(RETURN_REQUEST_MODULE) as any

  const customerId = req.query.customer_id as string
  const emailParam = req.query.email as string

  if (!customerId && !emailParam) {
    return res.status(400).json({ message: "customer_id or email required" })
  }

  let customer: any = null
  let email = emailParam

  // Get customer info
  if (customerId) {
    try {
      customer = await customerService.retrieveCustomer(customerId)
      email = customer?.email || email
    } catch {}
  } else if (email) {
    try {
      const customers = await customerService.listCustomers({ email: email.toLowerCase() }, { take: 1 })
      if (customers.length > 0) customer = customers[0]
    } catch {}
  }

  if (!email) return res.status(404).json({ message: "Client introuvable" })

  // ===== Orders =====
  let orders: any[] = []
  try {
    orders = await orderService.listOrders(
      { email: email.toLowerCase() },
      { order: { created_at: "DESC" }, take: 100, relations: ["items"] }
    )
  } catch {}

  const validOrders = orders.filter((o: any) => o.status !== "canceled")
  const lifetimeValue = validOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
  const orderCount = validOrders.length
  const avgOrderValue = orderCount > 0 ? lifetimeValue / orderCount : 0
  const lastOrderDate = orders[0]?.created_at || null
  const firstOrderDate = orders.length > 0 ? orders[orders.length - 1].created_at : null

  // ===== Contact messages =====
  let messages: any[] = []
  try {
    messages = await contactService.listContactMessages(
      { email: email.toLowerCase() },
      { order: { created_at: "DESC" }, take: 50 }
    )
  } catch {}
  const unreadMessages = messages.filter((m: any) => !m.is_read).length

  // ===== Reviews =====
  let reviews: any[] = []
  try {
    reviews = await reviewService.listReviews(
      { customer_email: email.toLowerCase() },
      { order: { created_at: "DESC" }, take: 50 }
    )
  } catch {}
  const avgReviewRating = reviews.length > 0
    ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  // ===== Return requests =====
  let returns: any[] = []
  try {
    returns = await returnService.listReturnRequests(
      { customer_email: email.toLowerCase() },
      { order: { created_at: "DESC" }, take: 50 }
    )
  } catch {}
  const pendingReturns = returns.filter((r: any) => r.status === "pending").length

  // ===== Customer segment =====
  let segment = "Nouveau"
  if (orderCount >= 5) segment = "VIP"
  else if (orderCount >= 2) segment = "Fidele"
  else if (orderCount === 1) segment = "Premier achat"
  else segment = "Prospect"

  res.json({
    customer: customer
      ? {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          created_at: customer.created_at,
        }
      : { email },
    summary: {
      lifetime_value: lifetimeValue,
      order_count: orderCount,
      avg_order_value: Math.round(avgOrderValue),
      first_order_date: firstOrderDate,
      last_order_date: lastOrderDate,
      message_count: messages.length,
      unread_messages: unreadMessages,
      review_count: reviews.length,
      avg_review_rating: avgReviewRating,
      return_count: returns.length,
      pending_returns: pendingReturns,
      segment,
    },
    orders: orders.slice(0, 10).map((o: any) => ({
      id: o.id,
      display_id: o.display_id,
      status: o.status,
      total: o.total,
      currency_code: o.currency_code,
      created_at: o.created_at,
      item_count: (o.items || []).length,
    })),
    messages: messages.slice(0, 5).map((m: any) => ({
      id: m.id,
      subject: m.subject,
      message: m.message,
      is_read: m.is_read,
      admin_reply: m.admin_reply,
      created_at: m.created_at,
    })),
    reviews: reviews.slice(0, 5).map((r: any) => ({
      id: r.id,
      product_id: r.product_id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      is_published: r.is_published,
      created_at: r.created_at,
    })),
    returns: returns.slice(0, 5).map((r: any) => ({
      id: r.id,
      order_display_id: r.order_display_id,
      reason: r.reason,
      status: r.status,
      created_at: r.created_at,
    })),
  })
}
