import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INTEGRATION_MODULE } from "../../../modules/integration"
import { INTEGRATIONS } from "../../../modules/integration/catalog"

/**
 * GET /admin/integrations
 *
 * Returns the catalog merged with whatever is in DB. Each entry includes
 * status + last_health_check_at + last_used_at + which secret_fields are
 * populated (just a boolean per field — the value itself is never returned).
 * config_public values ARE returned. config_encrypted is NEVER returned.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc: any = req.scope.resolve(INTEGRATION_MODULE)
  const rows = await svc.listIntegrations({})
  const bySlug = new Map<string, any>(rows.map((r: any) => [r.slug, r]))

  const items = INTEGRATIONS.map((def) => {
    const row: any = bySlug.get(def.slug)
    let secretsFilled: Record<string, boolean> = {}
    if (row?.config_encrypted) {
      // Resolve via the service so the cipher logic stays in one place.
      // For perf we don't decrypt on every list call — just expose flags.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { decryptJson } = require("../../../lib/integration-crypto")
        const blob = decryptJson(row.config_encrypted)
        secretsFilled = Object.fromEntries(
          def.secret_fields.map((f) => [f.key, !!blob[f.key]]),
        )
      } catch {
        secretsFilled = Object.fromEntries(def.secret_fields.map((f) => [f.key, false]))
      }
    } else {
      secretsFilled = Object.fromEntries(def.secret_fields.map((f) => [f.key, false]))
    }

    return {
      slug: def.slug,
      name: def.name,
      category: def.category,
      description: def.description,
      logo_path: def.logo_path,
      restart_required: def.restart_required,
      public_fields: def.public_fields,
      secret_fields: def.secret_fields,
      // From DB (or defaults if no row yet)
      enabled: row?.enabled ?? false,
      config_public: (row?.config_public || {}) as Record<string, unknown>,
      secrets_filled: secretsFilled,
      health_status: row?.health_status ?? "unknown",
      health_message: row?.health_message ?? null,
      last_health_check_at: row?.last_health_check_at ?? null,
      last_used_at: row?.last_used_at ?? null,
      connected_at: row?.connected_at ?? null,
      rotated_at: row?.rotated_at ?? null,
      expires_at: row?.expires_at ?? null,
    }
  })

  res.json({ integrations: items, count: items.length })
}
