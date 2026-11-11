import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Rewrite the casque-anti-bruit-bebe collection seo_text:
 *   - Short intro (2 short paragraphs)
 *   - Mini comparatif table
 *   - Internal linking (brand pages, blog, sister collections)
 */
export default async function updateCasqueSeo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const seoText = `<h2>Comment choisir le bon casque anti-bruit bebe ?</h2>
<p>Trois criteres font la difference : l'<strong>age de l'enfant</strong> (bandeau tissu pour les 0-3 ans, arceau ajustable au-dela), l'<strong>attenuation dB</strong> (23-25 dB pour usage courant, 27-29 dB pour environnements extremes ou hypersensibilite), et la <strong>certification CE EN 352-1:2020</strong> — le gage d'une protection reellement testee.</p>
<p>Pour un premier achat, nous recommandons le <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">casque anti-bruit bebe Alpine Muffy Baby</a> (des 0 mois, 23 dB). Pour les enfants plus ages, le <a href="/products/casque-antibruit-alpine-muffy-kids" class="text-primary hover:underline">Alpine Muffy Kids (5-16 ans)</a> ou le <a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline">Kidywolf Kidynoise (3-10 ans, pliable)</a>.</p>

<h2>Quel casque anti-bruit bebe choisir ? Notre comparatif</h2>
<div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
<table class="w-full text-sm border-collapse mt-4">
<thead>
<tr class="bg-bg-light border-b border-border"><th class="p-2 text-left font-semibold">Modele</th><th class="p-2 text-left font-semibold">Age</th><th class="p-2 text-left font-semibold">dB</th><th class="p-2 text-left font-semibold">Pour qui</th></tr>
</thead>
<tbody>
<tr class="border-b border-border-light"><td class="p-2"><a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Alpine Muffy Baby</a></td><td class="p-2">0-3 ans</td><td class="p-2">23 dB</td><td class="p-2">Nouveau-nes, concerts, voyages</td></tr>
<tr class="border-b border-border-light"><td class="p-2"><a href="/products/casque-antibruit-alpine-muffy-kids" class="text-primary hover:underline">Alpine Muffy Kids</a></td><td class="p-2">5-16 ans</td><td class="p-2">25 dB</td><td class="p-2">Enfants actifs, hypersensibles</td></tr>
<tr class="border-b border-border-light"><td class="p-2"><a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline">Kidywolf Kidynoise</a></td><td class="p-2">3-10 ans</td><td class="p-2">25 dB</td><td class="p-2">Nomades : pliable, transport</td></tr>
<tr class="border-b border-border-light"><td class="p-2"><a href="/products/casque-antibruit-alecto-educatif-29db" class="text-primary hover:underline">Alecto 29 dB</a></td><td class="p-2">18 mois+</td><td class="p-2">29 dB</td><td class="p-2">TDAH, autisme, ecole</td></tr>
<tr><td class="p-2"><a href="/products/casque-antibruit-dooky-evolutif-2-en-1" class="text-primary hover:underline">Dooky Evolutif 2-en-1</a></td><td class="p-2">0-12 ans</td><td class="p-2">27 dB</td><td class="p-2">Un seul achat pour 12 ans</td></tr>
</tbody>
</table>
</div>

<h2>Pour aller plus loin</h2>
<p>Decouvrez nos marques partenaires <a href="/marques/alpine" class="text-primary hover:underline">Alpine</a>, <a href="/marques/kidywolf" class="text-primary hover:underline">Kidywolf</a> et <a href="/marques/alecto" class="text-primary hover:underline">Alecto</a>, ou consultez nos guides sur le blog : <a href="/blog/meilleur-casque-anti-bruit-bebe-comparatif" class="text-primary hover:underline">comparatif casques anti-bruit bebe</a>, <a href="/blog/a-partir-de-quel-age-casque-anti-bruit-bebe" class="text-primary hover:underline">a partir de quel age</a>, <a href="/blog/casque-anti-bruit-enfant-tdah-hypersensibilite" class="text-primary hover:underline">TDAH et hypersensibilite</a>.</p>`

  await pg.raw(
    `UPDATE product_collection
     SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('seo_text', ?::text)
     WHERE handle = 'casque-anti-bruit-bebe'`,
    [seoText]
  )

  logger.info("  + casque-anti-bruit-bebe seo_text updated (intro + comparatif + maillage)")
}
