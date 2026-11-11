import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Redirections for 404 URLs reported in Google Search Console.
 * Path-based only — query-string-based URLs are handled in .htaccess.
 */
export default async function seedRedirectsGsc({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const redirects: Array<{ source: string; target: string; note?: string }> = [
    // Store locator (doesn't exist anymore - affiliate model)
    { source: "/magasins", target: "/contact", note: "GSC 404 — ancien store locator PS" },

    // Old casque anti-bruit product page (no longer stocked)
    { source: "/casque-anti-bruit-bebe/22-41-casque-anti-bruit-bebe-bunny.html", target: "/collections/casque-anti-bruit-bebe", note: "GSC 404 — ancienne fiche produit PS" },
    { source: "/casque-anti-bruit-bebe/22-casque-anti-bruit-bebe-bunny.html", target: "/collections/casque-anti-bruit-bebe", note: "GSC 404 — ancienne fiche produit PS" },
    { source: "/casque-anti-bruit-bebe/casque-anti-bruit-bebe-bunny", target: "/collections/casque-anti-bruit-bebe", note: "GSC 404 — ancienne fiche produit PS" },

    // Old attache-tetine product
    { source: "/attache-tetine/105-140-attache-tetine-avec-bouton.html", target: "/collections/attache-tetine", note: "GSC 404 — ancienne fiche produit PS" },

    // Old PS CMS content pages
    { source: "/content/10-protection-auditive-pour-bebe", target: "/collections/casque-anti-bruit-bebe", note: "GSC 404 — ancien CMS PS" },
    { source: "/content/choisir-son-coquillage-d-allaitement", target: "/blog/qu-est-ce-qu-une-coquille-d-allaitement", note: "GSC 404 — ancien CMS PS" },
    { source: "/content/13-choisir-son-coquillage-d-allaitement", target: "/blog/qu-est-ce-qu-une-coquille-d-allaitement", note: "GSC 404 — ancien CMS PS" },

    // Old category redirect
    { source: "/alimentation-grossesse", target: "/blog/les-aliments-interdits-pendant-l-allaitement", note: "GSC 404 — ancienne categorie PS" },

    // Module pages (PS AJAX) — redirect to homepage
    { source: "/module/cdc_googletagmanager/async", target: "/", note: "GSC 404 — module PS orphelin" },
  ]

  let added = 0
  let skipped = 0
  for (const r of redirects) {
    const exists = await pg.raw(`SELECT id FROM redirect WHERE source = '${r.source.replace(/'/g, "''")}' AND deleted_at IS NULL`)
    if (exists.rows?.length > 0) {
      skipped++
      continue
    }
    const id = `red_${Math.random().toString(36).substring(2, 14)}${Date.now().toString(36)}`
    await pg.raw(
      `INSERT INTO redirect (id, source, target, status_code, is_active, hit_count, note, created_at, updated_at)
       VALUES (?, ?, ?, 301, true, 0, ?, NOW(), NOW())`,
      [id, r.source, r.target, r.note || ""]
    )
    added++
    logger.info(`  + ${r.source} → ${r.target}`)
  }

  logger.info(`Done! +${added} added, ${skipped} already existed`)
}
