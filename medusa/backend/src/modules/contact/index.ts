import ContactModuleService from "./services/contact"
import { Module } from "@medusajs/framework/utils"

export const CONTACT_MODULE = "contact"

export default Module(CONTACT_MODULE, {
  service: ContactModuleService,
})
