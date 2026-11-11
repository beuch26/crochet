import RedirectModuleService from "./services/redirect"
import { Module } from "@medusajs/framework/utils"

export const REDIRECT_MODULE = "redirect"

export default Module(REDIRECT_MODULE, {
  service: RedirectModuleService,
})
