import { model } from "@medusajs/framework/utils"

const Redirect = model.define("redirect", {
  id: model.id().primaryKey(),
  source: model.text(),            // old URL path, e.g. "/fr/123-casque-anti-bruit.html"
  target: model.text(),            // new URL path, e.g. "/collections/casque-anti-bruit-bebe"
  status_code: model.number().default(301),  // 301 (permanent) or 302 (temporary)
  is_active: model.boolean().default(true),
  hit_count: model.number().default(0),      // how many times this redirect was used
  last_hit_at: model.dateTime().nullable(),
  note: model.text().nullable(),             // admin note (e.g. "PrestaShop migration")
})

export default Redirect
