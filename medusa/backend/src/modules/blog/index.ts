import BlogModuleService from "./services/blog"
import { Module } from "@medusajs/framework/utils"

export const BLOG_MODULE = "blog"

export default Module(BLOG_MODULE, {
  service: BlogModuleService,
})
