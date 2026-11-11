import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({ event, container }: SubscriberArgs<{ id: string }>) {
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const orderService = container.resolve(Modules.ORDER)

  try {
    const order = await orderService.retrieveOrder(event.data.id, {
      relations: ["items", "shipping_address"],
    })

    // `email` est optionnel sur OrderDTO : sans destinataire, rien à envoyer.
    const to = order.email
    if (!to) return

    const itemsHtml = order.items?.map((item: any) =>
      `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">
          <strong>${item.title}</strong><br/>
          <span style="color:#6b7280">Qte: ${item.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right">
          ${(Number(item.unit_price) * item.quantity).toFixed(2)} EUR
        </td>
      </tr>`
    ).join("") || ""

    const addr = order.shipping_address
    const addressHtml = addr ? `${addr.first_name} ${addr.last_name}<br/>${addr.address_1}<br/>${addr.postal_code} ${addr.city}` : ""

    await notificationService.createNotifications({
      to,
      channel: "email",
      template: null,
      content: {
        subject: `Confirmation de commande #${order.display_id} — Magic Crochet Kit`,
        html: `
<!DOCTYPE html>
<html>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f9fafb">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;border:1px solid #e5e7eb">
  <div style="background:#1a1a2e;padding:32px;text-align:center">
    <h1 style="color:white;margin:0;font-size:24px">Merci pour votre commande !</h1>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;line-height:1.6">Bonjour ${addr?.first_name || ""},</p>
    <p style="color:#374151;line-height:1.6">Votre commande <strong>#${order.display_id}</strong> a bien ete enregistree. Nous la preparons avec soin.</p>

    <h3 style="margin-top:24px;color:#1a1a2e">Recapitulatif</h3>
    <table style="width:100%;border-collapse:collapse">
      ${itemsHtml}
      <tr>
        <td style="padding:12px 0;font-weight:bold">Total</td>
        <td style="padding:12px 0;font-weight:bold;text-align:right">${(Number(order.total) || 0).toFixed(2)} EUR</td>
      </tr>
    </table>

    ${addressHtml ? `
    <h3 style="margin-top:24px;color:#1a1a2e">Adresse de livraison</h3>
    <p style="color:#6b7280;line-height:1.6">${addressHtml}</p>
    ` : ""}

    <div style="margin-top:32px;text-align:center">
      <a href="https://magic-crochet-kit.com/suivi-commande" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:600">Suivre ma commande</a>
    </div>

    <p style="margin-top:32px;color:#9ca3af;font-size:13px;text-align:center">
      Une question ? Contactez-nous a <a href="mailto:contact@magic-crochet-kit.com" style="color:#2563eb">contact@magic-crochet-kit.com</a>
    </p>
  </div>
  <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af">
    &copy; ${new Date().getFullYear()} Magic Crochet Kit — Tous droits reserves
  </div>
</div>
</body>
</html>`,
      },
    })
  } catch (e) {
    console.error("Order email error:", e)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
