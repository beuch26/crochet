import IntegrationModuleService from "./services/integration"
import { Module } from "@medusajs/framework/utils"

export const INTEGRATION_MODULE = "integration"

export default Module(INTEGRATION_MODULE, {
  service: IntegrationModuleService,
})
