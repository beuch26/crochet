/**
 * One-shot migration: move the keys that used to live in `theme_setting`
 * under groups `fulfillment` / `payment` / `tracking` into the
 * `integration` module, then delete the source rows.
 *
 * Idempotent: re-running after a successful migration is a no-op.
 *
 *   packlink_api_key            → integration.packlink.api_key (secret, encrypted)
 *   packlink_warehouse_country  → integration.packlink.warehouse_country (public)
 *   packlink_warehouse_zip      → integration.packlink.warehouse_zip (public)
 *   tracking_meta_pixel         → integration.meta_pixel.pixel_id (public)
 *   tracking_ga4_id             → DROP (integration.ga4.measurement_id already populated)
 *   tracking_gtm_id             → DROP (integration.gtm.container_id already populated)
 *   payment_provider            → DROP (Stripe is the only provider, encoded in code)
 *   payment_test_mode           → DROP (derived from the Stripe key prefix at runtime)
 *
 * Run: npx medusa exec src/scripts/migrate-theme-to-integrations.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { THEME_MODULE } from "../modules/theme"
import { INTEGRATION_MODULE } from "../modules/integration"
import { findIntegration } from "../modules/integration/catalog"
import { encryptJson } from "../lib/integration-crypto"

const KEYS_TO_DROP = [
  "packlink_api_key",
  "packlink_warehouse_country",
  "packlink_warehouse_zip",
  "payment_provider",
  "payment_test_mode",
  "tracking_ga4_id",
  "tracking_gtm_id",
  "tracking_meta_pixel",
] as const

export default async function migrate({ container }: ExecArgs) {
  const themeService: any = container.resolve(THEME_MODULE)
  const integrationService: any = container.resolve(INTEGRATION_MODULE)

  console.log("\n=== Migrating theme settings → integrations ===\n")

  // ---- 1. Read existing theme values ----
  const all = await themeService.listThemeSettings({ key: KEYS_TO_DROP as unknown as string[] })
  const themeMap: Record<string, string> = {}
  for (const row of all) themeMap[row.key] = row.value || ""

  if (Object.keys(themeMap).length === 0) {
    console.log("  ✓ No source rows found — already migrated.")
    return
  }

  console.log(`  Found ${Object.keys(themeMap).length} theme row(s) to migrate.\n`)

  // ---- 2. Upsert Packlink integration ----
  const packlinkKey = (themeMap["packlink_api_key"] || "").trim()
  const packlinkCountry = (themeMap["packlink_warehouse_country"] || "FR").trim()
  const packlinkZip = (themeMap["packlink_warehouse_zip"] || "").trim()

  if (packlinkKey || packlinkZip) {
    const def = findIntegration("packlink")
    if (!def) {
      console.warn("  ⚠ Packlink not in catalog — skipping.")
    } else {
      const existing = await integrationService.listIntegrations({ slug: "packlink" })
      const config_public = {
        warehouse_country: packlinkCountry,
        warehouse_zip: packlinkZip,
      }
      const config_encrypted = packlinkKey ? encryptJson({ api_key: packlinkKey }) : null

      if (existing.length === 0) {
        await integrationService.createIntegrations({
          slug: def.slug,
          name: def.name,
          category: def.category,
          description: def.description,
          logo_path: def.logo_path,
          enabled: Boolean(packlinkKey),
          config_public,
          config_encrypted,
          connected_at: packlinkKey ? new Date() : null,
        })
        console.log("  ✓ packlink     created")
      } else {
        await integrationService.updateIntegrations({
          id: existing[0].id,
          config_public,
          config_encrypted,
          enabled: Boolean(packlinkKey),
          connected_at: packlinkKey ? existing[0].connected_at || new Date() : existing[0].connected_at,
        })
        console.log("  ✓ packlink     updated")
      }
    }
  }

  // ---- 3. Upsert Meta Pixel integration ----
  const metaPixelId = (themeMap["tracking_meta_pixel"] || "").trim()
  if (metaPixelId) {
    const def = findIntegration("meta_pixel")
    if (def) {
      const existing = await integrationService.listIntegrations({ slug: "meta_pixel" })
      if (existing.length === 0) {
        await integrationService.createIntegrations({
          slug: def.slug,
          name: def.name,
          category: def.category,
          description: def.description,
          logo_path: def.logo_path,
          enabled: true,
          config_public: { pixel_id: metaPixelId },
          connected_at: new Date(),
        })
        console.log("  ✓ meta_pixel   created")
      } else {
        await integrationService.updateIntegrations({
          id: existing[0].id,
          config_public: { ...(existing[0].config_public || {}), pixel_id: metaPixelId },
          enabled: true,
        })
        console.log("  ✓ meta_pixel   updated")
      }
    }
  }

  // ---- 4. Delete migrated theme rows ----
  const ids = all.map((r: any) => r.id)
  if (ids.length > 0) {
    await themeService.deleteThemeSettings(ids)
    console.log(`\n  ✓ Deleted ${ids.length} theme_setting row(s).`)
  }

  console.log("\nDone.\n")
}
