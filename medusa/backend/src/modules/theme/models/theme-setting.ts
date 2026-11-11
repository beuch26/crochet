import { model } from "@medusajs/framework/utils"

const ThemeSetting = model.define("theme_setting", {
  id: model.id().primaryKey(),
  key: model.text().unique(),
  value: model.text(),
  type: model.enum(["text", "color", "image", "textarea", "boolean", "number"]).default("text"),
  group: model.text().default("general"),
  label: model.text(),
  description: model.text().nullable(),
  sort_order: model.number().default(0),
})

export default ThemeSetting
