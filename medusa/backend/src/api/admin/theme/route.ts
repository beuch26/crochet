import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { THEME_MODULE } from "../../../modules/theme"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const themeService = req.scope.resolve(THEME_MODULE)
  const settings = await themeService.listThemeSettings({})
  res.json({ settings, count: settings.length })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const themeService = req.scope.resolve(THEME_MODULE)
  const setting = await themeService.createThemeSettings(req.body as Record<string, unknown>)
  res.json({ setting })
}

// Bulk upsert — update all settings at once
export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const themeService = req.scope.resolve(THEME_MODULE)
  const updates = (req.body as any).settings as { key: string; value: string }[]

  for (const { key, value } of updates) {
    const existing = await themeService.listThemeSettings({ key })
    if (existing.length > 0) {
      await themeService.updateThemeSettings({ id: existing[0].id, value })
    }
  }

  const settings = await themeService.listThemeSettings({})
  res.json({ settings })
}
