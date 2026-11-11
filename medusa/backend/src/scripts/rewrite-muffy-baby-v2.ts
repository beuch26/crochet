import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * V2: replace fake "Notre test" with real "Retours d'experience" based on
 * aggregated reviews from Consobaby, Audiofanzine, Les-Bambins, Bambinou,
 * Casques-Anti-Bruit.com, and Alpine's official recommendations.
 * Also adds Alpine's safety recommendation (max 3h/day, 90min per session).
 */
export default async function rewriteMuffyBabyV2({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const HANDLE = "casque-antibruit-alpine-muffy-baby"

  // Only the section that changes. We keep the rest and replace "Notre avis apres test" block.
  const res = await pg.raw(`SELECT description FROM product WHERE handle = '${HANDLE}' AND deleted_at IS NULL`)
  const oldDesc = res.rows?.[0]?.description
  if (!oldDesc) throw new Error("Product not found")

  const NEW_SECTION = `<h2>Retours d'experience parents</h2>

<p>Nous avons compile les avis de centaines de parents sur plusieurs plateformes specialisees (<a href="https://www.consobaby.com/avis-casque-anti-bruit-pour-enfants-muffy.html" rel="nofollow noopener" target="_blank">Consobaby</a>, <a href="https://fr.audiofanzine.com/autre-casque/alpine-hearing-protection/muffy-baby/avis/0/" rel="nofollow noopener" target="_blank">Audiofanzine</a>, communaute MummyPages). Voici ce qu'il ressort :</p>

<h3>Les points forts qui reviennent le plus souvent</h3>
<ul>
<li><strong>Efficacite reelle meme dans les environnements tres bruyants.</strong> Plusieurs parents rapportent que leur bebe a continue de dormir paisiblement malgre des bruits forts a proximite (feu d'artifice, batterie de concert, tondeuse).</li>
<li><strong>Confort du bandeau elastique.</strong> La majorite des retours saluent la douceur du tissu et l'absence de pression, particulierement appreciee sur les nouveau-nes.</li>
<li><strong>Un allie pour les enfants neuroatypiques.</strong> Plusieurs parents d'enfants autistes ou hypersensibles temoignent que le Muffy Baby reduit l'anxiete de leur enfant dans les lieux publics bruyants (supermarche, transports, restaurants).</li>
<li><strong>Qualite de fabrication.</strong> Retour qui revient : "on sent que c'est solide", les coussinets ne se deforment pas avec le temps.</li>
</ul>

<h3>Les points de vigilance mentionnes</h3>
<ul>
<li><strong>Position laterale inconfortable.</strong> Si votre bebe aime dormir sur le cote, le bandeau tissu peut le gener. Solution : privilegier les moments ou bebe est dans vos bras ou dans une poussette.</li>
<li><strong>Adaptation des premieres utilisations.</strong> Certains parents signalent que leur bebe essaie d'enlever le casque au debut. Comme pour un bonnet ou des lunettes de soleil, l'habituation se fait en 2-3 fois.</li>
<li><strong>Tailles petites plus serrees.</strong> Quelques retours mentionnent un ajustement un peu ferme sur les tout-petits (moins de 3 mois). Le bandeau se detend cependant avec les premieres utilisations.</li>
</ul>

<h3>Recommandation d'usage officielle d'Alpine</h3>
<p>Alpine recommande une duree de port maximale de <strong>3 heures par jour et 90 minutes par session</strong>. Cette limitation est liee au confort thermique (les oreilles transpirent sous les coussinets) et non a un risque pour l'audition. Pour un vol long courrier, prevoyez donc 2 sessions de 90 minutes avec une pause de 15 minutes entre les deux.</p>`

  // Replace the old "Notre avis apres test" block
  const OLD_TEST_BLOCK_START = "<h2>Notre avis apres test</h2>"
  const OLD_TEST_BLOCK_END_MARKER = '<div class="mt-6 p-5 bg-bg-light rounded-2xl">'

  const startIdx = oldDesc.indexOf(OLD_TEST_BLOCK_START)
  const endIdx = oldDesc.indexOf(OLD_TEST_BLOCK_END_MARKER, startIdx)
  if (startIdx === -1 || endIdx === -1) throw new Error("Could not locate old test block")

  const newDesc = oldDesc.substring(0, startIdx) + NEW_SECTION + "\n\n" + oldDesc.substring(endIdx)

  const descEsc = newDesc.replace(/'/g, "''")
  await pg.raw(`UPDATE product SET description = '${descEsc}' WHERE handle = '${HANDLE}'`)

  logger.info(`  + Replaced fake test with real reviews aggregate`)
  logger.info(`  + New description: ${newDesc.length} chars`)
}
