import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * For each remaining casque, fix factual errors discovered during research
 * and insert "Retours d'experience parents" section based on real reviews.
 */
export default async function rewriteCasquesReviews({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  type Patch = {
    handle: string
    fixes?: Array<{ from: string; to: string }>
    reviewsSection: string
  }

  const patches: Patch[] = [
    // ============ Kidynoise Kidywolf ============
    {
      handle: "casque-antibruit-kidynoise-kidywolf",
      fixes: [
        // Age was 4+ but Kidywolf official says 3-10
        { from: "des 4 ans", to: "des 3 ans et jusqu'a 10 ans" },
        { from: "Adapte des 4 ans, il suit l'enfant jusqu'a l'adolescence", to: "Adapte de 3 a 10 ans environ" },
        { from: "Age recommande :</strong> des 4 ans", to: "Age recommande :</strong> 3 a 10 ans" },
        { from: "A partir de 4 ans, les enfants commencent", to: "Des 3 ans, les enfants commencent" },
      ],
      reviewsSection: `<h2>Retours d'experience parents</h2>

<p>Nous avons synthetise les retours publies par les parents sur plusieurs sites specialises (<a href="https://www.lespetitsbaroudeurs.com/casque-antibruit-kidynoise-kidywolf-6614.html" rel="nofollow noopener" target="_blank">Les Petits Baroudeurs</a>, <a href="https://en-pagaille.fr/produit/casque-anti-bruit-enfant-kidynoise-kidywolf/" rel="nofollow noopener" target="_blank">En Pagaille</a>, <a href="https://kidywolf.com/en/products/kidynoise-blue" rel="nofollow noopener" target="_blank">Kidywolf</a>). Voici ce qu'il ressort :</p>

<h3>Les points forts qui reviennent</h3>
<ul>
<li><strong>Super confort sur longue duree.</strong> Les parents temoignent que les enfants portent le casque sans se plaindre pendant des heures, notamment pendant les vols en avion.</li>
<li><strong>Efficacite dans les evenements bruyants.</strong> Plusieurs retours mentionnent son usage en concert (y compris concerts rock), avec un vrai ressenti d'attenuation.</li>
<li><strong>Format pliable pratique.</strong> Le casque se replie facilement dans un sac a dos ou une valise cabine — un vrai plus pour les familles qui voyagent.</li>
<li><strong>Design colore et ludique.</strong> Les enfants aiment le porter, ce qui evite les conflits quand il faut leur mettre dans les oreilles.</li>
</ul>

<h3>Les points de vigilance</h3>
<ul>
<li><strong>Attenuation moins forte qu'un modele professionnel.</strong> Les 25 dB conviennent pour concerts, feux d'artifice et voyages, mais pour des environnements extremes (piste de course automobile, course moto), un casque 29 dB comme l'<a href="/products/casque-antibruit-alecto-educatif-29db" class="text-primary hover:underline">Alecto Educatif</a> sera plus adapte.</li>
<li><strong>Bandeau qui peut serrer les premieres fois.</strong> Quelques parents signalent que le bandeau est un peu ferme au demarrage, il se detend apres quelques utilisations.</li>
</ul>

<h3>Pour quel usage ?</h3>
<p>Le Kidynoise est le choix ideal pour les familles qui voyagent frequemment en avion, vont aux concerts ou dans des evenements bruyants. Il est aussi plebiscite par les parents d'enfants avec besoin de concentration (devoirs, lecture) grace a son format leger et pliable.</p>`,
    },

    // ============ Muffy Kids (Alpine) ============
    {
      handle: "casque-antibruit-alpine-muffy-kids",
      fixes: [
        // Age: Alpine officially says 5-16, we had 3-16
        { from: "de 3 a 16 ans", to: "de 5 a 16 ans" },
        { from: "des 3 ans", to: "des 5 ans" },
        { from: "Age recommande :</strong> 3 a 16 ans", to: "Age recommande :</strong> 5 a 16 ans" },
      ],
      reviewsSection: `<h2>Retours d'experience parents</h2>

<p>Nous avons synthetise les avis publies sur <a href="https://www.consobaby.com/avis-casque-anti-bruit-pour-enfants-muffy.html" rel="nofollow noopener" target="_blank">Consobaby</a>, le site officiel <a href="https://www.alpineprotectionauditive.fr/products/muffy-kids" rel="nofollow noopener" target="_blank">Alpine</a> et le <a href="https://casquesantibruit.fr/comparatif-des-casques-alpine-muffy-en-year/" rel="nofollow noopener" target="_blank">comparatif Casques Anti-bruit</a>. Tendances qui se degagent :</p>

<h3>Les points forts qui reviennent</h3>
<ul>
<li><strong>Confort exceptionnel.</strong> Les coussinets en mousse multicouche permettent un port prolonge (matchs, concerts de plusieurs heures) sans rougissement des oreilles.</li>
<li><strong>Adopte par les familles d'enfants autistes et TDAH.</strong> Plusieurs parents temoignent que leur enfant neuroatypique porte quotidiennement le Muffy Kids et le considere comme indispensable (reduction de l'anxiete dans les lieux publics).</li>
<li><strong>Attenuation efficace sans couper du monde.</strong> Les 25 dB reduisent les bruits genants tout en laissant les voix audibles — l'enfant reste present dans les interactions sociales.</li>
<li><strong>Longevite : evolue avec la croissance.</strong> Plusieurs parents rapportent 3 a 5 ans d'usage avec le meme casque, grace a l'arceau ajustable.</li>
</ul>

<h3>Les points de vigilance</h3>
<ul>
<li><strong>Moins adapte aux tres petits.</strong> Avant 5 ans, le bandeau tissu du <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Muffy Baby</a> (23 dB) reste preferable — pas de pression sur la fontanelle et format adapte aux petites tetes.</li>
<li><strong>Coussinets qui chauffent en ete.</strong> Par temps chaud, prevoir des pauses toutes les 90 minutes pour eviter la transpiration sous les coussinets.</li>
</ul>

<h3>Pour quel usage ?</h3>
<p>Le Muffy Kids est particulierement adapte aux enfants qui accompagnent leurs parents a des matchs, festivals ou voyages. C'est aussi le casque le plus recommande pour les enfants presentant une hypersensibilite sensorielle (TSA, TDAH, HP) qui ont besoin de soutien a l'ecole ou dans les lieux publics.</p>`,
    },

    // ============ Alecto Educatif 29 dB ============
    {
      handle: "casque-antibruit-alecto-educatif-29db",
      fixes: [
        // Age: feed said "from 3 ans" but Alecto officially says 18 months
        { from: "a partir de 3 ans", to: "a partir de 18 mois" },
        { from: "des 3 ans", to: "des 18 mois" },
        { from: "Age recommande :</strong> a partir de 3 ans", to: "Age recommande :</strong> a partir de 18 mois (adaptable pour adultes)" },
      ],
      reviewsSection: `<h2>Retours d'experience parents</h2>

<p>Avis synthetises depuis <a href="https://www.jilu.fr/en/products/casque-anti-bruit-29db-vert-deau" rel="nofollow noopener" target="_blank">Jilu</a> (specialiste sensoriel enfants), <a href="https://casquesantibruit.fr/autisme/" rel="nofollow noopener" target="_blank">Casques Antibruit</a> et <a href="https://www.leobelo.fr/casque-anti-bruit-autisme-le-guide-sans-paniquer-tsa/" rel="nofollow noopener" target="_blank">Leobelo - guide TSA</a>. Ce que disent les utilisateurs :</p>

<h3>Les points forts qui reviennent</h3>
<ul>
<li><strong>Transformation possible au quotidien.</strong> Un parent temoigne : son enfant de 4 ans qui ne supportait pas le bruit de l'aspirateur s'est mis spontanement a utiliser le casque — et a meme commence a passer l'aspirateur lui-meme.</li>
<li><strong>Adaptation sur toutes les morphologies.</strong> Les parents soulignent que l'arceau ajustable s'adapte aussi bien aux petites tetes qu'aux plus grandes, y compris a des adultes hypersensibles.</li>
<li><strong>Legerete et confort.</strong> Retour qui revient : "leger et confortable" — important quand le casque doit etre porte plusieurs heures a l'ecole.</li>
<li><strong>Reduit sans couper.</strong> Les utilisateurs insistent : le casque abaisse les bruits a un niveau tolerable pour la concentration (lecture, devoirs) sans les supprimer totalement — l'enfant reste en contact avec son environnement.</li>
</ul>

<h3>Les points de vigilance</h3>
<ul>
<li><strong>Ressenti d'attenuation variable selon les personnes.</strong> Quelques utilisateurs trouvent que le casque ne "reduit qu'un peu" le bruit. L'efficacite percue depend de la sensibilite auditive individuelle et du niveau sonore de base.</li>
<li><strong>Pas un casque audio.</strong> A ne pas confondre avec un casque noise-cancelling actif (type Bose) : c'est une protection passive, sans musique.</li>
</ul>

<h3>Pour qui en priorite ?</h3>
<p>Ce casque est tout particulierement recommande aux enfants autistes, TDAH, HP ou simplement hypersensibles aux bruits. Il est egalement adopte par des adultes qui travaillent en open space ou ont besoin de concentration, grace a son arceau ajustable.</p>`,
    },

    // ============ Dooky Evolutif 2-en-1 ============
    {
      handle: "casque-antibruit-dooky-evolutif-2-en-1",
      fixes: [
        // Age: feed/official says 0-12 ans not 0-6
        { from: "de 0 a 6 ans", to: "de la naissance a 12 ans" },
        { from: "0 a 6 ans", to: "0 a 12 ans" },
        { from: "6 ans", to: "12 ans" },
        { from: "Age recommande :</strong> 0 a 12 ans", to: "Age recommande :</strong> de la naissance a 12 ans" },
        { from: "Reduction du bruit certifiee CE", to: "Reduction du bruit 27 dB (SNR)" },
        { from: "<strong>Certification :</strong> CE", to: "<strong>Reduction du bruit :</strong> 27 dB (SNR)<br/><strong>Certification :</strong> CE EN 352-1:2020" },
      ],
      reviewsSection: `<h2>Retours d'experience parents</h2>

<p>Informations synthetisees depuis <a href="https://www.sevirakids.com/fr/3505/securite/casque-anti-bruit-evolutif-2-en-1-bebe-et-enfant.html" rel="nofollow noopener" target="_blank">Sevira Kids</a>, <a href="https://e-shop-boiteadoudous.be/products/dooky-casque-de-protection-auditive-2-en-1-pour-bebe-enfant-x3001201" rel="nofollow noopener" target="_blank">La Boite a Doudous</a> et <a href="https://www.kiabi.com/casque-anti-bruit-evolutif-2-en-1-bebe-et-enfant-dooky-blanc_P2485218C2485219" rel="nofollow noopener" target="_blank">Kiabi</a>. Tendances :</p>

<h3>Les points forts qui reviennent</h3>
<ul>
<li><strong>L'investissement ultra-durable.</strong> Un seul casque pour 12 ans d'utilisation grace a l'arceau interchangeable — evite de racheter un produit quand bebe grandit.</li>
<li><strong>Transition fluide bebe → enfant.</strong> Les parents apprecient de pouvoir changer le systeme de maintien quand l'enfant est pret, sans avoir a reapprendre a le porter.</li>
<li><strong>Attenuation 27 dB, un bon niveau.</strong> Superieure aux casques d'entree de gamme (22-25 dB), mais sans excas pour ne pas isoler completement l'enfant de l'environnement.</li>
<li><strong>Design sobre qui s'adapte a tout.</strong> Le blanc epure plait autant aux parents qu'aux enfants, ne se demode pas sur la duree d'usage.</li>
</ul>

<h3>Les points de vigilance</h3>
<ul>
<li><strong>Ne coupe pas totalement le bruit ambiant.</strong> Comme tous les casques passifs, il reduit sans supprimer — ce qui permet a l'enfant de rester en contact avec vos instructions vocales.</li>
<li><strong>Le changement bandeau/arceau est ponctuel.</strong> En general a 3 ans, mais depend de la morphologie de l'enfant.</li>
</ul>

<h3>Pour quel usage ?</h3>
<p>Le Dooky Evolutif 2-en-1 est le choix economique et ecologique par excellence : un seul casque qui couvre de la naissance a 12 ans. Parfait pour les familles qui prevoient d'avoir plusieurs enfants et pour celles qui veulent investir intelligemment.</p>`,
    },

    // ============ Dooky Protection Bebe ============
    {
      handle: "casque-antibruit-dooky-protection-bebe",
      fixes: [
        { from: "Certifie CE pour bebe", to: "Reduction 25 dB (SNR) — certifie CE" },
        { from: "Certification :</strong> CE", to: "Reduction du bruit :</strong> 25 dB (SNR)<br/><strong>Certification :</strong> CE EN 352-1:2020" },
      ],
      reviewsSection: `<h2>Retours d'experience parents</h2>

<p>Avis synthetises depuis <a href="https://www.berceaumagique.com/produit_dooky-protection-auditive-pour-bebe-blanc-0-3-ans_198033.html" rel="nofollow noopener" target="_blank">Berceau Magique</a>, <a href="https://www.bebe9.com/protection-auditive-bebe-junior-blanc.html" rel="nofollow noopener" target="_blank">Bebe 9</a> et <a href="https://www.bambinou.com/protection-auditive-bebe-0-36m-blanc-dooky" rel="nofollow noopener" target="_blank">Bambinou</a>. Retours typiques :</p>

<h3>Les points forts qui reviennent</h3>
<ul>
<li><strong>Leger et compact.</strong> Les parents soulignent le poids plume du casque et le fait qu'il se plie pour se ranger facilement dans un sac a langer.</li>
<li><strong>Bandeau doux sans pression.</strong> Aucune trace rouge apres usage, meme sur les plus petits. Sans pression sur la fontanelle.</li>
<li><strong>Rapport qualite-prix tres apprecie.</strong> Souvent mentionne comme un bon premier achat ou cadeau de naissance.</li>
<li><strong>Pochette de rangement incluse.</strong> Petit plus pratique pour le transport.</li>
</ul>

<h3>Les points de vigilance</h3>
<ul>
<li><strong>Attenuation moins forte qu'un Muffy Baby.</strong> Les 25 dB suffisent pour des situations courantes (restaurant, trajet) mais pour un feu d'artifice proche, le <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Muffy Baby Alpine</a> (23 dB mais mieux isole) est souvent prefere.</li>
<li><strong>Tres limite dans le temps.</strong> Contrairement au <a href="/products/casque-antibruit-dooky-evolutif-2-en-1" class="text-primary hover:underline">Dooky Evolutif 2-en-1</a>, celui-ci est conçu uniquement pour les 0-3 ans — pas d'arceau de remplacement disponible.</li>
</ul>

<h3>Pour quel usage ?</h3>
<p>Casque d'entree de gamme ideal pour un premier achat, un cadeau de naissance ou pour des usages ponctuels (evenement occasionnel). Si vous prevoyez un usage frequent ou sur plusieurs annees, le Dooky Evolutif ou le Muffy Baby seront un meilleur investissement.</p>`,
    },

    // ============ Alecto Bebes (Blanc/Vert d'eau) ============
    {
      handle: "casque-antibruit-alecto-bebes",
      fixes: [
        // MAJOR FIX: age is 12 months+, not "des la naissance"
        { from: "des la naissance", to: "des 12 mois" },
        { from: "Des la naissance", to: "Des 12 mois" },
        { from: "Age recommande :</strong> des 12 mois", to: "Age recommande :</strong> a partir de 12 mois" },
        { from: "Certifie CE", to: "23 dB (SNR) — certifie CE EN 352-1:2020" },
        { from: "<strong>Certification :</strong> CE", to: "<strong>Reduction du bruit :</strong> 23 dB (SNR)<br/><strong>Certification :</strong> CE EN 352-1:2020<br/><strong>Particularite :</strong> sans parties metalliques (compatible IRM)" },
      ],
      reviewsSection: `<h2>Retours d'experience parents</h2>

<p>Avis synthetises depuis <a href="https://www.berceaumagique.com/produit_alecto-casque-anti-bruit-pour-bebes-blanc-vert-menthe_216706.html" rel="nofollow noopener" target="_blank">Berceau Magique</a>, <a href="https://www.alectobaby.nl/fr/products/alecto-bv-72-gehoorbeschermer-voor-babys-en-peuters-wit-mintgroen" rel="nofollow noopener" target="_blank">Alecto Baby</a> et <a href="https://www.larmoiredebebe.com/fiche/P202508040031.html" rel="nofollow noopener" target="_blank">L'Armoire de Bebe</a>. Points cles :</p>

<h3>Les points forts qui reviennent</h3>
<ul>
<li><strong>Confort exceptionnel.</strong> Le bandeau elastique ajustable epouse parfaitement la tete et les coussinets souples ne laissent pas de marque apres usage.</li>
<li><strong>Compatible IRM.</strong> Particularite unique : <strong>sans aucune partie metallique</strong>. Parfait si votre enfant doit passer une IRM ou un scanner en etat eveille dans un environnement bruyant.</li>
<li><strong>Leger et facile a porter.</strong> Les parents rapportent que les enfants oublient presque qu'ils le portent.</li>
<li><strong>Design bicolore doux.</strong> Le blanc + vert menthe/vert d'eau est tres apprecie visuellement — ideal pour les photos souvenirs.</li>
</ul>

<h3>Les points de vigilance</h3>
<ul>
<li><strong>Pas adapte avant 12 mois.</strong> Contrairement au <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Muffy Baby Alpine</a> qui s'utilise des la naissance, celui-ci est conçu pour les enfants de plus de 12 mois.</li>
<li><strong>Attenuation standard (23 dB).</strong> Identique au Muffy Baby, suffisante pour la majorite des situations mais pas pour les environnements extremes (courses automobiles, concerts metal).</li>
</ul>

<h3>Pour quel usage ?</h3>
<p>Particulierement recommande pour les enfants qui doivent passer un examen d'imagerie medicale (IRM, scanner) en etat eveille, grace a son absence totale de parties metalliques. Egalement un bon choix pour les sorties familiales a partir de 1 an.</p>`,
    },

    // ============ Muffy Baby Menthe edition ============
    {
      handle: "casque-antibruit-alpine-muffy-baby-menthe",
      reviewsSection: `<h2>Retours d'experience parents</h2>

<p>Cette edition partage les caracteristiques techniques du <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Muffy Baby classique</a>. Les retours sont donc identiques — synthetise depuis <a href="https://www.consobaby.com/avis-casque-anti-bruit-pour-enfants-muffy.html" rel="nofollow noopener" target="_blank">Consobaby</a> et <a href="https://www.alpinehearingprotection.com/products/muffy-baby" rel="nofollow noopener" target="_blank">Alpine officiel</a> :</p>

<h3>Les points forts qui reviennent</h3>
<ul>
<li><strong>Coloris pastel tres photogeniques.</strong> L'avantage de cette edition : les teintes menthe, bleu et rose nude sont particulierement appreciees pour les photos de naissance et sur les reseaux sociaux.</li>
<li><strong>Meme qualite qu'un Muffy Baby standard.</strong> 23 dB SNR, bandeau sans pression, etui Protect&Go inclus, garantie 2 ans.</li>
<li><strong>Cadeau de naissance original.</strong> Souvent choisi comme cadeau pour ses teintes douces et son packaging soigne.</li>
</ul>

<h3>Les points de vigilance</h3>
<ul>
<li><strong>Prix plus eleve que la version standard.</strong> Comptez environ 5€ de plus pour l'edition coloree. Si les coloris pastel ne sont pas une priorite, le <a href="/products/casque-antibruit-alpine-muffy-baby" class="text-primary hover:underline">Muffy Baby classique</a> (vert, noir, rose) est plus economique.</li>
<li><strong>Series limitees.</strong> Cette edition peut etre moins disponible en stock que la version classique.</li>
</ul>

<h3>Pour quel usage ?</h3>
<p>Choisi essentiellement pour ses coloris exclusifs — parfait pour offrir a une future maman, pour les shootings photos de naissance, ou simplement pour s'accorder avec l'univers colore de la chambre de bebe.</p>`,
    },
  ]

  for (const patch of patches) {
    const res = await pg.raw(`SELECT description FROM product WHERE handle = '${patch.handle}' AND deleted_at IS NULL`)
    let desc = res.rows?.[0]?.description
    if (!desc) { logger.warn(`  = ${patch.handle}: not found`); continue }

    let changes = 0

    // 1. Apply factual fixes
    for (const { from, to } of patch.fixes || []) {
      if (desc.includes(from)) {
        desc = desc.replace(from, to)
        changes++
      }
    }

    // 2. Insert "Retours d'experience" section before the "À noter" block
    const MARKER = '<div class="mt-6 p-5 bg-bg-light rounded-2xl">'
    if (!desc.includes("Retours d'experience parents")) {
      const idx = desc.lastIndexOf(MARKER)
      if (idx !== -1) {
        desc = desc.substring(0, idx) + patch.reviewsSection + "\n\n" + desc.substring(idx)
        changes++
      } else {
        desc = desc + "\n\n" + patch.reviewsSection
        changes++
      }
    }

    if (changes > 0) {
      const escaped = desc.replace(/'/g, "''")
      await pg.raw(`UPDATE product SET description = '${escaped}' WHERE handle = '${patch.handle}'`)
      logger.info(`  + ${patch.handle}: ${changes} changes applied`)
    } else {
      logger.info(`  = ${patch.handle}: no changes`)
    }
  }

  logger.info("Done!")
}
