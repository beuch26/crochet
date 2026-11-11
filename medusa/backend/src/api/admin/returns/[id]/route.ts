import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RETURN_REQUEST_MODULE } from "../../../../modules/return-request"
import { Modules } from "@medusajs/framework/utils"

// POST — update status, notes, refund amount
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const returnService = req.scope.resolve(RETURN_REQUEST_MODULE) as any
  const notificationService = req.scope.resolve(Modules.NOTIFICATION) as any
  const { id } = req.params
  const body = req.body as { status?: string; admin_notes?: string; refund_amount?: number }

  const updateData: any = { id }
  if (body.status !== undefined) {
    updateData.status = body.status
    if (["approved", "rejected", "refunded", "completed"].includes(body.status)) {
      updateData.processed_at = new Date()
    }
  }
  if (body.admin_notes !== undefined) updateData.admin_notes = body.admin_notes
  if (body.refund_amount !== undefined) updateData.refund_amount = body.refund_amount

  const returnRequest = await returnService.updateReturnRequests(updateData)

  // Notify customer on status change
  if (body.status && returnRequest) {
    const r = Array.isArray(returnRequest) ? returnRequest[0] : returnRequest
    const statusLabels: Record<string, string> = {
      approved: "approuvee",
      rejected: "refusee",
      refunded: "remboursee",
      completed: "completee",
    }
    const label = statusLabels[body.status]
    if (label && r.customer_email) {
      try {
        await notificationService.createNotifications({
          to: r.customer_email,
          channel: "email",
          template: null as any,
          content: {
            subject: `Mise a jour de votre retour — Magic Crochet Kit`,
            html: `<!DOCTYPE html><html><body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f9fafb"><div style="max-width:600px;margin:24px auto;background:white;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden"><div style="background:#1a1a2e;padding:24px;text-align:center"><h1 style="color:white;margin:0;font-size:20px">Mise a jour de votre retour</h1></div><div style="padding:24px"><p>Bonjour ${r.customer_name || ""},</p><p>Votre demande de retour a ete <strong>${label}</strong>.</p>${body.admin_notes ? `<div style="margin:16px 0;padding:16px;background:#f3f4f6;border-radius:8px"><p style="margin:0;color:#374151">${body.admin_notes.replace(/\n/g, '<br/>')}</p></div>` : ''}${body.refund_amount ? `<p>Montant rembourse : <strong>${(body.refund_amount / 100).toFixed(2)} EUR</strong></p>` : ''}<p style="color:#9ca3af;font-size:13px;margin-top:24px">Une question ? <a href="mailto:contact@magic-crochet-kit.com" style="color:#2563eb">contact@magic-crochet-kit.com</a></p></div></div></body></html>`,
          },
        })
      } catch {}
    }
  }

  res.json({ return_request: returnRequest })
}

// DELETE
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const returnService = req.scope.resolve(RETURN_REQUEST_MODULE) as any
  const { id } = req.params
  await returnService.deleteReturnRequests(id)
  res.json({ id, deleted: true })
}
