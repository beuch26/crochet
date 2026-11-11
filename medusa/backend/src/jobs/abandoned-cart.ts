import { MedusaContainer } from "@medusajs/framework/types"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Runs every hour to check for abandoned carts
export default async function abandonedCartJob(container: MedusaContainer) {
  const notificationService = container.resolve(Modules.NOTIFICATION) as any
  const remoteQuery = container.resolve(ContainerRegistrationKeys.REMOTE_QUERY)

  try {
    // Find carts with email, not completed, updated 2-24 hours ago
    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Query carts directly
    const cartService = container.resolve(Modules.CART) as any
    // Le filtre email doit rester en base : appliqué en JS après le `take`,
    // les paniers anonymes (la majorité) saturaient la page de résultats et
    // le job repartait sans rien envoyer.
    const carts = await cartService.listCarts(
      {
        completed_at: null,
        email: { $ne: null },
        updated_at: { $lt: twoHoursAgo, $gt: twentyFourHoursAgo },
      },
      // Du plus ancien au plus récent : les paniers proches de sortir de la
      // fenêtre des 24 h sont traités en premier.
      { relations: ["items"], order: { updated_at: "ASC" }, take: 50 }
    )

    const abandonedCarts = carts.filter((c: any) => c.items?.length > 0)

    if (abandonedCarts.length === 0) return

    for (const cart of abandonedCarts) {
      // Check if we already sent an email (use metadata)
      if (cart.metadata?.abandoned_email_sent) continue

      const itemsHtml = cart.items
        .slice(0, 3)
        .map((item: any) => {
          const price = ((Number(item.unit_price) || 0) * item.quantity).toFixed(2)
          return `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">
              <strong>${item.title}</strong> x${item.quantity}
            </td>
            <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right">${price} EUR</td>
          </tr>`
        })
        .join("")

      const moreItems = cart.items.length > 3 ? `<p style="color:#6b7280;font-size:13px">...et ${cart.items.length - 3} autre(s) article(s)</p>` : ""

      try {
        await notificationService.createNotifications({
          to: cart.email,
          channel: "email",
          template: null as any,
          content: {
            subject: "Vous avez oublie quelque chose... — Magic Crochet Kit",
            html: `<!DOCTYPE html>
<html>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;background:#f9fafb">
<div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;border:1px solid #e5e7eb">
  <div style="background:#1a1a2e;padding:32px;text-align:center">
    <h1 style="color:white;margin:0;font-size:22px">Votre panier vous attend !</h1>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;line-height:1.6">Bonjour,</p>
    <p style="color:#374151;line-height:1.6">Vous avez laisse des articles dans votre panier. Ils n'attendent que vous !</p>

    <table style="width:100%;border-collapse:collapse;margin:24px 0">
      ${itemsHtml}
    </table>
    ${moreItems}

    <div style="margin:32px 0;text-align:center">
      <a href="https://magic-crochet-kit.com/cart" style="display:inline-block;padding:14px 32px;background:#2563eb;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Reprendre mon panier</a>
    </div>

    <p style="color:#9ca3af;font-size:13px;text-align:center">
      Besoin d'aide ? <a href="mailto:contact@magic-crochet-kit.com" style="color:#2563eb">contact@magic-crochet-kit.com</a>
    </p>
  </div>
  <div style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af">
    Magic Crochet Kit — Tous droits reserves<br/>
    <a href="https://magic-crochet-kit.com" style="color:#9ca3af">Se desinscrire</a>
  </div>
</div>
</body>
</html>`,
          },
        })

        // Mark cart as email sent
        await cartService.updateCarts(cart.id, {
          metadata: { ...cart.metadata, abandoned_email_sent: new Date().toISOString() },
        })

        console.log(`Abandoned cart email sent to ${cart.email}`)
      } catch (e) {
        console.error(`Failed to send abandoned cart email to ${cart.email}:`, e)
      }
    }
  } catch (e) {
    console.error("Abandoned cart job error:", e)
  }
}

export const config = {
  name: "abandoned-cart-reminder",
  schedule: "0 * * * *", // Every hour
}
