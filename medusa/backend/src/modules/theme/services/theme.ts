import { MedusaService } from "@medusajs/framework/utils"
import ThemeSetting from "../models/theme-setting"

class ThemeModuleService extends MedusaService({
  ThemeSetting,
}) {}

export default ThemeModuleService
