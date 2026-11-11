import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Enrich vetements products with filter-ready metadata (brand) and
 * configure filters on each sub-collection.
 */
export default async function enrichVetementsFilters({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  // 1. Copy affiliate_brand -> brand for all vetements products (so filter picks it up)
  const vetementsHandles = [
    "robe-allaitement", "tunique-allaitement", "pyjama-allaitement",
    "pull-allaitement", "t-shirt-allaitement", "salopette-allaitement",
    "maillot-bain-allaitement", "pantalon-allaitement", "vetements-allaitement",
  ]

  const res = await pg.raw(
    `UPDATE product
     SET metadata = metadata || jsonb_build_object('brand', metadata->>'affiliate_brand')
     WHERE handle LIKE 'vb-%'
       AND deleted_at IS NULL
       AND metadata->>'affiliate_brand' IS NOT NULL
       AND (metadata->>'brand' IS NULL OR metadata->>'brand' != metadata->>'affiliate_brand')`
  )
  logger.info(`  + ${res.rowCount ?? 0} products got brand metadata`)

  // 2. Configure filters per collection
  const filtersPerCollection: Record<string, string[]> = {
    "vetements-allaitement": ["price", "brand", "Couleur", "Taille"],
    "robe-allaitement": ["price", "brand", "Couleur", "Taille"],
    "tunique-allaitement": ["price", "brand", "Couleur", "Taille"],
    "pyjama-allaitement": ["price", "brand", "Couleur", "Taille"],
    "pull-allaitement": ["price", "brand", "Couleur", "Taille"],
    "t-shirt-allaitement": ["price", "brand", "Couleur", "Taille"],
    "salopette-allaitement": ["price", "brand", "Couleur", "Taille"],
    "maillot-bain-allaitement": ["price", "brand", "Couleur", "Taille"],
    "pantalon-allaitement": ["price", "brand", "Couleur", "Taille"],
  }

  for (const [handle, filters] of Object.entries(filtersPerCollection)) {
    await pg.raw(
      `UPDATE product_collection
       SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('filters', ?::text)
       WHERE handle = ? AND deleted_at IS NULL`,
      [JSON.stringify(filters), handle]
    )
    logger.info(`  + ${handle}: filters = ${filters.join(", ")}`)
  }

  logger.info("Done!")
}
