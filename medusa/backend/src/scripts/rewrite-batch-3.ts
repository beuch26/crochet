import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Hand-written batch #3 (5 products): dernier bola (pierre de lune) + 4 bouts
 * de sein / aides à la mise au sein.
 *
 * Internal linking SEO (anchor = target keyword):
 *   /collections/bout-de-sein                 => "bouts de sein"
 *   /collections/soins-allaitement            => "soins allaitement"
 *   /collections/coquillage-allaitement-nacre => "coquillages d'allaitement en nacre"
 *   /collections/tire-lait                    => "tire-lait"
 *   /collections/bola-de-grossesse            => "bola de grossesse"
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
    handle: "bola-de-grossesse-pierre-de-lune",
    title: "Bola de grossesse arbre de vie argenté et bille dorée",
    subtitle: "Bola de grossesse motif arbre de vie ajouré",
    description: `<p>Ce <a href="/collections/bola-de-grossesse" class="text-primary hover:underline">bola de grossesse</a> au motif arbre de vie associe une sphère argentée polie à une bille dorée visible par les ajourés. Son tintement, doux et régulier, accompagne chaque mouvement — un son que bébé perçoit à partir de la 20e semaine de grossesse.</p>

<h2>Les points forts</h2>
<ul>
<li>Sphère argentée polie, motif arbre de vie finement ajouré</li>
<li>Bille dorée intérieure visible à travers le motif</li>
<li>Tintement doux et enveloppant à chaque mouvement</li>
<li>Son perçu par bébé dès la 20e semaine</li>
<li>Bijou de maternité à transmettre après la naissance</li>
</ul>

<h2>La symbolique de l'arbre de vie</h2>
<p>L'arbre de vie est l'un des motifs les plus anciens et universels : il représente les racines familiales, la croissance, le lien entre les générations. En bola de grossesse, il prend une résonance particulière — une invitation à tisser un premier lien sonore avec l'enfant qui grandit, avant même sa naissance.</p>

<h2>Un repère sonore pour bébé</h2>
<p>Porté au quotidien, le bola devient une musique familière que bébé apprend à reconnaître à travers le liquide amniotique. Après la naissance, accroché au berceau ou cousu dans le doudou, le même tintement aide à recréer un environnement sonore apaisant pendant les premières semaines.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> nos autres <a href="/collections/bola-de-grossesse" class="text-primary hover:underline font-medium">bolas de grossesse</a> et notre sélection de <a href="/collections/bijoux" class="text-primary hover:underline font-medium">bijoux de maternité</a>.</p></div>`,
    benefits: [
      "Sphère argentée polie, motif arbre de vie ajouré",
      "Bille dorée intérieure visible à travers le motif",
      "Tintement doux et régulier",
      "Son audible par bébé dès la 20e semaine",
      "Bijou symbolique à transmettre après la naissance",
    ],
    faqs: [
      { q: "Que signifie l'arbre de vie ?", a: "C'est un symbole universel présent dans de nombreuses cultures. Il évoque les racines familiales, la croissance et le lien entre les générations — une image particulièrement forte pendant la grossesse." },
      { q: "Bébé entend-il vraiment le bola ?", a: "Oui. À partir de la 20e semaine, l'audition de bébé est suffisamment développée pour percevoir les sons extérieurs à travers le liquide amniotique. Le tintement proche du ventre devient un repère familier." },
      { q: "Comment entretenir la finition argentée ?", a: "Essuyez avec un chiffon doux après chaque port. Évitez l'eau prolongée, le parfum et les produits chimiques. Rangez dans une pochette en tissu pour préserver l'éclat." },
    ],
    meta_title: "Bola grossesse arbre de vie argenté bille dorée | Magic Crochet Kit",
    meta_description: "Bola de grossesse argenté au motif arbre de vie ajouré, bille dorée intérieure. Son perçu par bébé dès la 20e semaine. Bijou à transmettre après la naissance.",
  },

  {
    handle: "bout-de-sein-en-silicone-pour-maman",
    title: "Bout de sein en silicone transparent pour l'allaitement",
    subtitle: "Bout de sein en silicone alimentaire",
    description: `<p>Ce <a href="/collections/bout-de-sein" class="text-primary hover:underline">bout de sein</a> en silicone souple transparent protège les mamelons sensibles et facilite la tétée en cas de difficulté de mise au sein. Sa découpe en pétales préserve un contact peau à peau maximal entre la maman et bébé.</p>

<h2>Les points forts</h2>
<ul>
<li>Silicone alimentaire souple, transparent et sans odeur</li>
<li>Découpe en pétales — maintient le contact peau à peau</li>
<li>Trous de sortie adaptés à un débit variable</li>
<li>Discret et léger, presque invisible à la tétée</li>
<li>Solution d'appoint pour crevasses, mamelons plats ou ombiliqués</li>
</ul>

<h2>Quand l'utiliser ?</h2>
<p>Le bout de sein est une solution temporaire. Il est recommandé en cas de crevasses douloureuses, de mamelons plats ou ombiliqués, de prématurité ou lorsque bébé a du mal à prendre le sein. L'objectif reste de revenir à une tétée directe dès que possible — idéalement accompagné par une sage-femme ou une consultante en lactation.</p>

<h2>Utilisation et entretien</h2>
<p>Avant utilisation : vérifier que le bout de sein est propre et sec. Le centrer sur le mamelon avant la tétée. Après chaque usage : rincer à l'eau tiède savonneuse et sécher soigneusement. Une stérilisation par jour est conseillée (vapeur, micro-ondes ou ébullition 5 minutes). Remplacer en cas de déchirure ou de déformation.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a> et nos <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a> pour soulager les mamelons sensibles.</p></div>`,
    benefits: [
      "Silicone alimentaire souple, transparent et sans odeur",
      "Découpe en pétales — contact peau à peau maximal",
      "Débit variable adapté au rythme de succion de bébé",
      "Discret et léger à porter",
      "Compatible avec la stérilisation vapeur et l'ébullition",
    ],
    faqs: [
      { q: "Combien de temps peut-on utiliser un bout de sein ?", a: "Idéalement sur quelques jours à quelques semaines, le temps de laisser les crevasses cicatriser ou le mamelon reprendre sa forme. Un usage prolongé peut réduire la stimulation et donc la lactation." },
      { q: "Comment choisir la bonne taille ?", a: "Mesurez le diamètre de votre mamelon en érection. S (16-20 mm), M (20-24 mm), L (24-28 mm). Un bout de sein trop grand peut gêner la prise, trop petit peut pincer." },
      { q: "Comment stériliser le bout de sein ?", a: "Stérilisation vapeur (stérilisateur ou micro-ondes), ou ébullition 5 minutes dans l'eau. Évitez les températures extrêmes qui peuvent fragiliser le silicone sur le long terme." },
    ],
    meta_title: "Bout de sein silicone transparent allaitement | Magic Crochet Kit",
    meta_description: "Bout de sein en silicone souple transparent, découpe en pétales, contact peau à peau préservé. Débit variable, compatible stérilisateur.",
  },

  {
    handle: "bouts-de-sein-contact",
    title: "Bouts de sein Contact Lansinoh (silicone, 2 tailles)",
    subtitle: "Bouts de sein Lansinoh Contact",
    description: `<p>Les <a href="/collections/bout-de-sein" class="text-primary hover:underline">bouts de sein</a> Contact de <a href="/marques/lansinoh" class="text-primary hover:underline">Lansinoh</a> facilitent la mise au sein et soulagent les mamelons sensibles ou ombiliqués. Disponibles en 20 mm et 24 mm, ils préservent le contact peau à peau essentiel à une tétée réussie et au lien mère-enfant.</p>

<h2>Les points forts</h2>
<ul>
<li>Silicone ultrafin et transparent, presque invisible à la tétée</li>
<li>Deux tailles disponibles : 20 mm et 24 mm, pour s'adapter à l'anatomie</li>
<li>Découpe spécifique préservant le contact peau à peau et la perception de l'odeur</li>
<li>Adaptés aux mamelons plats, ombiliqués, aux crevasses et aux bébés prématurés</li>
<li>Boîte de transport fournie pour un usage nomade</li>
</ul>

<h2>Pour qui ce bout de sein est-il pensé ?</h2>
<p>Les bouts de sein Contact conviennent particulièrement aux mamans dont les mamelons sont plats ou ombiliqués, qui traversent une période de crevasses douloureuses, ou dont le bébé présente un frein de langue (lingual) ou des lèvres (labial) rendant la prise du sein difficile. Ils sont aussi adaptés aux bébés prématurés pour qui le silicone, plus ferme que le mamelon, facilite la prise.</p>

<h2>Utilisation et hygiène</h2>
<p>Vérifier que le bout de sein est propre et sec avant chaque usage. Le placer délicatement sur le mamelon, en le centrant. Après la tétée, nettoyer à l'eau tiède et au savon neutre. Stériliser une fois par jour (vapeur ou ébullition brève). Éviter les hautes températures prolongées qui fragilisent le silicone.</p>

<h2>Accompagnement conseillé</h2>
<p>Le bout de sein est une aide temporaire. En cas de difficultés d'allaitement persistantes, consulter une sage-femme, une consultante en lactation ou un professionnel de santé est la meilleure voie pour adapter la solution à votre situation.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> notre sélection de <a href="/marques/lansinoh" class="text-primary hover:underline font-medium">Lansinoh</a>, les <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a> et les <a href="/collections/coquillage-allaitement-nacre" class="text-primary hover:underline font-medium">coquillages d'allaitement en nacre</a>.</p></div>`,
    benefits: [
      "Silicone ultrafin transparent, préserve le peau à peau",
      "Deux tailles disponibles : 20 mm et 24 mm",
      "Signé Lansinoh — référence mondiale de l'allaitement",
      "Adaptés aux mamelons plats, ombiliqués et aux bébés prématurés",
      "Boîte de transport fournie",
    ],
    faqs: [
      { q: "Comment choisir entre 20 mm et 24 mm ?", a: "Mesurez le diamètre de votre mamelon en érection : moins de 17 mm → 20 mm, entre 17 et 22 mm → 24 mm. En cas de doute, la plus petite taille est souvent plus efficace pour la prise du sein." },
      { q: "Faut-il consulter avant d'utiliser un bout de sein ?", a: "Oui, idéalement. Un bout de sein mal utilisé peut masquer un autre problème (frein de langue, mauvaise position). Une consultante en lactation vous aidera à identifier la cause et à revenir à une tétée directe." },
      { q: "Combien de temps utiliser les bouts de sein Lansinoh ?", a: "Sur une courte période (quelques jours à quelques semaines). L'objectif est de soulager tout en maintenant la production de lait, puis de sevrer progressivement les bouts de sein dès que possible." },
    ],
    meta_title: "Bouts de sein Lansinoh Contact 20 et 24 mm | Magic Crochet Kit",
    meta_description: "Bouts de sein Contact Lansinoh, silicone ultrafin en 2 tailles (20 mm et 24 mm). Pour mamelons plats, ombiliqués, crevasses et bébés prématurés.",
    brand: "Lansinoh",
  },

  {
    handle: "bouts-de-sein-medela-contact-taille-s",
    title: "Bouts de sein Contact Medela taille S (aide à l'allaitement)",
    subtitle: "Bouts de sein Medela Contact taille S",
    description: `<p>Les <a href="/collections/bout-de-sein" class="text-primary hover:underline">bouts de sein</a> Contact de <a href="/marques/medela" class="text-primary hover:underline">Medela</a> sont une solution d'appoint pour les mamans aux mamelons sensibles, secs ou présentant des crevasses. Le silicone ultrafin et la découpe anatomique permettent à bébé de téter tout en préservant le contact peau à peau.</p>

<h2>Les points forts</h2>
<ul>
<li>Silicone ultrafin presque invisible à la tétée</li>
<li>Taille S (moins de 17 mm) pour les mamelons de petite taille</li>
<li>Découpe anatomique — préserve le contact peau à peau et l'odeur de la maman</li>
<li>Sans BPA, sans goût pour bébé</li>
<li>Adaptés aux crevasses, mamelons sensibles et bébés prématurés</li>
</ul>

<h2>Quand les utiliser ?</h2>
<p>En cas de tétée douloureuse liée à des crevasses, de mamelons très sensibles ou irrités, de bébé prématuré peinant à s'accrocher, ou ponctuellement pour laisser la peau cicatriser. Les bouts de sein Medela sont conçus comme une aide temporaire, le temps de retrouver une tétée confortable sans protection.</p>

<h2>Utilisation recommandée</h2>
<p>Positionner le bout de sein, propre et sec, centré sur le mamelon. Stimuler la lactation avant la tétée (massage, expression manuelle, chaleur) facilite l'écoulement. Nettoyer après chaque usage à l'eau tiède savonneuse, stériliser une fois par jour. Remplacer en cas d'usure.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> notre sélection <a href="/marques/medela" class="text-primary hover:underline font-medium">Medela</a>, nos <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a> et les <a href="/collections/tire-lait" class="text-primary hover:underline font-medium">tire-lait</a> pour entretenir la lactation.</p></div>`,
    benefits: [
      "Silicone ultrafin, contact peau à peau préservé",
      "Taille S — pour mamelons de moins de 17 mm",
      "Signé Medela, référence mondiale de l'allaitement",
      "Sans BPA, sans goût",
      "Solution d'appoint pour crevasses et mamelons sensibles",
    ],
    faqs: [
      { q: "Quand utiliser la taille S ?", a: "La taille S est adaptée aux mamelons dont le diamètre est inférieur à 17 mm en érection. Au-delà, préférez la taille M. Un bout de sein trop grand compromet la prise et la stimulation de la lactation." },
      { q: "Le silicone Medela a-t-il un goût pour bébé ?", a: "Non, le silicone utilisé est médical et sans odeur ni goût, ce qui aide bébé à accepter le bout de sein sans refus de tétée." },
      { q: "Les bouts de sein diminuent-ils la lactation ?", a: "Un usage court n'a pas d'impact. Un usage prolongé peut réduire la stimulation et donc la production de lait, d'où l'importance de revenir à une tétée directe dès que possible, éventuellement accompagnée d'un tire-lait." },
    ],
    meta_title: "Bouts de sein Medela Contact taille S | Magic Crochet Kit",
    meta_description: "Bouts de sein Contact Medela en taille S, silicone ultrafin sans BPA. Aide à l'allaitement en cas de crevasses, mamelons sensibles ou bébés prématurés.",
    brand: "Medela",
  },

  {
    handle: "poire-mamelons",
    title: "Poire Latch Assist Lansinoh (mamelons plats ou ombiliqués)",
    subtitle: "Poire d'aide à la prise du sein",
    description: `<p>La poire Latch Assist™ de <a href="/marques/lansinoh" class="text-primary hover:underline">Lansinoh</a> aide à faire ressortir délicatement les mamelons plats ou ombiliqués avant la tétée. En facilitant la prise du sein, elle résout une difficulté courante rencontrée par de nombreuses mamans les premières semaines d'allaitement.</p>

<h2>Les points forts</h2>
<ul>
<li>Aspiration douce et ajustable — fait ressortir le mamelon avant la tétée</li>
<li>Utilisable d'une seule main, pratique à manipuler</li>
<li>Silicone souple sans BPA, sans goût</li>
<li>Livrée avec une boîte de rangement hygiénique</li>
<li>Compatible avec les <a href="/collections/bout-de-sein" class="text-primary hover:underline">bouts de sein</a> Lansinoh</li>
</ul>

<h2>Pour qui ce produit est-il pensé ?</h2>
<p>La Latch Assist s'adresse aux mamans qui rencontrent des difficultés à faire prendre le sein à leur bébé — mamelons plats ou ombiliqués, engorgement rendant les mamelons moins saillants, ou simplement bébé qui peine à accrocher. C'est une aide ponctuelle, à utiliser juste avant la tétée, qui peut suffire à relancer un allaitement bloqué.</p>

<h2>Utilisation pas à pas</h2>
<p>Placer la poire contre le mamelon, presser doucement pour créer une aspiration mesurée, puis relâcher : le mamelon ressort. Mettre bébé immédiatement au sein avant que le mamelon ne rétracte. Nettoyer à l'eau tiède savonneuse après chaque usage. Stérilisation possible à la vapeur ou par ébullition.</p>

<h2>Quand consulter ?</h2>
<p>Si les difficultés persistent malgré l'utilisation de la poire, consultez une sage-femme, une consultante en lactation ou votre pédiatre. Un frein lingual, une mauvaise position ou d'autres facteurs peuvent nécessiter un accompagnement personnalisé.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> la gamme <a href="/marques/lansinoh" class="text-primary hover:underline font-medium">Lansinoh</a>, les <a href="/collections/bout-de-sein" class="text-primary hover:underline font-medium">bouts de sein</a> et les <a href="/collections/soins-allaitement" class="text-primary hover:underline font-medium">soins allaitement</a>.</p></div>`,
    benefits: [
      "Aide les mamelons plats ou ombiliqués à ressortir avant la tétée",
      "Utilisable d'une seule main, aspiration ajustable",
      "Silicone souple sans BPA, sans goût",
      "Boîte de rangement fournie, nomade et hygiénique",
      "Signée Lansinoh — référence mondiale de l'allaitement",
    ],
    faqs: [
      { q: "La poire est-elle douloureuse à utiliser ?", a: "Non, l'aspiration est douce et contrôlée par la pression que vous exercez sur la poire. Elle ne doit jamais être inconfortable — si c'est le cas, réduisez la pression." },
      { q: "Quand l'utiliser précisément ?", a: "Juste avant la tétée, pour faire ressortir le mamelon et faciliter la prise par bébé. Un bref usage (10-15 secondes) suffit généralement." },
      { q: "Peut-on remplacer les bouts de sein par la poire ?", a: "Non, ce sont deux aides complémentaires. La poire prépare la prise, les bouts de sein protègent pendant la tétée en cas de crevasses. Certaines mamans utilisent les deux selon la situation." },
    ],
    meta_title: "Poire Latch Assist Lansinoh mamelons plats | Magic Crochet Kit",
    meta_description: "Poire Latch Assist Lansinoh pour faire ressortir mamelons plats ou ombiliqués avant la tétée. Silicone sans BPA, utilisable d'une seule main.",
    brand: "Lansinoh",
  },
]

export default async function rewriteBatch3({ container }: ExecArgs) {
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

  logger.info(`\nBatch 3 done: ${BATCH.length} products rewritten`)
}
