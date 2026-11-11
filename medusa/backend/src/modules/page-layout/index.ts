import PageLayoutModuleService from "./services/page-layout"
import { Module } from "@medusajs/framework/utils"

export const PAGE_LAYOUT_MODULE = "page_layout"

export default Module(PAGE_LAYOUT_MODULE, {
  service: PageLayoutModuleService,
})
