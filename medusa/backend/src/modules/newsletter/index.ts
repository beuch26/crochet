import NewsletterModuleService from "./services/newsletter"
import { Module } from "@medusajs/framework/utils"

export const NEWSLETTER_MODULE = "newsletter"

export default Module(NEWSLETTER_MODULE, {
  service: NewsletterModuleService,
})
