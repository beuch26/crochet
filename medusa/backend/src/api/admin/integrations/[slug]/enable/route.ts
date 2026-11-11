import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INTEGRATION_MODULE } from "../../../../../modules/integration"
import { findIntegration } from "../../../../../modules/integration/catalog"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params
  const def = findIntegration(slug as string)
  if (!def) return res.status(404).json({ message: "Unknown integration slug" })

  const svc: any = req.scope.resolve(INTEGRATION_MODULE)
  const row = await svc.setEnabled(slug, true)
  await svc.recordAudit({
    integration_id: row.id,
    actor_id: (req as any).auth_context?.actor_id ?? null,
    action: "enabled",
  })
  try {
    const eventBus = req.scope.resolve("event_bus") as any
    await eventBus.emit({ name: "integration.updated", data: { slug, changed_fields: ["enabled"] } })
  } catch {}
  res.json({ slug, enabled: true })
}
