import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INTEGRATION_MODULE } from "../../../../modules/integration"
import { findIntegration } from "../../../../modules/integration/catalog"
import { decryptJson } from "../../../../lib/integration-crypto"

function sanitize(def: ReturnType<typeof findIntegration>, row: any) {
  if (!def) return null
  let secretsFilled: Record<string, boolean> = Object.fromEntries(
    def.secret_fields.map((f) => [f.key, false]),
  )
  if (row?.config_encrypted) {
    try {
      const blob = decryptJson(row.config_encrypted) as Record<string, unknown>
      secretsFilled = Object.fromEntries(def.secret_fields.map((f) => [f.key, !!blob[f.key]]))
    } catch {
      /* keep all-false */
    }
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
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params
  const def = findIntegration(slug as string)
  if (!def) return res.status(404).json({ message: "Unknown integration slug" })

  const svc: any = req.scope.resolve(INTEGRATION_MODULE)
  const rows = await svc.listIntegrations({ slug })
  res.json({ integration: sanitize(def, rows[0]) })
}

/**
 * PATCH /admin/integrations/:slug
 *
 * Body shape:
 *   { config_public?: { [key]: value }, config_secret_in?: { [key]: value } }
 *
 * Empty-string secrets are silently dropped (i.e. "leave existing value
 * untouched") so the UI can render password fields with placeholder ••••
 * and only POST the ones the user actually edited.
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params
  const def = findIntegration(slug as string)
  if (!def) return res.status(404).json({ message: "Unknown integration slug" })

  const body = (req.body || {}) as {
    config_public?: Record<string, unknown>
    config_secret_in?: Record<string, unknown>
  }

  // Whitelist incoming fields against the catalog
  const publicWl: Record<string, unknown> = {}
  for (const f of def.public_fields) {
    if (body.config_public && f.key in body.config_public) publicWl[f.key] = body.config_public[f.key]
  }
  const secretWl: Record<string, unknown> = {}
  for (const f of def.secret_fields) {
    if (body.config_secret_in && f.key in body.config_secret_in) {
      const v = body.config_secret_in[f.key]
      if (typeof v === "string" && v.trim() === "") continue // skip "untouched"
      secretWl[f.key] = v
    }
  }

  const svc: any = req.scope.resolve(INTEGRATION_MODULE)
  const { row, changedFields } = await svc.setConfig(slug, { public: publicWl, secret: secretWl })

  // Emit so the cache invalidates and subscribers can react
  try {
    const eventBus = req.scope.resolve("event_bus") as any
    await eventBus.emit({ name: "integration.updated", data: { slug, changed_fields: changedFields } })
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[integration] event emit failed:", e?.message)
  }

  // Audit
  if (changedFields.length > 0) {
    await svc.recordAudit({
      integration_id: row.id,
      actor_id: (req as any).auth_context?.actor_id ?? null,
      action: "updated",
      changed_fields: changedFields,
    })
  }

  res.json({ integration: sanitize(def, row), changed_fields: changedFields })
}
