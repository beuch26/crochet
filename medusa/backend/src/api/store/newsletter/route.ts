import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const newsletterService = req.scope.resolve(NEWSLETTER_MODULE)

  const { email } = req.body as { email: string }

  if (!email) {
    return res.status(400).json({ message: "Email requis" })
  }

  try {
    // Check if already subscribed
    const existing = await newsletterService.listNewsletterSubscribers({ email })
    if (existing && existing.length > 0) {
      // Reactivate if was unsubscribed
      if (!existing[0].is_active) {
        await newsletterService.updateNewsletterSubscribers({ id: existing[0].id, is_active: true })
      }
      return res.json({ subscriber: existing[0], message: "Déjà inscrit" })
    }

    const subscriber = await newsletterService.createNewsletterSubscribers({ email })
    res.status(201).json({ subscriber })
  } catch (e: any) {
    res.status(400).json({ message: e.message || "Erreur lors de l'inscription" })
  }
}
