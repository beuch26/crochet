import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Hand-written batch #6 (5 products): 4 coussinets d'allaitement + 1 baume bio.
 *
 * Internal linking SEO (anchor = target keyword):
 *   /collections/coussinet-allaitement        => "coussinets d'allaitement"
 *   /collections/soins-allaitement            => "soins allaitement"
 *   /collections/coquillage-allaitement-nacre => "coquillages d'allaitement en nacre"
 *   /collections/bout-de-sein                 => "bouts de sein"
 *   /marques/lansinoh                         => "Lansinoh"
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
    handle: "coussinet-d-allaitement-en-fibre-ultra-fine",
    title: "Coussinets d'allaitement lavables en fibre de bambou (3 couches)",
    subtitle: "Coussinets d'allaitement en bambou 3 couches",
    description: `<p>Ces <a href="/collections/coussinet-allaitement" class="text-primary hover:underline">coussinets d'allaitement</a> lavables combinent trois couches techniques pour garder les mamelons au sec et la peau confortable : une fibre de bambou 100% au contact de la peau, une microfibre ultra-absorbante au cœur, et un voile extérieur imperméable contre les fuites. Un trio qui fait la différence face aux coussinets jetables standards.</p>

<h2>Les points forts</h2>
<ul>
<li>Couche intérieure fibre de bambou 100% — douce et hypoallergénique</li>
<li>Couche intermédiaire microfibre ultra-absorbante</li>
<li>Voile extérieur imperméable — zéro fuite sur les vêtements</li>
<li>Lavables et réutilisables plusieurs mois</li>
<li>Forme anatomique discrète sous un soutien-gorge</li>
</ul>

<h2>Pourquoi le bambou au contact de la peau ?</h2>
<p>La fibre de bambou est reconnue pour sa douceur, ses propriétés antibactériennes naturelles et sa capacité à réguler l'humidité. Elle respire mieux que le coton classique et limite les irritations sur les mamelons sensibles — un vrai avantage pendant les premières semaines d'allaitement, quand la peau est la plus fragile.</p>

<h2>Utilisation et entretien</h2>
<p>Laver avant la première utilisation à la main ou en machine à 30°C, sans adoucissant qui réduirait l'absorption. Remplacer dès que le coussinet est saturé pour maintenir les mamelons au sec et éviter les macérations. Éviter l'exposition prolongée au soleil pour préserver les fibres. Séchage à l'air libre recommandé.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> d'autres <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a>, nos <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a> et nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "3 couches techniques : bambou + microfibre + imperméable",
      "Fibre de bambou 100% hypoallergénique au contact de la peau",
      "Absorption maximale sans retour d'humidité",
      "Lavables et réutilisables (plusieurs mois)",
      "Forme anatomique discrète",
    ],
    faqs: [
      { q: "Combien de coussinets lavables prévoir ?", a: "8 à 10 paires pour pouvoir alterner port, lavage et séchage sans rupture. Vous ajusterez selon votre fréquence de lavage (tous les 2-3 jours en moyenne)." },
      { q: "À quelle fréquence changer le coussinet ?", a: "Dès qu'il est saturé ou humide au toucher, pour maintenir la peau au sec. En moyenne 3 à 5 fois par jour les premières semaines, moins ensuite." },
      { q: "Puis-je utiliser de l'adoucissant ?", a: "Non, l'adoucissant enrobe les fibres et réduit l'absorption. Une lessive douce sans adoucissant est recommandée pour préserver les performances techniques du coussinet." },
    ],
    meta_title: "Coussinets allaitement lavables bambou 3 couches | Magic Crochet Kit",
    meta_description: "Coussinets d'allaitement lavables 3 couches : bambou intérieur, microfibre absorbante, voile imperméable. Hypoallergéniques, réutilisables plusieurs mois.",
  },

  {
    handle: "coussinets-allaitement-jetables",
    title: "Coussinets d'allaitement jetables Lansinoh Blue Lock (24)",
    subtitle: "Coussinets jetables Lansinoh Blue Lock",
    description: `<p>Les <a href="/collections/coussinet-allaitement" class="text-primary hover:underline">coussinets d'allaitement</a> jetables <a href="/marques/lansinoh" class="text-primary hover:underline">Lansinoh</a> Blue Lock® combinent une absorption maximale avec une composition enrichie en huiles naturelles (tournesol, olive, cire d'abeille, beurre de karité). Lot de 24, emballés individuellement pour un usage nomade hygiénique.</p>

<h2>Les points forts</h2>
<ul>
<li>Technologie Blue Lock® — absorption maximale jour et nuit</li>
<li>Ingrédients naturels : huiles de tournesol et d'olive, cire d'abeille, beurre de karité</li>
<li>Sachet individuel par coussinet — hygiène et transport faciles</li>
<li>Lot de 24 coussinets — environ 6 jours en usage quotidien régulier</li>
<li>Voile imperméable contre les fuites latérales</li>
</ul>

<h2>Jetable ou lavable : que choisir ?</h2>
<p>Les coussinets jetables sont pratiques en déplacement, la nuit, ou pendant les premières semaines où l'écoulement est très abondant. Les lavables sont plus économiques et écologiques sur la durée. Beaucoup de mamans alternent : jetables en déplacement, lavables à la maison.</p>

<h2>Utilisation</h2>
<p>Ouvrir le sachet individuel au moment de mettre le coussinet en place, retirer la protection adhésive et coller dans le soutien-gorge, mamelon bien centré. Changer dès que le coussinet est saturé — une absorption saturée favorise les macérations et les crevasses.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/lansinoh" class="text-primary hover:underline font-medium">Lansinoh</a>, nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> lavables et nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "Technologie Blue Lock — absorption jour et nuit",
      "Enrichis en huiles naturelles (tournesol, olive, karité, cire d'abeille)",
      "Sachets individuels hygiéniques, nomades",
      "Lot de 24 coussinets",
      "Voile imperméable anti-fuite latérale",
    ],
    faqs: [
      { q: "Combien de coussinets jetables utiliser par jour ?", a: "4 à 6 par jour les premières semaines d'allaitement, 2 à 4 ensuite. Changez dès que le coussinet est humide pour maintenir la peau au sec." },
      { q: "Les ingrédients naturels tachent-ils le soutien-gorge ?", a: "Non, les huiles sont intégrées dans la fibre, elles n'entrent pas en contact direct avec le tissu. Le voile imperméable bloque aussi toute migration." },
      { q: "Peut-on les porter la nuit ?", a: "Oui, Lansinoh Blue Lock est conçu pour tenir toute la nuit grâce à sa forte capacité d'absorption. Changez-le au réveil pour un nouveau cycle." },
    ],
    meta_title: "Coussinets allaitement jetables Lansinoh 24 | Magic Crochet Kit",
    meta_description: "Coussinets d'allaitement jetables Lansinoh Blue Lock, lot de 24. Absorption maximale, huiles naturelles, sachets individuels. Jour et nuit.",
    brand: "Lansinoh",
  },

  {
    handle: "coussinets-allaitement-lavables",
    title: "Coussinets d'allaitement lavables Lansinoh (lot de 8)",
    subtitle: "Coussinets lavables Lansinoh 3 couches",
    description: `<p>Les <a href="/collections/coussinet-allaitement" class="text-primary hover:underline">coussinets d'allaitement</a> lavables <a href="/marques/lansinoh" class="text-primary hover:underline">Lansinoh</a> sont annoncés jusqu'à 9 fois plus absorbants que les coussinets classiques, grâce à une construction en trois couches : voile imperméable extérieur, noyau en fibres naturelles de bambou, et couche intérieure douce au contact de la peau. Lot de 8 pour alterner facilement.</p>

<h2>Les points forts</h2>
<ul>
<li>Absorption jusqu'à 9 fois supérieure aux coussinets classiques</li>
<li>Couche extérieure imperméable — aucune fuite sur les vêtements</li>
<li>Noyau en fibres naturelles de bambou, ultra-absorbant</li>
<li>Couche intérieure douce au contact de la peau sensibilisée</li>
<li>Lavables en machine, réutilisables des mois durant</li>
</ul>

<h2>Comment fonctionnent les 3 couches ?</h2>
<p>La couche intérieure dirige rapidement le liquide vers le noyau pour maintenir la peau au sec. Le noyau en bambou piège et retient l'humidité. La couche extérieure imperméable bloque toute fuite vers le soutien-gorge. Résultat : une sensation de sec prolongée, même lors des écoulements abondants.</p>

<h2>Entretien</h2>
<p>Laver avant la première utilisation. Lavage en machine à 30-40°C, sans adoucissant (qui bouche les fibres et réduit l'absorption). Séchage à l'air libre ou sèche-linge basse température. Remplacez les coussinets quand la performance d'absorption baisse (généralement après plusieurs mois d'usage).</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/lansinoh" class="text-primary hover:underline font-medium">Lansinoh</a>, nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> jetables et nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "Absorption jusqu'à 9 fois supérieure aux coussinets classiques",
      "3 couches : imperméable + bambou + doux peau",
      "Lot de 8 — alternance port/lavage facile",
      "Lavables en machine, plusieurs mois d'usage",
      "Signés Lansinoh — référence mondiale de l'allaitement",
    ],
    faqs: [
      { q: "Ces coussinets remplacent-ils les jetables ?", a: "Oui, pour un usage à la maison ou en journée. Beaucoup de mamans gardent quelques jetables pour les déplacements ou les premiers jours post-partum avec des écoulements très abondants." },
      { q: "Combien de temps durent les coussinets ?", a: "Plusieurs mois en lavage fréquent, à condition de ne pas utiliser d'adoucissant. Remplacez-les lorsque l'absorption baisse nettement ou que les fibres se délitent." },
      { q: "Peut-on les sécher au sèche-linge ?", a: "Oui, à basse température. Le séchage à l'air libre reste idéal pour préserver l'élasticité des fibres et la performance du noyau absorbant." },
    ],
    meta_title: "Coussinets allaitement lavables Lansinoh 8 | Magic Crochet Kit",
    meta_description: "Coussinets d'allaitement lavables Lansinoh, lot de 8, 3 couches techniques. Jusqu'à 9x plus absorbants, noyau bambou, voile imperméable anti-fuite.",
    brand: "Lansinoh",
  },

  {
    handle: "coussinets-lavables-medela-4",
    title: "Coussinets d'allaitement lavables Medela (lot de 4, 1,6 mm)",
    subtitle: "Coussinets lavables Medela triple couche",
    description: `<p>Les <a href="/collections/coussinet-allaitement" class="text-primary hover:underline">coussinets d'allaitement</a> lavables de <a href="/marques/medela" class="text-primary hover:underline">Medela</a> sont conçus pour une discrétion maximale : seulement 1,6 mm d'épaisseur, tout en absorbant jusqu'à 50 fois leur poids en liquide. Leur structure triple couche offre sécheresse et respirabilité, lot de 4 pour un usage quotidien.</p>

<h2>Les points forts</h2>
<ul>
<li>1,6 mm d'épaisseur — ultra-discrets sous les vêtements ajustés</li>
<li>Absorption jusqu'à 50 fois leur propre poids</li>
<li>Couche extérieure ultra respirante — la peau reste au sec</li>
<li>Triple couche technique pour une performance optimale</li>
<li>Lot de 4 coussinets lavables et réutilisables</li>
</ul>

<h2>Pourquoi si fins ?</h2>
<p>La technologie Medela permet d'obtenir une forte capacité d'absorption avec une épaisseur minimale. Résultat : aucun effet « rembourré » sous un t-shirt ajusté ou une lingerie fine, et un confort préservé toute la journée. Idéal pour les mamans qui veulent allaiter sans que l'entourage le remarque.</p>

<h2>Utilisation et entretien</h2>
<p>Prélaver avant la première utilisation. Lavage en machine à 30-40°C, sans adoucissant. Séchage à l'air libre recommandé. Remplacer dans la journée dès que le coussinet est saturé. Pour un usage toute la journée, prévoyez plusieurs rechanges selon le débit de votre lactation.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/medela" class="text-primary hover:underline font-medium">Medela</a>, nos autres <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> et nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "1,6 mm d'épaisseur — invisibles sous les vêtements ajustés",
      "Absorption jusqu'à 50x leur poids",
      "Triple couche : respirabilité et sécheresse",
      "Lot de 4 coussinets lavables",
      "Signés Medela, référence mondiale de l'allaitement",
    ],
    faqs: [
      { q: "1,6 mm d'épaisseur, c'est suffisant pour absorber ?", a: "Oui, la technologie Medela combine matériaux ultra-absorbants et densité optimisée pour une forte capacité malgré la finesse — jusqu'à 50x leur poids en liquide." },
      { q: "Lot de 4, est-ce assez ?", a: "Suffisant si vous lavez tous les jours. Pour alterner confortablement sans courir après le linge, un complément de 4 à 8 coussinets peut être utile." },
      { q: "Sont-ils compatibles avec d'autres marques de tire-lait ?", a: "Les coussinets sont indépendants du tire-lait : ils se portent simplement dans le soutien-gorge. Vous pouvez utiliser les coussinets Medela avec tout tire-lait." },
    ],
    meta_title: "Coussinets lavables Medela lot 4 triple couche | Magic Crochet Kit",
    meta_description: "Coussinets d'allaitement lavables Medela, lot de 4, seulement 1,6 mm d'épaisseur. Absorption jusqu'à 50x leur poids. Triple couche respirante.",
    brand: "Medela",
  },

  {
    handle: "baume-allaitement-bio",
    title: "Baume d'allaitement bio Lansinoh (100% naturel, sans rinçage)",
    subtitle: "Baume d'allaitement bio Lansinoh",
    description: `<p>Le baume d'allaitement bio <a href="/marques/lansinoh" class="text-primary hover:underline">Lansinoh</a> apaise et assouplit les mamelons et la peau sèche qui tiraille pendant la grossesse et les premiers jours après l'accouchement. Sa formule 100% naturelle, sans odeur ni goût, ne nécessite pas de rinçage avant la tétée — un soin pensé pour les mamans autant que pour bébé.</p>

<h2>Les points forts</h2>
<ul>
<li>Formule 100% naturelle, certifiée bio</li>
<li>Sans odeur, sans goût — pas besoin de rincer avant la tétée</li>
<li>Assouplit la peau sèche et les mamelons sensibles</li>
<li>Utilisable dès la grossesse pour préparer les seins à l'allaitement</li>
<li>Signé Lansinoh — référence mondiale de l'allaitement</li>
</ul>

<h2>Quand appliquer le baume ?</h2>
<p>Dès la fin de la grossesse pour familiariser la peau du mamelon à des manipulations régulières (massages, auto-examens). Pendant l'allaitement, appliquez une fine couche après chaque tétée pour prévenir les crevasses et maintenir l'élasticité de la peau. Les premiers jours post-partum sont cruciaux — le baume limite les fissures avant qu'elles n'apparaissent.</p>

<h2>Pourquoi choisir un baume bio ?</h2>
<p>Une formule bio écarte les perturbateurs endocriniens, parabens et parfums de synthèse. Pendant l'allaitement, tout ce qui touche le mamelon peut être ingéré par bébé — un baume bio, sans rinçage, garantit une sécurité maximale. C'est aussi un choix plus doux pour les peaux sensibles.</p>

<h2>Application</h2>
<p>Après la tétée, prélever une petite quantité de baume avec un doigt propre, réchauffer entre les doigts et appliquer en fine couche sur le mamelon et l'aréole. Inutile de rincer avant la prochaine tétée. Utiliser autant de fois que nécessaire dans la journée.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/lansinoh" class="text-primary hover:underline font-medium">Lansinoh</a>, nos <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a> et nos <a href="/collections/bout-de-sein" class="text-primary hover:underline font-medium">bouts de sein</a>.</p></div>`,
    benefits: [
      "Formule 100% naturelle certifiée bio",
      "Sans odeur, sans goût — pas de rinçage avant la tétée",
      "Utilisable dès la grossesse en prévention",
      "Apaise crevasses et mamelons sensibles",
      "Signé Lansinoh — référence mondiale de l'allaitement",
    ],
    faqs: [
      { q: "Faut-il rincer avant la tétée ?", a: "Non, c'est tout l'intérêt : la formule bio de Lansinoh est sans danger pour bébé et ne nécessite aucun rinçage. Bébé peut téter directement après application." },
      { q: "Peut-on l'utiliser sur d'autres zones sèches ?", a: "Oui, les mamans l'utilisent parfois sur les lèvres gercées, les cuticules ou les petites zones de peau très sèche. La formule 100% naturelle le rend polyvalent." },
      { q: "À partir de quand appliquer le baume ?", a: "Dès la fin de grossesse pour préparer la peau, puis après chaque tétée dès le début de l'allaitement pour prévenir les crevasses. Plus tôt vous commencez, plus la prévention est efficace." },
    ],
    meta_title: "Baume allaitement bio Lansinoh 100% naturel | Magic Crochet Kit",
    meta_description: "Baume d'allaitement bio Lansinoh, formule 100% naturelle sans rinçage. Apaise les mamelons sensibles et les crevasses. Utilisable dès la grossesse.",
    brand: "Lansinoh",
  },
]

export default async function rewriteBatch6({ container }: ExecArgs) {
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

  logger.info(`\nBatch 6 done: ${BATCH.length} products rewritten`)
}
