import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RETURN_REQUEST_MODULE } from "../../../modules/return-request"
import { Modules } from "@medusajs/framework/utils"

// POST — submit a return request
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const returnService = req.scope.resolve(RETURN_REQUEST_MODULE) as any
  const notificationService = req.scope.resolve(Modules.NOTIFICATION) as any

  const body = req.body as {
    order_id: string
    order_display_id?: string
    customer_email: string
    customer_name?: string
    reason: string
    description?: string
    items?: any[]
  }

  if (!body.order_id || !body.customer_email || !body.reason) {
    return res.status(400).json({ message: "Donnees incompletes" })
  }

  const request = await returnService.createReturnRequests({
    order_id: body.order_id,
    order_display_id: body.order_display_id || null,
    customer_email: body.customer_email.toLowerCase(),
    customer_name: body.customer_name || null,
    reason: body.reason,
    description: body.description || null,
    items: body.items || null,
    status: "pending",
  })

  // Send confirmation email to customer
  try {
    await notificationService.createNotifications({
      to: body.customer_email,
      channel: "email",
      template: null as any,
      content: {
        subject: `Demande de retour recue — Commande #${body.order_display_id || body.order_id} — Magic Crochet Kit`,
        html: `<!DOCTYPE html><html><body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f9fafb"><div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;border:1px solid #e5e7eb"><div style="background:#1a1a2e;padding:32px;text-align:center"><h1 style="color:white;margin:0;font-size:22px">Demande de retour recue</h1></div><div style="padding:32px"><p style="color:#374151;line-height:1.6">Bonjour ${body.customer_name || ""},</p><p style="color:#374151;line-height:1.6">Nous avons bien recu votre demande de retour pour la commande <strong>#${body.order_display_id || body.order_id}</strong>.</p><p style="color:#374151;line-height:1.6">Notre equipe va l'examiner et vous repondra sous 48 heures avec les instructions pour le retour.</p><p style="color:#9ca3af;font-size:13px;text-align:center;margin-top:24px">Une question ? <a href="mailto:contact@magic-crochet-kit.com" style="color:#2563eb">contact@magic-crochet-kit.com</a></p></div><div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af">Magic Crochet Kit — Tous droits reserves</div></div></body></html>`,
      },
    })
  } catch {}

  res.status(201).json({ return_request: request, message: "Demande de retour enregistree" })
}
