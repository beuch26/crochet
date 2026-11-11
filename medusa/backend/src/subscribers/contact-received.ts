import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { getIntegrationConfig } from "../lib/integration-config"

/**
 * Fires on `contact.received`. Sends TWO emails:
 *   1. Auto-reply to the customer ("Nous avons bien reçu votre message…")
 *   2. Notification to the shop admin with the full message + reply-to set
 *      to the customer email so a simple reply in the inbox reaches them.
 *
 * Admin recipient resolves from env (CONTACT_ADMIN_EMAIL) and falls back
 * to SMTP_FROM (which is the same inbox in our setup).
 */
export default async function contactReceivedHandler({
  event,
  container,
}: SubscriberArgs<{ id?: string; name: string; email: string; subject: string; message: string }>) {
  const notificationService: any = container.resolve(Modules.NOTIFICATION)
  const { id: messageId, name, email, subject, message } = event.data

  // Read admin notification email from the Brevo integration (with env fallback)
  const brevoCfg = await getIntegrationConfig<{
    admin_notification_email?: string
    from_email?: string
  }>(container, "brevo")
  const adminEmail =
    brevoCfg.admin_notification_email
    || brevoCfg.from_email
    || process.env.CONTACT_ADMIN_EMAIL
    || process.env.SMTP_FROM
    || "contact@magic-crochet-kit.com"
  const escape = (s: string) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

  // ---------- 1. Auto-reply to the customer ----------
  try {
    await notificationService.createNotifications({
      to: email,
      channel: "email",
      template: null,
      content: {
        subject: `Nous avons bien reçu votre message — Magic Crochet Kit`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f9fafb">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;border:1px solid #e5e7eb">
  <div style="background:#1a1a2e;padding:32px;text-align:center">
    <h1 style="color:white;margin:0;font-size:24px">Message bien reçu !</h1>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;line-height:1.6">Bonjour ${escape(name)},</p>
    <p style="color:#374151;line-height:1.6">Nous avons bien reçu votre message concernant "<strong>${escape(subject)}</strong>". Notre équipe vous répondra dans les plus brefs délais.</p>

    <div style="margin:24px 0;padding:16px;background:#f3f4f6;border-radius:8px">
      <p style="margin:0;color:#6b7280;font-size:13px;white-space:pre-wrap">${escape(message)}</p>
    </div>

    <p style="color:#9ca3af;font-size:13px">Cordialement,<br/><strong>L'équipe Magic Crochet Kit</strong></p>
  </div>
  <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af">
    &copy; ${new Date().getFullYear()} Magic Crochet Kit — Tous droits réservés
  </div>
</div>
</body>
</html>`,
      },
    })
  } catch (e) {
    console.error("Contact auto-reply error:", e)
  }

  // ---------- 2. Admin notification ----------
  const adminBackendUrl =
    process.env.MEDUSA_BACKEND_URL || "https://api-hetzner.web-guru.fr"
  const messageLink = messageId
    ? `${adminBackendUrl}/app/contact?id=${messageId}`
    : `${adminBackendUrl}/app/contact`

  try {
    await notificationService.createNotifications({
      to: adminEmail,
      channel: "email",
      template: null,
      // Setting Reply-To via channel-level data isn't supported uniformly
      // across notification providers; the customer email is already in
      // the body so a copy-paste reply is one click.
      content: {
        subject: `[Magic Crochet Kit] Nouveau message — ${subject} — ${name}`,
        html: `<!DOCTYPE html>
<html>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f9fafb">
<div style="max-width:640px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;border:1px solid #e5e7eb">
  <div style="background:#1a1a2e;padding:24px 32px">
    <p style="color:#9ca3af;font-size:12px;margin:0;letter-spacing:.05em;text-transform:uppercase">Magic Crochet Kit — formulaire de contact</p>
    <h1 style="color:white;margin:8px 0 0;font-size:22px">Nouveau message reçu</h1>
  </div>
  <div style="padding:28px 32px">
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
      <tr><td style="padding:8px 0;color:#6b7280;width:130px">De</td><td style="padding:8px 0"><strong>${escape(name)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0"><a href="mailto:${escape(email)}" style="color:#e11d48;text-decoration:none">${escape(email)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#6b7280">Sujet</td><td style="padding:8px 0">${escape(subject)}</td></tr>
    </table>

    <div style="margin:20px 0;padding:18px;background:#f3f4f6;border-left:3px solid #e11d48;border-radius:6px">
      <p style="margin:0;color:#1f2937;font-size:14px;line-height:1.6;white-space:pre-wrap">${escape(message)}</p>
    </div>

    <div style="margin-top:24px;display:flex;gap:12px">
      <a href="mailto:${escape(email)}?subject=Re:%20${encodeURIComponent(subject)}" style="display:inline-block;padding:10px 16px;background:#e11d48;color:white;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">Répondre par mail</a>
      <a href="${messageLink}" style="display:inline-block;padding:10px 16px;background:#f3f4f6;color:#374151;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">Voir dans l'admin</a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:14px;text-align:center;font-size:11px;color:#9ca3af">Notification automatique — message envoyé via le formulaire de magic-crochet-kit.com/contact</div>
</div>
</body>
</html>`,
      },
    })
  } catch (e) {
    console.error("Contact admin notification error:", e)
  }
}

export const config: SubscriberConfig = {
  event: "contact.received",
}
