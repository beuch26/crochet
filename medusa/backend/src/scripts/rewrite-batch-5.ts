import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Hand-written batch #5 (5 products): 3 coquillages en nacre marques + 1
 * coupelles Medela + 1 collecteur silicone générique.
 *
 * Internal linking SEO (anchor = target keyword):
 *   /collections/coquillage-allaitement-nacre => "coquillages d'allaitement en nacre"
 *   /collections/coussinet-allaitement        => "coussinets d'allaitement"
 *   /collections/soins-allaitement            => "soins allaitement"
 *   /collections/bout-de-sein                 => "bouts de sein"
 *   /collections/conservation-lait-maternel   => "conservation du lait maternel"
 *   /marques/babig                            => "BABIG"
 *   /marques/moms-shells                      => "MOM'S SHELLS"
 *   /marques/yemma-shell                      => "Yemma Shell"
 *   /marques/medela                           => "Medela"
 */

type Rewrite = {
  handle: string
  title?: string
  subtitle?: string
  description: string
  benefits: string[]
  faqs: Array<{ q: string; a: string }>
  meta_title: string
  meta_description: string
  brand?: string
}

const BATCH: Rewrite[] = [
  {
    handle: "coquillages-allaitement-babig",
    title: "Coquillages d'allaitement BABIG (dispositif médical, Made in France)",
    subtitle: "Coquillages d'allaitement BABIG en nacre",
    description: `<p>Les <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline">coquillages d'allaitement en nacre</a> <a href="/marques/babig" class="text-primary hover:underline">BABIG</a> sont fabriqués en France et polis à la main à partir de coquillages naturels. Classés dispositif médical de classe I (directive DE 93/42/CEE), ils sont recommandés par 93% des sages-femmes pour prévenir et soulager les crevasses, irritations et échauffements de l'allaitement.</p>

<h2>Les points forts</h2>
<ul>
<li>Fabrication française artisanale — polis à la main</li>
<li>Dispositif médical de classe I (directive européenne DE 93/42/CEE)</li>
<li>Nacre naturelle aux propriétés antibactériennes et cicatrisantes</li>
<li>Plébiscités par 93% des sages-femmes interrogées par la marque</li>
<li>100% réutilisables, lavables, écologiques</li>
</ul>

<h2>Comment la nacre soulage l'allaitement</h2>
<p>Au contact du lait maternel, la nacre réagit pour former un pansement naturel qui apaise les mamelons sensibles, limite la prolifération bactérienne et accélère la cicatrisation des crevasses. Cette propriété, connue depuis des siècles, fait de la nacre une alternative naturelle aux crèmes et aux coussinets jetables.</p>

<h2>Quand les utiliser ?</h2>
<p>Dès les premières douleurs, ou en prévention dès les premiers jours d'allaitement. Les coquillages se placent dans le soutien-gorge entre les tétées, au contact direct de la peau. Ils recueillent également les gouttes de lait qui s'écoulent, sans gaspillage.</p>

<h2>Entretien</h2>
<p>Rinçage à l'eau claire après chaque utilisation, lavage à l'eau tiède savonneuse une fois par jour. Stérilisation par ébullition 5 minutes avant la première utilisation et une fois par semaine ensuite. Laisser sécher à l'air libre — jamais de séchage au lave-vaisselle qui pourrait fragiliser la nacre.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> d'autres <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a>, nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> et nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "Fabrication française artisanale, polis à la main",
      "Dispositif médical de classe I (DE 93/42/CEE)",
      "Nacre naturelle aux propriétés cicatrisantes",
      "Recommandés par 93% des sages-femmes (selon la marque)",
      "Réutilisables, lavables, zéro déchet",
    ],
    faqs: [
      { q: "Pourquoi la nacre soulage-t-elle les crevasses ?", a: "La nacre possède des propriétés antibactériennes et cicatrisantes. Au contact du lait maternel, elle crée un pansement naturel qui apaise la peau irritée et accélère la cicatrisation. C'est un remède traditionnel reconnu." },
      { q: "Les coquillages sont-ils un dispositif médical ?", a: "Oui, les coquillages BABIG sont classés dispositif médical de classe I selon la directive européenne 93/42/CEE. Cela atteste de leur conformité et de leur sécurité pour un usage sur peau fragilisée." },
      { q: "Comment stériliser les coquillages ?", a: "Ébullition 5 minutes avant la première utilisation, puis une fois par semaine. Évitez le lave-vaisselle : la chaleur intense et les produits peuvent fragiliser la nacre à long terme." },
    ],
    meta_title: "Coquillages allaitement BABIG dispositif médical | Magic Crochet Kit",
    meta_description: "Coquillages d'allaitement BABIG en nacre, polis à la main en France. Dispositif médical classe I, recommandés par 93% des sages-femmes.",
    brand: "BABIG",
  },

  {
    handle: "coquillages-allaitement-moms-shells",
    title: "Coquillages d'allaitement MOM'S SHELLS (nacre, Made in France)",
    subtitle: "Coquillages MOM'S SHELLS en nacre",
    description: `<p>Les <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline">coquillages d'allaitement en nacre</a> <a href="/marques/moms-shells" class="text-primary hover:underline">MOM'S SHELLS</a> sont fabriqués en France, certifiés CE, et vendus en pharmacie. La marque reverse 1 € par boîte à l'association Magnificat qui aide les femmes enceintes en difficulté — un achat responsable, au-delà du simple soin d'allaitement.</p>

<h2>Les points forts</h2>
<ul>
<li>Fabrication française, certification CE</li>
<li>Nacre naturelle aux propriétés apaisantes et cicatrisantes</li>
<li>Lingette de séchage et sac en flanelle fournis</li>
<li>1 € reversé à l'association Magnificat pour chaque boîte vendue</li>
<li>Compatibles lave-vaisselle — entretien rapide</li>
</ul>

<h2>Pourquoi ces coquillages ?</h2>
<p>Au contact du lait maternel, la nacre forme un pansement naturel qui soulage crevasses, irritations et hypersensibilité des mamelons. Recommandés contre les maux de l'allaitement, ils accompagnent la maman dès les premiers jours et se réutilisent pendant toute la période d'allaitement.</p>

<h2>Utilisation et entretien</h2>
<p>Placer les coquillages dans le soutien-gorge entre les tétées, côté nacre contre la peau. Après usage, laver à l'eau claire, sécher avec la lingette MOM'S SHELLS fournie, puis ranger dans le sac en flanelle. Ils peuvent également passer au lave-vaisselle.</p>

<h2>Un engagement solidaire</h2>
<p>Chaque boîte achetée permet à la marque de reverser 1 € à Magnificat, une association française qui accompagne les femmes enceintes en situation de précarité. Un geste d'achat qui prolonge la dimension humaine de la maternité.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> d'autres <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a>, nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> et nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "Nacre naturelle, fabrication française, certifiée CE",
      "Lingette de séchage et sac en flanelle fournis",
      "Compatibles lave-vaisselle",
      "1 € reversé à l'association Magnificat par boîte",
      "Vendus en pharmacie — qualité pharmaceutique",
    ],
    faqs: [
      { q: "MOM'S SHELLS est-elle une marque fiable ?", a: "Oui. La marque est fabriquée en France, certifiée CE et distribuée en pharmacie. Elle est recommandée par les professionnels de santé et les sages-femmes." },
      { q: "Peut-on passer les coquillages au lave-vaisselle ?", a: "Oui, les coquillages MOM'S SHELLS supportent le lave-vaisselle, ce qui les distingue de certains autres coquillages en nacre. Pensez toutefois à une stérilisation occasionnelle par ébullition." },
      { q: "Quel est l'engagement solidaire de la marque ?", a: "1 € par boîte vendue est reversé à l'association Magnificat, qui soutient les femmes enceintes en difficulté. Un achat qui associe soin personnel et geste solidaire." },
    ],
    meta_title: "Coquillages allaitement MOM'S SHELLS nacre France | Magic Crochet Kit",
    meta_description: "Coquillages d'allaitement MOM'S SHELLS en nacre, fabriqués en France, certifiés CE. Lingette + sac flanelle fournis, 1 € reversé à Magnificat.",
    brand: "MOM'S SHELLS",
  },

  {
    handle: "coquillages-allaitement-nacre-yemma-shell",
    title: "Coquillages Yemma Shell en nacre + 6 coussinets",
    subtitle: "Coquillages Yemma Shell (4 tailles)",
    description: `<p>Les <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline">coquillages d'allaitement en nacre</a> <a href="/marques/yemma-shell" class="text-primary hover:underline">Yemma Shell</a> sont sélectionnés à la main et façonnés sans vernis chimique. Disponibles en 4 tailles et livrés avec 6 coussinets d'allaitement, ils apaisent les mamelons sensibles et protègent contre les frottements dès la maternité.</p>

<h2>Les points forts</h2>
<ul>
<li>Nacre naturelle 100%, sans vernis ni traitement chimique</li>
<li>Façonnage manuel — chaque coquillage est unique</li>
<li>4 tailles disponibles (S, M, L, XL) pour s'adapter à chaque aréole</li>
<li>Épais et résistants aux chocs — conçus pour durer</li>
<li>Set fourni avec 6 <a href="/collections/coussinet-allaitement" class="text-primary hover:underline">coussinets d'allaitement</a></li>
</ul>

<h2>Comment choisir la bonne taille ?</h2>
<p>Mesurez le diamètre de votre aréole (partie brune autour du mamelon) :</p>
<ul>
<li><strong>Taille S</strong> — jusqu'à 5,5 cm de diamètre</li>
<li><strong>Taille M</strong> — entre 5,5 et 6 cm de diamètre</li>
<li><strong>Taille L</strong> — entre 6 et 6,5 cm de diamètre</li>
<li><strong>Taille XL</strong> — plus de 6,5 cm de diamètre</li>
</ul>
<p>Le coquillage ne doit pas nécessairement recouvrir ou dépasser l'aréole — il doit simplement permettre un positionnement confortable et stable dans le soutien-gorge.</p>

<h2>Pourquoi choisir Yemma Shell ?</h2>
<p>La marque est vendue en pharmacie et recommandée par les sages-femmes et les consultants en lactation. Le travail artisanal français garantit l'absence de substances chimiques au contact de la peau et du lait maternel. Réutilisables sans limite, les coquillages deviennent un investissement durable pour toute la période d'allaitement.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> d'autres <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a>, nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> et nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "Nacre 100% naturelle, sans vernis chimique",
      "Façonnage manuel, fabrication française",
      "4 tailles (S, M, L, XL) pour une adaptation précise",
      "Set complet : coquillages + 6 coussinets d'allaitement",
      "Vendus en pharmacie, recommandés par les sages-femmes",
    ],
    faqs: [
      { q: "Comment choisir la bonne taille de coquillage ?", a: "Mesurez le diamètre de votre aréole : S jusqu'à 5,5 cm, M 5,5-6 cm, L 6-6,5 cm, XL au-delà. Le coquillage doit tenir confortablement dans le soutien-gorge, sans forcément recouvrir toute l'aréole." },
      { q: "Que contient le set Yemma Shell ?", a: "Deux coquillages en nacre dans la taille choisie, plus 6 coussinets d'allaitement pour rester au sec entre les tétées. Un kit complet pour bien démarrer l'allaitement." },
      { q: "Yemma Shell est-elle vendue en pharmacie ?", a: "Oui, la marque est distribuée en pharmacie française et reconnue par les professionnels de santé comme dispositif apaisant et cicatrisant pour les mamelons." },
    ],
    meta_title: "Coquillages Yemma Shell nacre + 6 coussinets | Magic Crochet Kit",
    meta_description: "Coquillages d'allaitement Yemma Shell en nacre naturelle (4 tailles S/M/L/XL) + 6 coussinets. Fabrication artisanale française, vendus en pharmacie.",
    brand: "Yemma Shell",
  },

  {
    handle: "coupelles-recueil-lait-lot-de-2",
    title: "Coupelles recueil-lait Medela (lot de 2, silicone souple)",
    subtitle: "Coupelles recueil-lait Medela",
    description: `<p>Les coupelles recueil-lait de <a href="/marques/medela" class="text-primary hover:underline">Medela</a> recueillent le lait qui s'écoule pendant la tétée du côté opposé, évitant ainsi les fuites et les pertes. Vendues par lot de 2, elles se portent dans le soutien-gorge, invisibles sous les vêtements grâce à leur silicone souple anatomique.</p>

<h2>Les points forts</h2>
<ul>
<li>Silicone souple côté peau — confort et adaptation à toutes les anatomies</li>
<li>Membrane anatomique fine, invisible sous les vêtements</li>
<li>Recueille le lait qui s'écoule pendant la tétée — moins de gaspillage</li>
<li>Vendues par lot de 2 (une pour chaque sein)</li>
<li>Marque Medela — référence mondiale de l'allaitement</li>
</ul>

<h2>Quand les utiliser ?</h2>
<p>Pendant la tétée, sur le sein opposé à celui que bébé tète. Le réflexe d'éjection s'active souvent des deux côtés simultanément : la coupelle recueille le lait qui s'écoule librement, qui peut ensuite être conservé pour une tétée ultérieure. Pratique aussi entre les tétées en cas d'écoulements abondants.</p>

<h2>Différence avec les coussinets jetables</h2>
<p>Les coussinets absorbent le lait qui s'écoule — il est donc perdu. Les coupelles le recueillent : si elles sont stérilisées avant usage et que le lait est conservé rapidement dans un contenant adapté (pot ou sachet de <a href="/collections/conservation-lait-maternel" class="text-primary hover:underline">conservation du lait maternel</a>), il peut être donné à bébé. Zéro gaspillage.</p>

<h2>Entretien</h2>
<p>Rincer à l'eau claire après chaque usage, laver à l'eau tiède savonneuse ou au lave-vaisselle (panier supérieur). Stériliser régulièrement (vapeur ou ébullition) pour un usage alimentaire sûr du lait recueilli.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/medela" class="text-primary hover:underline font-medium">Medela</a>, nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> et la <a href="/collections/conservation-lait-maternel" class="text-primary hover:underline font-medium">conservation du lait maternel</a>.</p></div>`,
    benefits: [
      "Lot de 2 coupelles en silicone souple",
      "Membrane anatomique fine, invisible sous les vêtements",
      "Recueille le lait qui s'écoule pendant la tétée",
      "Compatibles lave-vaisselle et stérilisateur",
      "Signées Medela, référence mondiale de l'allaitement",
    ],
    faqs: [
      { q: "Peut-on donner à bébé le lait recueilli par les coupelles ?", a: "Oui, à condition que les coupelles aient été stérilisées avant usage et que le lait soit transféré rapidement dans un contenant de conservation adapté (pot ou sachet). Sans cette précaution, le lait est considéré non alimentaire." },
      { q: "Coupelles ou coussinets, lesquels choisir ?", a: "Les coussinets absorbent (lait perdu, donc pratique au quotidien). Les coupelles recueillent (lait conservable). Beaucoup de mamans alternent selon les moments : coupelles pendant les tétées, coussinets le reste du temps." },
      { q: "Les coupelles sont-elles visibles sous les vêtements ?", a: "Non, leur silicone souple anatomique les rend discrètes, même sous un vêtement ajusté. Elles ajoutent toutefois un petit volume par rapport à un coussinet plat." },
    ],
    meta_title: "Coupelles recueil-lait Medela lot de 2 silicone | Magic Crochet Kit",
    meta_description: "Coupelles recueil-lait Medela en silicone souple, lot de 2. Recueillent le lait qui s'écoule pendant la tétée pour éviter les pertes. Compatibles stérilisateur.",
    brand: "Medela",
  },

  {
    handle: "coussinets-d-allaitement-en-silicone",
    title: "Coupelles collectrices de lait en silicone (lot de 2, réutilisables)",
    subtitle: "Coupelles collectrices de lait en silicone",
    description: `<p>Ces coupelles collectrices de lait en silicone recueillent les fuites de lait qui s'écoulent pendant les tétées — plus besoin de coussinets jetables, et plus aucun gaspillage. Vendues par lot de 2, elles sont réutilisables, lavables, et se portent discrètement dans le soutien-gorge.</p>

<h2>Les points forts</h2>
<ul>
<li>Silicone alimentaire souple, sans BPA</li>
<li>Lot de 2 coupelles — une pour chaque sein</li>
<li>Forme anatomique adaptée à toutes les morphologies</li>
<li>Recueille le lait qui s'écoule entre ou pendant les tétées</li>
<li>Lavable et réutilisable — économique et écologique</li>
</ul>

<h2>Pour qui sont-elles pensées ?</h2>
<p>Pour les mamans qui ont un écoulement abondant de lait (particulièrement fréquent les premières semaines), celles qui veulent récupérer le lait du côté opposé à la tétée, ou simplement celles qui cherchent une alternative aux <a href="/collections/coussinet-allaitement" class="text-primary hover:underline">coussinets d'allaitement</a> jetables.</p>

<h2>Utilisation</h2>
<p>Placer la coupelle dans le soutien-gorge, côté silicone au contact de la peau, membrane creuse orientée vers l'écoulement. Après usage, vider le lait (à jeter si les coupelles n'étaient pas stérilisées avant, ou à conserver en <a href="/collections/conservation-lait-maternel" class="text-primary hover:underline">conservation du lait maternel</a> si elles l'étaient). Rincer à l'eau tiède et laver au savon.</p>

<h2>Entretien</h2>
<p>Lavage à l'eau tiède savonneuse après chaque usage, stérilisation hebdomadaire à la vapeur ou par ébullition. Passage possible au lave-vaisselle (panier supérieur). Sécher à l'air libre avant rangement — une boîte de rangement est proposée en option.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> lavables, les <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a> et la <a href="/collections/conservation-lait-maternel" class="text-primary hover:underline font-medium">conservation du lait maternel</a>.</p></div>`,
    benefits: [
      "Silicone alimentaire sans BPA",
      "Lot de 2 coupelles, une par sein",
      "Forme anatomique discrète sous les vêtements",
      "Récupère le lait qui s'écoule — zéro gaspillage",
      "Réutilisable, plus économique que les jetables",
    ],
    faqs: [
      { q: "Quelle différence avec les coussinets jetables ?", a: "Les coussinets absorbent et sont jetés (lait perdu). Les coupelles recueillent et sont réutilisables : le lait peut être conservé si les coupelles ont été stérilisées au préalable." },
      { q: "Les coupelles sont-elles visibles sous un vêtement près du corps ?", a: "Elles ajoutent un léger volume par rapport à un coussinet plat. Sous une tenue ajustée, un vêtement en couche superposée peut être préférable." },
      { q: "Peut-on porter les coupelles la nuit ?", a: "Oui, c'est même un usage fréquent pour gérer les écoulements abondants nocturnes. Assurez-vous que la coupelle est bien positionnée pour éviter les fuites pendant le sommeil." },
    ],
    meta_title: "Coupelles collectrices lait silicone lot de 2 | Magic Crochet Kit",
    meta_description: "Coupelles collectrices de lait maternel en silicone sans BPA, lot de 2. Lavables, réutilisables. Récupèrent les écoulements entre ou pendant les tétées.",
  },
]

export default async function rewriteBatch5({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  for (const r of BATCH) {
    const existing = await pg.raw(`SELECT id, metadata FROM product WHERE handle = ? AND deleted_at IS NULL LIMIT 1`, [r.handle])
    const row = existing.rows?.[0]
    if (!row) { logger.warn(`  ! not found: ${r.handle}`); continue }

    const newMeta: any = {
      ...(row.metadata || {}),
      benefits: r.benefits,
      faqs: r.faqs,
      meta_title: r.meta_title,
      meta_description: r.meta_description,
    }
    if (r.brand) newMeta.affiliate_brand = r.brand

    const params: any[] = [r.description, JSON.stringify(newMeta)]
    let setClause = "description = ?, metadata = ?::jsonb"
    if (r.title) { setClause += ", title = ?"; params.push(r.title) }
    if (r.subtitle) { setClause += ", subtitle = ?"; params.push(r.subtitle) }
    params.push(row.id)

    await pg.raw(`UPDATE product SET ${setClause} WHERE id = ?`, params)
    logger.info(`  + ${r.handle}`)
  }

  logger.info(`\nBatch 5 done: ${BATCH.length} products rewritten`)
}
