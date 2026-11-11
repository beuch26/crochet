import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Append "Vous aimerez aussi" paragraph with internal links at end of description
 * and replace remaining unlinked keywords.
 */
export default async function addInternalLinksV2({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const CROSS_LINK_MUFFY = `
<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>À noter :</strong> le Muffy Baby est adapté aux tout-petits jusqu'à 3 ans. Si votre enfant a plus de 4 ans, nous recommandons plutôt le <a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline font-medium">casque antibruit Kidynoise de Kidywolf</a>, pliable et reglable. Voir aussi tous nos <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casques anti-bruit bebe</a>.</p>
</div>`

  const CROSS_LINK_KIDYNOISE = `
<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>À noter :</strong> le Kidynoise est conçu pour les enfants dès 4 ans. Pour un bébé de moins de 3 ans, préférez le <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">casque Muffy Baby d'Alpine</a> avec son bandeau doux sans pression sur la fontanelle. Découvrez notre <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">sélection complète de casques anti-bruit</a>.</p>
</div>`

  const patches: Record<string, { append?: string; replace?: Array<{ from: string; to: string }> }> = {
    "casque-antibruit-alpine-muffy-baby": {
      append: CROSS_LINK_MUFFY,
    },
    "casque-antibruit-kidynoise-kidywolf": {
      replace: [
        {
          from: "trajets en avion) tout en restant compact",
          to: `trajets en avion) tout en restant compact`,
        },
        {
          from: "A partir de 4 ans, les enfants commencent",
          to: `A partir de 4 ans, les <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline">enfants</a> commencent`,
        },
      ],
      append: CROSS_LINK_KIDYNOISE,
    },
  }

  for (const [handle, { append, replace }] of Object.entries(patches)) {
    const res = await pg.raw(`SELECT description FROM product WHERE handle = '${handle}' AND deleted_at IS NULL`)
    let desc = res.rows?.[0]?.description
    if (!desc) continue

    let changes = 0
    if (replace) {
      for (const { from, to } of replace) {
        if (desc.includes(from)) {
          desc = desc.replace(from, to)
          changes++
        }
      }
    }

    // Only append if not already present
    if (append && !desc.includes("À noter :")) {
      desc = desc + append
      changes++
    }

    if (changes > 0) {
      const escaped = desc.replace(/'/g, "''")
      await pg.raw(`UPDATE product SET description = '${escaped}' WHERE handle = '${handle}'`)
      logger.info(`  + ${handle}: ${changes} updates`)
    } else {
      logger.info(`  = ${handle}: no changes`)
    }
  }

  logger.info("Done!")
}
