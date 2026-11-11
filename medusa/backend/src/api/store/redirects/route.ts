import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REDIRECT_MODULE } from "../../../modules/redirect"

/**
 * GET /store/redirects?path=/old-url
 *
 * Checks if a redirect exists for the given path.
 * Used by the frontend 404 page to redirect old URLs.
 * Also increments the hit counter.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(REDIRECT_MODULE) as any
  const path = req.query.path as string

  if (!path) {
    return res.status(400).json({ message: "path required" })
  }

  const source = path.startsWith("/") ? path : `/${path}`

  const redirects = await service.listRedirects({ source, is_active: true }, { take: 1 })

  if (redirects.length === 0) {
    return res.status(404).json({ redirect: null })
  }

  const redirect = redirects[0]

  // Increment hit count (fire and forget)
  try {
    await service.updateRedirects({
      id: redirect.id,
      hit_count: (redirect.hit_count || 0) + 1,
      last_hit_at: new Date(),
    })
  } catch {}

  res.json({
    redirect: {
      target: redirect.target,
      status_code: redirect.status_code,
    },
  })
}
