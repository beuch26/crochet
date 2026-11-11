import GiftCardModuleService from "./services/gift-card"
import { Module } from "@medusajs/framework/utils"

export const GIFT_CARD_MODULE = "gift_card"

export default Module(GIFT_CARD_MODULE, {
  service: GiftCardModuleService,
})
