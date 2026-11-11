import ThemeModuleService from "./services/theme"
import { Module } from "@medusajs/framework/utils"

export const THEME_MODULE = "theme"

export default Module(THEME_MODULE, {
  service: ThemeModuleService,
})
