import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Hand-written batch #4 (5 products): 3 conservation du lait + 2 coquillages
 * d'allaitement.
 *
 * Internal linking SEO (anchor = target keyword):
 *   /collections/conservation-lait-maternel  => "conservation du lait maternel"
 *   /collections/tire-lait                   => "tire-lait"
 *   /collections/biberons-tetines            => "biberons et tétines"
 *   /collections/coquillage-allaitement-nacre => "coquillages d'allaitement en nacre"
 *   /collections/coussinet-allaitement       => "coussinets d'allaitement"
 *   /collections/soins-allaitement           => "soins allaitement"
 *   /marques/lansinoh                        => "Lansinoh"
 *   /marques/medela                          => "Medela"
 *   /marques/koala-babycare                  => "Koala Babycare"
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
    handle: "coffret-allaitement-naturel-geniuz",
    title: "Coffret allaitement naturel (coquillages + coussinets)",
    subtitle: "Coffret maternité complet pour l'allaitement",
    description: `<p>Ce coffret d'allaitement réunit tout ce qu'il faut pour accompagner les premières semaines : deux coquillages apaisants en forme d'entonnoir pour soulager les mamelons sensibles, deux coussinets de confort pour rester au sec, et un ebook pour vous guider. Une réponse complète aux inconforts les plus fréquents du début d'allaitement.</p>

<h2>Contenu du coffret</h2>
<ul>
<li>2 coquillages d'allaitement cicatrisants, forme entonnoir</li>
<li>2 coussinets d'allaitement confort</li>
<li>Ebook offert sur l'allaitement</li>
<li>Boîte de rangement pour transport et hygiène</li>
<li>Instructions d'utilisation incluses</li>
</ul>

<h2>Pourquoi ces coquillages ?</h2>
<p>Les coquillages d'allaitement créent un coussin d'air entre le vêtement et le mamelon, réduisant les frottements responsables des irritations. Leur forme évasée facilite aussi la prise du sein par bébé — un double bénéfice pour soulager les douleurs pendant les tétées et accélérer la cicatrisation des crevasses.</p>

<h2>Comment les utiliser ?</h2>
<p>Avant la première utilisation, nettoyez et séchez les coquillages et les coussins. Placez les coquillages directement sur le mamelon, au sec, entre deux tétées. Retirez-les avant la tétée. Nettoyez à l'eau tiède savonneuse après chaque usage et laissez sécher à l'air libre dans la boîte de rangement fournie.</p>

<h2>Un coffret pour qui ?</h2>
<p>Idéal en cadeau de baby shower, de naissance, ou comme kit complet à avoir dans sa valise de maternité. Il convient aux mamans qui commencent l'allaitement, à celles qui souffrent de crevasses, ou simplement pour prévenir les irritations des premières semaines.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> nos autres <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a>, nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a> et nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "Coffret complet : 2 coquillages + 2 coussinets + ebook + boîte",
      "Coquillages en forme d'entonnoir — soulagent les crevasses",
      "Coussinets de confort pour rester au sec entre les tétées",
      "Boîte de rangement hygiénique, pratique en déplacement",
      "Idéal cadeau de baby shower ou valise de maternité",
    ],
    faqs: [
      { q: "Quelle différence entre coquillages et coussinets ?", a: "Les coquillages apaisent les mamelons sensibles et recueillent les gouttes de lait entre les tétées. Les coussinets se placent dans le soutien-gorge pour absorber l'écoulement du lait et éviter les taches. Ils sont complémentaires." },
      { q: "Ce coffret convient-il dès la naissance ?", a: "Oui. C'est même le moment où les mamelons sont les plus sensibles et où les risques de crevasses sont les plus élevés — d'où l'intérêt d'avoir ces accessoires à portée de main dès la maternité." },
      { q: "Les coquillages sont-ils réutilisables ?", a: "Oui, ils sont lavables et réutilisables pendant plusieurs mois voire années, à condition d'être nettoyés après chaque usage et séchés soigneusement." },
    ],
    meta_title: "Coffret allaitement coquillages coussinets ebook | Magic Crochet Kit",
    meta_description: "Coffret allaitement complet : 2 coquillages cicatrisants + 2 coussinets confort + ebook + boîte. Idéal cadeau de baby shower ou valise maternité.",
  },

  {
    handle: "coques-allaitement-trilamine",
    title: "Coques d'allaitement Koala Babycare (soins des crevasses)",
    subtitle: "Coques d'allaitement Koala Babycare",
    description: `<p>Les coques d'allaitement <a href="/marques/koala-babycare" class="text-primary hover:underline">Koala Babycare</a> se placent dans le soutien-gorge entre les tétées pour soulager les crevasses, protéger les mamelons sensibles et recueillir les gouttes de lait. Conçues par une marque spécialisée dans les soins du post-partum, elles sont certifiées et pensées pour un usage quotidien.</p>

<h2>Les points forts</h2>
<ul>
<li>Forme anatomique qui éloigne le tissu du mamelon — zéro frottement</li>
<li>Recueille l'écoulement de lait entre les tétées, sans gaspillage</li>
<li>Plusieurs certifications de la marque Koala Babycare attestent la qualité des matériaux</li>
<li>Réutilisables — plus économiques et écologiques que les coussinets jetables</li>
<li>Design ergonomique discret sous les vêtements</li>
</ul>

<h2>Quand les utiliser ?</h2>
<p>Entre les tétées, dès l'apparition des premières douleurs ou en prévention. Elles sont particulièrement utiles les premières semaines d'allaitement, quand les mamelons sont les plus vulnérables, et en cas de crevasses avérées pour protéger la peau des frottements du soutien-gorge.</p>

<h2>Entretien</h2>
<p>Rincer à l'eau tiède après chaque utilisation, laver à l'eau savonneuse une fois par jour. Stérilisation possible à la vapeur ou à l'ébullition. Sécher à l'air libre avant rangement pour éviter tout développement bactérien.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/koala-babycare" class="text-primary hover:underline font-medium">Koala Babycare</a>, nos <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a> et nos <a href="/collections/coussinet-allaitement" class="text-primary hover:underline font-medium">coussinets d'allaitement</a>.</p></div>`,
    benefits: [
      "Forme anatomique sans frottement sur le mamelon",
      "Recueille le lait qui s'écoule entre les tétées",
      "Réutilisables — économiques et écologiques",
      "Certifications Koala Babycare attestant la qualité",
      "Discrètes sous le soutien-gorge",
    ],
    faqs: [
      { q: "Koala Babycare est-elle une marque fiable ?", a: "Oui, Koala Babycare est une marque spécialisée dans les soins maternité et bébé, reconnue pour ses certifications et la sélection rigoureuse de ses matériaux." },
      { q: "Peut-on récupérer le lait recueilli ?", a: "Uniquement si les coques ont été stérilisées avant le port et conservées à bonne température. Pour un usage alimentaire sûr, préférez un système dédié comme des coupelles-recueils." },
      { q: "Comment les différencier des coquillages en nacre ?", a: "Les coques en plastique/silicone sont souples et discrètes ; les coquillages en nacre utilisent les propriétés antibactériennes et cicatrisantes naturelles de la nacre. Les deux ont une fonction proche mais des matières différentes." },
    ],
    meta_title: "Coques allaitement Koala Babycare crevasses | Magic Crochet Kit",
    meta_description: "Coques d'allaitement Koala Babycare, forme anatomique pour soulager les crevasses et recueillir le lait entre les tétées. Réutilisables, certifiées.",
    brand: "Koala Babycare",
  },

  {
    handle: "pots-conservation-lait-maternel",
    title: "Pots de conservation du lait maternel Lansinoh 4x160 ml",
    subtitle: "Pots de conservation Lansinoh 160 ml",
    description: `<p>Les pots de <a href="/collections/conservation-lait-maternel" class="text-primary hover:underline">conservation du lait maternel</a> de <a href="/marques/lansinoh" class="text-primary hover:underline">Lansinoh</a> permettent de stocker le lait tiré au réfrigérateur ou au congélateur, dans des contenants dédiés garantissant l'étanchéité et la qualité nutritionnelle du lait. Vendus par lot de 4 pots de 160 ml.</p>

<h2>Les points forts</h2>
<ul>
<li>Lot de 4 pots de 160 ml — capacité adaptée aux tétées courantes</li>
<li>Disque d'étanchéité en silicone, fermeture hermétique sans fuite</li>
<li>Col large compatible avec tous les <a href="/collections/tire-lait" class="text-primary hover:underline">tire-lait</a> et tétines Lansinoh</li>
<li>Sans BPA ni BPS — sécurité sanitaire garantie</li>
<li>Graduation précise pour mesurer le volume tiré ou restitué</li>
</ul>

<h2>Pourquoi choisir des pots plutôt que des sachets ?</h2>
<p>Les pots sont réutilisables et donc plus économiques sur le long terme. Ils se manipulent plus facilement, se lavent au lave-vaisselle, et peuvent servir à tirer, conserver et donner le lait avec la même contenance — pas besoin de transvaser. En revanche, ils prennent plus de place au congélateur que les sachets empilables.</p>

<h2>Durée de conservation du lait maternel</h2>
<ul>
<li>Température ambiante : 4 heures maximum</li>
<li>Réfrigérateur (4°C) : 4 jours</li>
<li>Congélateur (-18°C) : jusqu'à 6 mois</li>
<li>Lait décongelé : 24 heures au frigo, à ne pas recongeler</li>
</ul>

<h2>Entretien</h2>
<p>Stérilisation possible avant première utilisation. Rinçage à l'eau tiède puis lavage au lave-vaisselle (panier supérieur) ou à la main. Sécher soigneusement avant rangement ou réutilisation.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/lansinoh" class="text-primary hover:underline font-medium">Lansinoh</a>, nos <a href="/collections/tire-lait" class="text-primary hover:underline font-medium">tire-lait</a> et nos <a href="/collections/biberons-tetines" class="text-primary hover:underline font-medium">biberons et tétines</a>.</p></div>`,
    benefits: [
      "Lot de 4 pots de 160 ml, graduation précise",
      "Disque d'étanchéité silicone — fermeture hermétique sans fuite",
      "Col large compatible toute la gamme Lansinoh (tire-lait + tétines)",
      "Sans BPA ni BPS",
      "Réutilisables et lavables au lave-vaisselle",
    ],
    faqs: [
      { q: "Pots ou sachets, lequel choisir ?", a: "Les pots sont réutilisables, économiques et pratiques (tirer, conserver, donner avec un seul contenant). Les sachets prennent moins de place au congélateur et sont pré-stérilisés. Beaucoup de mamans utilisent les deux selon le volume à conserver." },
      { q: "Combien de temps le lait se conserve-t-il ?", a: "4 h à température ambiante, 4 jours au réfrigérateur (4°C), jusqu'à 6 mois au congélateur (-18°C). Une fois décongelé, le lait doit être consommé dans les 24 h et ne jamais être recongelé." },
      { q: "Les pots sont-ils compatibles avec un autre tire-lait ?", a: "Le col large est conçu pour la gamme Lansinoh. Avec certains adaptateurs, ils peuvent être utilisés avec d'autres tire-lait, mais la compatibilité n'est garantie qu'avec Lansinoh." },
    ],
    meta_title: "Pots conservation lait maternel Lansinoh 4x160ml | Magic Crochet Kit",
    meta_description: "Pots Lansinoh pour conservation du lait maternel, lot de 4 x 160 ml. Disque silicone hermétique, sans BPA, compatibles tire-lait Lansinoh.",
    brand: "Lansinoh",
  },

  {
    handle: "sachets-conservation-lait-maternel",
    title: "Sachets de conservation du lait maternel Lansinoh (lot 25)",
    subtitle: "Sachets Lansinoh pour lait maternel",
    description: `<p>Les sachets de <a href="/collections/conservation-lait-maternel" class="text-primary hover:underline">conservation du lait maternel</a> <a href="/marques/lansinoh" class="text-primary hover:underline">Lansinoh</a> sont pré-stérilisés et prêts à l'emploi pour stocker le lait tiré au réfrigérateur ou au congélateur. Vendus par lot de 25, ils offrent une solution nomade, hygiénique et compacte pour constituer une réserve de lait.</p>

<h2>Les points forts</h2>
<ul>
<li>Pré-stérilisés — prêts à l'emploi dès l'ouverture</li>
<li>Double jonction hermétique sur les côtés + zip renforcé</li>
<li>Étiquette intégrée pour noter la date et le volume</li>
<li>Polyéthylène de qualité alimentaire, sans plastiques nocifs</li>
<li>Compatibles avec les <a href="/collections/tire-lait" class="text-primary hover:underline">tire-lait</a> Lansinoh — tirage direct possible</li>
</ul>

<h2>Pour qui ces sachets sont-ils pensés ?</h2>
<p>Ils conviennent particulièrement aux mamans qui reprennent le travail et constituent une réserve de lait, à celles qui veulent avoir du lait d'avance pour le coucher ou les sorties, et aux vacances / déplacements où le format plat et pré-stérilisé fait gagner de la place et du temps.</p>

<h2>Utilisation</h2>
<p>Ouvrir le sachet par la découpe prédécoupée, remplir directement depuis le tire-lait ou par transvasement, fermer le zip, chasser l'air, inscrire la date. Stocker à plat au congélateur pour un gain de place, puis empiler les sachets gelés. Pour décongeler, placer au réfrigérateur 12 heures avant usage ou passer sous l'eau tiède.</p>

<h2>Durée de conservation</h2>
<ul>
<li>Réfrigérateur (4°C) : 4 jours</li>
<li>Congélateur (-18°C) : jusqu'à 6 mois</li>
<li>Lait décongelé : 24 h au frigo, à ne pas recongeler</li>
<li>Jamais décongeler au micro-ondes (détruit les nutriments)</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/lansinoh" class="text-primary hover:underline font-medium">Lansinoh</a>, nos <a href="/collections/tire-lait" class="text-primary hover:underline font-medium">tire-lait</a> et nos <a href="/collections/biberons-tetines" class="text-primary hover:underline font-medium">biberons et tétines</a>.</p></div>`,
    benefits: [
      "Lot de 25 sachets pré-stérilisés, prêts à l'emploi",
      "Double jonction + zip renforcé — étanchéité maximale",
      "Étiquette intégrée pour noter date et volume",
      "Polyéthylène sans plastiques nocifs",
      "Compatibles avec les tire-lait Lansinoh (tirage direct)",
    ],
    faqs: [
      { q: "Les sachets sont-ils réutilisables ?", a: "Non, les sachets sont à usage unique. C'est ce qui garantit leur pré-stérilisation et leur hygiène. Pour une solution réutilisable, préférez les pots de conservation." },
      { q: "Peut-on tirer directement dans le sachet ?", a: "Oui, avec un tire-lait Lansinoh équipé de l'adaptateur approprié. Cela évite le transvasement et limite le risque de contamination." },
      { q: "Comment décongeler le lait en sachet ?", a: "Idéalement au réfrigérateur 12 h avant usage, ou rapidement sous l'eau tiède (jamais bouillante). Ne jamais passer le sachet au micro-ondes — cela détruit les nutriments et crée des points chauds." },
    ],
    meta_title: "Sachets conservation lait maternel Lansinoh (25) | Magic Crochet Kit",
    meta_description: "Sachets Lansinoh pour conservation du lait maternel, lot de 25 pré-stérilisés. Double zip hermétique, étiquette date intégrée, compatibles tire-lait.",
    brand: "Lansinoh",
  },

  {
    handle: "sachets-conservation-medela-lait-maternel-lot-25",
    title: "Sachets conservation lait maternel Medela (lot de 25)",
    subtitle: "Sachets Medela pour lait maternel",
    description: `<p>Les sachets de <a href="/collections/conservation-lait-maternel" class="text-primary hover:underline">conservation du lait maternel</a> de <a href="/marques/medela" class="text-primary hover:underline">Medela</a> sont conçus pour résister à la congélation et à la décongélation sans compromis sur la qualité du lait. Vendus par lot de 25, ils tiennent debout pour un remplissage facile, puis se posent à plat pour optimiser l'espace au congélateur.</p>

<h2>Les points forts</h2>
<ul>
<li>Lot de 25 sachets ultra résistants scellés à chaud</li>
<li>Double glissière de protection + double paroi — zéro fuite</li>
<li>Tiennent debout pour le remplissage, à plat pour le stockage</li>
<li>Sans BPA — sécurité sanitaire pour le lait maternel</li>
<li>Pochette de transport incluse pour un rangement propre</li>
</ul>

<h2>Pourquoi la double paroi ?</h2>
<p>La double paroi rend les sachets très résistants aux variations de température et aux chocs. Scellés à chaud, ils ne se déchirent pas au congélateur et résistent à plusieurs cycles de manipulation, ce qui limite considérablement le risque de pertes de lait.</p>

<h2>Utilisation et durée de conservation</h2>
<ul>
<li>Remplir en position debout, refermer la double glissière, chasser l'air</li>
<li>Noter la date et le volume sur la zone prévue</li>
<li>Réfrigérateur (4°C) : 4 jours</li>
<li>Congélateur (-18°C) : jusqu'à 6 mois</li>
<li>Décongélation au réfrigérateur (idéal) ou à l'eau tiède</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/medela" class="text-primary hover:underline font-medium">Medela</a>, nos <a href="/collections/tire-lait" class="text-primary hover:underline font-medium">tire-lait</a> et nos <a href="/collections/biberons-tetines" class="text-primary hover:underline font-medium">biberons et tétines</a>.</p></div>`,
    benefits: [
      "Lot de 25 sachets scellés à chaud, ultra résistants",
      "Double glissière + double paroi — étanchéité maximale",
      "Position debout pour le remplissage, à plat pour le stockage",
      "Sans BPA",
      "Pochette de transport incluse",
    ],
    faqs: [
      { q: "Les sachets Medela tiennent-ils vraiment debout ?", a: "Oui, la base renforcée et la double paroi donnent suffisamment de rigidité pour les remplir à la main ou directement depuis un tire-lait sans qu'ils basculent." },
      { q: "Peut-on recongeler un sachet après décongélation ?", a: "Non, jamais. Le lait décongelé doit être consommé dans les 24 h et conservé uniquement au réfrigérateur. Recongeler détruit la structure du lait et favorise le développement bactérien." },
      { q: "Les sachets Medela sont-ils compatibles avec d'autres tire-lait ?", a: "Ils sont optimisés pour la gamme Medela. Avec certains adaptateurs, le tirage direct est possible sur d'autres tire-lait, mais la compatibilité totale n'est garantie qu'avec Medela." },
    ],
    meta_title: "Sachets conservation lait maternel Medela 25 | Magic Crochet Kit",
    meta_description: "Sachets Medela pour conservation du lait maternel, lot de 25. Double glissière + double paroi, sans BPA, tiennent debout. Pochette de transport fournie.",
    brand: "Medela",
  },
]

export default async function rewriteBatch4({ container }: ExecArgs) {
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

  logger.info(`\nBatch 4 done: ${BATCH.length} products rewritten`)
}
