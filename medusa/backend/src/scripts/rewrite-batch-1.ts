import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Hand-written batch #1 (5 products): attache-tetine-bois, attache-tetine-silicone,
 * biberon-pp-natural-wave, tetine-natural-wave, bola-aeonslove-argent.
 * Each rewrite is scoped to the actual facts present in the source description.
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

const SISTER_BLOCK = (links: Array<{ label: string; href: string }>) =>
  `<div class="mt-6 p-5 bg-bg-light rounded-2xl"><p class="text-sm"><strong>Vous aimerez aussi :</strong> ${links.map((l) => `notre sélection de <a href="${l.href}" class="text-primary hover:underline font-medium">${l.label}</a>`).join(" ou ")}.</p></div>`

const BATCH: Rewrite[] = [
  {
    handle: "attache-tetine-en-bois",
    title: "Attache-tétine en bois de hêtre (lot de 5)",
    subtitle: "Attache-tétine en bois naturel pour bébé",
    description: `<p>L'attache-tétine en bois de hêtre garde la tétine de bébé à portée de main tout en offrant un anneau de dentition naturel à mordiller. Vendu en lot de 5, ce set varie les styles pour accompagner chaque tenue et chaque situation du quotidien.</p>

<h2>Les points forts</h2>
<ul>
<li>Bois de hêtre brut, surface lisse sans vernis ni traitement chimique</li>
<li>Fait aussi office d'anneau de dentition — soulage les gencives douloureuses</li>
<li>Lot de 5 pièces pour varier les couleurs et motifs</li>
<li>Clip solide et sûr, fixable sur poussette, porte-bébé ou body</li>
<li>Matériaux écologiques, durables et compostables en fin de vie</li>
</ul>

<h2>Un accessoire deux-en-un</h2>
<p>Au-delà de sa fonction pratique, cet accessoire accompagne les poussées dentaires. Le bois de hêtre est tendre au toucher mais suffisamment résistant pour être mordillé en toute sécurité. Il stimule la motricité fine et la coordination main-œil de bébé au fil des manipulations.</p>

<h2>Entretien</h2>
<p>Nettoyez à l'eau tiède savonneuse et séchez immédiatement avec un chiffon. Évitez le trempage prolongé et le lave-vaisselle pour préserver les fibres du bois. Un passage régulier avec une huile alimentaire (olive, coco) nourrit le bois et prolonge sa durée de vie.</p>

${SISTER_BLOCK([
  { label: "biberons et tétines", href: "/collections/biberons-tetines" },
  { label: "trousses de soin bébé", href: "/collections/trousse-de-soin-bebe" },
])}`,
    benefits: [
      "Bois de hêtre naturel, sans vernis ni substances chimiques",
      "Anneau de dentition — apaise les gencives pendant les poussées",
      "Lot de 5 pièces pour varier les styles",
      "Clip solide fixable sur poussette, porte-bébé ou vêtements",
      "Matériaux durables et écologiques",
    ],
    faqs: [
      { q: "L'attache-tétine en bois est-elle sans danger pour bébé ?", a: "Oui, le bois de hêtre brut non verni est naturellement sûr à mordiller. La longueur respecte la norme EN 12586 (moins de 22 cm). Ne jamais attacher autour du cou de bébé." },
      { q: "Comment l'entretenir ?", a: "À la main avec de l'eau tiède savonneuse, à sécher immédiatement. Évitez le trempage et le lave-vaisselle. Un coup d'huile alimentaire tous les 2-3 mois nourrit le bois." },
      { q: "À partir de quel âge l'utiliser ?", a: "Dès la naissance pour sécuriser la tétine. Comme anneau de dentition, elle est adaptée dès les premières dents (environ 4-6 mois) sous surveillance." },
    ],
    meta_title: "Attache-tétine bois de hêtre (lot 5) | Magic Crochet Kit",
    meta_description: "Attache-tétine en bois de hêtre naturel, lot de 5 pièces. Fait aussi office d'anneau de dentition. Sans vernis ni substances chimiques.",
  },

  {
    handle: "attache-tetine-en-silicone-souple",
    title: "Attache-tétine en silicone souple, clip réglable",
    subtitle: "Attache-tétine en silicone alimentaire",
    description: `<p>L'attache-tétine en silicone souple sécurise la tétine de bébé pour éviter chutes et pertes au quotidien. Le silicone alimentaire est doux, facile à nettoyer et résistant, compatible avec toutes les tétines standard à anneau.</p>

<h2>Les points forts</h2>
<ul>
<li>Silicone alimentaire souple, sans BPA ni phtalates</li>
<li>Clip réglable ergonomique, manipulable d'une seule main</li>
<li>Compatible tétines Avent, MAM, Suavinex, Nuk et autres standards</li>
<li>Grande variété de coloris pastels et tendance</li>
<li>Passe au lave-vaisselle et au stérilisateur</li>
</ul>

<h2>Un accessoire du quotidien</h2>
<p>Utile dès la maternité, il évite que la tétine ne tombe par terre en voiture, en poussette ou au lit. Il la garde propre et à portée de main — particulièrement pratique pendant les poussées dentaires, quand bébé cherche à téter plus fréquemment.</p>

<h2>Sécurité</h2>
<p>La longueur de l'attache respecte la norme européenne EN 12586 (moins de 22 cm). Fixez-le uniquement sur les vêtements de bébé, jamais autour du cou. Vérifiez régulièrement l'état du clip et du cordon.</p>

${SISTER_BLOCK([
  { label: "biberons et tétines", href: "/collections/biberons-tetines" },
  { label: "trousses de soin bébé", href: "/collections/trousse-de-soin-bebe" },
])}`,
    benefits: [
      "Silicone alimentaire souple, sans BPA ni phtalates",
      "Clip réglable manipulable d'une seule main",
      "Compatible toutes les tétines à anneau standard",
      "Passe au lave-vaisselle et au stérilisateur",
      "Conforme à la norme européenne EN 12586",
    ],
    faqs: [
      { q: "Quel est l'âge recommandé ?", a: "Dès la naissance. L'attache-tétine garde la tétine propre et à portée de bébé dès les premières semaines." },
      { q: "Comment la nettoyer ?", a: "À l'eau savonneuse, au lave-vaisselle (panier supérieur) ou au stérilisateur à vapeur. Séchez bien avant rangement." },
      { q: "L'attache est-elle sûre ?", a: "Oui, la longueur respecte la norme EN 12586 (<22 cm). Fixez-la sur les vêtements, jamais autour du cou, et contrôlez régulièrement le clip." },
    ],
    meta_title: "Attache-tétine silicone souple réglable | Magic Crochet Kit",
    meta_description: "Attache-tétine en silicone alimentaire, clip réglable, compatible toutes tétines standard. Sans BPA, passe au stérilisateur. Norme EN 12586.",
  },

  {
    handle: "biberon-pp-natural-wave",
    title: "Biberon NaturalWave 160 ml Lansinoh (allaitement mixte)",
    subtitle: "Biberon péristaltique pour allaitement mixte",
    description: `<p>Le biberon NaturalWave® 160 ml de Lansinoh® est conçu pour l'allaitement mixte. Sa tétine péristaltique en silicone reproduit le mouvement naturel de la langue observé au sein, ce qui facilite les allers-retours entre sein et biberon sans confusion sein-tétine.</p>

<h2>Les points forts</h2>
<ul>
<li>Tétine NaturalWave® péristaltique — mouvement de succion identique au sein</li>
<li>Système Air Ventilation System® anti-colique intégré</li>
<li>Base large et texturée pour une prise en main facile</li>
<li>Corps en polypropylène résistant et sans BPA</li>
<li>160 ml — contenance adaptée aux nouveau-nés (0-4 mois)</li>
</ul>

<h2>Pour qui ce biberon est-il pensé ?</h2>
<p>Pour les mamans qui allaitent et souhaitent donner occasionnellement du lait extrait — reprise du travail, relai de nuit, séparation ponctuelle. Le design réduit le risque de préférence sein ou biberon souvent observé avec des tétines classiques, car bébé retrouve le même effort de succion dans les deux cas.</p>

<h2>Entretien et stérilisation</h2>
<p>Le biberon passe au stérilisateur (vapeur, micro-ondes ou ébullition 5 minutes) et au lave-vaisselle dans le panier supérieur. Vérifiez l'état de la tétine toutes les 4 à 6 semaines et remplacez en cas de déchirure, durcissement ou débit irrégulier.</p>

${SISTER_BLOCK([
  { label: "tire-laits", href: "/collections/tire-lait" },
  { label: "conservation du lait maternel", href: "/collections/conservation-lait-maternel" },
])}`,
    benefits: [
      "Tétine NaturalWave® péristaltique — mouvement identique au sein",
      "Système anti-colique Air Ventilation System®",
      "Polypropylène sans BPA, résistant",
      "Passe au stérilisateur et au lave-vaisselle",
      "Compatible avec les principaux tire-laits Lansinoh®",
    ],
    faqs: [
      { q: "Pourquoi choisir une tétine péristaltique ?", a: "Le mouvement de la langue est identique à celui observé lors de la tétée au sein. Cela limite fortement la confusion sein-tétine et permet à bébé de revenir facilement au sein après un biberon." },
      { q: "Quel débit choisir ?", a: "XS ou S pour les 0-3 mois, M à partir de 3-6 mois, L au-delà de 6 mois. Vérifiez toujours sur votre lot car les débits dépendent aussi du lait utilisé." },
      { q: "Le biberon est-il compatible avec les tire-laits ?", a: "Oui, avec l'ensemble de la gamme Lansinoh® et, via des adaptateurs, avec les principaux tire-laits du marché." },
    ],
    meta_title: "Biberon Lansinoh NaturalWave 160 ml | Magic Crochet Kit",
    meta_description: "Biberon NaturalWave 160 ml Lansinoh pour allaitement mixte. Tétine péristaltique, système anti-colique, sans BPA. Transition sein-biberon sans confusion.",
  },

  {
    handle: "tetine-natural-wave",
    title: "Tétine NaturalWave XS Lansinoh (lot de 2, 0-3 mois)",
    subtitle: "Tétine péristaltique pour allaitement mixte",
    description: `<p>Les tétines NaturalWave® XS de Lansinoh® sont pensées pour l'allaitement mixte dès la naissance. Leur forme péristaltique unique permet à bébé de conserver le même mouvement de succion qu'au sein, ce qui limite la confusion sein-tétine et facilite les allers-retours entre les deux modes d'alimentation.</p>

<h2>Les points forts</h2>
<ul>
<li>Mouvement de succion identique au sein (péristaltique, soutenu par plus de 50 ans de recherche)</li>
<li>Silicone 100 % souple, sans BPA</li>
<li>Débit XS adapté aux nouveau-nés (0-3 mois)</li>
<li>Base large et texturée — bonne prise en bouche</li>
<li>Vendue en lot de 2 pour toujours disposer d'une tétine propre</li>
</ul>

<h2>Comment choisir le débit ?</h2>
<p>Lansinoh® propose toute la gamme pour accompagner la croissance :</p>
<ul>
<li><strong>XS</strong> — 0 à 3 mois, débit très lent</li>
<li><strong>S</strong> — 0 à 6 mois, débit lent</li>
<li><strong>M</strong> — 3 à 6 mois, débit moyen</li>
<li><strong>L</strong> — dès 6 mois, débit rapide</li>
<li><strong>Y</strong> — débit variable pour liquides épais (lait épaissi, jus)</li>
</ul>

<h2>Remplacement et entretien</h2>
<p>Il est recommandé de remplacer les tétines toutes les 4 à 6 semaines, ou dès l'apparition d'une déchirure, d'un durcissement ou d'un débit irrégulier. Stérilisation possible à la vapeur, au micro-ondes ou par ébullition. Passe au lave-vaisselle en panier supérieur.</p>

${SISTER_BLOCK([
  { label: "biberons et tétines", href: "/collections/biberons-tetines" },
  { label: "tire-laits", href: "/collections/tire-lait" },
])}`,
    benefits: [
      "Mouvement péristaltique identique au sein",
      "Silicone souple 100 %, sans BPA",
      "Débit XS adapté aux nouveau-nés (0-3 mois)",
      "Lot de 2 tétines",
      "Compatible biberons Lansinoh® NaturalWave®",
    ],
    faqs: [
      { q: "Quand remplacer la tétine ?", a: "Toutes les 4 à 6 semaines en usage quotidien, ou immédiatement si vous constatez une déchirure, un durcissement ou un débit anormal." },
      { q: "La tétine évite-t-elle la confusion sein-tétine ?", a: "Aucune tétine ne garantit à 100 % l'absence de confusion, mais la forme péristaltique NaturalWave® est reconnue pour la limiter significativement en reproduisant le mouvement naturel de la langue." },
      { q: "Peut-on passer les tétines au lave-vaisselle ?", a: "Oui, dans le panier supérieur. La stérilisation vapeur (stérilisateur ou micro-ondes) ou par ébullition 5 minutes est également adaptée." },
    ],
    meta_title: "Tétine NaturalWave XS Lansinoh (lot 2) | Magic Crochet Kit",
    meta_description: "Tétines NaturalWave XS Lansinoh, lot de 2. Mouvement péristaltique comme au sein, limite la confusion sein-tétine. Débit nouveau-né 0-3 mois.",
  },

  {
    handle: "bola-de-grossesse-aeonslove-argent",
    title: "Bola de grossesse Aeonslove arbre de vie argenté",
    subtitle: "Bola musical arbre de vie en argent",
    description: `<p>Ce bola de grossesse Aeonslove est un pendentif argenté orné d'un arbre de vie finement ajouré. Sa sphère de 20 mm renferme une bille qui tinte doucement à chaque mouvement — un son que bébé commence à percevoir dès la 20e semaine de grossesse et qui l'accompagnera dans son berceau après la naissance.</p>

<h2>Les points forts</h2>
<ul>
<li>Sphère musicale 20 mm au tintement délicat</li>
<li>Pendentif argenté brillant, détails pointillés et ajourés</li>
<li>Motif arbre de vie — symbole des racines et de la continuité</li>
<li>Long cordon ajustable, pour porter à hauteur du ventre</li>
<li>Bijou à transmettre à bébé après la naissance</li>
</ul>

<h2>Un lien sonore avec bébé</h2>
<p>À partir de la 20e semaine, bébé perçoit les sons extérieurs à travers le liquide amniotique. Le tintement régulier du bola, entendu à travers votre corps pendant la grossesse, devient l'un de ses premiers repères sonores. Après la naissance, le même son — accroché au berceau ou cousu dans le doudou — apaise naturellement le nouveau-né.</p>

<h2>Symbolique de l'arbre de vie</h2>
<p>L'arbre de vie ajouré qui orne ce bola représente les racines familiales et la continuité de la vie, un motif universel qui fait écho à l'expérience de la maternité et au lien qui se tisse avec bébé.</p>

${SISTER_BLOCK([
  { label: "bijoux de maternité", href: "/collections/bijoux" },
  { label: "soins grossesse", href: "/collections/soins-grossesse" },
])}`,
    benefits: [
      "Sphère musicale 20 mm au tintement doux",
      "Motif arbre de vie ajouré, finition argentée brillante",
      "Cordon ajustable pour porter à hauteur du ventre",
      "Son perceptible par bébé dès la 20e semaine de grossesse",
      "Bijou symbolique à transmettre à l'enfant après la naissance",
    ],
    faqs: [
      { q: "À partir de quel mois porter le bola ?", a: "Vous pouvez le porter dès le début de la grossesse pour vous familiariser avec son tintement. Bébé commencera à le percevoir vers la 20e semaine, lorsque son audition est suffisamment développée." },
      { q: "Que faire du bola après la naissance ?", a: "Accrochez-le au berceau ou cousez-le dans le doudou. Le son familier, reconnu depuis la grossesse, apaise bébé et devient un repère rassurant." },
      { q: "Comment entretenir le bola ?", a: "Essuyez délicatement avec un chiffon doux. Évitez l'eau et les produits abrasifs qui pourraient ternir la finition argentée." },
    ],
    meta_title: "Bola grossesse Aeonslove arbre de vie argent | Magic Crochet Kit",
    meta_description: "Bola de grossesse Aeonslove, pendentif argenté arbre de vie, sphère musicale 20 mm. Son perceptible dès la 20e semaine — bijou à transmettre à bébé.",
  },
]

export default async function rewriteBatch1({ container }: ExecArgs) {
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

  logger.info(`\nBatch 1 done: ${BATCH.length} products rewritten`)
}
