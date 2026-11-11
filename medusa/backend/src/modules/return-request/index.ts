import ReturnRequestModuleService from "./services/return-request"
import { Module } from "@medusajs/framework/utils"

export const RETURN_REQUEST_MODULE = "return_request"

export default Module(RETURN_REQUEST_MODULE, {
  service: ReturnRequestModuleService,
})
