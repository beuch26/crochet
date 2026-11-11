import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import PDFDocument from "pdfkit"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { order_id, email } = req.body as { order_id: string; email: string }

  if (!order_id || !email) {
    return res.status(400).json({ message: "order_id and email required" })
  }

  const orderService = req.scope.resolve(Modules.ORDER) as any

  let order: any
  try {
    order = await orderService.retrieveOrder(order_id, {
      relations: ["items", "shipping_address"],
    })
  } catch {
    return res.status(404).json({ message: "Commande introuvable" })
  }

  // Security: verify email matches order
  if (order.email?.toLowerCase() !== email.toLowerCase()) {
    return res.status(403).json({ message: "Email non autorise" })
  }

  // Generate PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const chunks: Buffer[] = []

  doc.on("data", (chunk: Buffer) => chunks.push(chunk))

  await new Promise<void>((resolve) => {
    doc.on("end", resolve)

    const pageWidth = doc.page.width - 100 // margins

    // Header
    doc.fontSize(22).font("Helvetica-Bold").text("FACTURE", { align: "right" })
    doc.moveDown(0.3)
    doc.fontSize(10).font("Helvetica").fillColor("#666")
      .text(`Facture N° F-${order.display_id}`, { align: "right" })
      .text(`Date: ${new Date(order.created_at).toLocaleDateString("fr-FR")}`, { align: "right" })

    doc.moveDown(1.5)

    // Company info (left)
    const companyY = doc.y
    doc.fillColor("#000").fontSize(14).font("Helvetica-Bold").text("Magic Crochet Kit")
    doc.fontSize(9).font("Helvetica").fillColor("#666")
      .text("TN GROUP")
      .text("6 Rue d'Armaille")
      .text("75017 Paris, France")
      .text("contact@magic-crochet-kit.com")
      .text("SIRET: A renseigner")

    // Customer info (right)
    const addr = order.shipping_address
    if (addr) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#000")
        .text("Facture a :", 350, companyY)
      doc.font("Helvetica").fillColor("#666")
        .text(`${addr.first_name || ""} ${addr.last_name || ""}`, 350)
        .text(addr.address_1 || "", 350)
        .text(`${addr.postal_code || ""} ${addr.city || ""}`, 350)
        .text(order.email || "", 350)
    }

    doc.moveDown(3)

    // Table header
    const tableTop = doc.y
    const col1 = 50, col2 = 300, col3 = 400, col4 = 480

    doc.fillColor("#f3f4f6").rect(col1 - 5, tableTop - 5, pageWidth + 10, 22).fill()
    doc.fillColor("#374151").fontSize(9).font("Helvetica-Bold")
      .text("Produit", col1, tableTop)
      .text("Qte", col2, tableTop, { width: 50, align: "center" })
      .text("Prix unit.", col3, tableTop, { width: 70, align: "right" })
      .text("Total", col4, tableTop, { width: 70, align: "right" })

    // Table rows
    let y = tableTop + 25
    const items = order.items || []

    for (const item of items) {
      const unitPrice = Number(item.unit_price) || 0
      const lineTotal = unitPrice * item.quantity

      doc.fillColor("#000").fontSize(9).font("Helvetica")
        .text(item.title || "Produit", col1, y, { width: 240 })
        .text(String(item.quantity), col2, y, { width: 50, align: "center" })
        .text(`${unitPrice.toFixed(2)} EUR`, col3, y, { width: 70, align: "right" })
        .text(`${lineTotal.toFixed(2)} EUR`, col4, y, { width: 70, align: "right" })

      y += 20

      // Line separator
      doc.strokeColor("#e5e7eb").lineWidth(0.5)
        .moveTo(col1, y - 3).lineTo(col4 + 70, y - 3).stroke()
    }

    // Totals
    y += 15
    const totalsX = 380

    const subtotal = Number(order.subtotal || order.item_subtotal) || 0
    const shipping = Number(order.shipping_total) || 0
    const discount = Number(order.discount_total) || 0
    const tax = Number(order.tax_total) || 0
    const total = Number(order.total) || 0

    doc.fontSize(9).font("Helvetica").fillColor("#666")
      .text("Sous-total HT", totalsX, y, { width: 90, align: "right" })
      .text(`${subtotal.toFixed(2)} EUR`, col4, y, { width: 70, align: "right" })

    y += 18
    doc.text("Livraison", totalsX, y, { width: 90, align: "right" })
      .text(shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} EUR`, col4, y, { width: 70, align: "right" })

    if (discount > 0) {
      y += 18
      doc.fillColor("#16a34a")
        .text("Reduction", totalsX, y, { width: 90, align: "right" })
        .text(`-${discount.toFixed(2)} EUR`, col4, y, { width: 70, align: "right" })
    }

    if (tax > 0) {
      y += 18
      doc.fillColor("#666")
        .text("TVA", totalsX, y, { width: 90, align: "right" })
        .text(`${tax.toFixed(2)} EUR`, col4, y, { width: 70, align: "right" })
    }

    // Total line
    y += 25
    doc.fillColor("#f3f4f6").rect(totalsX - 5, y - 5, 170, 25).fill()
    doc.fillColor("#000").fontSize(12).font("Helvetica-Bold")
      .text("TOTAL TTC", totalsX, y, { width: 90, align: "right" })
      .text(`${total.toFixed(2)} EUR`, col4, y, { width: 70, align: "right" })

    // Footer
    const footerY = doc.page.height - 80
    doc.fontSize(8).font("Helvetica").fillColor("#9ca3af")
      .text("Magic Crochet Kit — TN GROUP — 6 Rue d'Armaille, 75017 Paris", 50, footerY, { align: "center", width: pageWidth })
      .text("Merci pour votre confiance !", 50, footerY + 12, { align: "center", width: pageWidth })

    doc.end()
  })

  const pdfBuffer = Buffer.concat(chunks)

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename=facture-${order.display_id}.pdf`)
  res.setHeader("Content-Length", pdfBuffer.length)
  res.send(pdfBuffer)
}
