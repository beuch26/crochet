import { model } from "@medusajs/framework/utils"

const Page = model.define("page", {
  id: model.id().primaryKey(),
  title: model.text(),
  handle: model.text().unique(),
  content: model.text(),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  is_published: model.boolean().default(true),
})

export default Page
