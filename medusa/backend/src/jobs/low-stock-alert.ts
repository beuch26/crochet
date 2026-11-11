import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

// Runs once a day to check low stock and notify admin
export default async function lowStockAlertJob(container: MedusaContainer) {
  const inventoryService = container.resolve(Modules.INVENTORY) as any
  const productService = container.resolve(Modules.PRODUCT) as any
  const notificationService = container.resolve(Modules.NOTIFICATION) as any

  const LOW_STOCK_THRESHOLD = 5
  const ADMIN_EMAIL = process.env.ADMIN_ALERT_EMAIL || "contact@magic-crochet-kit.com"

  try {
    // Get inventory levels
    const inventoryItems = await inventoryService.listInventoryItems({}, { take: 1000 })
    if (!inventoryItems || inventoryItems.length === 0) return

    const lowStock: any[] = []

    for (const item of inventoryItems) {
      try {
        const levels = await inventoryService.listInventoryLevels({ inventory_item_id: item.id })
        const totalAvailable = levels.reduce((sum: number, l: any) => sum + (l.stocked_quantity || 0) - (l.reserved_quantity || 0), 0)
        if (totalAvailable > 0 && totalAvailable <= LOW_STOCK_THRESHOLD) {
          lowStock.push({ sku: item.sku, title: item.title, quantity: totalAvailable })
        }
      } catch {}
    }

    if (lowStock.length === 0) return

    const itemsHtml = lowStock.slice(0, 30).map(i =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #f3f4f6"><strong>${i.title || i.sku}</strong></td><td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right"><span style="color:${i.quantity <= 2 ? '#dc2626' : '#d97706'};font-weight:bold">${i.quantity}</span></td></tr>`
    ).join("")

    await notificationService.createNotifications({
      to: ADMIN_EMAIL,
      channel: "email",
      template: null as any,
      content: {
        subject: `[Magic Crochet Kit] ${lowStock.length} produit(s) en stock bas`,
        html: `<!DOCTYPE html><html><body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f9fafb"><div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;border:1px solid #e5e7eb"><div style="background:#d97706;padding:24px;text-align:center"><h1 style="color:white;margin:0;font-size:20px">⚠ Alerte stock bas</h1></div><div style="padding:24px"><p style="color:#374151">${lowStock.length} produit(s) ont un stock inferieur ou egal a ${LOW_STOCK_THRESHOLD} unites :</p><table style="width:100%;border-collapse:collapse;margin:16px 0">${itemsHtml}</table>${lowStock.length > 30 ? `<p style="color:#9ca3af;font-size:13px">...et ${lowStock.length - 30} autre(s)</p>` : ''}<div style="margin-top:24px;text-align:center"><a href="https://api-hetzner.web-guru.fr/app/inventory" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:600">Gerer le stock</a></div></div></div></body></html>`,
      },
    })

    console.log(`Low stock alert sent: ${lowStock.length} items`)
  } catch (e) {
    console.error("Low stock alert error:", e)
  }
}

export const config = {
  name: "low-stock-alert",
  schedule: "0 9 * * *", // Every day at 9am
}
