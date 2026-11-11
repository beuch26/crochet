import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Enrich vetements-allaitement collections with richer seo_text:
 * H2-driven content with comparatifs and internal linking.
 */
export default async function enrichVetementsCollectionsSeo({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const seoTexts: Record<string, string> = {
    // ============ PARENT ============
    "vetements-allaitement": `<h2>Pourquoi des vêtements d'allaitement dédiés ?</h2>
<p>Allaiter tout en continuant à vivre normalement (bureau, sorties, rendez-vous médicaux, voyages) demande un dressing adapté. Les vêtements d'allaitement intègrent des <strong>ouvertures invisibles</strong> — zip latéral, double épaisseur, plis croisés ou boutons stratégiques — qui permettent de donner le sein en quelques secondes sans se déshabiller. Vous gagnez en confort, en discrétion et en autonomie, surtout en public.</p>
<p>Un vêtement d'allaitement bien choisi est aussi un vêtement qu'on porte <strong>avant et après</strong> : la plupart de nos modèles sont évolutifs — ils s'adaptent à la silhouette pendant la grossesse, pendant l'allaitement, puis se portent encore des mois voire des années après le sevrage. C'est un investissement rentable sur la durée.</p>

<h2>Quel vêtement d'allaitement choisir ?</h2>
<p>Tout dépend de l'occasion et de la saison :</p>
<div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
<table class="w-full text-sm border-collapse mt-4">
<thead><tr class="bg-bg-light border-b border-border"><th class="p-2 text-left font-semibold">Occasion</th><th class="p-2 text-left font-semibold">Pièce recommandée</th></tr></thead>
<tbody>
<tr class="border-b border-border-light"><td class="p-2">Bureau, rendez-vous</td><td class="p-2"><a href="/collections/tunique-allaitement" class="text-primary hover:underline">Tunique d'allaitement</a>, <a href="/collections/robe-allaitement" class="text-primary hover:underline">robe d'allaitement</a></td></tr>
<tr class="border-b border-border-light"><td class="p-2">Nuit, post-partum</td><td class="p-2"><a href="/collections/pyjama-allaitement" class="text-primary hover:underline">Pyjama d'allaitement</a>, <a href="/collections/t-shirt-allaitement" class="text-primary hover:underline">t-shirt basique</a></td></tr>
<tr class="border-b border-border-light"><td class="p-2">Hiver, sorties fraîches</td><td class="p-2"><a href="/collections/pull-allaitement" class="text-primary hover:underline">Pull d'allaitement</a></td></tr>
<tr class="border-b border-border-light"><td class="p-2">Plage, piscine, vacances</td><td class="p-2"><a href="/collections/maillot-bain-allaitement" class="text-primary hover:underline">Maillot de bain d'allaitement</a></td></tr>
<tr class="border-b border-border-light"><td class="p-2">Tenue décontractée</td><td class="p-2"><a href="/collections/salopette-allaitement" class="text-primary hover:underline">Salopette d'allaitement</a>, <a href="/collections/pantalon-allaitement" class="text-primary hover:underline">pantalon</a></td></tr>
<tr><td class="p-2">Soutien et maintien</td><td class="p-2"><a href="/collections/soutien-gorge-allaitement" class="text-primary hover:underline">Soutien-gorge d'allaitement</a></td></tr>
</tbody>
</table>
</div>

<h2>Nos marques partenaires</h2>
<p>Nous sélectionnons les marques spécialisées en maternité et allaitement : <strong>Envie De Fraise</strong> (valeur sûre française), <strong>Cache Cœur</strong> (pièces élégantes et durables), <strong>Pomkin</strong>, <strong>Mamalicious</strong>, <strong>Boob Design</strong>. Toutes sont reconnues pour la qualité de leurs tissus et la praticité de leurs ouvertures d'allaitement.</p>`,

    // ============ ROBES ============
    "robe-allaitement": `<h2>Comment choisir sa robe d'allaitement ?</h2>
<p>Une robe d'allaitement se choisit selon <strong>3 critères</strong> : l'<strong>occasion</strong> (bureau, sortie, cérémonie), la <strong>saison</strong> (gaze de coton pour l'été, molleton pour l'hiver) et le <strong>type d'ouverture</strong> (cache-coeur pour un accès rapide, boutonnée pour plus de précision, double épaisseur pour la discrétion absolue).</p>
<p>Pour un mariage ou un événement chic, privilégiez une <strong>robe longue cache-coeur</strong>. Pour le quotidien, une <strong>robe fluide en coton</strong> est plus pratique. Pour l'hiver, une <strong>robe pull en molleton</strong> avec ouverture invisible combine chaleur et allaitement facile.</p>

<h2>Robe grossesse ou robe d'allaitement : quelle différence ?</h2>
<p>Les robes grossesse sont coupées pour accueillir le ventre arrondi mais n'ont pas forcément d'ouverture d'allaitement. Les robes d'allaitement, elles, combinent les deux : <strong>coupe évolutive</strong> (grossesse → post-partum → sevrage) et <strong>ouvertures invisibles</strong> pour les tétées. C'est le choix le plus rentable : une seule robe pour 9 mois + 2 ans minimum.</p>

<h2>Pour aller plus loin</h2>
<p>Complétez votre dressing avec un <a href="/collections/soutien-gorge-allaitement" class="text-primary hover:underline">soutien-gorge d'allaitement</a> adapté, un <a href="/collections/pull-allaitement" class="text-primary hover:underline">pull d'allaitement</a> pour les jours frais, ou découvrez notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline">vêtements d'allaitement</a>.</p>`,

    // ============ TUNIQUES ============
    "tunique-allaitement": `<h2>Pourquoi une tunique d'allaitement au bureau ?</h2>
<p>Reprendre le travail en continuant à allaiter demande des tenues compatibles. Les <strong>tuniques d'allaitement</strong> sont la solution la plus discrète : les ouvertures sont <strong>invisibles à l'œil nu</strong> (zips cachés, double épaisseur croisée, boutons stratégiques) — vos collègues et clients ne verront aucune différence avec une tunique classique.</p>
<p>Selon les modèles, l'accès au sein se fait en <strong>5 à 10 secondes</strong>, ce qui permet de tirer ou d'allaiter discrètement pendant une pause déjeuner.</p>

<h2>Tunique ou blouse d'allaitement : comment choisir ?</h2>
<p>Les <strong>tuniques</strong> ont une coupe plus ample et une longueur mi-cuisse, parfaite pour les silhouettes post-partum. Les <strong>blouses</strong> sont plus courtes, plus structurées, idéales avec un pantalon de tailleur. Les deux offrent les mêmes systèmes d'ouverture invisibles.</p>

<h2>Pour aller plus loin</h2>
<p>Associez avec un <a href="/collections/pantalon-allaitement" class="text-primary hover:underline">pantalon d'allaitement</a> ou une <a href="/collections/robe-allaitement" class="text-primary hover:underline">robe d'allaitement</a> pour les jours plus formels. Voir notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline">vêtements d'allaitement</a>.</p>`,

    // ============ PYJAMAS ============
    "pyjama-allaitement": `<h2>Pourquoi un pyjama d'allaitement spécifique ?</h2>
<p>Les tétées de nuit sont un moment fatigant : <strong>3 à 5 réveils</strong> les premiers mois, souvent dans le noir, avec bébé dans les bras. Un pyjama d'allaitement classique demande de se dévêtir entièrement — impossible quand bébé pleure et que vous êtes à moitié endormie.</p>
<p>Un pyjama d'allaitement dédié intègre des <strong>ouvertures manipulables d'une seule main</strong> (boutons stratégiques, débardeur intégré sous le haut, fentes croisées) : vous donnez le sein sans même sortir du lit.</p>

<h2>Pyjama, nuisette ou chemise de nuit ?</h2>
<p>Le <strong>pyjama 2-pièces</strong> (haut + bas) est le plus pratique : vous pouvez ne changer que la partie tachée en cas de fuite de lait. La <strong>chemise de nuit</strong> est plus aérée en été, avec accès boutonné rapide. La <strong>nuisette</strong> combine élégance et fonctionnalité pour celles qui ne veulent pas sacrifier le style en maternité.</p>

<h2>Pour aller plus loin</h2>
<p>Pensez aux <a href="/collections/coussinet-allaitement" class="text-primary hover:underline">coussinets d'allaitement</a> pour protéger votre pyjama des fuites nocturnes, ou découvrez notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline">vêtements d'allaitement</a>.</p>`,

    // ============ PULLS ============
    "pull-allaitement": `<h2>Comment allaiter en hiver sans exposer bébé au froid ?</h2>
<p>Allaiter en extérieur en hiver ou dans un local frais pose un vrai problème : soulever son pull = bébé exposé à l'air froid. La solution : un <strong>pull d'allaitement</strong> avec zip invisible au niveau de la poitrine, qui garde <strong>le reste du corps couvert</strong> pendant la tétée.</p>
<p>Nos modèles sont confectionnés en maille douce, jersey épais ou mélange laine-coton pour un confort thermique optimal, même par températures négatives.</p>

<h2>Pull, gilet, cardigan : lequel choisir ?</h2>
<p>Le <strong>pull d'allaitement</strong> est plus enveloppant, idéal pour les journées froides. Le <strong>gilet</strong> (à ouverture frontale complète) offre encore plus de liberté pour allaiter — vous soulevez, bébé tète, vous refermez. Le <strong>cardigan</strong> se porte par-dessus un haut d'allaitement pour un look superposé.</p>

<h2>Pour aller plus loin</h2>
<p>Associez avec une <a href="/collections/robe-allaitement" class="text-primary hover:underline">robe d'allaitement</a> en dessous pour un look automne-hiver, ou un <a href="/collections/t-shirt-allaitement" class="text-primary hover:underline">t-shirt basique</a>. Voir notre gamme de <a href="/collections/vetements-allaitement" class="text-primary hover:underline">vêtements d'allaitement</a>.</p>`,

    // ============ T-SHIRTS ============
    "t-shirt-allaitement": `<h2>Le basique incontournable du dressing allaitement</h2>
<p>Le <strong>t-shirt d'allaitement</strong> est la pièce la plus portée de votre garde-robe post-partum. Léger, simple, lavable fréquemment (les fuites de lait sont inévitables les premiers mois), il se porte en <strong>couche de base</strong> sous un pull, sous un gilet, ou seul en été.</p>
<p>Prévoyez-en <strong>au moins 3 à 5</strong> pour pouvoir alterner et en avoir toujours un propre. Coton bio, modal ou jersey extensible selon vos préférences.</p>

<h2>T-shirt ou débardeur d'allaitement ?</h2>
<p>Le <strong>t-shirt</strong> se porte en toutes saisons, seul ou en couche intermédiaire. Le <strong>débardeur d'allaitement</strong> (avec bretelles larges) est parfait en été et sous une chemise ouverte — il reste caché et invisible tout en permettant l'accès au sein.</p>

<h2>Pour aller plus loin</h2>
<p>Associez avec un <a href="/collections/pantalon-allaitement" class="text-primary hover:underline">pantalon d'allaitement</a> pour le quotidien ou une <a href="/collections/salopette-allaitement" class="text-primary hover:underline">salopette</a> pour un look décontracté. Voir notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline">vêtements d'allaitement</a>.</p>`,

    // ============ SALOPETTES ============
    "salopette-allaitement": `<h2>Salopette d'allaitement : style décontracté et fonctionnel</h2>
<p>La <strong>salopette d'allaitement</strong> est la pièce tendance qui prouve qu'on peut rester stylée tout en allaitant. Les ouvertures sont intégrées au plastron (boutons-pression invisibles, plis croisés, zips latéraux) — vous accédez au sein en quelques secondes sans avoir à tout retirer.</p>
<p>À porter avec un <strong>t-shirt basique</strong>, un <strong>body d'allaitement</strong> ou une <strong>chemise blanche</strong> selon l'occasion. Parfait pour les sorties au parc, les journées à la maison ou les weekends en ville.</p>

<h2>Salopette ou combinaison ?</h2>
<p>La <strong>salopette</strong> a des bretelles et laisse les épaules libres — plus fraîche en été, plus facile pour allaiter. La <strong>combinaison</strong> couvre les épaules (manches courtes ou longues) et demande un système d'ouverture plus sophistiqué, mais offre un look plus habillé.</p>

<h2>Pour aller plus loin</h2>
<p>Complétez avec un <a href="/collections/t-shirt-allaitement" class="text-primary hover:underline">t-shirt d'allaitement</a> en couche de base ou un <a href="/collections/pull-allaitement" class="text-primary hover:underline">pull</a> pour les jours frais. Voir notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline">vêtements d'allaitement</a>.</p>`,

    // ============ MAILLOTS ============
    "maillot-bain-allaitement": `<h2>Peut-on allaiter à la plage ou à la piscine ?</h2>
<p>Oui, sans aucun souci. Le <strong>maillot de bain d'allaitement</strong> est spécialement conçu pour ça : les bonnets sont <strong>ouvrables par clips invisibles</strong> ou <strong>plis croisés</strong>, qui permettent de donner le sein sans avoir à retirer le maillot complet.</p>
<p>Les tissus utilisés sont ceux des maillots classiques (polyester, élasthanne), résistants au chlore et au sel, avec un séchage rapide. Seule l'ingénierie du bonnet change.</p>

<h2>Une pièce, bikini ou tankini ?</h2>
<p>Le <strong>tankini</strong> (haut débardeur + bas) est le plus pratique pour allaiter : vous soulevez juste le haut. La <strong>une pièce</strong> offre plus de maintien et couvre mieux la silhouette post-partum, avec accès par clips invisibles sur les bonnets. Le <strong>bikini</strong> est parfait pour celles qui se sentent à l'aise — les bonnets s'ouvrent latéralement.</p>

<h2>Pour aller plus loin</h2>
<p>Pensez aux <a href="/collections/coussinet-allaitement" class="text-primary hover:underline">coussinets d'allaitement</a> waterproof pour les longues séances de piscine. Voir notre gamme de <a href="/collections/vetements-allaitement" class="text-primary hover:underline">vêtements d'allaitement</a>.</p>`,

    // ============ PANTALONS ============
    "pantalon-allaitement": `<h2>Pourquoi un pantalon post-grossesse dédié ?</h2>
<p>Les premières semaines post-partum, votre silhouette change <strong>rapidement et irrégulièrement</strong>. Un pantalon classique est soit trop serré (ventre encore tendu), soit trop large (hanches remontées). Un <strong>pantalon d'allaitement / grossesse</strong> intègre une <strong>ceinture élastique douce</strong> ou un <strong>bandeau extensible</strong> qui s'adapte automatiquement.</p>
<p>Vous pouvez porter ces pantalons <strong>pendant les 9 mois de grossesse, pendant l'allaitement, et même plusieurs mois après</strong>. C'est l'investissement le plus rentable du dressing maternité.</p>

<h2>Pantalon, legging ou jean de grossesse ?</h2>
<p>Le <strong>legging d'allaitement</strong> est le plus confortable au quotidien, parfait en couche intermédiaire en hiver. Le <strong>jean de grossesse</strong> offre un look plus structuré, avec bandeau extensible invisible sous une tunique. Le <strong>pantalon large ou fluide</strong> est idéal pour l'été avec une tunique.</p>

<h2>Pour aller plus loin</h2>
<p>Associez avec une <a href="/collections/tunique-allaitement" class="text-primary hover:underline">tunique d'allaitement</a> pour un look travail, ou un <a href="/collections/t-shirt-allaitement" class="text-primary hover:underline">t-shirt basique</a> au quotidien. Voir notre gamme complète de <a href="/collections/vetements-allaitement" class="text-primary hover:underline">vêtements d'allaitement</a>.</p>`,
  }

  let updated = 0
  for (const [handle, seoText] of Object.entries(seoTexts)) {
    const res = await pg.raw(
      `UPDATE product_collection SET metadata = COALESCE(metadata, '{}'::jsonb)
         || jsonb_build_object('seo_text', ?::text)
       WHERE handle = ? AND deleted_at IS NULL`,
      [seoText, handle]
    )
    if (res.rowCount && res.rowCount > 0) {
      logger.info(`  + ${handle} seo_text updated`)
      updated++
    }
  }

  logger.info(`Done! ${updated} collections enriched.`)
}
