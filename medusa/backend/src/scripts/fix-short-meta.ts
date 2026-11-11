import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function fixShortMeta({ container }: ExecArgs) {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  // Fix CMS pages
  await pg.raw(`
    UPDATE page SET seo_description = 'Decouvrez Magic Crochet Kit, boutique en ligne specialisee pour les mamans et bebes. Nos produits soigneusement selectionnes accompagnent chaque etape de la maternite.'
    WHERE handle = 'a-propos'
  `)
  console.log("Fixed: a-propos")

  await pg.raw(`
    UPDATE page SET seo_description = 'Consultez les conditions generales de vente de Magic Crochet Kit.fr. Informations sur les commandes, livraisons, retours et garanties. TN GROUP SASU, Paris.'
    WHERE handle = 'cgv'
  `)
  console.log("Fixed: cgv")

  // Fix collections metadata
  await pg.raw(`
    UPDATE product_collection
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'),
      '{meta_description}',
      '"Decouvrez notre selection de produits pour maman : soins grossesse, allaitement, tire-lait, coussinets et bien plus. Livraison rapide et retours gratuits."'
    )
    WHERE handle = 'pour-maman'
  `)
  console.log("Fixed: pour-maman collection")

  await pg.raw(`
    UPDATE product_collection
    SET metadata = jsonb_set(
      COALESCE(metadata, '{}'),
      '{meta_description}',
      '"Tout pour votre bebe : casques anti-bruit, tresses de lit, vaisselle, biberons, trousses de soin et attache-tetines. Qualite et securite garanties."'
    )
    WHERE handle = 'bebe'
  `)
  console.log("Fixed: bebe collection")

  console.log("Done!")
}
