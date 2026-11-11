import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REDIRECT_MODULE } from "../../../../modules/redirect"

// POST /admin/redirects/import
// Body: { redirects: [{ source, target, status_code?, note? }] }
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(REDIRECT_MODULE) as any
  const { redirects } = req.body as { redirects: { source: string; target: string; status_code?: number; note?: string }[] }

  if (!Array.isArray(redirects) || redirects.length === 0) {
    return res.status(400).json({ message: "Tableau de redirections requis" })
  }

  let created = 0
  let skipped = 0

  for (const r of redirects) {
    if (!r.source || !r.target) { skipped++; continue }

    const source = r.source.startsWith("/") ? r.source : `/${r.source}`
    const target = r.target.startsWith("/") || r.target.startsWith("http") ? r.target : `/${r.target}`

    // Skip duplicates
    const existing = await service.listRedirects({ source }, { take: 1 })
    if (existing.length > 0) { skipped++; continue }

    try {
      await service.createRedirects({
        source,
        target,
        status_code: r.status_code || 301,
        is_active: true,
        hit_count: 0,
        note: r.note || "Import",
      })
      created++
    } catch {
      skipped++
    }
  }

  res.json({ message: `${created} redirection(s) creee(s), ${skipped} ignoree(s)`, created, skipped })
}
