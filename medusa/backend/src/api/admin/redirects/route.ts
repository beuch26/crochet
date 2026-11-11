import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REDIRECT_MODULE } from "../../../modules/redirect"

// GET /admin/redirects — list all redirects
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(REDIRECT_MODULE) as any
  const { is_active, search } = req.query as any

  const filters: any = {}
  if (is_active !== undefined) filters.is_active = is_active === "true"

  const redirects = await service.listRedirects(filters, {
    order: { created_at: "DESC" },
    take: 500,
  })

  // Filter by search if needed (source or target contains search term)
  let filtered = redirects
  if (search) {
    const q = search.toLowerCase()
    filtered = redirects.filter((r: any) =>
      r.source.toLowerCase().includes(q) || r.target.toLowerCase().includes(q) || (r.note || "").toLowerCase().includes(q)
    )
  }

  const stats = {
    total: redirects.length,
    active: redirects.filter((r: any) => r.is_active).length,
    total_hits: redirects.reduce((s: number, r: any) => s + (r.hit_count || 0), 0),
  }

  res.json({ redirects: filtered, stats })
}

// POST /admin/redirects — create a new redirect
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(REDIRECT_MODULE) as any
  const body = req.body as {
    source: string
    target: string
    status_code?: number
    note?: string
  }

  if (!body.source || !body.target) {
    return res.status(400).json({ message: "Source et target requis" })
  }

  // Normalize: ensure source starts with /
  const source = body.source.startsWith("/") ? body.source : `/${body.source}`
  const target = body.target.startsWith("/") || body.target.startsWith("http") ? body.target : `/${body.target}`

  // Check for duplicates
  const existing = await service.listRedirects({ source }, { take: 1 })
  if (existing.length > 0) {
    return res.status(409).json({ message: `Une redirection existe deja pour ${source}` })
  }

  const redirect = await service.createRedirects({
    source,
    target,
    status_code: body.status_code || 301,
    is_active: true,
    hit_count: 0,
    note: body.note || null,
  })

  res.status(201).json({ redirect })
}
