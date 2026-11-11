import { model } from "@medusajs/framework/utils"

const BlogPost = model.define("blog_post", {
  id: model.id().primaryKey(),
  title: model.text(),
  handle: model.text().unique(),
  content: model.text(),
  excerpt: model.text().nullable(),
  featured_image: model.text().nullable(),
  author: model.text().nullable(),
  published_at: model.dateTime().nullable(),
  is_published: model.boolean().default(false),
  seo_title: model.text().nullable(),
  seo_description: model.text().nullable(),
  tags: model.array().default([]),
  category: model.text().nullable(),
})

export default BlogPost
