import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Hand-written batch #2 (5 products): bolas de grossesse (ange, éléphant,
 * ethnique, fleur, Mamijux pieds argent).
 *
 * Internal linking: anchor text matches the target page's primary keyword.
 *   - /collections/bola-de-grossesse  => "bola de grossesse" / "bolas de grossesse"
 *   - /collections/bijoux             => "bijoux de maternité"
 *   - /collections/soins-grossesse    => "soins grossesse"
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
}

const BATCH: Rewrite[] = [
  {
    handle: "bola-de-grossesse-ange",
    title: "Bola de grossesse anges pieds chaîne acier",
    subtitle: "Bola de grossesse pendentif pieds d'ange",
    description: `<p>Ce <a href="/collections/bola-de-grossesse" class="text-primary hover:underline">bola de grossesse</a> est un pendentif sphérique argenté de 20 mm orné de petits pieds d'ange dorés et de zircones scintillantes. Sa bille intérieure tinte à chaque mouvement — un son que bébé commence à percevoir dès la 20e semaine et qui deviendra un repère apaisant après la naissance.</p>

<h2>Les points forts</h2>
<ul>
<li>Sphère musicale de 20 mm au tintement doux et régulier</li>
<li>Pieds d'ange dorés finement ciselés, sertis de zircones</li>
<li>Chaîne en acier inoxydable hypoallergénique</li>
<li>Motif symbolique évoquant la protection et l'arrivée de bébé</li>
<li>Bijou à transmettre à bébé après la naissance, accroché au berceau ou cousu dans le doudou</li>
</ul>

<h2>Un lien sonore avec bébé</h2>
<p>À partir de la 20e semaine de grossesse, bébé perçoit les sons extérieurs à travers le liquide amniotique. En portant ce bola au quotidien, vous tissez un lien sonore : le tintement régulier devient familier, rassurant, reconnaissable. Après la naissance, le même son — accroché au berceau ou au landau — apaise le nouveau-né en lui rappelant son environnement intra-utérin.</p>

<h2>La symbolique des pieds d'ange</h2>
<p>Les pieds d'ange représentent la douceur et la protection de la nouvelle vie. Les zircones apportent une touche lumineuse qui sublime la finition argentée du pendentif. Ce motif en fait un bijou de maternité à la fois décoratif et porteur de sens, à offrir ou à s'offrir.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> parcourez nos autres <a href="/collections/bola-de-grossesse" class="text-primary hover:underline font-medium">bolas de grossesse</a> et notre sélection de <a href="/collections/bijoux" class="text-primary hover:underline font-medium">bijoux de maternité</a>.</p></div>`,
    benefits: [
      "Sphère musicale 20 mm au tintement doux",
      "Pieds d'ange dorés sertis de zircones",
      "Chaîne en acier inoxydable hypoallergénique",
      "Son perceptible par bébé dès la 20e semaine",
      "Bijou symbolique à transmettre après la naissance",
    ],
    faqs: [
      { q: "À partir de quel mois porter le bola ?", a: "Dès le début de la grossesse pour vous habituer au tintement. Bébé commencera à le percevoir à la 20e semaine, quand son audition est suffisamment développée." },
      { q: "La chaîne en acier est-elle hypoallergénique ?", a: "Oui. L'acier inoxydable utilisé est sans nickel libéré, il convient aux peaux sensibles et ne noircit pas au contact de la transpiration." },
      { q: "Que faire du bola après la naissance ?", a: "Accrochez-le au berceau, au landau ou cousez-le dans le doudou. Le son familier, reconnu depuis la grossesse, apaise bébé lors des moments d'éveil et d'endormissement." },
    ],
    meta_title: "Bola grossesse pieds d'ange argenté zircones | Magic Crochet Kit",
    meta_description: "Bola de grossesse argenté orné de pieds d'ange dorés et zircones. Sphère musicale 20 mm, chaîne acier hypoallergénique. Perçu par bébé dès 20 semaines.",
  },

  {
    handle: "bola-de-grossesse-elephant",
    title: "Bola de grossesse éléphant argenté et doré",
    subtitle: "Bola de grossesse bicolore motif éléphant",
    description: `<p>Ce <a href="/collections/bola-de-grossesse" class="text-primary hover:underline">bola de grossesse</a> bicolore associe l'argenté brillant et l'or chaleureux sur un motif d'éléphant — animal vénéré pour sa sagesse, sa mémoire et son instinct maternel. La sphère de 20 mm renferme un carillon mélodieux qui accompagne chaque mouvement au quotidien.</p>

<h2>Les points forts</h2>
<ul>
<li>Sphère musicale 20 mm au tintement enveloppant</li>
<li>Design bichromatique argent et or — s'assortit à toutes les tenues</li>
<li>Motif éléphant, symbole universel de protection maternelle</li>
<li>Son perçu par bébé à partir de la 20e semaine de grossesse</li>
<li>Bijou de maternité à garder comme souvenir et à transmettre à bébé</li>
</ul>

<h2>Un tintement qui crée le lien</h2>
<p>Dès la 20e semaine, le système auditif de bébé est assez développé pour percevoir les sons extérieurs. Porté régulièrement, ce bola devient une musique familière que bébé reconnaîtra à la naissance. Accroché au berceau après l'accouchement, il prolonge cette sensation rassurante pendant les premiers mois.</p>

<h2>La symbolique de l'éléphant</h2>
<p>Dans de nombreuses cultures, l'éléphant incarne la sagesse, la protection et le lien entre les générations — particulièrement entre mère et petit. Le contraste argent-or évoque l'équilibre entre deux énergies, en écho à la dualité de la maternité qui transforme et renforce à la fois.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> parcourez nos autres <a href="/collections/bola-de-grossesse" class="text-primary hover:underline font-medium">bolas de grossesse</a> et notre sélection de <a href="/collections/bijoux" class="text-primary hover:underline font-medium">bijoux de maternité</a>.</p></div>`,
    benefits: [
      "Sphère musicale 20 mm bichromatique argent et or",
      "Motif éléphant, symbole de protection et sagesse",
      "Carillon mélodieux à chaque mouvement",
      "Son perceptible par bébé dès la 20e semaine",
      "Bijou à transmettre comme souvenir de grossesse",
    ],
    faqs: [
      { q: "Le bola s'associe-t-il à d'autres bijoux ?", a: "Oui — la finition bicolore argent-or en fait un pendentif polyvalent, facile à assortir à la plupart des autres bijoux, qu'ils soient argentés ou dorés." },
      { q: "Quelle longueur de chaîne choisir ?", a: "Traditionnellement, 100 à 114 cm pour que le bola repose sur le bas-ventre, à hauteur de bébé. Une chaîne plus courte reste portable mais le son se propage moins bien." },
      { q: "Comment entretenir la finition bicolore ?", a: "Essuyez avec un chiffon doux après chaque port. Évitez l'eau, le parfum et les produits chimiques qui pourraient ternir les métaux." },
    ],
    meta_title: "Bola grossesse éléphant bicolore argent or | Magic Crochet Kit",
    meta_description: "Bola de grossesse bicolore argent et or, motif éléphant symbole de protection. Sphère musicale 20 mm, son perçu par bébé dès 20 semaines.",
  },

  {
    handle: "bola-de-grossesse-ethnique",
    title: "Bola de grossesse motif ethnique bleu et bordeaux",
    subtitle: "Bola de grossesse géométrique coloré",
    description: `<p>Ce <a href="/collections/bola-de-grossesse" class="text-primary hover:underline">bola de grossesse</a> affiche des motifs géométriques aux teintes bleu foncé et bordeaux sur un fond de métal doré mat. Sa sphère de 20 à 25 mm renferme une bille qui tinte délicatement à chaque pas — un son que bébé perçoit à partir de la 20e semaine et qu'il reconnaîtra après la naissance.</p>

<h2>Les points forts</h2>
<ul>
<li>Sphère musicale 20-25 mm au tintement ancestral</li>
<li>Motifs géométriques bleu foncé et bordeaux sur métal doré mat</li>
<li>Inspiration ethnique — bijou singulier, loin du bola classique</li>
<li>Finition métal doré mat, plus discrète qu'un or brillant</li>
<li>Bijou de grossesse à transmettre après la naissance</li>
</ul>

<h2>Un rituel sonore au quotidien</h2>
<p>En portant ce bola chaque jour, vous installez un rituel sonore qui accompagne la grossesse. Le tintement régulier, entendu par bébé à travers le liquide amniotique dès la 20e semaine, devient un repère rassurant. Après l'accouchement, ce même son — près du berceau — aide à recréer le cocon sensoriel que bébé connaissait avant sa naissance.</p>

<h2>Une inspiration ancestrale</h2>
<p>Les motifs géométriques s'inspirent des bijoux traditionnels que portaient les mères à travers les cultures. Ce bola prend ainsi la dimension d'un talisman, un pont symbolique entre les générations et un objet de transmission.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> nos autres <a href="/collections/bola-de-grossesse" class="text-primary hover:underline font-medium">bolas de grossesse</a> et nos <a href="/collections/soins-grossesse" class="text-primary hover:underline font-medium">soins grossesse</a> pour accompagner chaque étape.</p></div>`,
    benefits: [
      "Sphère musicale 20-25 mm, tintement délicat",
      "Motifs géométriques bleu foncé et bordeaux sur métal doré mat",
      "Design original, moins classique qu'un bola argenté ou doré",
      "Son perceptible par bébé dès la 20e semaine",
      "Bijou de transmission, à confier à bébé après la naissance",
    ],
    faqs: [
      { q: "Le bola ethnique se porte-t-il au quotidien ?", a: "Oui, les matériaux résistent à un port régulier. Évitez simplement le contact prolongé avec l'eau (douche, piscine) et les produits cosmétiques qui peuvent ternir la finition." },
      { q: "Quelle taille de sphère choisir ?", a: "Les sphères de 20 à 25 mm offrent un tintement bien audible sans alourdir le cou. En dessous de 15 mm, le son peut être trop discret pour que bébé le perçoive distinctement." },
      { q: "Peut-on l'offrir en baby shower ?", a: "Absolument. C'est l'un des cadeaux de baby shower les plus symboliques : la future maman le portera pendant toute la grossesse, puis le transmettra à bébé." },
    ],
    meta_title: "Bola grossesse motif ethnique bleu bordeaux | Magic Crochet Kit",
    meta_description: "Bola de grossesse original aux motifs géométriques bleu foncé et bordeaux sur métal doré mat. Sphère musicale 20-25 mm, son perçu dès 20 semaines.",
  },

  {
    handle: "bola-de-grossesse-fleur",
    title: "Bola de grossesse fleur dorée et émail vert",
    subtitle: "Bola de grossesse fleur émaillée verte",
    description: `<p>Ce <a href="/collections/bola-de-grossesse" class="text-primary hover:underline">bola de grossesse</a> est orné d'une fleur en émail vert profond rehaussée de lignes dorées. La sphère musicale qu'il abrite tinte doucement à chaque mouvement — un son que bébé entend à partir de la 20e semaine de grossesse et qui l'accompagnera ensuite dans son berceau.</p>

<h2>Les points forts</h2>
<ul>
<li>Sphère musicale au tintement enveloppant</li>
<li>Fleur en émail vert profond, contours dorés éclatants</li>
<li>Motif floral symbolique d'éclosion et de vie naissante</li>
<li>Son perçu par bébé dès la 20e semaine</li>
<li>Bijou facile à entretenir, résistant au port quotidien</li>
</ul>

<h2>Un bijou symbolique d'éclosion</h2>
<p>La fleur est un symbole universel de vie qui s'ouvre, de beauté et d'épanouissement. Portée pendant la grossesse, elle évoque la transformation du corps et l'arrivée d'une nouvelle vie. L'émail vert profond est traditionnellement associé à la nature, à la croissance et au bien-être — un ensemble qui fait écho à l'expérience de la maternité.</p>

<h2>Comment l'entretenir</h2>
<p>Essuyez avec un chiffon doux après chaque port. Évitez l'eau prolongée, les parfums et les produits chimiques qui pourraient altérer l'émail ou la finition dorée. Rangez-le dans une pochette en tissu pour éviter les rayures.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> découvrez nos autres <a href="/collections/bola-de-grossesse" class="text-primary hover:underline font-medium">bolas de grossesse</a> et nos <a href="/collections/bijoux" class="text-primary hover:underline font-medium">bijoux de maternité</a>.</p></div>`,
    benefits: [
      "Sphère musicale au tintement doux",
      "Fleur en émail vert profond et contours dorés",
      "Motif symbolique d'éclosion et de vie naissante",
      "Son perceptible par bébé dès la 20e semaine",
      "Finition émaillée résistante, facile à entretenir",
    ],
    faqs: [
      { q: "L'émail est-il fragile ?", a: "L'émail à froid utilisé sur les bijoux est stable au port quotidien. Évitez cependant les chocs directs, le contact prolongé avec l'eau et les produits abrasifs pour préserver l'éclat des couleurs." },
      { q: "Peut-on le porter en permanence ?", a: "Oui — c'est même recommandé pour que bébé associe le tintement à la présence de maman. Retirez-le simplement pour la douche et la nuit (pour le confort du sommeil)." },
      { q: "Convient-il en cadeau de baby shower ?", a: "C'est un choix délicat et symbolique : la future maman le portera pendant plusieurs mois puis le transmettra à bébé. Un cadeau à forte valeur émotionnelle." },
    ],
    meta_title: "Bola grossesse fleur émail vert et doré | Magic Crochet Kit",
    meta_description: "Bola de grossesse orné d'une fleur en émail vert profond et contours dorés. Sphère musicale, son perceptible par bébé dès la 20e semaine.",
  },

  {
    handle: "bola-de-grossesse-mamijux-pieds-argent",
    title: "Bola de grossesse Mamijux pieds de bébé argenté",
    subtitle: "Bola Mamijux pendentif pieds de bébé",
    description: `<p>Ce <a href="/collections/bola-de-grossesse" class="text-primary hover:underline">bola de grossesse</a> Mamijux est un pendentif sphérique argenté orné de petits pieds de bébé en relief. Son carillon intérieur diffuse un tintement apaisant à chaque pas — un son que bébé perçoit dès la 20e semaine à travers le liquide amniotique et qu'il reconnaît ensuite à la naissance.</p>

<h2>Les points forts</h2>
<ul>
<li>Pendentif en cuivre argenté premium, finition brillante</li>
<li>Petits pieds de bébé en relief — motif iconique de la marque Mamijux</li>
<li>Chaîne longue de 110 cm, adaptée à l'évolution de la silhouette</li>
<li>Carillon intérieur au tintement régulier et doux</li>
<li>Son audible par bébé dès la 20e semaine de grossesse</li>
</ul>

<h2>Un bijou pour toute la grossesse</h2>
<p>La chaîne longue de 110 cm permet au pendentif de reposer naturellement sur le bas-ventre, à hauteur de bébé — position idéale pour que le son se propage bien à travers la paroi abdominale. Au fur et à mesure que la silhouette évolue, la chaîne reste adaptée sans besoin d'ajustement.</p>

<h2>Un souvenir qui prolonge le lien</h2>
<p>Après la naissance, accrochez le bola au berceau ou au landau : bébé reconnaîtra instantanément le tintement familier, ce qui l'aide à s'endormir et à se calmer pendant les premiers mois. C'est un bijou de transmission, à conserver précieusement ou à offrir plus tard à l'enfant devenu grand.</p>

<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> nos autres <a href="/collections/bola-de-grossesse" class="text-primary hover:underline font-medium">bolas de grossesse</a> et notre sélection de <a href="/collections/bijoux" class="text-primary hover:underline font-medium">bijoux de maternité</a>.</p></div>`,
    benefits: [
      "Cuivre argenté premium, finition brillante",
      "Motif petits pieds de bébé en relief (signature Mamijux)",
      "Chaîne longue 110 cm adaptée à toute la grossesse",
      "Carillon audible par bébé dès la 20e semaine",
      "Bijou de transmission à garder après la naissance",
    ],
    faqs: [
      { q: "Mamijux est-elle une marque reconnue ?", a: "Oui, Mamijux est une marque italienne spécialisée dans les bijoux de grossesse. Elle est connue pour la qualité de ses bolas et la finesse de leurs motifs." },
      { q: "La chaîne de 110 cm est-elle ajustable ?", a: "La longueur de 110 cm est pensée pour s'adapter sans réglage à toute la durée de la grossesse. Vous pouvez éventuellement la raccourcir chez un bijoutier si vous souhaitez un port plus près du cou." },
      { q: "Le cuivre argenté noircit-il avec le temps ?", a: "Comme tous les métaux argentés, il peut se ternir légèrement. Un essuyage régulier avec un chiffon doux et un rangement dans une pochette tissu préservent l'éclat du pendentif." },
    ],
    meta_title: "Bola grossesse Mamijux pieds bébé argenté | Magic Crochet Kit",
    meta_description: "Bola de grossesse Mamijux, pendentif argenté aux petits pieds de bébé en relief, chaîne 110 cm. Son perceptible dès la 20e semaine de grossesse.",
  },
]

export default async function rewriteBatch2({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  for (const r of BATCH) {
    const existing = await pg.raw(`SELECT id, metadata FROM product WHERE handle = ? AND deleted_at IS NULL LIMIT 1`, [r.handle])
    const row = existing.rows?.[0]
    if (!row) { logger.warn(`  ! not found: ${r.handle}`); continue }

    const newMeta = {
      ...(row.metadata || {}),
      benefits: r.benefits,
      faqs: r.faqs,
      meta_title: r.meta_title,
      meta_description: r.meta_description,
    }

    const params: any[] = [r.description, JSON.stringify(newMeta)]
    let setClause = "description = ?, metadata = ?::jsonb"
    if (r.title) { setClause += ", title = ?"; params.push(r.title) }
    if (r.subtitle) { setClause += ", subtitle = ?"; params.push(r.subtitle) }
    params.push(row.id)

    await pg.raw(`UPDATE product SET ${setClause} WHERE id = ?`, params)
    logger.info(`  + ${r.handle}`)
  }

  logger.info(`\nBatch 2 done: ${BATCH.length} products rewritten`)
}
