import { model } from "@medusajs/framework/utils"

/**
 * One row per non-trivial change on an Integration. Tracks who did
 * what, but NEVER stores secret values (only the names of changed
 * fields — `changed_fields`).
 */
const IntegrationAuditLog = model.define("integration_audit_log", {
  id: model.id().primaryKey(),
  integration_id: model.text(),
  actor_id: model.text().nullable(),
  action: model.enum([
    "created",
    "updated",
    "rotated",
    "tested",
    "enabled",
    "disabled",
    "deleted",
  ]),
  changed_fields: model.array().default([]),
  notes: model.text().nullable(),
})

export default IntegrationAuditLog
