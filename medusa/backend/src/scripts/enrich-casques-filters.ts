import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Enrich casque-anti-bruit products with filter metadata:
 *   - brand: marque (Alpine, Kidywolf, etc.)
 *   - age_range: "bebe" (0-3ans) / "enfant" (3-10ans) / "grand-enfant" (10+ ans) / "evolutif" (0-10+)
 *   - attenuation_db: number (23, 25, 27, 29)
 *   - usage_tags: array of usage keywords (concert, avion, sommeil, tdah, ecole)
 */
export default async function enrichCasquesFilters({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const enrichments: Record<string, {
    brand: string
    age_range: string // "bebe" | "enfant" | "grand-enfant" | "evolutif"
    attenuation_db: number
    usage_tags: string[]
  }> = {
    "alpine-baby-muffy-casque": { brand: "Alpine", age_range: "bebe", attenuation_db: 23, usage_tags: ["concert", "avion", "feu-artifice", "mariage"] },
    "schallwerk-casque-anti-bruit": { brand: "Schallwerk", age_range: "bebe", attenuation_db: 25, usage_tags: ["concert", "feu-artifice"] },
    "alpine-muffy-casque-anti-bruit": { brand: "Alpine", age_range: "grand-enfant", attenuation_db: 25, usage_tags: ["concert", "avion", "feu-artifice", "sport"] },
    "schallwerk-reg-kiddies-ndash-ca": { brand: "Schallwerk", age_range: "enfant", attenuation_db: 25, usage_tags: ["concert", "feu-artifice", "sport"] },
    "minutie-fabrique-casque-anti-bruit": { brand: "Minutie Fabrique", age_range: "bebe", attenuation_db: 23, usage_tags: ["concert", "feu-artifice"] },
    "reer-silentguard-baby-casque-anti-bruit": { brand: "Reer", age_range: "bebe", attenuation_db: 23, usage_tags: ["concert", "feu-artifice"] },
    "casque-anti-bruit-bebe-bbtkcare": { brand: "BBTKCARE", age_range: "bebe", attenuation_db: 25, usage_tags: ["concert", "feu-artifice"] },
    "casque-antibruit-alecto-educatif-29db": { brand: "Alecto", age_range: "enfant", attenuation_db: 29, usage_tags: ["ecole", "tdah", "autisme", "concentration"] },
    "casque-antibruit-alecto-bebes": { brand: "Alecto", age_range: "bebe", attenuation_db: 23, usage_tags: ["concert", "feu-artifice", "irm"] },
    "casque-antibruit-alpine-muffy-baby-menthe": { brand: "Alpine", age_range: "bebe", attenuation_db: 23, usage_tags: ["concert", "avion", "feu-artifice", "mariage"] },
    "casque-antibruit-alpine-muffy-kids": { brand: "Alpine", age_range: "grand-enfant", attenuation_db: 25, usage_tags: ["concert", "avion", "feu-artifice", "sport", "tdah"] },
    "casque-antibruit-dooky-evolutif-2-en-1": { brand: "Dooky", age_range: "evolutif", attenuation_db: 27, usage_tags: ["concert", "feu-artifice", "mariage"] },
    "casque-antibruit-dooky-protection-bebe": { brand: "Dooky", age_range: "bebe", attenuation_db: 25, usage_tags: ["concert", "feu-artifice"] },
    "casque-antibruit-kidynoise-kidywolf": { brand: "Kidywolf", age_range: "enfant", attenuation_db: 25, usage_tags: ["concert", "avion", "ecole", "tdah"] },
    "peltor-casque-anti-bruit": { brand: "Peltor", age_range: "enfant", attenuation_db: 27, usage_tags: ["sport", "concert", "feu-artifice"] },
    "casque-antibruit-alpine-muffy-baby": { brand: "Alpine", age_range: "bebe", attenuation_db: 23, usage_tags: ["concert", "avion", "feu-artifice", "mariage"] },
    "wassilla-casque-anti-bruit-bebe": { brand: "Wassilla", age_range: "bebe", attenuation_db: 23, usage_tags: ["concert", "feu-artifice"] },
  }

  let updated = 0
  for (const [handle, data] of Object.entries(enrichments)) {
    const res = await pg.raw(
      `UPDATE product SET metadata = COALESCE(metadata, '{}'::jsonb)
          || jsonb_build_object('brand', ?::text)
          || jsonb_build_object('age_range', ?::text)
          || jsonb_build_object('attenuation_db', ?::int)
          || jsonb_build_object('usage_tags', ?::jsonb)
       WHERE handle = ? AND deleted_at IS NULL`,
      [data.brand, data.age_range, data.attenuation_db, JSON.stringify(data.usage_tags), handle]
    )
    if (res.rowCount && res.rowCount > 0) {
      logger.info(`  + ${handle}: ${data.brand} / ${data.age_range} / ${data.attenuation_db}dB`)
      updated++
    } else {
      logger.warn(`  = ${handle}: not found`)
    }
  }

  // Configure filters on the collection
  const filters = ["price", "brand", "age_range", "attenuation_db", "usage_tags"]
  await pg.raw(
    `UPDATE product_collection
     SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('filters', ?::text)
     WHERE handle = 'casque-anti-bruit-bebe'`,
    [JSON.stringify(filters)]
  )
  logger.info(`  + Collection filters configured: ${filters.join(", ")}`)

  logger.info(`Done! ${updated} products enriched`)
}
