/**
 * Quick smoke test: list integrations, run testers against the live ones.
 * Bypasses the HTTP layer (and thus the admin auth middleware) by hitting
 * the service directly.
 */

import { ExecArgs } from "@medusajs/framework/types"
import { INTEGRATION_MODULE } from "../modules/integration"
import { runIntegrationTest } from "../lib/integration-testers"
import { getIntegrationConfig } from "../lib/integration-config"

export default async function smokeTestIntegrations({ container }: ExecArgs) {
  const svc: any = container.resolve(INTEGRATION_MODULE)
  const rows = await svc.listIntegrations({})
  // eslint-disable-next-line no-console
  console.log(`\n=== ${rows.length} integrations in DB ===\n`)

  for (const row of rows) {
    const cfg = await getIntegrationConfig(container, row.slug)
    const t0 = Date.now()
    const result = await runIntegrationTest(row.slug, cfg)
    const ms = Date.now() - t0
    await svc.markHealth(row.slug, result.ok ? "ok" : "error", result.message ?? null)
    console.log(
      `  ${result.ok ? "OK " : "KO "} ${row.slug.padEnd(22)} ${ms}ms`,
      "—",
      result.message || "",
    )
  }
  console.log()
}
