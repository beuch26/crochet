import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NEWSLETTER_MODULE } from "../../../modules/newsletter"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const newsletterService = req.scope.resolve(NEWSLETTER_MODULE)

  const limit = parseInt(req.query.limit as string) || 100
  const offset = parseInt(req.query.offset as string) || 0

  const filters: Record<string, unknown> = {}
  if (req.query.is_active !== undefined) {
    filters.is_active = req.query.is_active === "true"
  }

  const [subscribers, count] = await newsletterService.listAndCountNewsletterSubscribers(
    filters,
    {
      order: { created_at: "DESC" },
      skip: offset,
      take: limit,
    }
  )

  res.json({ subscribers, count, limit, offset })
}

// POST — add a new subscriber manually OR bulk import
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const newsletterService = req.scope.resolve(NEWSLETTER_MODULE) as any
  const body = req.body as { email?: string; emails?: string[] }

  // Bulk import
  if (Array.isArray(body.emails)) {
    const validEmails = body.emails
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

    if (validEmails.length === 0) {
      return res.status(400).json({ message: "Aucun email valide" })
    }

    const created: any[] = []
    const skipped: string[] = []

    for (const email of validEmails) {
      try {
        // Check if exists
        const existing = await newsletterService.listNewsletterSubscribers({ email }, { take: 1 })
        if (existing.length > 0) {
          skipped.push(email)
          continue
        }
        const sub = await newsletterService.createNewsletterSubscribers({ email, is_active: true })
        created.push(sub)
      } catch {
        skipped.push(email)
      }
    }

    return res.json({
      message: `${created.length} abonne(s) ajoute(s), ${skipped.length} ignore(s)`,
      created: created.length,
      skipped: skipped.length,
    })
  }

  // Single
  if (!body.email) {
    return res.status(400).json({ message: "Email requis" })
  }
  const email = body.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Email invalide" })
  }

  // Check if exists
  const existing = await newsletterService.listNewsletterSubscribers({ email }, { take: 1 })
  if (existing.length > 0) {
    return res.status(409).json({ message: "Cet email est deja abonne" })
  }

  const subscriber = await newsletterService.createNewsletterSubscribers({
    email,
    is_active: true,
  })

  res.status(201).json({ subscriber })
}
