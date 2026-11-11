import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Add internal links to Vertbaudet affiliate product descriptions for SEO.
 * Links: collection page, parent categories, cross-sell to other products.
 */
export default async function addInternalLinks({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const patches: Record<string, Array<{ from: string; to: string }>> = {
    "casque-antibruit-alpine-muffy-baby": [
      {
        from: "le casque antibruit Alpine Muffy Baby",
        to: `le <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline">casque antibruit</a> Alpine Muffy Baby`,
      },
      {
        from: "votre bébé jusqu'à 3 ans",
        to: `votre <a href="/collections/bebe" class="text-primary hover:underline">bébé</a> jusqu'à 3 ans`,
      },
      {
        from: "Un casque antibruit bébé est indispensable",
        to: `Un <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline">casque antibruit bébé</a> est indispensable`,
      },
      {
        from: "spécialement conçu pour la tête fragile des nourrissons.",
        to: `spécialement conçu pour la tête fragile des nourrissons. Pour les enfants plus grands, découvrez plutôt le <a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline">Kidynoise de Kidywolf</a> adapté dès 4 ans.`,
      },
    ],
    "casque-antibruit-kidynoise-kidywolf": [
      {
        from: "offre une protection auditive efficace",
        to: `offre une <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline">protection auditive</a> efficace`,
      },
      {
        from: "voyages en avion)",
        to: `voyages en avion) — autant d'environnements où les <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline">casques anti-bruit</a> sont indispensables`,
      },
      {
        from: "Le Muffy Baby est conçu pour les tout-petits (0-3 ans)",
        to: `Le <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Muffy Baby d'Alpine</a> est conçu pour les tout-petits (0-3 ans)`,
      },
      {
        from: "salles de classe bruyantes ou environnement surcharge sensoriellement",
        to: `salles de classe bruyantes ou environnement surchargé sensoriellement`,
      },
    ],
  }

  for (const [handle, replacements] of Object.entries(patches)) {
    const res = await pg.raw(`SELECT description FROM product WHERE handle = '${handle}' AND deleted_at IS NULL`)
    let desc = res.rows?.[0]?.description
    if (!desc) { logger.warn(`Product not found: ${handle}`); continue }

    let changes = 0
    for (const { from, to } of replacements) {
      if (desc.includes(from)) {
        desc = desc.replace(from, to)
        changes++
      } else {
        logger.warn(`  - Pattern not found in ${handle}: "${from.slice(0, 60)}..."`)
      }
    }

    if (changes > 0) {
      const escaped = desc.replace(/'/g, "''")
      await pg.raw(`UPDATE product SET description = '${escaped}' WHERE handle = '${handle}'`)
      logger.info(`  + ${handle}: ${changes} internal links added`)
    }
  }

  logger.info("Done!")
}
