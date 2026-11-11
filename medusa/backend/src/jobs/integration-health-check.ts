import { MedusaContainer } from "@medusajs/framework/types"
import { INTEGRATION_MODULE } from "../modules/integration"
import { getIntegrationConfig } from "../lib/integration-config"
import { runIntegrationTest } from "../lib/integration-testers"

/**
 * Pings each enabled integration every 6h. Stores result in
 * `health_status` + `health_message` + `last_health_check_at` so the
 * admin UI can show a fresh status badge without manual testing.
 *
 * Failures are isolated per slug — one broken integration never blocks
 * the others. Each tester has its own 8s timeout (see integration-testers.ts).
 */
export default async function integrationHealthCheck(container: MedusaContainer) {
  const logger = container.resolve("logger") as any
  const svc: any = container.resolve(INTEGRATION_MODULE)

  const rows: any[] = await svc.listIntegrations({ enabled: true })
  if (rows.length === 0) {
    logger.info("[integration-health] no enabled integrations, skipping")
    return
  }

  const startedAt = Date.now()
  const results = await Promise.allSettled(
    rows.map(async (row) => {
      const cfg = await getIntegrationConfig(container, row.slug)
      const t0 = Date.now()
      const result = await runIntegrationTest(row.slug, cfg)
      const ms = Date.now() - t0
      await svc.markHealth(row.slug, result.ok ? "ok" : "error", result.message ?? null)
      // Structured log line for monitoring grep
      logger.info(
        JSON.stringify({
          event: "integration_health_check",
          slug: row.slug,
          status: result.ok ? "ok" : "error",
          message: result.message ?? null,
          duration_ms: ms,
        }),
      )
      return { slug: row.slug, ok: result.ok }
    }),
  )

  const ok = results.filter((r) => r.status === "fulfilled" && (r as any).value.ok).length
  const ko = results.length - ok
  logger.info(
    `[integration-health] cycle done in ${Date.now() - startedAt}ms — ${ok} ok, ${ko} ko (over ${rows.length} enabled)`,
  )
}

export const config = {
  name: "integration-health-check",
  schedule: "0 */6 * * *", // every 6 hours
}
