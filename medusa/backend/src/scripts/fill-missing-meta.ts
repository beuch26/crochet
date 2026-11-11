import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function fillMissingMeta({ container }: ExecArgs) {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  console.log("Filling missing meta descriptions...")

  // 1. Fix 2 blog posts without seo_description
  await pg.raw(`
    UPDATE blog_post SET seo_description = 'Guide complet sur les probiotiques pour enfant : bienfaits pour la flore intestinale, quand les donner et comment les choisir pour renforcer l immunite de votre enfant.'
    WHERE handle = 'probiotique-enfant' AND (seo_description IS NULL OR seo_description = '')
  `)
  await pg.raw(`
    UPDATE blog_post SET seo_description = 'Decouvrez nos astuces pratiques pour s organiser au quotidien avec des jumeaux : routine, repas, sommeil et vie de famille simplifiee.'
    WHERE handle = 'jumeaux-nos-astuces-pour-sorganiser-au-quotidien' AND (seo_description IS NULL OR seo_description = '')
  `)
  console.log("  Blog: 2 seo_descriptions ajoutees")

  // 2. Generate meta_description for all products that don't have one
  // Use: collection name + product title + "livraison rapide"
  const products = await pg.raw(`
    SELECT p.id, p.title, p.handle, pc.title as collection_title
    FROM product p
    LEFT JOIN product_collection pc ON pc.id = p.collection_id
    WHERE p.deleted_at IS NULL
    AND (p.metadata IS NULL OR p.metadata->>'meta_description' IS NULL OR p.metadata->>'meta_description' = '')
  `)
  const rows = products.rows || products[0]
  console.log(`  Products sans meta_description: ${rows.length}`)

  let updated = 0
  for (const p of rows) {
    const colName = p.collection_title || ''
    // Generate a relevant meta description from title + collection
    const desc = `${p.title}${colName ? ' — ' + colName : ''}. Livraison rapide en France. Retours gratuits 30 jours. Paiement securise.`
    const truncated = desc.length > 155 ? desc.substring(0, desc.lastIndexOf(' ', 152)) + '...' : desc

    const escaped = truncated.replace(/'/g, "''")
    try {
      await pg.raw(`
        UPDATE product
        SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('meta_description', '${escaped}')
        WHERE id = '${p.id}'
      `)
      updated++
    } catch (e: any) {
      console.error(`  x ${p.handle}: ${e.message}`)
    }
  }
  console.log(`  Products: ${updated} meta_descriptions generees`)

  console.log("Done!")
}
