import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INTEGRATION_MODULE } from "../../../../modules/integration"
import { INTEGRATIONS } from "../../../../modules/integration/catalog"

/**
 * GET /store/integrations/public
 *
 * Returns ONLY non-secret config values of currently-enabled integrations,
 * grouped by category. Consumed by the storefront at build time + at
 * runtime (e.g. Layout.astro reads GA4 measurement_id, GTM container_id,
 * Clarity project_id from here).
 *
 * This endpoint is PUBLIC — it has no auth gate. Make absolutely sure to
 * never include anything from config_encrypted nor secret_fields here.
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const svc: any = _req.scope.resolve(INTEGRATION_MODULE)
  const rows: any[] = await svc.listIntegrations({})
  const bySlug = new Map<string, any>(rows.map((r) => [r.slug, r]))

  const grouped: Record<string, Record<string, Record<string, unknown>>> = {}
  for (const def of INTEGRATIONS) {
    const row = bySlug.get(def.slug)
    if (!row?.enabled) continue
    const pub = (row.config_public || {}) as Record<string, unknown>
    // Whitelist against the catalog's public_fields so even if some other
    // code accidentally writes to config_public we never leak it.
    const whitelisted: Record<string, unknown> = {}
    for (const f of def.public_fields) {
      if (pub[f.key] !== undefined && pub[f.key] !== "") whitelisted[f.key] = pub[f.key]
    }
    if (Object.keys(whitelisted).length === 0) continue
    if (!grouped[def.category]) grouped[def.category] = {}
    grouped[def.category][def.slug] = whitelisted
  }

  // Short-cache: storefront calls this at build, but a runtime client
  // page might too. 60s cache is a sane default.
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
  res.json(grouped)
}
