import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { THEME_MODULE } from "../../../modules/theme"

// Groups that should NEVER be exposed to the public store API
const PRIVATE_GROUPS = ["payment", "medusa", "fulfillment"]
// Keys that contain sensitive data (tracking IDs like GA4/GTM/Pixel are public by nature)
const SENSITIVE_KEY_PATTERNS = ["stripe", "secret", "api_key", "packlink"]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const themeService = req.scope.resolve(THEME_MODULE)
  const settings = await themeService.listThemeSettings({})

  // Filter out sensitive settings
  const safeSettings = settings.filter((s: any) => {
    if (PRIVATE_GROUPS.includes(s.group)) return false
    if (SENSITIVE_KEY_PATTERNS.some((p) => s.key.toLowerCase().includes(p))) return false
    return true
  })

  // Return as key-value map grouped by section
  const grouped: Record<string, Record<string, any>> = {}
  for (const s of safeSettings) {
    if (!grouped[s.group]) grouped[s.group] = {}
    let val: any = s.value
    if (s.type === "boolean") val = s.value === "true"
    if (s.type === "number") val = Number(s.value)
    grouped[s.group][s.key] = val
  }

  res.json({ settings: grouped })
}
