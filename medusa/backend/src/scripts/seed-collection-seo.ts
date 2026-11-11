import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function seedCollectionSeo({ container }: ExecArgs) {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const collections: Record<string, {
    seo_text: string
    meta_description: string
    faqs: { q: string; a: string }[]
  }> = {
    "tire-lait": {
      meta_description: "Comparez les meilleurs tire-lait electriques et manuels : Medela, Lansinoh. Guide d achat, avis et livraison rapide.",
      seo_text: "Choisir le bon tire-lait depend de votre rythme d utilisation. Un tire-lait electrique double convient aux mamans qui tirent quotidiennement, tandis qu un modele manuel suffit pour un usage occasionnel. Tous nos tire-lait sont compatibles avec les normes europeennes.",
      faqs: [
        { q: "Quel tire-lait choisir pour debuter ?", a: "Pour un usage occasionnel, un tire-lait manuel est ideal. Si vous tirez quotidiennement, un modele electrique double sera plus efficace et rapide." },
        { q: "A partir de quand utiliser un tire-lait ?", a: "Vous pouvez commencer des que l allaitement est bien installe, generalement apres 4 a 6 semaines." },
        { q: "Comment bien conserver le lait tire ?", a: "Le lait maternel se conserve 4h a temperature ambiante, 4 jours au refrigerateur et 6 mois au congelateur." },
        { q: "Tire-lait electrique ou manuel ?", a: "L electrique est plus efficace en volume et rapidite. Le manuel offre plus de controle et de discretion en deplacement." },
      ],
    },
    "soins-allaitement": {
      meta_description: "Soins allaitement : cremes lanoline, compresses hydrogel, baume bio pour mamelons. Soulagez les crevasses et allaitez sereinement.",
      seo_text: "L allaitement peut s accompagner de petits desagrements. Nos soins sont selectionnes pour apaiser et proteger les mamelons : cremes a la lanoline pure, compresses hydrogel, baumes bio. Tous compatibles avec l allaitement.",
      faqs: [
        { q: "Quelle creme pour les crevasses d allaitement ?", a: "La creme a la lanoline (Lansinoh HPA ou Medela PureLan) est la reference. 100% naturelle, pas besoin de rincer avant la tetee." },
        { q: "Comment eviter les crevasses ?", a: "Une bonne position d allaitement et une prise du sein correcte sont essentielles. Appliquez de la lanoline en prevention apres chaque tetee." },
      ],
    },
    "soins-grossesse": {
      meta_description: "Soins grossesse : huile perinee bio, baume levres lanoline, spray apaisant post-accouchement. Preparez votre corps en douceur.",
      seo_text: "La grossesse et le post-partum necessitent une attention particuliere. Nos soins bio et naturels accompagnent chaque etape : massage du perinee, soin de la peau, apaisement post-cesarienne.",
      faqs: [
        { q: "Quand commencer le massage du perinee ?", a: "Le massage du perinee est recommande a partir de la 34e semaine de grossesse, 2 a 3 fois par semaine." },
        { q: "Quels soins apres une cesarienne ?", a: "Les patchs hydrogel apaisent la cicatrice et favorisent la cicatrisation. Attendez la validation de votre sage-femme." },
      ],
    },
    "casque-anti-bruit-bebe": {
      meta_description: "Casques anti-bruit bebe certifies : Alpine, Peltor, BBTKCARE. Protection auditive des 0 mois. Comparatif et guide des tailles.",
      seo_text: "Proteger l audition de votre bebe est essentiel lors d evenements bruyants. Nos casques anti-bruit sont certifies CE et offrent une attenuation de 20 a 27 dB, adaptee aux oreilles sensibles des tout-petits.",
      faqs: [
        { q: "A quel age mettre un casque anti-bruit a bebe ?", a: "Des la naissance pour les modeles Baby (0-18 mois). Les modeles Kids conviennent a partir de 2-3 ans." },
        { q: "Un casque anti-bruit est-il dangereux pour bebe ?", a: "Non. Les casques certifies sont conçus pour ne pas exercer de pression sur la fontanelle." },
        { q: "Quel niveau de decibels est dangereux ?", a: "Au-dela de 80 dB. Un concert produit 100-120 dB, un casque anti-bruit est indispensable dans ces situations." },
      ],
    },
    "coquillage-allaitement-nacre": {
      meta_description: "Coquillages d allaitement en nacre : protegent les mamelons, recueillent le lait. BABIG, Yemma Shell, Mom s Shells.",
      seo_text: "Les coquillages d allaitement en nacre sont une alternative naturelle aux coussinets. Ils protegent les mamelons, maintiennent l hydratation et favorisent la cicatrisation des crevasses.",
      faqs: [
        { q: "Comment utiliser les coquillages d allaitement ?", a: "Placez-les dans votre soutien-gorge, face concave contre le mamelon. Nettoyez-les a l eau tiede entre chaque utilisation." },
        { q: "Sont-ils efficaces contre les crevasses ?", a: "Oui, en maintenant le mamelon en contact avec le lait maternel, ils accelerent la guerison des crevasses." },
      ],
    },
    "bola-de-grossesse": {
      meta_description: "Bola de grossesse : bijoux avec son doux et apaisant pour bebe. Ange, fleur, pierre de lune — livraison offerte.",
      seo_text: "Le bola de grossesse emet un tintement doux perceptible par bebe des la 20e semaine. Apres la naissance, le son familier aide a calmer le nouveau-ne.",
      faqs: [
        { q: "A partir de quand porter un bola ?", a: "Bebe percoit son tintement vers la 20e semaine de grossesse, quand son systeme auditif se developpe." },
        { q: "Que faire du bola apres l accouchement ?", a: "Accrochez-le au berceau ou cousez-le dans un doudou. Le son familier calmera bebe." },
      ],
    },
    "bout-de-sein": {
      meta_description: "Bouts de sein en silicone : Medela Contact, tailles S/M/L. Facilitent la prise du sein et protegent les mamelons.",
      seo_text: "Les bouts de sein en silicone ultra-fin facilitent l allaitement en cas de difficulte de prise du sein ou de mamelons plats.",
      faqs: [
        { q: "Comment choisir la taille ?", a: "Mesurez le diametre de votre mamelon. S (16mm), M (20mm), L (24mm). Le bout de sein doit entourer le mamelon sans le comprimer." },
      ],
    },
    "coussinet-allaitement": {
      meta_description: "Coussinets d allaitement lavables et jetables : silicone, coton bio, ultra-absorbants. Restez au sec en toute discretion.",
      seo_text: "Les coussinets d allaitement absorbent les fuites de lait. Nos lavables en coton bio sont economiques, les jetables sont pratiques en deplacement.",
      faqs: [
        { q: "Lavables ou jetables ?", a: "Les lavables sont plus economiques et ecologiques. Les jetables sont pratiques en sortie. Beaucoup de mamans utilisent les deux." },
      ],
    },
    "conservation-lait-maternel": {
      meta_description: "Sachets et pots de conservation du lait maternel : Medela, compatibles congelation. Stockez votre lait en securite.",
      seo_text: "Conserver le lait maternel permet de constituer un stock. Nos sachets et pots sont pre-sterilises et compatibles congelation.",
      faqs: [
        { q: "Combien de temps conserver le lait ?", a: "4h a temperature ambiante, 4 jours au refrigerateur, 6 mois au congelateur. Ne recongelez jamais du lait decongele." },
      ],
    },
    "soutien-gorge-allaitement": {
      meta_description: "Soutiens-gorge d allaitement : sans armature, ouverture facile, maintien optimal. Dentelle, sport, nuit.",
      seo_text: "Un bon soutien-gorge d allaitement allie confort et praticite. L ouverture clip permet d allaiter discretement.",
      faqs: [
        { q: "Quand acheter son soutien-gorge d allaitement ?", a: "Au 8e mois de grossesse, quand votre poitrine a atteint sa taille quasi definitive." },
      ],
    },
    "biberons-tetines": {
      meta_description: "Biberons et tetines Natural Wave : transition sein-biberon en douceur. Compatibles allaitement mixte.",
      seo_text: "La gamme Natural Wave reproduit le mouvement naturel de succion au sein, facilitant la transition sans confusion.",
      faqs: [
        { q: "Quel biberon pour un bebe allaite ?", a: "Privilegiez une tetine a debit lent et forme physiologique pour eviter la confusion sein-biberon." },
      ],
    },
    "vaisselle-bebe": {
      meta_description: "Vaisselle bebe en silicone alimentaire : assiettes a ventouse, bols, cuilleres. Sans BPA, lave-vaisselle.",
      seo_text: "Nos sets de repas en silicone alimentaire sont conçus pour la diversification des 4 mois. La ventouse maintient l assiette en place.",
      faqs: [
        { q: "A quel age commencer la diversification ?", a: "Entre 4 et 6 mois, en complement du lait. Demandez conseil a votre pediatre." },
      ],
    },
    "tresse-de-lit-bebe": {
      meta_description: "Tresses de lit bebe : protection et decoration du berceau. Tour de lit tresse doux et securise.",
      seo_text: "La tresse de lit protege bebe des barreaux tout en decorant la chambre. Nos tresses sont en coton doux et hypoallergenique.",
      faqs: [
        { q: "A partir de quel age ?", a: "Des la naissance. Assurez-vous qu elle est bien fixee et que bebe ne peut pas s y enfouir le visage." },
      ],
    },
    "trousse-de-soin-bebe": {
      meta_description: "Trousse de soin bebe complete : thermometre, mouche-bebe, coupe-ongles. Tout pour les premiers soins.",
      seo_text: "Notre kit regroupe tous les accessoires essentiels pour la toilette et les premiers soins de bebe.",
      faqs: [
        { q: "Que contient une trousse de soin ?", a: "Thermometre, mouche-bebe, serum physiologique, coupe-ongles bebe, brosse a cheveux." },
      ],
    },
    "attache-tetine": {
      meta_description: "Attaches tetine silicone et bois : securisees, sans BPA. Gardez la tetine toujours a portee.",
      seo_text: "L attache-tetine evite les chutes et pertes. Nos modeles sont conformes aux normes de securite europeennes.",
      faqs: [
        { q: "L attache-tetine est-elle sans danger ?", a: "Oui, conformes a la norme EN 12586. Longueur limitee a 22 cm, materiaux sans BPA." },
      ],
    },
    "bijoux": {
      meta_description: "Bijoux pour femme enceinte : bolas de grossesse en argent 925. Cadeaux de naissance originaux.",
      seo_text: "Nos bijoux celebrent la maternite avec elegance. Le bola de grossesse est aussi le cadeau de naissance ideal.",
      faqs: [
        { q: "Le bola est-il un bon cadeau ?", a: "C est l un des cadeaux les plus apprecies. Decoratif, symbolique et apaisant pour bebe." },
      ],
    },
    "pour-maman": {
      meta_description: "Tout pour les mamans : soins grossesse, allaitement, tire-lait, coussinets. Selection premium pour la maternite.",
      seo_text: "Notre selection couvre toutes les etapes : preparation a l accouchement, allaitement, post-partum et retour au travail.",
      faqs: [
        { q: "Quels produits preparer avant l accouchement ?", a: "Les essentiels : huile perinee, coussinets, creme lanoline, soutien-gorge d allaitement et tire-lait." },
      ],
    },
    "bebe": {
      meta_description: "Tout pour bebe : casques anti-bruit, tresses de lit, vaisselle, biberons, trousses de soin. Qualite et securite.",
      seo_text: "Nous selectionnons des produits surs et pratiques pour le quotidien de bebe. Tous nos articles respectent les normes europeennes.",
      faqs: [
        { q: "Quels indispensables pour un nouveau-ne ?", a: "Biberons, trousse de soin, tresse de lit et casque anti-bruit pour les sorties. Privilegiez la qualite." },
      ],
    },
  }

  console.log("Seeding collection SEO content + FAQ...")

  for (const [handle, data] of Object.entries(collections)) {
    try {
      // Build JSON metadata update
      const faqsStr = JSON.stringify(data.faqs).replace(/'/g, "''")
      const seoStr = data.seo_text.replace(/'/g, "''")
      const metaStr = data.meta_description.replace(/'/g, "''")

      await pg.raw(`
        UPDATE product_collection
        SET metadata = COALESCE(metadata, '{}'::jsonb)
          || jsonb_build_object('seo_text', '${seoStr}')
          || jsonb_build_object('meta_description', '${metaStr}')
          || jsonb_build_object('faqs', '${faqsStr}')
        WHERE handle = '${handle}'
      `)
      console.log(`  + ${handle}: ${data.faqs.length} FAQ`)
    } catch (e: any) {
      console.error(`  x ${handle}: ${e.message}`)
    }
  }

  console.log("Done!")
}
