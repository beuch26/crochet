/**
 * Runtime helper to read an integration's merged (public + secret) config.
 *
 * Resolution order:
 *   1. In-memory cache keyed by slug, TTL 60s (invalidated by the
 *      `integration.updated` subscriber).
 *   2. DB lookup via the `integration` module's `getDecryptedConfig`.
 *   3. process.env fallback driven by the catalog's env_map_* — keeps
 *      the system working before the seed script has run, OR if the
 *      DB row was deleted by accident.
 *
 * The shape returned merges public and secret into a single flat object
 * for ergonomics at the call site, e.g.
 *   const cfg = await getIntegrationConfig(container, "brevo")
 *   cfg.smtp_user, cfg.smtp_pass, cfg.from_email, ...
 *
 * Callers must already have access to the container (route handlers,
 * subscribers, scheduled jobs all do).
 */

import { INTEGRATION_MODULE } from "../modules/integration"
import { findIntegration } from "../modules/integration/catalog"

type CacheEntry = { config: Record<string, unknown>; fetchedAt: number }

const TTL_MS = 60_000
const cache: Map<string, CacheEntry> = new Map()

export function invalidateCache(slug?: string): void {
  if (slug) cache.delete(slug)
  else cache.clear()
}

export async function getIntegrationConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  container: any,
  slug: string,
): Promise<T> {
  const now = Date.now()
  const cached = cache.get(slug)
  if (cached && now - cached.fetchedAt < TTL_MS) return cached.config as T

  let merged: Record<string, unknown> = {}

  // 1. DB lookup
  try {
    const svc: any = container.resolve(INTEGRATION_MODULE)
    const decrypted = await svc.getDecryptedConfig(slug)
    if (decrypted) {
      merged = { ...(decrypted.public || {}), ...(decrypted.secret || {}) }
    }
  } catch (e: any) {
    // Module not loaded yet, container down, etc. Silently fall through
    // to env-var fallback.
    // eslint-disable-next-line no-console
    console.warn(`[integration-config] DB lookup failed for ${slug}: ${e?.message || e}`)
  }

  // 2. env fallback — fills any keys that are missing from DB
  const def = findIntegration(slug)
  if (def) {
    for (const [envKey, fieldKey] of Object.entries(def.env_map_public)) {
      if (merged[fieldKey] == null && process.env[envKey]) merged[fieldKey] = process.env[envKey]
    }
    for (const [envKey, fieldKey] of Object.entries(def.env_map_secret)) {
      if (merged[fieldKey] == null && process.env[envKey]) merged[fieldKey] = process.env[envKey]
    }
  }

  cache.set(slug, { config: merged, fetchedAt: now })
  return merged as T
}

/**
 * Returns whether at least one secret_field of the integration is
 * populated (DB or env). Useful for "enabled?" auto-detection in the
 * seed script.
 */
export async function isIntegrationConfigured(container: any, slug: string): Promise<boolean> {
  const def = findIntegration(slug)
  if (!def) return false
  if (def.secret_fields.length === 0) {
    // No secrets needed → presence of any public field counts as configured
    const cfg = await getIntegrationConfig(container, slug)
    return def.public_fields.some((f) => cfg[f.key] != null && cfg[f.key] !== "")
  }
  const cfg = await getIntegrationConfig(container, slug)
  return def.secret_fields.some((f) => cfg[f.key] != null && cfg[f.key] !== "")
}
