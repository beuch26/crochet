import { model } from "@medusajs/framework/utils"

/**
 * Third-party integration configuration.
 *
 *   - `slug` is the stable key used by the application (e.g. "brevo")
 *   - `config_public` holds non-secret values (measurement_id, from email…)
 *   - `config_encrypted` holds the AES-256-GCM ciphertext of a JSON blob
 *     of secrets — never returned through the admin/store API in clear.
 */
const Integration = model.define("integration", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  name: model.text(),
  category: model.text(),
  description: model.text().nullable(),
  logo_path: model.text().nullable(),
  enabled: model.boolean().default(false),
  config_public: model.json().default({}),
  config_encrypted: model.text().nullable(),
  health_status: model.enum(["ok", "error", "unknown"]).default("unknown"),
  health_message: model.text().nullable(),
  last_health_check_at: model.dateTime().nullable(),
  last_used_at: model.dateTime().nullable(),
  connected_at: model.dateTime().nullable(),
  rotated_at: model.dateTime().nullable(),
  expires_at: model.dateTime().nullable(),
})

export default Integration
