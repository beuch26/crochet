import PageModuleService from "./services/page"
import { Module } from "@medusajs/framework/utils"

export const PAGE_MODULE = "page"

export default Module(PAGE_MODULE, {
  service: PageModuleService,
})
