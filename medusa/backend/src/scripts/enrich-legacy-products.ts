import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Enrich legacy (pre-affiliate-import) products with:
 *   - metadata.benefits (list, rendered above H1)
 *   - metadata.faqs (array, used by FAQ tab + schema.org FAQPage)
 *   - metadata.meta_title / meta_description (SEO, if missing)
 *
 * Does NOT rewrite existing <description> HTML — legacy Medela/PrestaShop
 * content is already usable. Appends a "Questions fréquentes" block if absent.
 * Skips casque-anti-bruit-bebe (user confirmed those are fine) and skips
 * products that already have an affiliate_source (they were generated recently).
 */

type Faq = { q: string; a: string }

const COLLECTION_FAQS: Record<string, Faq[]> = {
  "tire-lait": [
    { q: "Tire-lait manuel ou électrique : lequel choisir ?", a: "Le manuel est idéal pour un usage occasionnel, silencieux et à petit prix. L'électrique (simple ou double) convient mieux à un usage régulier : il est plus rapide, moins fatigant pour la main et permet le double pompage, qui stimule davantage la lactation." },
    { q: "À partir de quand utiliser un tire-lait ?", a: "Dès que l'allaitement est bien installé (généralement après 3-4 semaines). Vous pouvez commencer plus tôt en cas de séparation, de difficultés de mise au sein ou pour stimuler la lactation." },
    { q: "Comment nettoyer et stériliser les pièces ?", a: "Démontez toutes les pièces après chaque utilisation, rincez à l'eau froide puis nettoyez à l'eau chaude savonneuse. Stérilisez au moins une fois par jour (vapeur, micro-ondes ou ébullition 5 min)." },
  ],
  "bout-de-sein": [
    { q: "À quel moment utiliser un bout de sein ?", a: "En cas de crevasses, de mamelons plats ou ombiliqués, de prématurité ou de difficulté de prise du sein. C'est une solution d'appoint : consultez une sage-femme ou conseillère en lactation pour un sevrage progressif." },
    { q: "Comment choisir la bonne taille ?", a: "Mesurez le diamètre de votre mamelon en érection. S (16-20 mm), M (20-24 mm), L (24-28 mm). Un bout de sein trop grand peut gêner la succion, trop petit peut pincer." },
    { q: "Combien de temps peut-on l'utiliser ?", a: "Idéalement sur une courte durée (quelques jours à quelques semaines). Il permet de soulager temporairement tout en maintenant la lactation. Un usage prolongé peut réduire le transfert de lait." },
  ],
  "coussinet-allaitement": [
    { q: "Combien de coussinets prévoir par jour ?", a: "Comptez 4 à 6 coussinets jetables par jour en début d'allaitement, 2 à 4 ensuite. Pour les lavables, prévoyez 8 à 10 paires pour alterner avec le lavage." },
    { q: "Lavables ou jetables : lesquels choisir ?", a: "Les lavables sont plus économiques, écologiques et doux pour la peau. Les jetables sont pratiques en déplacement ou de nuit. Beaucoup de mamans alternent les deux selon les situations." },
    { q: "Comment éviter les irritations ?", a: "Changez de coussinet dès qu'il est humide. Préférez une matière respirante (coton bio, bambou) et séchez bien les mamelons entre les tétées." },
  ],
  "coquillage-allaitement-nacre": [
    { q: "Comment fonctionnent les coquillages d'allaitement ?", a: "Posés sur le mamelon entre les tétées, ils recueillent naturellement les gouttes de lait qui s'écoulent. La nacre a des propriétés apaisantes et favorise la cicatrisation des mamelons fragilisés." },
    { q: "Sont-ils adaptés en cas de crevasses ?", a: "Oui, ils sont particulièrement recommandés en cas de crevasses. Le lait maternel piégé contre la peau, combiné aux propriétés antibactériennes de la nacre, accélère la guérison." },
    { q: "Comment les entretenir ?", a: "Rincez à l'eau tiède après chaque usage, séchez à l'air libre. Stérilisez 1 fois par semaine à l'ébullition ou au stérilisateur vapeur." },
  ],
  "soins-allaitement": [
    { q: "Quand utiliser une crème ou un baume à la lanoline ?", a: "Dès les premiers jours d'allaitement pour prévenir crevasses et sensibilités. Appliquez une fine couche après chaque tétée, inutile de rincer avant la tétée suivante." },
    { q: "Les soins sont-ils sans danger pour bébé ?", a: "Les crèmes à la lanoline médicale pure et les baumes bio sans parfum ni conservateur sont sûrs : bébé peut téter sans rinçage préalable." },
    { q: "Quels produits pour soulager l'engorgement ?", a: "Compresses hydrogel apaisantes, baumes anti-engorgement, douches chaudes et massages doux. En cas de douleur persistante, consultez une conseillère en lactation." },
  ],
  "soutien-gorge-allaitement": [
    { q: "Comment choisir sa taille de soutien-gorge d'allaitement ?", a: "Prenez une taille au-dessus de votre bonnet habituel (la poitrine gonfle avec la montée de lait) et votre tour de dos normal. Les matières stretch s'adaptent aux variations." },
    { q: "Quand acheter son premier soutien-gorge d'allaitement ?", a: "Vers le 7e-8e mois de grossesse. Optez pour un modèle sans armatures, avec larges bretelles et ouverture rapide (clips ou bonnets rabattables)." },
    { q: "Combien de soutiens-gorge prévoir ?", a: "3 à 4 modèles : un pour la journée, un de nuit (sans armatures, coton), un pour le sport et un de rechange. Alternez les lavages et les ports." },
  ],
  "bola-de-grossesse": [
    { q: "À partir de quel mois porter le bola de grossesse ?", a: "Vous pouvez le porter dès le début pour vous familiariser avec le son. Bébé commencera à l'entendre vers la 20e semaine, lorsque son système auditif est suffisamment développé." },
    { q: "Quelle longueur de chaîne choisir ?", a: "Traditionnellement 100 à 114 cm pour que le bola repose sur le bas-ventre, au niveau de bébé. Certaines mamans préfèrent 90 cm." },
    { q: "Que faire du bola après l'accouchement ?", a: "Accrochez-le au berceau ou cousez-le dans le doudou de bébé. Le son familier, reconnu depuis la grossesse, l'apaise et rassure." },
  ],
  "soins-grossesse": [
    { q: "Quels produits utiliser contre les vergetures ?", a: "Des huiles végétales (amande douce, argan, coco) et des crèmes spécifiques enrichies en vitamine E et collagène. Appliquez matin et soir sur ventre, seins, cuisses et hanches dès le début de la grossesse." },
    { q: "Les soins sont-ils sans danger pour bébé ?", a: "Privilégiez des formules bio, sans huiles essentielles (certaines sont contre-indiquées pendant la grossesse), sans parabens, parfums de synthèse ni perturbateurs endocriniens." },
    { q: "Quels soins pour l'accouchement et le post-partum ?", a: "Serviettes post-accouchement, compresses hydrogel, douche intime apaisante, patchs cicatrisants en cas de césarienne. Un kit complet facilite la récupération." },
  ],
  "conservation-lait-maternel": [
    { q: "Combien de temps conserver le lait maternel ?", a: "À température ambiante : 4 h. Au réfrigérateur : 4 jours à 4°C. Au congélateur : 6 mois à -18°C. Une fois décongelé, il se conserve 24 h au frigo et doit être utilisé dans les 2 h à température ambiante." },
    { q: "Sachets ou biberons de conservation : lesquels choisir ?", a: "Les sachets prennent moins de place au congélateur et sont à usage unique (hygiéniques). Les biberons sont réutilisables et plus économiques sur le long terme." },
    { q: "Comment décongeler le lait maternel ?", a: "Au réfrigérateur (idéal, 12 h) ou sous l'eau tiède. Jamais au micro-ondes (détruit les nutriments et provoque des points chauds). Homogénéisez doucement avant usage." },
  ],
  "attache-tetine": [
    { q: "Quel âge pour commencer à utiliser une attache-tétine ?", a: "Dès la naissance. Elle évite que la tétine tombe par terre, se perde ou s'abîme, et garde la tétine propre et à portée de bébé." },
    { q: "L'attache-tétine est-elle sans danger ?", a: "Oui, à condition de respecter la longueur maximale (moins de 22 cm selon la norme EN 12586) et de ne jamais l'attacher autour du cou. Pincez-la sur les vêtements uniquement." },
    { q: "Comment la nettoyer ?", a: "À la main avec du savon doux, ou en machine à 30°C dans un filet. Séchez à plat. Vérifiez régulièrement l'état du mousqueton et du cordon." },
  ],
  "biberons-tetines": [
    { q: "Comment choisir la tétine du biberon ?", a: "Le débit dépend de l'âge de bébé : lent (0-3 mois), moyen (3-6 mois), rapide (6 mois+). Privilégiez une tétine en silicone (plus hygiénique) et de forme anatomique." },
    { q: "Comment stériliser le biberon ?", a: "Stérilisation à la vapeur (stérilisateur ou micro-ondes), à l'eau bouillante (5 min) ou à froid (pastilles). Jusqu'aux 6 mois de bébé, stérilisez après chaque utilisation." },
    { q: "Quelle contenance choisir ?", a: "150-180 ml pour les nouveau-nés, 240-270 ml à partir de 3-4 mois. Au-delà, 300 ml suffisent. Mieux vaut un biberon sous-rempli que débordant." },
  ],
  "trousse-de-soin-bebe": [
    { q: "Que contient une trousse de soin bébé ?", a: "Thermomètre, ciseaux/coupe-ongles à bout rond, mouche-bébé, brosse douce, peigne, parfois un petit miroir et des boîtes pour coton-tiges. Le nécessaire pour les soins quotidiens." },
    { q: "Dès quel âge l'utiliser ?", a: "Dès la maternité. Les ongles de bébé poussent vite et il faut pouvoir dégager les narines en cas de rhume." },
    { q: "Comment entretenir les accessoires ?", a: "Nettoyez à l'eau tiède savonneuse après chaque utilisation, séchez soigneusement. Désinfectez les ciseaux à l'alcool occasionnellement." },
  ],
  "vaisselle-bebe": [
    { q: "À partir de quel âge utiliser de la vaisselle bébé ?", a: "Dès le début de la diversification, vers 4-6 mois. Les assiettes à ventouse et cuillères souples sont adaptées aux premiers repas." },
    { q: "Quel matériau choisir ?", a: "Le silicone alimentaire est incassable, antidérapant et souvent passe au lave-vaisselle. Le bambou est écologique. Évitez le mélamine avant 3 ans (préférez verre, inox ou silicone)." },
    { q: "Passe-t-elle au micro-ondes et au lave-vaisselle ?", a: "La majorité des produits en silicone et inox oui, mais vérifiez les indications du fabricant. Certains ne passent pas au lave-vaisselle pour préserver les couleurs ou les motifs." },
  ],
}

function extractBenefitsFromDesc(desc: string, collectionHandle: string, title: string): string[] {
  const stripped = desc.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").toLowerCase()
  const benefits: string[] = []

  // Rule-based detection
  if (stripped.includes("sans bpa")) benefits.push("Sans BPA — conforme aux normes européennes")
  if (stripped.includes("silicone")) benefits.push("Silicone alimentaire doux et sûr")
  if (stripped.includes("lanoline")) benefits.push("À base de lanoline — apaise et répare la peau sensible")
  if (stripped.includes("bio") || stripped.includes("biologique")) benefits.push("Formule bio, sans perturbateurs endocriniens")
  if (stripped.includes("lavable")) benefits.push("Lavable et réutilisable — plus économique")
  if (stripped.includes("compatible") && stripped.includes("lave-vaisselle")) benefits.push("Compatible lave-vaisselle")
  if (stripped.includes("stérilis")) benefits.push("Stérilisable (vapeur, micro-ondes ou ébullition)")
  if (stripped.includes("coton bio")) benefits.push("Coton bio certifié Oeko-Tex")
  if (stripped.includes("nacre")) benefits.push("Nacre naturelle aux vertus apaisantes")
  if (stripped.includes("hydrogel")) benefits.push("Effet rafraîchissant et apaisant immédiat")
  if (stripped.includes("anti-colique")) benefits.push("Système anti-colique intégré")
  if (stripped.includes("ergonomique")) benefits.push("Forme ergonomique — prise en main facilitée")
  if (stripped.includes("certifié ce") || stripped.includes("norme en")) benefits.push("Certifié CE — normes européennes respectées")

  // Collection-specific fallbacks
  const fallback: Record<string, string[]> = {
    "tire-lait": ["Stimule et maintient la lactation", "Pièces 100 % détachables pour un nettoyage facile"],
    "bout-de-sein": ["Silicone ultrafin — conserve le contact peau à peau", "Découpe anatomique pour une prise du sein naturelle"],
    "coussinet-allaitement": ["Absorption rapide et sans retour d'humidité", "Discret sous les vêtements"],
    "soutien-gorge-allaitement": ["Ouverture à une main pour un allaitement pratique", "Sans armatures — confort optimal jour et nuit"],
    "coquillage-allaitement-nacre": ["Recueille naturellement le lait entre les tétées", "Nacre apaisante et cicatrisante"],
    "soins-allaitement": ["Formule hypoallergénique, sans rinçage nécessaire", "Convient aux peaux les plus sensibles"],
    "soins-grossesse": ["Action ciblée contre les vergetures et tiraillements", "Absorption rapide, fini non gras"],
    "bola-de-grossesse": ["Son doux et apaisant dès la 20e semaine", "Bijou symbolique à transmettre à bébé après la naissance"],
    "attache-tetine": ["Sécurise la tétine — moins de perte, moins de chutes", "Design raffiné à assortir à la tenue de bébé"],
    "conservation-lait-maternel": ["Graduation précise pour mesurer le lait", "Hermétique — préserve les qualités nutritives du lait"],
    "biberons-tetines": ["Compatible avec les principaux tire-laits", "Tétine anti-colique, débit adapté à l'âge"],
    "trousse-de-soin-bebe": ["Tous les essentiels pour les soins du quotidien", "Compact et nomade — se glisse dans le sac à langer"],
    "vaisselle-bebe": ["Antidérapant — bébé peut manger en autonomie", "Bords arrondis sans risque pour bébé"],
  }

  for (const b of fallback[collectionHandle] || []) {
    if (benefits.length >= 5) break
    if (!benefits.some((x) => x.toLowerCase().includes(b.split(" ")[0].toLowerCase()))) benefits.push(b)
  }

  // Ensure at least 3 benefits
  const generic = [
    "Livraison rapide depuis la France",
    "Produit soigneusement sélectionné par Magic Crochet Kit",
  ]
  for (const g of generic) {
    if (benefits.length >= 3) break
    benefits.push(g)
  }

  return benefits.slice(0, 5)
}

function generateFaqHtml(faqs: Faq[]): string {
  return `\n\n<h2>Questions fréquentes</h2>\n${faqs.map((f) => `<details class="mb-3 border-b border-border-light pb-3"><summary class="font-semibold cursor-pointer py-2">${f.q}</summary><div class="mt-2 text-text-light">${f.a}</div></details>`).join("\n")}`
}

export default async function enrichLegacyProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const res = await pg.raw(`
    SELECT p.id, p.handle, p.title, p.description, p.metadata, c.handle AS collection_handle
    FROM product p
    LEFT JOIN product_collection c ON p.collection_id = c.id
    WHERE p.deleted_at IS NULL
      AND p.status = 'published'
      AND (p.metadata->>'affiliate_source') IS NULL
      AND c.handle IS NOT NULL
      AND c.handle <> 'casque-anti-bruit-bebe'
  `)

  let enriched = 0
  let skipped = 0

  for (const row of res.rows || []) {
    const ch = row.collection_handle
    const existingMeta = row.metadata || {}

    // Skip if already enriched (has both faqs + benefits)
    if (existingMeta.faqs && existingMeta.benefits) { skipped++; continue }

    const faqs = COLLECTION_FAQS[ch]
    if (!faqs) { skipped++; continue }

    const benefits = extractBenefitsFromDesc(row.description || "", ch, row.title)

    let newDesc = row.description || ""
    if (!newDesc.toLowerCase().includes("questions fréquentes")) {
      newDesc = newDesc.trim() + generateFaqHtml(faqs)
    }

    const metaTitle = existingMeta.meta_title || `${row.title.substring(0, 55)} | Magic Crochet Kit`
    const metaDesc = existingMeta.meta_description
      || `${row.title}. ${benefits[0]}. Livraison rapide, paiement sécurisé.`.substring(0, 160)

    const newMeta = {
      ...existingMeta,
      benefits,
      faqs,
      meta_title: metaTitle,
      meta_description: metaDesc,
    }

    await pg.raw(
      `UPDATE product SET description = ?, metadata = ?::jsonb WHERE id = ?`,
      [newDesc, JSON.stringify(newMeta), row.id]
    )

    enriched++
    logger.info(`  + ${row.handle}`)
  }

  logger.info(`\nDone: ${enriched} enriched, ${skipped} skipped`)
}
