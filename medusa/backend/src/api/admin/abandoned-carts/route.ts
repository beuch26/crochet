import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// GET /admin/abandoned-carts
// Returns carts with email, items, not completed, older than 1 hour
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const cartService = req.scope.resolve(Modules.CART) as any

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  try {
    const carts = await cartService.listCarts(
      {
        completed_at: null,
        updated_at: { $lt: oneHourAgo, $gt: sevenDaysAgo },
      },
      {
        relations: ["items", "shipping_address"],
        order: { updated_at: "DESC" },
        take: 200,
      }
    )

    // Filter only carts with email and items
    const abandoned = carts.filter((c: any) => c.email && c.items?.length > 0)

    // Build response with summary
    const enriched = abandoned.map((c: any) => {
      const itemCount = c.items?.length || 0
      const totalQty = c.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) || 0
      const subtotal = c.items?.reduce((s: number, i: any) => s + ((i.unit_price || 0) * (i.quantity || 0)), 0) || 0
      const emailSent = !!c.metadata?.abandoned_email_sent
      const hoursAgo = Math.floor((Date.now() - new Date(c.updated_at).getTime()) / (60 * 60 * 1000))

      return {
        id: c.id,
        email: c.email,
        item_count: itemCount,
        total_quantity: totalQty,
        subtotal,
        currency_code: c.currency_code,
        updated_at: c.updated_at,
        hours_ago: hoursAgo,
        email_sent: emailSent,
        email_sent_at: c.metadata?.abandoned_email_sent || null,
        items_preview: (c.items || []).slice(0, 3).map((i: any) => ({
          title: i.title,
          quantity: i.quantity,
          unit_price: i.unit_price,
          thumbnail: i.thumbnail,
        })),
        shipping_first_name: c.shipping_address?.first_name || null,
        shipping_last_name: c.shipping_address?.last_name || null,
      }
    })

    // Stats
    const totalValue = enriched.reduce((s: number, c: any) => s + c.subtotal, 0)
    const emailedCount = enriched.filter((c: any) => c.email_sent).length

    res.json({
      abandoned_carts: enriched,
      stats: {
        count: enriched.length,
        total_value: totalValue,
        emailed: emailedCount,
        not_emailed: enriched.length - emailedCount,
      },
    })
  } catch (e: any) {
    console.error("Abandoned carts error:", e)
    res.status(500).json({ message: "Erreur de chargement", error: e.message })
  }
}
