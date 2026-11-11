import ReviewModuleService from "./services/review"
import { Module } from "@medusajs/framework/utils"

export const REVIEW_MODULE = "review"

export default Module(REVIEW_MODULE, {
  service: ReviewModuleService,
})
