import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { INTEGRATION_MODULE } from "../../../../../modules/integration"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params
  const svc: any = req.scope.resolve(INTEGRATION_MODULE)

  const rows = await svc.listIntegrations({ slug })
  if (!rows[0]) return res.status(404).json({ message: "Unknown integration slug" })

  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 200)
  const logs = await svc.listIntegrationAuditLogs(
    { integration_id: rows[0].id },
    { order: { created_at: "DESC" }, take: limit },
  )

  // Best-effort: enrich actor_id with the user email
  const actorIds: string[] = Array.from(new Set(logs.map((l: any) => l.actor_id).filter(Boolean) as string[]))
  let emailById = new Map<string, string>()
  if (actorIds.length > 0) {
    try {
      const userSvc: any = req.scope.resolve(Modules.USER)
      const users = await userSvc.listUsers({ id: actorIds })
      emailById = new Map(users.map((u: any) => [u.id, u.email]))
    } catch {}
  }

  res.json({
    slug,
    audit_log: logs.map((l: any) => ({
      id: l.id,
      action: l.action,
      changed_fields: l.changed_fields,
      notes: l.notes,
      actor_id: l.actor_id,
      actor_email: l.actor_id ? emailById.get(l.actor_id) || null : null,
      created_at: l.created_at,
    })),
    count: logs.length,
  })
}
