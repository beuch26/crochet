import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Replace generic/weak internal link anchors with keyword-rich anchors
 * based on Keyword Shitter data (targeted user queries).
 *
 * SEO rule: anchor text should match what users type in Google,
 * not filler words like "casque classique" or "modele".
 */
export default async function fixInternalLinkAnchors({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  // Generic anchors -> keyword-rich anchors
  const anchorReplacements: Array<{ from: string; to: string }> = [
    // To collection (casque-anti-bruit-bebe)
    {
      from: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline">casques anti-bruit</a>',
      to: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline">casque anti-bruit bebe</a>',
    },
    {
      from: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casques anti-bruit bebe</a>',
      to: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casques anti-bruit bebe</a>',
    },
    {
      from: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casques antibruit bebe</a>',
      to: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casques anti-bruit bebe</a>',
    },
    {
      from: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">selection complete de casques anti-bruit</a>',
      to: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">comparatif complet des casques anti-bruit bebe</a>',
    },
    {
      from: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">selection de casques anti-bruit</a>',
      to: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">meilleurs casques anti-bruit bebe</a>',
    },
    {
      from: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">selection de casques antibruit</a>',
      to: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">comparatif casques anti-bruit bebe</a>',
    },
    {
      from: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">selection complete de casques antibruit bebe</a>',
      to: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">comparatif casques anti-bruit bebe</a>',
    },

    // To parent category /bebe
    {
      from: '<a href="/collections/bebe" class="text-primary hover:underline">bebe</a>',
      to: '<a href="/collections/bebe" class="text-primary hover:underline">tout pour bebe</a>',
    },

    // Weak anchor "casque classique" -> keyword-rich
    {
      from: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casque classique</a>',
      to: '<a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casque anti-bruit bebe</a>',
    },

    // Cross-links between products — use full keyword names
    {
      from: '<a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline">Kidynoise de Kidywolf</a>',
      to: '<a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline">casque anti-bruit enfant Kidynoise</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline font-medium">casque antibruit Kidynoise de Kidywolf</a>',
      to: '<a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline font-medium">casque anti-bruit enfant Kidywolf Kidynoise</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline">Kidynoise de Kidywolf</a>',
      to: '<a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline">casque anti-bruit Kidywolf Kidynoise</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline font-medium">Kidynoise de Kidywolf</a>',
      to: '<a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline font-medium">casque anti-bruit Kidywolf Kidynoise</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Muffy Baby d\'Alpine</a>',
      to: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">casque anti-bruit bebe Alpine Muffy</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">casque Muffy Baby d\'Alpine</a>',
      to: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">casque anti-bruit bebe Alpine Muffy</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Muffy Baby</a>',
      to: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">casque bebe Muffy Baby Alpine</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">Muffy Baby classique</a>',
      to: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">casque anti-bruit Alpine Muffy Baby</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">Muffy Baby Alpine</a>',
      to: '<a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">casque anti-bruit bebe Alpine Muffy Baby</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-alpine-muffy-kids" class="text-primary hover:underline">Muffy Kids</a>',
      to: '<a href="/products/casque-antibruit-alpine-muffy-kids" class="text-primary hover:underline">casque anti-bruit enfant Alpine Muffy Kids</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-alpine-muffy-kids" class="text-primary hover:underline font-medium">Muffy Kids</a>',
      to: '<a href="/products/casque-antibruit-alpine-muffy-kids" class="text-primary hover:underline font-medium">Alpine Muffy Kids (5-16 ans)</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-dooky-evolutif-2-en-1" class="text-primary hover:underline font-medium">Dooky Evolutif 2-en-1</a>',
      to: '<a href="/products/casque-antibruit-dooky-evolutif-2-en-1" class="text-primary hover:underline font-medium">casque anti-bruit bebe evolutif Dooky</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-dooky-evolutif-2-en-1" class="text-primary hover:underline">Dooky Evolutif 2-en-1</a>',
      to: '<a href="/products/casque-antibruit-dooky-evolutif-2-en-1" class="text-primary hover:underline">casque anti-bruit evolutif Dooky 2-en-1</a>',
    },
    {
      from: '<a href="/products/casque-antibruit-alecto-educatif-29db" class="text-primary hover:underline">Alecto Educatif</a>',
      to: '<a href="/products/casque-antibruit-alecto-educatif-29db" class="text-primary hover:underline">casque anti-bruit enfant TDAH Alecto 29 dB</a>',
    },

    // Brand pages
    {
      from: '<a href="/marques/alpine" class="text-primary hover:underline font-medium">Alpine</a>',
      to: '<a href="/marques/alpine" class="text-primary hover:underline font-medium">gamme Alpine casques anti-bruit</a>',
    },
  ]

  // Get all affiliate products
  const products = await pg.raw(`
    SELECT id, handle, description FROM product
    WHERE metadata->>'affiliate_source' = 'vertbaudet' AND deleted_at IS NULL
  `)

  let totalChanges = 0
  for (const p of products.rows || []) {
    let desc = p.description || ""
    let changes = 0
    for (const { from, to } of anchorReplacements) {
      if (from === to || !desc.includes(from)) continue
      const before = desc
      desc = desc.split(from).join(to)
      if (desc !== before) changes++
    }
    if (changes > 0) {
      const escaped = desc.replace(/'/g, "''")
      await pg.raw(`UPDATE product SET description = '${escaped}' WHERE id = '${p.id}'`)
      logger.info(`  + ${p.handle}: ${changes} anchors improved`)
      totalChanges += changes
    }
  }

  logger.info(`Done! ${totalChanges} total anchor improvements across ${products.rows.length} products`)
}
