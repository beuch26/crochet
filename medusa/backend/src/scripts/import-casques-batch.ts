import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Batch import for remaining casques anti-bruit from Vertbaudet feed.
 * 6 products, ~17 variants total.
 */
export default async function importCasquesBatch({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

  const COLLECTION_HANDLE = "casque-anti-bruit-bebe"
  const IMAGE_BASE = "https://magic-crochet-kit.com/images/products/vertbaudet"
  const AFFILIATE_TRACKER = "https://track.effiliation.com/servlet/effi.redir?id_compteur=23257207&url="

  const col = await pg.raw(`SELECT id FROM product_collection WHERE handle = '${COLLECTION_HANDLE}'`)
  const collectionId = col.rows?.[0]?.id
  if (!collectionId) throw new Error(`Collection ${COLLECTION_HANDLE} not found`)
  const [defaultChannel] = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" })
  if (!defaultChannel) throw new Error("Default Sales Channel not found")

  type Variant = { color: string; handle: string; sku: string; imageCount: number; affiliateUrlSuffix: string; barcode?: string }
  type ProductCfg = {
    handle: string
    title: string
    subtitle: string
    metaDescription: string
    brand: string
    price: number
    imagePrefix: string // e.g. "muffy-kids"
    variants: Variant[]
    benefits: string[]
    description: string
    faqs: { q: string; a: string }[]
  }

  const products: ProductCfg[] = [
    // ============ 1. Muffy Baby Menthe (Alpine) ============
    {
      handle: "casque-antibruit-alpine-muffy-baby-menthe",
      title: "Casque antibruit Alpine Muffy Baby edition menthe - 23 dB",
      subtitle: "Edition coloree Muffy Baby : menthe, bleu et rose nude — 23 dB, certifie CE, des 0 mois",
      metaDescription: "Casque antibruit Alpine Muffy Baby edition coloree : 23 dB, CE EN 352-1:2020, des la naissance. 3 coloris menthe/bleu/rose nude.",
      brand: "Alpine",
      price: 3495,
      imagePrefix: "muffy-baby-menthe",
      variants: [
        { color: "Menthe", handle: "menthe", sku: "MUFFY-BABY-MENTHE-EDITION-MENTHE", imageCount: 3, affiliateUrlSuffix: "-menthe.htm?ProductId=341021590&FiltreCouleur=1313&FiltreTaille=TU" },
        { color: "Bleu", handle: "bleu", sku: "MUFFY-BABY-MENTHE-EDITION-BLEU", imageCount: 3, affiliateUrlSuffix: "-bleu.htm?ProductId=341021590&FiltreCouleur=0502&FiltreTaille=TU" },
        { color: "Rose nude", handle: "rose-nude", sku: "MUFFY-BABY-MENTHE-EDITION-ROSE", imageCount: 3, affiliateUrlSuffix: "-rose-nude.htm?ProductId=341021590&FiltreCouleur=1115&FiltreTaille=TU" },
      ],
      benefits: [
        "Reduction du bruit : 23 dB (SNR)",
        "Certifie CE - Norme EN 352-1:2020",
        "De la naissance a 3 ans",
        "Bandeau doux sans pression sur la fontanelle",
        "Coloris doux : menthe, bleu et rose nude",
      ],
      description: `<p><strong>La gamme Muffy Baby d'Alpine dans une edition aux coloris doux et tendance.</strong> Menthe pastel, bleu poudre ou rose nude : 3 teintes apaisantes pour proteger l'audition de votre bebe avec style, des la naissance jusqu'a 3 ans.</p>

<h2>Pourquoi cette edition coloree ?</h2>
<ul>
<li><strong>Memes caracteristiques que le Muffy Baby classique</strong> : reduction de 23 dB, certifie CE EN 352-1:2020.</li>
<li><strong>Bandeau extensible doux</strong> : aucune pression sur la fontanelle, confort optimal pour les nourrissons.</li>
<li><strong>Coloris exclusifs</strong> : menthe, bleu pastel, rose nude — parfaits pour les photos souvenirs ou pour assortir aux tenues de bebe.</li>
<li><strong>Etui Protect&Go inclus</strong> pour le transport.</li>
<li><strong>Lavage simple</strong> : chiffon humide pour les coques, lavage a la main pour le bandeau.</li>
</ul>

<h2>Caracteristiques techniques</h2>
<ul>
<li><strong>Marque :</strong> Alpine</li>
<li><strong>Age recommande :</strong> des la naissance a 3 ans</li>
<li><strong>Reduction du bruit :</strong> 23 dB (SNR)</li>
<li><strong>Norme :</strong> CE EN 352-1:2020</li>
<li><strong>Livre avec :</strong> etui Protect&Go</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>À noter :</strong> pour les coloris classiques (vert, noir, rose), preferez le <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">Muffy Baby standard</a>. Pour les enfants de plus de 3 ans, le <a href="/products/casque-antibruit-alpine-muffy-kids" class="text-primary hover:underline font-medium">Muffy Kids</a> est plus adapte. Voir tous nos <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casques anti-bruit bebe</a>.</p>
</div>`,
      faqs: [
        { q: "Quelle difference avec le Muffy Baby classique ?", a: "Memes caracteristiques techniques (23 dB, CE), seuls les coloris changent. L'edition coloree propose des teintes plus douces et pastel." },
        { q: "A partir de quel age ?", a: "Des la naissance, jusqu'a 3 ans environ. Le bandeau extensible s'adapte a la tete de bebe." },
        { q: "Pourquoi un prix legerement plus eleve ?", a: "L'edition coloree est une serie limitee avec des coloris exclusifs. Le produit reste identique au Muffy Baby standard en termes de performance." },
      ],
    },

    // ============ 2. Muffy Kids (Alpine) ============
    {
      handle: "casque-antibruit-alpine-muffy-kids",
      title: "Casque antibruit Alpine Muffy Kids - 25 dB des 3 ans",
      subtitle: "Protection auditive 25 dB pour les enfants de 3 a 16 ans — Bandeau reglable et etui de transport inclus",
      metaDescription: "Casque antibruit Alpine Muffy Kids : 25 dB, de 3 a 16 ans. Bandeau ajustable, etui Protect&Go inclus. 3 coloris bleu/rose/menthe.",
      brand: "Alpine",
      price: 2795,
      imagePrefix: "muffy-kids",
      variants: [
        { color: "Bleu", handle: "bleu", sku: "MUFFY-KIDS-BLEU", imageCount: 3, affiliateUrlSuffix: "-bleu.htm?ProductId=341015600&FiltreCouleur=0502&FiltreTaille=TU" },
        { color: "Rose", handle: "rose", sku: "MUFFY-KIDS-ROSE", imageCount: 3, affiliateUrlSuffix: "-rose.htm?ProductId=341015600&FiltreCouleur=1114&FiltreTaille=TU" },
        { color: "Menthe", handle: "menthe", sku: "MUFFY-KIDS-MENTHE", imageCount: 3, affiliateUrlSuffix: "-menthe.htm?ProductId=341015600&FiltreCouleur=1313&FiltreTaille=TU" },
      ],
      benefits: [
        "Reduction du bruit : 25 dB (SNR)",
        "Certifie CE - Norme EN 352-1:2020",
        "De 3 a 16 ans (ajustable)",
        "Bandeau reglable en plastique",
        "Etui Protect&Go inclus",
      ],
      description: `<p><strong>Le grand frere du Muffy Baby pour les enfants des 3 ans.</strong> Le Muffy Kids d'Alpine est un casque antibruit robuste avec arceau ajustable, conçu pour accompagner votre enfant de la maternelle a l'adolescence.</p>

<h2>Pourquoi choisir le Muffy Kids ?</h2>
<ul>
<li><strong>Protection 25 dB</strong> : attenuation superieure au Muffy Baby, adaptee aux oreilles plus matures.</li>
<li><strong>Arceau ajustable</strong> en plastique robuste, ideal pour les enfants actifs. Se regle sans outil.</li>
<li><strong>Taille evolutive</strong> : s'adapte a toutes les tetes entre 3 et 16 ans.</li>
<li><strong>Coussinets doux</strong> pour un confort lors des longues utilisations.</li>
<li><strong>Certifie CE</strong> EN 352-1:2020 comme tous les produits Alpine.</li>
<li><strong>Livre avec son etui</strong> Protect&Go pour le transport.</li>
</ul>

<h2>Dans quelles situations l'utiliser ?</h2>
<ul>
<li>Concerts, festivals, spectacles musicaux</li>
<li>Feux d'artifice, fetes foraines</li>
<li>Evenements sportifs (foot, rugby, courses auto)</li>
<li>Voyages en avion</li>
<li>Travaux a la maison</li>
<li>Soutien aux enfants hyperactifs ou hypersensibles (TDAH, TSA)</li>
</ul>

<h2>Caracteristiques techniques</h2>
<ul>
<li><strong>Marque :</strong> Alpine</li>
<li><strong>Age recommande :</strong> 3 a 16 ans</li>
<li><strong>Reduction du bruit :</strong> 25 dB (SNR)</li>
<li><strong>Norme :</strong> CE EN 352-1:2020</li>
<li><strong>Arceau :</strong> plastique ajustable</li>
<li><strong>Livre avec :</strong> etui Protect&Go</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>À noter :</strong> pour les tout-petits de moins de 3 ans, preferez le <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">Muffy Baby</a> avec son bandeau tissu sans pression. Voir notre <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">selection complete de casques anti-bruit</a> ou comparer avec le <a href="/products/casque-antibruit-kidynoise-kidywolf" class="text-primary hover:underline font-medium">Kidynoise de Kidywolf</a>.</p>
</div>`,
      faqs: [
        { q: "A partir de quel age utiliser le Muffy Kids ?", a: "Des 3 ans. Le bandeau s'ajuste sans outil et suit la croissance de l'enfant jusqu'a l'adolescence." },
        { q: "Quelle difference avec le Muffy Baby ?", a: "Le Muffy Baby (0-3 ans) a un bandeau tissu extensible sans pression sur la fontanelle. Le Muffy Kids (3 ans+) a un arceau plastique classique, plus solide et ajustable." },
        { q: "Quelle reduction de bruit ?", a: "25 dB (SNR), soit une reduction superieure au Muffy Baby (23 dB). Suffisant pour les concerts (100-120 dB) et feux d'artifice (120-150 dB)." },
        { q: "Est-il confortable pour plusieurs heures ?", a: "Oui, les coussinets rembourres repartissent la pression. De nombreux parents l'utilisent pour des festivals ou des longs trajets en avion." },
      ],
    },

    // ============ 3. Alecto Educatif 29 dB ============
    {
      handle: "casque-antibruit-alecto-educatif-29db",
      title: "Casque antibruit Alecto 29 dB - Jouet educatif pour enfants",
      subtitle: "Protection 29 dB design jouet educatif — 4 coloris, adapte aux enfants actifs et aux environnements scolaires",
      metaDescription: "Casque antibruit Alecto 29 dB : design jouet educatif, 4 coloris (noir, bleu, vert d'eau, rose). Ideal ecole, TDAH, sorties bruyantes.",
      brand: "Alecto",
      price: 3110,
      imagePrefix: "alecto-educatif",
      variants: [
        { color: "Noir", handle: "noir", sku: "ALECTO-EDU-NOIR", imageCount: 3, affiliateUrlSuffix: "-noir-jouet-educatif-pour-enfants-multi-coloured.htm?ProductId=A0000GSKK&FiltreCouleur=PF99&FiltreTaille=TU" },
        { color: "Bleu", handle: "bleu", sku: "ALECTO-EDU-BLEU", imageCount: 3, affiliateUrlSuffix: "-bleu-jouet-educatif-pour-enfants-multi-coloured.htm?ProductId=A0000GSKL&FiltreCouleur=PF99&FiltreTaille=TU" },
        { color: "Vert d'eau", handle: "vert-deau", sku: "ALECTO-EDU-VERT", imageCount: 3, affiliateUrlSuffix: "-vert-d-eau-jouet-educatif-pour-enfants-multi-coloured.htm?ProductId=A0000GSKM&FiltreCouleur=PF99&FiltreTaille=TU" },
        { color: "Rose", handle: "rose", sku: "ALECTO-EDU-ROSE", imageCount: 3, affiliateUrlSuffix: "-rose-jouet-educatif-pour-enfants-multi-coloured.htm?ProductId=A0000GSKO&FiltreCouleur=PF99&FiltreTaille=TU" },
      ],
      benefits: [
        "Reduction du bruit : 29 dB (SNR)",
        "Design jouet educatif colore",
        "Ideal TDAH, hypersensibilite sensorielle",
        "4 coloris au choix",
        "Bandeau ajustable",
      ],
      description: `<p><strong>Un casque antibruit pense comme un jouet educatif.</strong> La marque Alecto propose un casque colore avec une forte attenuation de 29 dB — parfait pour les enfants hypersensibles, neuroatypiques (TDAH, TSA) ou simplement actifs dans des environnements bruyants comme l'ecole ou la cantine.</p>

<h2>Pourquoi ce casque Alecto ?</h2>
<ul>
<li><strong>29 dB d'attenuation</strong> : l'un des niveaux les plus eleves du marche pour enfants. Particulierement apprecie dans les contextes de surcharge sensorielle.</li>
<li><strong>Design oriente jouet</strong> : couleurs vives et formes attractives pour que l'enfant accepte de le porter.</li>
<li><strong>Utilisation a l'ecole</strong> : de plus en plus de parents d'enfants hypersensibles adoptent ce casque pour les temps de classe, de cantine ou de recreation.</li>
<li><strong>Bandeau ajustable</strong> pour s'adapter a toutes les morphologies.</li>
<li><strong>4 coloris</strong> : noir, bleu, vert d'eau, rose — une couleur pour chaque enfant.</li>
</ul>

<h2>Dans quelles situations l'utiliser ?</h2>
<ul>
<li>Salle de classe, cantine, cour de recreation (enfants TDAH/TSA)</li>
<li>Sorties en ville, transports en commun</li>
<li>Feux d'artifice, spectacles, parcs d'attractions</li>
<li>Moments de concentration (devoirs, lecture)</li>
<li>Voyages</li>
</ul>

<h2>Caracteristiques techniques</h2>
<ul>
<li><strong>Marque :</strong> Alecto</li>
<li><strong>Reduction du bruit :</strong> 29 dB (SNR)</li>
<li><strong>Age recommande :</strong> a partir de 3 ans</li>
<li><strong>Design :</strong> jouet educatif colore</li>
<li><strong>Bandeau :</strong> ajustable</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>Pour qui ?</strong> Les 29 dB d'attenuation de ce casque en font un choix privilegie pour les enfants <strong>hypersensibles aux bruits</strong> (TDAH, TSA, Haut Potentiel). Si votre enfant n'a pas de sensibilite particuliere, un <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casque classique</a> (22-25 dB) peut suffire.</p>
</div>`,
      faqs: [
        { q: "Pourquoi 29 dB ?", a: "C'est l'un des niveaux d'attenuation les plus eleves du marche pour enfants. Il est recommande pour les environnements tres bruyants ou pour les enfants tres sensibles aux bruits." },
        { q: "Ce casque est-il adapte aux enfants TDAH ou autistes ?", a: "Oui, il est particulierement populaire aupres des familles d'enfants neuroatypiques (TDAH, TSA, HP) pour les temps d'ecole ou de surcharge sensorielle." },
        { q: "Peut-on le porter toute la journee a l'ecole ?", a: "Oui, les coussinets sont conçus pour un port prolonge. Il est cependant recommande de faire des pauses." },
        { q: "L'enfant peut-il entendre le professeur ?", a: "Oui, le casque attenue les bruits ambiants sans les couper completement. La voix humaine proche reste audible." },
      ],
    },

    // ============ 4. Dooky Evolutif 2-en-1 ============
    {
      handle: "casque-antibruit-dooky-evolutif-2-en-1",
      title: "Casque antibruit Dooky Evolutif 2-en-1 bebe et enfant - Blanc",
      subtitle: "Casque 2-en-1 evolutif : bandeau tissu pour bebe, arceau ajustable pour enfant — Suit la croissance de 0 a 6 ans",
      metaDescription: "Casque antibruit Dooky Evolutif 2-en-1 : bandeau bebe + arceau enfant interchangeables. Suit la croissance de 0 a 6 ans. Blanc.",
      brand: "Dooky",
      price: 3290,
      imagePrefix: "dooky-evolutif",
      variants: [
        { color: "Blanc", handle: "blanc", sku: "DOOKY-EVO-BLANC", imageCount: 3, affiliateUrlSuffix: "-blanc.htm?ProductId=A0000H1GJ&FiltreCouleur=HG75&FiltreTaille=TU" },
      ],
      benefits: [
        "2-en-1 : bandeau bebe + arceau enfant",
        "Evolutif de 0 a 6 ans",
        "Reduction du bruit certifiee CE",
        "Design epure blanc",
        "Coussinets ultra-souples",
      ],
      description: `<p><strong>Un seul casque qui suit votre enfant de la naissance a 6 ans.</strong> Le Dooky Evolutif 2-en-1 est une solution ingenieuse : il se porte avec un bandeau en tissu doux pour bebe (0-3 ans), puis se transforme avec un arceau en plastique ajustable des 3 ans.</p>

<h2>Pourquoi ce casque 2-en-1 ?</h2>
<ul>
<li><strong>Un seul achat pour 6 ans d'utilisation</strong> : economique et ecologique compare a l'achat de deux casques differents.</li>
<li><strong>Bandeau tissu pour bebe</strong> : aucune pression sur la fontanelle, confort optimal des la naissance.</li>
<li><strong>Arceau plastique pour enfant</strong> : quand votre enfant grandit, vous remplacez le bandeau par l'arceau inclus.</li>
<li><strong>Design epure et minimaliste</strong> : blanc sobre, discret, s'accorde avec tous les styles.</li>
<li><strong>Coussinets moelleux</strong> pour un confort prolonge.</li>
</ul>

<h2>Comment ça marche ?</h2>
<p>Le casque est livre avec les deux systemes de maintien : le bandeau tissu pour les bebes (0-3 ans) et l'arceau plastique pour les enfants (3-6 ans). Vous changez de systeme quand votre enfant est pret — en general vers 2,5-3 ans.</p>

<h2>Caracteristiques techniques</h2>
<ul>
<li><strong>Marque :</strong> Dooky</li>
<li><strong>Age recommande :</strong> 0 a 6 ans</li>
<li><strong>Certification :</strong> CE</li>
<li><strong>Systemes inclus :</strong> bandeau tissu + arceau plastique</li>
<li><strong>Couleur :</strong> blanc</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>Avantage :</strong> en achetant le Dooky Evolutif, vous evitez de racheter un casque quand bebe grandit — economie d'environ 30€. Voir notre <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">selection complete de casques anti-bruit</a> pour comparer avec les modeles specifiques par age.</p>
</div>`,
      faqs: [
        { q: "Comment fonctionne le 2-en-1 ?", a: "Le casque est livre avec un bandeau tissu pour bebe et un arceau plastique pour enfant. Vous changez quand votre enfant grandit, en general vers 3 ans." },
        { q: "Est-ce rentable par rapport a 2 casques ?", a: "Oui, vous economisez le prix d'un second casque (environ 30€) en achetant une seule fois." },
        { q: "Le changement de systeme est-il simple ?", a: "Oui, le bandeau et l'arceau se clipsent sur les memes coques. Pas besoin d'outil." },
      ],
    },

    // ============ 5. Dooky Protection Auditive Bebe ============
    {
      handle: "casque-antibruit-dooky-protection-bebe",
      title: "Casque antibruit Dooky Protection Auditive Bebe - Blanc",
      subtitle: "Casque antibruit d'entree de gamme pour bebe — Bandeau doux, certifie CE, design epure",
      metaDescription: "Casque antibruit Dooky Protection Auditive Bebe : d'entree de gamme, bandeau doux, certifie CE. Blanc. Des la naissance.",
      brand: "Dooky",
      price: 2690,
      imagePrefix: "dooky-protection-bebe",
      variants: [
        { color: "Blanc", handle: "blanc", sku: "DOOKY-PROT-BLANC", imageCount: 3, affiliateUrlSuffix: "-blanc.htm?ProductId=A0000H1GK&FiltreCouleur=HG75&FiltreTaille=TU" },
      ],
      benefits: [
        "Certifie CE pour bebe",
        "Bandeau tissu sans pression",
        "Prix accessible",
        "Design epure blanc",
        "Des la naissance",
      ],
      description: `<p><strong>Une protection auditive essentielle a un prix accessible.</strong> Le casque Dooky Protection Auditive Bebe est conçu pour proteger l'audition fragile des tout-petits sans casser la tirelire. Design epure, confort optimal, performance fiable.</p>

<h2>Pourquoi ce casque Dooky ?</h2>
<ul>
<li><strong>Prix accessible</strong> : l'un des casques antibruit bebe les moins chers du marche, ideal pour un premier achat ou un cadeau.</li>
<li><strong>Bandeau doux</strong> : sans pression sur la fontanelle, confortable des la naissance.</li>
<li><strong>Certification CE</strong> : respecte les normes europeennes de protection auditive.</li>
<li><strong>Design minimaliste</strong> : blanc sobre, discret, facile a assortir.</li>
</ul>

<h2>Caracteristiques techniques</h2>
<ul>
<li><strong>Marque :</strong> Dooky</li>
<li><strong>Age recommande :</strong> des la naissance</li>
<li><strong>Certification :</strong> CE</li>
<li><strong>Bandeau :</strong> tissu doux extensible</li>
<li><strong>Couleur :</strong> blanc</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>A noter :</strong> pour un modele evolutif 0-6 ans (avec arceau interchangeable), preferez le <a href="/products/casque-antibruit-dooky-evolutif-2-en-1" class="text-primary hover:underline font-medium">Dooky Evolutif 2-en-1</a>. Pour un modele haut de gamme, voir le <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline font-medium">Muffy Baby d'Alpine</a>. Tous nos <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">casques anti-bruit bebe</a>.</p>
</div>`,
      faqs: [
        { q: "A partir de quel age ?", a: "Des la naissance. Le bandeau extensible s'adapte a la tete de bebe sans exercer de pression sur la fontanelle." },
        { q: "Quelle difference avec le Dooky Evolutif ?", a: "Ce modele est conçu uniquement pour bebe (0-3 ans). Le Dooky Evolutif est un 2-en-1 qui fonctionne aussi pour les enfants jusqu'a 6 ans grace a un arceau interchangeable." },
      ],
    },

    // ============ 6. Alecto Casque Pour Bebes ============
    {
      handle: "casque-antibruit-alecto-bebes",
      title: "Casque antibruit Alecto pour bebes - Blanc et vert d'eau",
      subtitle: "Casque ultra-leger pour bebe — Design bicolore blanc et vert d'eau, certifie CE",
      metaDescription: "Casque antibruit Alecto pour bebes : ultra-leger, blanc et vert d'eau, certifie CE. Des la naissance, bandeau doux.",
      brand: "Alecto",
      price: 2690,
      imagePrefix: "alecto-bebes",
      variants: [
        { color: "Blanc / Vert d'eau", handle: "blanc", sku: "ALECTO-BEBE-BLANC", imageCount: 3, affiliateUrlSuffix: "-blanc-vert-d-eau.htm?ProductId=A0000H22M&FiltreCouleur=HG75&FiltreTaille=TU" },
      ],
      benefits: [
        "Ultra-leger pour bebe",
        "Design bicolore blanc et vert d'eau",
        "Certifie CE",
        "Bandeau doux sans pression",
        "Prix attractif",
      ],
      description: `<p><strong>Un casque antibruit leger et apaisant pour bebe.</strong> Le modele Alecto pour bebes combine performance auditive certifiee CE, design bicolore blanc et vert d'eau apaisant, et un prix accessible. Ideal pour les premieres sorties.</p>

<h2>Pourquoi ce casque Alecto ?</h2>
<ul>
<li><strong>Ultra-leger</strong> : conçu pour ne pas fatiguer la tete de bebe meme apres plusieurs heures.</li>
<li><strong>Design bicolore apaisant</strong> : le vert d'eau doux combine au blanc cree un visuel tres soft.</li>
<li><strong>Bandeau sans pression</strong> sur la fontanelle, confort optimal des la naissance.</li>
<li><strong>Certification CE</strong> : respecte les normes europeennes de protection auditive.</li>
<li><strong>Prix accessible</strong> : rapport qualite/prix tres competitif.</li>
</ul>

<h2>Caracteristiques techniques</h2>
<ul>
<li><strong>Marque :</strong> Alecto</li>
<li><strong>Age recommande :</strong> des la naissance</li>
<li><strong>Certification :</strong> CE</li>
<li><strong>Bandeau :</strong> tissu doux extensible</li>
<li><strong>Couleur :</strong> blanc et vert d'eau</li>
</ul>

<div class="mt-6 p-5 bg-bg-light rounded-2xl">
<p class="text-sm"><strong>Bon a savoir :</strong> la marque Alecto propose aussi un <a href="/products/casque-antibruit-alecto-educatif-29db" class="text-primary hover:underline font-medium">modele educatif 29 dB</a> pour les enfants plus ages et hypersensibles. Decouvrez toute notre <a href="/collections/casque-anti-bruit-bebe" class="text-primary hover:underline font-medium">selection de casques anti-bruit</a>.</p>
</div>`,
      faqs: [
        { q: "A partir de quel age ?", a: "Des la naissance. Le bandeau extensible s'adapte a la tete de bebe." },
        { q: "Pourquoi bicolore ?", a: "Le design blanc et vert d'eau a ete pense pour etre visuellement apaisant, parfait pour les bebes mais aussi pour les photos." },
        { q: "Quelle difference avec l'Alecto Educatif ?", a: "Ce modele est pour les tout-petits (des 0 mois). L'Alecto Educatif 29 dB est pour les enfants de 3 ans et plus, avec une attenuation plus elevee." },
      ],
    },
  ]

  for (const cfg of products) {
    // Skip if already exists
    const exists = await pg.raw(`SELECT id FROM product WHERE handle = '${cfg.handle}' AND deleted_at IS NULL`)
    if (exists.rows?.length > 0) {
      logger.info(`  = ${cfg.handle} already exists, skipping`)
      continue
    }

    const firstVariant = cfg.variants[0]
    const defaultAffiliateUrl = encodeURI(`${AFFILIATE_TRACKER}https://www.vertbaudet.fr/casque-antibruit-${cfg.imagePrefix.replace(/^alecto-|^dooky-/, '')}${firstVariant.affiliateUrlSuffix}`)

    const productInput = {
      title: cfg.title,
      subtitle: cfg.subtitle,
      description: cfg.description,
      handle: cfg.handle,
      status: "published" as const,
      thumbnail: `${IMAGE_BASE}/${cfg.imagePrefix}-${firstVariant.handle}-1.webp`,
      collection_id: collectionId,
      metadata: {
        meta_title: cfg.title + " | Magic Crochet Kit",
        meta_description: cfg.metaDescription,
        affiliate_enabled: "true",
        affiliate_source: "vertbaudet",
        affiliate_brand: cfg.brand,
        affiliate_url: defaultAffiliateUrl,
        affiliate_label: "Voir sur Vertbaudet",
        benefits: cfg.benefits,
        faqs: cfg.faqs,
      },
      images: cfg.variants.flatMap((v) => Array.from({ length: v.imageCount }, (_, i) => ({
        url: `${IMAGE_BASE}/${cfg.imagePrefix}-${v.handle}-${i + 1}.webp`,
      }))),
      options: [{ title: "Couleur", values: cfg.variants.map((v) => v.color) }],
      variants: cfg.variants.map((v) => {
        const vImgs = Array.from({ length: v.imageCount }, (_, i) => `${IMAGE_BASE}/${cfg.imagePrefix}-${v.handle}-${i + 1}.webp`)
        return {
          title: v.color,
          sku: v.sku,
          ...(v.barcode ? { barcode: v.barcode } : {}),
          manage_inventory: false,
          allow_backorder: true,
          options: { Couleur: v.color },
          prices: [{ amount: cfg.price, currency_code: "eur" }],
          metadata: {
            affiliate_url: encodeURI(`${AFFILIATE_TRACKER}https://www.vertbaudet.fr/casque-antibruit-${cfg.imagePrefix.replace(/^alecto-|^dooky-/, '')}${v.affiliateUrlSuffix}`),
            images: vImgs,
            thumbnail: vImgs[0],
          },
        }
      }),
      sales_channels: [{ id: defaultChannel.id }],
    }

    logger.info(`Creating "${cfg.title}"...`)
    try {
      const { result } = await createProductsWorkflow(container).run({ input: { products: [productInput] as any } })
      logger.info(`  + ${result[0].handle}`)
    } catch (e: any) {
      logger.error(`  x ${cfg.handle}: ${e.message}`)
    }
  }

  logger.info("Done!")
}
