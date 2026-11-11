import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INTEGRATION_MODULE } from "../../../../../modules/integration"
import { findIntegration } from "../../../../../modules/integration/catalog"
import { runIntegrationTest } from "../../../../../lib/integration-testers"
import { getIntegrationConfig } from "../../../../../lib/integration-config"

/**
 * POST /admin/integrations/:slug/test
 *
 * Runs the corresponding tester immediately, updates health_status, and
 * returns the result. Result is also appended to the audit log.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params
  const def = findIntegration(slug as string)
  if (!def) return res.status(404).json({ message: "Unknown integration slug" })

  const svc: any = req.scope.resolve(INTEGRATION_MODULE)
  const cfg = await getIntegrationConfig(req.scope, slug as string)
  const startedAt = Date.now()
  const result = await runIntegrationTest(slug as string, cfg)
  const duration = Date.now() - startedAt

  await svc.markHealth(slug, result.ok ? "ok" : "error", result.message || null)

  // Audit
  const rows = await svc.listIntegrations({ slug })
  if (rows[0]) {
    await svc.recordAudit({
      integration_id: rows[0].id,
      actor_id: (req as any).auth_context?.actor_id ?? null,
      action: "tested",
      notes: result.ok ? `OK (${duration}ms)` : `KO: ${result.message?.slice(0, 200)}`,
    })
  }

  res.json({
    slug,
    ok: result.ok,
    message: result.message ?? null,
    duration_ms: duration,
    tested_at: new Date().toISOString(),
  })
}
