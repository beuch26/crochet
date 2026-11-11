import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MODULE } from "../../../../modules/contact"
import { Modules } from "@medusajs/framework/utils"

// Mark as read OR reply
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const contactService = req.scope.resolve(CONTACT_MODULE)
  const notificationService = req.scope.resolve(Modules.NOTIFICATION) as any
  const { id } = req.params
  const body = req.body as { is_read?: boolean; admin_reply?: string; replied_by?: string }

  const updateData: any = { id }
  if (body.is_read !== undefined) updateData.is_read = body.is_read
  if (body.admin_reply !== undefined) {
    updateData.admin_reply = body.admin_reply
    updateData.replied_at = new Date()
    if (body.replied_by) updateData.replied_by = body.replied_by
    updateData.is_read = true
  }

  const message = await contactService.updateContactMessages(updateData)

  // Send reply email if admin_reply is set
  if (body.admin_reply && message) {
    const msgArr = Array.isArray(message) ? message : [message]
    const m = msgArr[0]
    try {
      await notificationService.createNotifications({
        to: m.email,
        channel: "email",
        template: null as any,
        content: {
          subject: `Re: ${m.subject || "Votre message"} — Magic Crochet Kit`,
          html: `<!DOCTYPE html><html><body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f9fafb"><div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;border:1px solid #e5e7eb"><div style="background:#1a1a2e;padding:32px;text-align:center"><h1 style="color:white;margin:0;font-size:22px">Reponse a votre message</h1></div><div style="padding:32px"><p style="color:#374151;line-height:1.6">Bonjour ${m.name},</p><p style="color:#374151;line-height:1.6">Suite a votre message du ${new Date(m.created_at).toLocaleDateString("fr-FR")}, voici notre reponse :</p><div style="margin:24px 0;padding:20px;background:#f0f9ff;border-radius:8px;border-left:4px solid #2563eb;color:#1e40af;line-height:1.6">${body.admin_reply.replace(/\n/g, "<br/>")}</div><p style="color:#9ca3af;font-size:13px">Pour rappel, votre message etait :</p><div style="margin:8px 0 24px;padding:12px;background:#f3f4f6;border-radius:6px;color:#6b7280;font-size:13px;font-style:italic">${m.message.replace(/\n/g, "<br/>")}</div><p style="color:#374151;line-height:1.6">N'hesitez pas a nous recontacter si besoin.</p><p style="color:#9ca3af;font-size:13px;margin-top:24px">Cordialement,<br/><strong>L'equipe Magic Crochet Kit</strong></p></div><div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af">Magic Crochet Kit — Tous droits reserves</div></div></body></html>`,
        },
      })
    } catch (e) {
      console.error("Failed to send admin reply email:", e)
    }
  }

  res.json({ contact_message: message })
}

// Delete message
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const contactService = req.scope.resolve(CONTACT_MODULE)
  const { id } = req.params

  await contactService.deleteContactMessages(id)

  res.json({ id, deleted: true })
}
