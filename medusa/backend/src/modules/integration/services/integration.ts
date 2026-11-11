import { MedusaService } from "@medusajs/framework/utils"
import Integration from "../models/integration"
import IntegrationAuditLog from "../models/integration-audit-log"
import { decryptJson, encryptJson } from "../../../lib/integration-crypto"
import { findIntegration } from "../catalog"

type DecryptedConfig = {
  /** Non-secret values stored in clear in DB. Safe to return through API. */
  public: Record<string, unknown>
  /** Secret values from the encrypted blob — caller is responsible for not leaking them. */
  secret: Record<string, unknown>
}

class IntegrationModuleService extends MedusaService({
  Integration,
  IntegrationAuditLog,
}) {
  /**
   * Fetch the integration row and decrypt the secret blob.
   * Returns null if the row doesn't exist (callers can then fallback to env).
   */
  async getDecryptedConfig(slug: string): Promise<DecryptedConfig | null> {
    const rows = await this.listIntegrations({ slug })
    const row = rows[0]
    if (!row) return null

    const publicConfig = (row.config_public || {}) as Record<string, unknown>
    let secretConfig: Record<string, unknown> = {}
    if (row.config_encrypted) {
      try {
        secretConfig = decryptJson<Record<string, unknown>>(row.config_encrypted)
      } catch (e: any) {
        // Don't blow up the whole request if decryption fails (wrong key,
        // corrupted blob). Caller will treat as missing secrets.
        // eslint-disable-next-line no-console
        console.error(`[integration] decrypt failed for slug=${slug}: ${e?.message || e}`)
      }
    }
    return { public: publicConfig, secret: secretConfig }
  }

  /**
   * Partial upsert. Merges the new public/secret values into existing ones
   * (so the caller can PATCH just one field). Emits no event itself — the
   * route does that so the actor_id is correctly captured.
   *
   * Returns the names of fields that actually changed (for audit log).
   */
  async setConfig(
    slug: string,
    input: { public?: Record<string, unknown>; secret?: Record<string, unknown> },
  ): Promise<{ row: any; changedFields: string[] }> {
    const def = findIntegration(slug)
    if (!def) throw new Error(`Unknown integration slug: ${slug}`)

    const rows = await this.listIntegrations({ slug })
    const existing = rows[0]

    const prevPublic = (existing?.config_public || {}) as Record<string, unknown>
    const prevSecret: Record<string, unknown> = existing?.config_encrypted
      ? safeDecrypt(existing.config_encrypted)
      : {}

    const nextPublic = { ...prevPublic, ...(input.public || {}) }
    const nextSecret = { ...prevSecret, ...(input.secret || {}) }

    const changedFields: string[] = []
    for (const k of Object.keys(input.public || {})) {
      if (prevPublic[k] !== nextPublic[k]) changedFields.push(`public.${k}`)
    }
    for (const k of Object.keys(input.secret || {})) {
      if (prevSecret[k] !== nextSecret[k]) changedFields.push(`secret.${k}`)
    }

    const encryptedBlob = Object.keys(nextSecret).length > 0 ? encryptJson(nextSecret) : null

    let row: any
    if (existing) {
      row = await this.updateIntegrations({
        id: existing.id,
        config_public: nextPublic,
        config_encrypted: encryptedBlob,
        rotated_at: changedFields.some((f) => f.startsWith("secret.")) ? new Date() : existing.rotated_at,
      })
    } else {
      row = await this.createIntegrations({
        slug: def.slug,
        name: def.name,
        category: def.category,
        description: def.description,
        logo_path: def.logo_path,
        enabled: false,
        config_public: nextPublic,
        config_encrypted: encryptedBlob,
      })
    }

    return { row, changedFields }
  }

  async recordAudit(input: {
    integration_id: string
    actor_id?: string | null
    action: "created" | "updated" | "rotated" | "tested" | "enabled" | "disabled" | "deleted"
    changed_fields?: string[]
    notes?: string
  }): Promise<void> {
    await this.createIntegrationAuditLogs({
      integration_id: input.integration_id,
      actor_id: input.actor_id ?? null,
      action: input.action,
      changed_fields: input.changed_fields || [],
      notes: input.notes ?? null,
    })
  }

  async markHealth(
    slug: string,
    status: "ok" | "error" | "unknown",
    message?: string | null,
  ): Promise<void> {
    const rows = await this.listIntegrations({ slug })
    if (!rows[0]) return
    await this.updateIntegrations({
      id: rows[0].id,
      health_status: status,
      health_message: message ?? null,
      last_health_check_at: new Date(),
    })
  }

  async setEnabled(slug: string, enabled: boolean): Promise<any> {
    const rows = await this.listIntegrations({ slug })
    if (!rows[0]) throw new Error(`Integration not found: ${slug}`)
    return await this.updateIntegrations({
      id: rows[0].id,
      enabled,
      connected_at: enabled && !rows[0].connected_at ? new Date() : rows[0].connected_at,
    })
  }
}

function safeDecrypt(blob: string): Record<string, unknown> {
  try {
    return decryptJson<Record<string, unknown>>(blob)
  } catch {
    return {}
  }
}

export default IntegrationModuleService
