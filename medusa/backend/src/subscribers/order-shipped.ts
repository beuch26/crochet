import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderShippedHandler({ event, container }: SubscriberArgs<{ id: string; fulfillment_id: string }>) {
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const orderService = container.resolve(Modules.ORDER)

  try {
    const order = await orderService.retrieveOrder(event.data.id, {
      relations: ["shipping_address", "fulfillments"],
    })

    // `fulfillments` n'est pas sur OrderDTO : il vient de la relation demandée ci-dessus.
    const fulfillment = (order as any).fulfillments?.find((f: any) => f.id === event.data.fulfillment_id)

    // `email` est optionnel sur OrderDTO : sans destinataire, rien à envoyer.
    const to = order.email
    if (!to) return
    const trackingLinks = fulfillment?.tracking_links || []
    const trackingHtml = trackingLinks.length > 0
      ? trackingLinks.map((t: any) => `<a href="${t.url || '#'}" style="color:#2563eb;font-weight:600">${t.tracking_number || 'Suivre le colis'}</a>`).join("<br/>")
      : ""

    const addr = order.shipping_address

    await notificationService.createNotifications({
      to,
      channel: "email",
      template: null,
      content: {
        subject: `Votre commande #${order.display_id} a ete expediee — Magic Crochet Kit`,
        html: `
<!DOCTYPE html>
<html>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f9fafb">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;border:1px solid #e5e7eb">
  <div style="background:#10b981;padding:32px;text-align:center">
    <h1 style="color:white;margin:0;font-size:24px">Votre colis est en route !</h1>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;line-height:1.6">Bonjour ${addr?.first_name || ""},</p>
    <p style="color:#374151;line-height:1.6">Bonne nouvelle ! Votre commande <strong>#${order.display_id}</strong> a ete expediee.</p>

    ${trackingHtml ? `
    <div style="margin:24px 0;padding:16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">
      <p style="margin:0 0 8px;font-weight:600;color:#166534">Suivi du colis</p>
      ${trackingHtml}
    </div>
    ` : ""}

    <h3 style="color:#1a1a2e">Adresse de livraison</h3>
    <p style="color:#6b7280;line-height:1.6">
      ${addr ? `${addr.first_name} ${addr.last_name}<br/>${addr.address_1}<br/>${addr.postal_code} ${addr.city}` : ""}
    </p>

    <p style="margin-top:32px;color:#9ca3af;font-size:13px;text-align:center">
      Une question ? <a href="mailto:contact@magic-crochet-kit.com" style="color:#2563eb">contact@magic-crochet-kit.com</a>
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
    console.error("Shipping email error:", e)
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
