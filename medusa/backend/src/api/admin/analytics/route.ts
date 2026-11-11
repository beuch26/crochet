import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

// GET /admin/analytics?range=30d
// Returns sales metrics for the requested period
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderService = req.scope.resolve(Modules.ORDER) as any
  const productService = req.scope.resolve(Modules.PRODUCT) as any
  const customerService = req.scope.resolve(Modules.CUSTOMER) as any

  const range = (req.query.range as string) || "30d"
  const now = new Date()
  const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "365d" ? 365 : 30
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)

  try {
    // Fetch all orders in the current period
    const currentOrders = await orderService.listOrders(
      { created_at: { $gte: startDate } },
      { take: 5000, relations: ["items"] }
    )

    // Fetch previous period for comparison
    const previousOrders = await orderService.listOrders(
      { created_at: { $gte: prevStartDate, $lt: startDate } },
      { take: 5000 }
    )

    // ===== Current period stats =====
    const validOrders = currentOrders.filter((o: any) => o.status !== "canceled")

    const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
    const totalOrders = validOrders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Unique customers
    const customerEmails = new Set(validOrders.map((o: any) => o.email).filter(Boolean))
    const totalCustomers = customerEmails.size

    // ===== Previous period (for delta %) =====
    const prevValid = previousOrders.filter((o: any) => o.status !== "canceled")
    const prevRevenue = prevValid.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
    const prevOrders = prevValid.length

    const revenueDelta = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : (totalRevenue > 0 ? 100 : 0)
    const ordersDelta = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : (totalOrders > 0 ? 100 : 0)

    // ===== Daily series for chart =====
    const dailyMap: Record<string, { revenue: number; orders: number }> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split("T")[0]
      dailyMap[key] = { revenue: 0, orders: 0 }
    }
    for (const o of validOrders) {
      const key = new Date(o.created_at).toISOString().split("T")[0]
      if (dailyMap[key]) {
        dailyMap[key].revenue += o.total || 0
        dailyMap[key].orders += 1
      }
    }
    const dailySeries = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({ date, revenue: data.revenue, orders: data.orders }))

    // ===== Top products =====
    const productCount: Record<string, { product_id: string; quantity: number; revenue: number }> = {}
    for (const o of validOrders) {
      for (const item of o.items || []) {
        const pid = item.product_id || item.variant_id || "unknown"
        if (!productCount[pid]) productCount[pid] = { product_id: pid, quantity: 0, revenue: 0 }
        productCount[pid].quantity += item.quantity || 0
        productCount[pid].revenue += (item.unit_price || 0) * (item.quantity || 0)
      }
    }
    const topProductIds = Object.values(productCount)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Enrich with product details
    let topProducts: any[] = []
    if (topProductIds.length > 0) {
      try {
        const ids = topProductIds.map(p => p.product_id).filter(id => id !== "unknown")
        const products = await productService.listProducts({ id: ids })
        const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]))
        topProducts = topProductIds.map(p => ({
          ...p,
          title: productMap[p.product_id]?.title || "Inconnu",
          handle: productMap[p.product_id]?.handle || null,
          thumbnail: productMap[p.product_id]?.thumbnail || null,
        }))
      } catch {
        topProducts = topProductIds
      }
    }

    // ===== Order status breakdown =====
    const statusBreakdown: Record<string, number> = {}
    for (const o of currentOrders) {
      const s = o.status || "pending"
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1
    }

    // ===== New vs returning customers =====
    let newCustomers = 0
    let returningCustomers = 0
    try {
      // For each unique email, check if they had orders before the period
      const emails = Array.from(customerEmails)
      for (const email of emails.slice(0, 200)) {
        const past = await orderService.listOrders(
          { email, created_at: { $lt: startDate } },
          { take: 1 }
        )
        if (past.length > 0) returningCustomers++
        else newCustomers++
      }
    } catch {}

    res.json({
      range,
      period: { start: startDate.toISOString(), end: now.toISOString(), days },
      totals: {
        revenue: totalRevenue,
        orders: totalOrders,
        avg_order_value: Math.round(avgOrderValue),
        customers: totalCustomers,
        new_customers: newCustomers,
        returning_customers: returningCustomers,
      },
      deltas: {
        revenue: Math.round(revenueDelta * 10) / 10,
        orders: Math.round(ordersDelta * 10) / 10,
      },
      daily_series: dailySeries,
      top_products: topProducts,
      status_breakdown: statusBreakdown,
    })
  } catch (e: any) {
    console.error("Analytics error:", e)
    res.status(500).json({ message: "Erreur de calcul des analytics", error: e.message })
  }
}
