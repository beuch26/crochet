import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function seedCollectionContent({ container }: ExecArgs) {
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const collections: Record<string, {
    meta_title: string
    intro_text: string
    seo_text: string
  }> = {
    "tire-lait": {
      meta_title: "Tire-lait electrique et manuel — Guide et comparatif",
      intro_text: "Trouvez le tire-lait adapte a votre quotidien : electrique double pour un tirage rapide et efficace, ou manuel pour plus de liberte en deplacement. Nos modeles sont selectionnes pour leur confort, leur fiabilite et leur compatibilite avec les accessoires d'allaitement les plus courants.",
      seo_text: `Le tire-lait est un allie precieux pour les mamans qui souhaitent concilier allaitement et vie active. Que vous repreniez le travail, que vous ayez besoin de soulager un engorgement ou que vous souhaitiez constituer un stock de lait, il existe un modele fait pour vous.

Un tire-lait electrique double pompage permet de tirer les deux seins simultanement en 15 a 20 minutes. C'est la solution la plus efficace pour les tirages quotidiens. Les modeles manuels, plus compacts et silencieux, sont parfaits pour un usage ponctuel ou en deplacement.

Quelques criteres pour bien choisir : le confort de la teterelle (la taille doit correspondre a votre mamelon), le niveau sonore si vous tirez au bureau, et la compatibilite avec vos biberons et sachets de conservation. Toutes nos references sont conformes aux normes europeennes et garanties sans BPA.`,
    },
    "soins-allaitement": {
      meta_title: "Soins allaitement : creme, compresse et baume mamelons",
      intro_text: "Crevasses, irritations, sensibilite : l'allaitement n'est pas toujours un long fleuve tranquille. Notre selection de soins cible les desagrements les plus frequents avec des formules douces, compatibles avec l'allaitement et efficaces des la premiere application.",
      seo_text: `Les premiers jours d'allaitement sont souvent les plus delicats. Les mamelons, sollicites intensement, peuvent developper des crevasses douloureuses qui rendent chaque tetee difficile. Heureusement, des solutions simples et naturelles existent.

La creme a la lanoline reste la reference : 100 % naturelle, elle hydrate et protege sans qu'il soit necessaire de la retirer avant la tetee. Les compresses hydrogel offrent un soulagement immediat en cas de crevasses installees — elles refroidissent, hydratent et creent un environnement favorable a la cicatrisation.

Pour les mamans qui preferent des alternatives naturelles, les baumes bio a base de beurre de karite ou d'huile d'olive sont egalement tres efficaces. L'essentiel est d'agir des les premiers signes d'inconfort et de verifier la prise du sein de bebe avec votre sage-femme.`,
    },
    "soins-grossesse": {
      meta_title: "Soins grossesse et post-partum — Naturels et bio",
      intro_text: "Prenez soin de vous a chaque etape de votre grossesse. Nos soins naturels et bio vous accompagnent dans la preparation de votre corps : massage du perinee, hydratation de la peau, apaisement post-accouchement.",
      seo_text: `La grossesse transforme le corps et chaque trimestre apporte ses propres besoins. Des le deuxieme trimestre, l'hydratation de la peau aide a prevenir les vergetures. Au troisieme trimestre, le massage du perinee prepare les tissus a l'accouchement et reduit le risque de dechirure.

L'huile de massage du perinee, a utiliser a partir de la 34e semaine, est recommandee par les sages-femmes. Quelques minutes de massage 2 a 3 fois par semaine suffisent pour assouplir les tissus. Apres l'accouchement, que ce soit par voie basse ou cesarienne, des soins adaptes aident a la recuperation : sprays apaisants, patchs cicatrisants ou cremes reparatrices.

Nos formules sont selectionnees pour leur composition clean, sans perturbateurs endocriniens, et adaptees aux femmes enceintes et allaitantes.`,
    },
    "casque-anti-bruit-bebe": {
      meta_title: "Casque anti-bruit bebe : protection auditive des 0 mois",
      intro_text: "Protegez l'audition de votre bebe dans les environnements bruyants : feux d'artifice, concerts, stades, travaux ou fetes de famille. Nos casques anti-bruit sont certifies CE, confortables et adaptes aux tout-petits des la naissance.",
      seo_text: `L'audition de bebe est beaucoup plus sensible que celle d'un adulte. Des 80 decibels — le niveau d'un aspirateur bruyant — l'exposition prolongee peut etre nefaste. Lors d'un feu d'artifice (120-150 dB) ou d'un concert (100-120 dB), un casque anti-bruit n'est pas un luxe, c'est une necessite.

Les casques pour bebes se declinent en deux categories : les modeles Baby (0-18 mois) avec un bandeau souple qui n'appuie pas sur la fontanelle, et les modeles Kids (2-10 ans) avec un arceau ajustable. L'attenuation varie de 20 a 27 dB selon les modeles, suffisante pour ramener le bruit a un niveau confortable.

Nos marques — Alpine, Peltor, BBTKCARE — sont reconnues pour leur qualite de fabrication et leur certification CE. Pensez a verifier le tour de tete de votre enfant avant de choisir la taille.`,
    },
    "coquillage-allaitement-nacre": {
      meta_title: "Coquillage allaitement nacre — Protection naturelle",
      intro_text: "Les coquillages d'allaitement en nacre sont une alternative naturelle et reutilisable aux coussinets jetables. Ils protegent les mamelons entre les tetees, favorisent la cicatrisation des crevasses et recueillent les petites fuites de lait.",
      seo_text: `Utilises depuis des generations par les femmes du littoral, les coquillages d'allaitement connaissent un regain d'interet aupres des jeunes mamans. Leur principe est simple : places dans le soutien-gorge, ils maintiennent le mamelon en contact avec quelques gouttes de lait maternel, un cicatrisant naturel extremement efficace.

La nacre, douce et lisse, evite les frottements avec le tissu et cree une barriere protectrice. Contrairement aux coussinets jetables, les coquillages ne dessechent pas le mamelon et n'y adherent pas en cas de crevasse.

Nos coquillages sont vendus par paire et disponibles en plusieurs tailles pour s'adapter a toutes les morphologies. Faciles d'entretien — un simple rinçage a l'eau tiede entre chaque utilisation — ils durent tout au long de votre allaitement et peuvent meme etre reutilises pour un prochain bebe.`,
    },
    "bola-de-grossesse": {
      meta_title: "Bola de grossesse : bijou apaisant pour bebe in utero",
      intro_text: "Le bola de grossesse est un bijou traditionnel mexicain qui emet un tintement doux et apaisant, perceptible par bebe des la 20e semaine. A la fois accessoire de mode et objet de bien-etre, il vous accompagne tout au long de votre grossesse.",
      seo_text: `Le bola de grossesse se porte sur un long sautoir qui repose sur le ventre arrondi. A l'interieur du pendentif, une petite bille en laiton ou en cuivre produit un son delicat a chaque mouvement. Ce tintement, perçu par bebe in utero a travers le liquide amniotique, l'accompagne pendant toute la grossesse.

Apres la naissance, ce son familier a un pouvoir apaisant : accrochez le bola au berceau ou cousez-le dans un doudou, et il aidera bebe a retrouver la serenite qu'il associe a la vie dans le ventre de maman.

Nos bolas sont en argent 925, cuivre ou plaque or, avec des motifs varies : ange gardien, arbre de vie, fleur de lotus, pierre de lune. C'est aussi le cadeau de naissance ideal, symbolique et elegant. Chaque bola est livre avec sa chaine ajustable.`,
    },
    "bout-de-sein": {
      meta_title: "Bout de sein silicone Medela — Tailles S, M et L",
      intro_text: "Les bouts de sein en silicone ultra-fin facilitent la prise du sein en cas de mamelons plats, inverses ou douloureux. Ils constituent une aide temporaire precieuse pour maintenir l'allaitement dans les moments difficiles.",
      seo_text: `Le bout de sein est une fine coque en silicone qui se pose sur le mamelon pendant la tetee. Il aide bebe a saisir le sein plus facilement, notamment en cas de mamelons plats ou inverses, de crevasses douloureuses, ou lorsque bebe a des difficultes de succion (premature, frein de langue).

Le choix de la bonne taille est essentiel : un bout de sein trop petit comprime le mamelon et reduit le transfert de lait, un trop grand gene la prise du sein. Mesurez le diametre de votre mamelon au repos et choisissez la taille correspondante : S (16 mm), M (20 mm) ou L (24 mm).

Les bouts de sein sont conçus comme une aide transitoire. N'hesitez pas a consulter une consultante en lactation pour travailler en parallele sur la cause sous-jacente et envisager un sevrage progressif du bout de sein quand bebe sera pret.`,
    },
    "coussinet-allaitement": {
      meta_title: "Coussinets allaitement lavables et jetables — Bio",
      intro_text: "Discrets et absorbants, les coussinets d'allaitement vous gardent au sec entre les tetees. Decouvrez nos modeles lavables en coton bio pour un choix economique et ecologique, ou jetables pour la praticite en deplacement.",
      seo_text: `Les fuites de lait sont normales, surtout les premieres semaines quand la lactation se met en place. Les coussinets d'allaitement absorbent ces fuites et protegent vos vetements. Deux grandes familles existent et beaucoup de mamans les combinent.

Les coussinets lavables en coton bio ou bambou sont doux, respirants et economiques a long terme. Un lot de 6 a 8 paires suffit avec un lavage tous les 2-3 jours. Les coussinets jetables sont ultra-fins et adhesifs — parfaits en sortie ou au travail quand vous n'avez pas la possibilite de les rincer.

Les coussinets en silicone sont une troisieme option : ils exercent une legere pression qui arrete la fuite au lieu de l'absorber. Invisibles sous un t-shirt, ils sont ideaux pour les sorties ou les occasions speciales.`,
    },
    "conservation-lait-maternel": {
      meta_title: "Conservation lait maternel : sachets et pots steriles",
      intro_text: "Sachets de congelation, pots de conservation, etiquettes de datation : tout le necessaire pour stocker votre lait maternel en toute securite et constituer une reserve pour les jours ou vous ne serez pas disponible.",
      seo_text: `Constituer un stock de lait maternel offre une vraie liberte : confier bebe a papa ou aux grands-parents, reprendre le travail sereinement, ou simplement avoir un plan B en cas de fatigue. Encore faut-il respecter les regles de conservation pour que le lait garde toutes ses proprietes.

Les sachets de conservation pre-sterilises sont la solution la plus pratique : plats, ils se congelent facilement et prennent peu de place. Notez toujours la date et la quantite sur chaque sachet. Les pots rigides en polypropylene sont reutilisables et parfaits pour le refrigerateur.

Rappel des durees de conservation (lait fraichement tire) : 4 heures a temperature ambiante (25°C max), 4 jours au refrigerateur (4°C), 6 mois au congelateur (-18°C). Ne recongelez jamais du lait qui a ete decongele, et decongelez toujours au refrigerateur ou sous l'eau tiede, jamais au micro-ondes.`,
    },
    "soutien-gorge-allaitement": {
      meta_title: "Soutien-gorge allaitement : confort et ouverture clip",
      intro_text: "Confort, maintien et praticite : nos soutiens-gorge d'allaitement sont conçus pour faciliter les tetees au quotidien. Ouverture clip d'une seule main, sans armature pour ne pas comprimer les canaux, et matiere douce sur la peau.",
      seo_text: `Un bon soutien-gorge d'allaitement change la vie. L'ouverture a clip permet de degrafer le bonnet d'une seule main pendant que l'autre tient bebe. Le maintien sans armature evite la compression des canaux lactiferes, reduisant le risque de mastite et d'engorgement.

Quand l'acheter ? Idealement au 8e mois de grossesse, quand votre poitrine a atteint sa taille quasi definitive. Prenez une taille de bonnet au-dessus de votre taille actuelle pour anticiper la montee de lait. Les modeles avec rallonge d'agrafage s'adaptent aux variations de tour de dos.

Nos modeles couvrent tous les besoins : soutien-gorge dentelle pour les jours ou vous voulez vous sentir feminine, brassiere sport pour les mamans actives, et brassiere nuit ultra-douce sans coutures pour dormir confortablement.`,
    },
    "biberons-tetines": {
      meta_title: "Biberons et tetines compatibles allaitement maternel",
      intro_text: "Des biberons et tetines conçus pour faciliter la transition sein-biberon sans perturber l'allaitement. La tetine Natural Wave reproduit le mouvement naturel de succion pour eviter la confusion sein-biberon.",
      seo_text: `La confusion sein-biberon est la crainte numero un des mamans qui allaitent et doivent introduire le biberon. La difference de mecanique de succion entre le sein (actif, bebe doit travailler) et un biberon classique (passif, le lait coule tout seul) peut amener bebe a refuser le sein ensuite.

Les tetines physiologiques a debit lent resolvent ce probleme : bebe doit exercer une succion active, exactement comme au sein. La forme asymetrique respecte le palais et favorise un bon developpement bucco-dentaire.

Nous avons selectionne des biberons compatibles avec l'allaitement mixte, en verre ou en polypropylene sans BPA. Les systemes anti-coliques integres reduisent l'ingestion d'air et limitent les inconforts digestifs. Commencez toujours par un debit lent (taille 1) et n'augmentez que si bebe montre des signes de frustration.`,
    },
    "vaisselle-bebe": {
      meta_title: "Vaisselle bebe silicone : assiette ventouse et couverts",
      intro_text: "Des 4-6 mois, bebe decouvre de nouvelles saveurs. Notre vaisselle en silicone alimentaire est conçue pour la diversification : assiettes a ventouse qui restent en place, bols anti-renversement et couverts ergonomiques pour petites mains.",
      seo_text: `La diversification alimentaire est une etape passionnante, parfois un peu salissante. Une vaisselle adaptee fait toute la difference : l'assiette a ventouse reste collee a la table (meme quand bebe tape dessus), le bol anti-renversement limite les degats, et la cuillere souple en silicone respecte les gencives sensibles.

Le silicone alimentaire de qualite est le materiau ideal : souple, incassable, il passe au lave-vaisselle, au micro-ondes et au congelateur. Nos sets sont sans BPA, sans phtalates et conformes aux normes alimentaires europeennes.

Pour la DME (diversification menee par l'enfant), les assiettes compartimentees permettent de proposer plusieurs aliments sans qu'ils se melangent. Les sets complets — assiette, bol, cuillere, bavoir — font aussi d'excellents cadeaux de naissance pratiques et colores.`,
    },
    "tresse-de-lit-bebe": {
      meta_title: "Tresse de lit bebe : tour de lit tresse doux et decoratif",
      intro_text: "La tresse de lit protege bebe des barreaux du berceau tout en apportant une touche decorative a la chambre. Douce, hypoallergenique et disponible dans de nombreux coloris pour s'harmoniser avec votre decoration.",
      seo_text: `La tresse de lit, ou tour de lit tresse, remplit une double fonction : elle amortit les contacts entre bebe et les barreaux du lit, et elle cree un environnement cocooning et rassurant. Contrairement aux anciens tours de lit en tissu plat, la structure tressee assure une bonne circulation de l'air.

Nos tresses sont fabriquees en coton doux et hypoallergenique, avec un rembourrage moelleux qui garde sa forme dans le temps. Elles sont disponibles en tresses a 3 brins (plus fines, ideales pour les berceaux) ou a 4 brins (plus volumineuses, pour les lits 60x120 et 70x140).

Mesurez le perimetre interieur du lit pour choisir la bonne longueur : 150 cm pour un berceau, 200 cm pour un tour partiel de lit, 300-400 cm pour un tour complet. Les tresses sont lavables en machine a 30°C.`,
    },
    "trousse-de-soin-bebe": {
      meta_title: "Trousse de soin bebe : kit complet premiers soins",
      intro_text: "Tout le necessaire pour la toilette et les premiers soins de bebe, reuni dans une trousse compacte. Thermometre, mouche-bebe, coupe-ongles, serum physiologique : des indispensables selectionnes pour leur securite et leur facilite d'utilisation.",
      seo_text: `Les premiers jours avec bebe sont intenses, et avoir tout le materiel de soin a portee de main evite bien du stress. Une trousse de soin complete regroupe les essentiels : thermometre digital rapide, mouche-bebe (a aspiration nasale ou electrique), coupe-ongles ou ciseaux a bouts ronds, brosse a cheveux souple, et doses de serum physiologique.

Le thermometre frontal ou auriculaire donne une mesure fiable en quelques secondes — indispensable quand bebe est agite. Le mouche-bebe degage le nez en douceur, car un nourrisson ne sait pas se moucher seul avant 2-3 ans.

Nos trousses sont presentees dans des pochettes compactes faciles a glisser dans le sac a langer. Elles constituent aussi un cadeau de naissance extremement utile et toujours apprecie des jeunes parents.`,
    },
    "attache-tetine": {
      meta_title: "Attache-tetine silicone et bois — Securisee sans BPA",
      intro_text: "Fini la tetine qui tombe par terre : l'attache-tetine se fixe au vetement de bebe et garde la sucette toujours a portee. Nos modeles en silicone et bois naturel sont securises, sans BPA et conformes aux normes europeennes.",
      seo_text: `L'attache-tetine est un petit accessoire qui evite un grand agacement : ramasser la tetine vingt fois par jour, la nettoyer, la re-steriliser. Fixee au vetement de bebe par un clip, elle garde la sucette a portee de bouche en toute securite.

La norme europeenne EN 12586 impose une longueur maximale de 22 cm (clip inclus) pour eviter tout risque d'enroulement autour du cou. Tous nos modeles respectent cette regle. Les materiaux — silicone alimentaire, bois de hetre naturel, acier inoxydable pour le clip — sont sans BPA, sans phtalates et non toxiques.

Au-dela de la securite, l'attache-tetine est aussi un accessoire de mode pour bebe : perles de silicone colorees, prenom personnalisable, formes animales... Elle fait partie des petits cadeaux de naissance toujours apprecies.`,
    },
    "bijoux": {
      meta_title: "Bijoux maternite : bola grossesse et pendentifs argent",
      intro_text: "Des bijoux qui celebrent la maternite avec elegance. Bolas de grossesse en argent 925, pendentifs symboliques, bracelets de naissance : des pieces delicates a porter pendant la grossesse et a garder en souvenir.",
      seo_text: `Nos bijoux de maternite sont bien plus que des accessoires : ils marquent une etape unique dans la vie d'une femme. Le bola de grossesse, porte sur le ventre arrondi, cree un lien sonore avec bebe avant meme sa naissance. Les pendentifs arbre de vie ou ange gardien symbolisent la protection et le renouveau.

Chaque piece est fabriquee en argent 925, cuivre ou plaque or, avec un souci du detail et de la qualite. Les chaines sont ajustables pour s'adapter a l'evolution du ventre pendant la grossesse et se porter plus court apres l'accouchement.

Offrir un bijou de maternite, c'est offrir un souvenir que la maman gardera toute sa vie. Nos coffrets cadeaux avec emballage soigne en font un present ideal pour une baby shower, un anniversaire ou simplement pour faire plaisir a une future maman.`,
    },
    "pour-maman": {
      meta_title: "Tout pour maman : grossesse, allaitement et post-partum",
      intro_text: "Tout ce dont vous avez besoin pour vivre sereinement votre maternite : preparation a l'accouchement, allaitement, post-partum et retour au travail. Des produits selectionnes par des mamans, pour des mamans.",
      seo_text: `Devenir maman est une aventure extraordinaire qui s'accompagne de mille questions pratiques. Notre selection couvre chaque etape pour que vous puissiez vous concentrer sur l'essentiel : profiter de votre bebe.

Avant l'accouchement : huile de massage du perinee, soutien-gorge d'allaitement (a acheter au 8e mois), coussinets et creme lanoline pour etre prete des la maternite. Pendant l'allaitement : tire-lait, coquillages d'allaitement, bouts de sein si necessaire, et sachets de conservation pour constituer votre stock.

Pour le retour au travail : un tire-lait electrique compact, des sachets de conservation etiquetes, et un sac isotherme pour transporter le lait. Et parce que vous le meritez : un bola de grossesse en souvenir, un bijou symbolique, ou simplement un moment pour prendre soin de vous.`,
    },
    "bebe": {
      meta_title: "Tout pour bebe : securite, confort et eveil des 0 mois",
      intro_text: "Securite, confort et eveil : notre selection pour bebe reunit des produits surs, pratiques et adaptes a chaque etape de son developpement, de la naissance jusqu'a ses premiers repas.",
      seo_text: `Chaque produit de notre univers bebe est selectionne avec un critere principal : la securite. Normes CE, certifications europeennes, materiaux sans substances nocives — nous ne faisons aucun compromis.

Pour les sorties : le casque anti-bruit protege les oreilles sensibles de bebe dans les environnements bruyants. Pour le sommeil : la tresse de lit amortit les contacts avec les barreaux et cree un cocon rassurant. Pour la toilette : la trousse de soin regroupe les essentiels du quotidien.

A l'heure de la diversification, notre vaisselle en silicone alimentaire accompagne les premiers repas : assiettes a ventouse, bols anti-renversement et cuilleres souples. Et pour garder la tetine toujours propre, l'attache-tetine est un indispensable que tous les parents finissent par adopter.`,
    },
  }

  console.log("Seeding collection intro + SEO text...")

  for (const [handle, data] of Object.entries(collections)) {
    try {
      const titleEsc = data.meta_title.replace(/'/g, "''")
      const introEsc = data.intro_text.replace(/'/g, "''")
      const seoEsc = data.seo_text.replace(/'/g, "''")

      await pg.raw(`
        UPDATE product_collection
        SET metadata = COALESCE(metadata, '{}'::jsonb)
          || jsonb_build_object('meta_title', '${titleEsc}')
          || jsonb_build_object('intro_text', '${introEsc}')
          || jsonb_build_object('seo_text', '${seoEsc}')
        WHERE handle = '${handle}'
      `)
      console.log(`  + ${handle}`)
    } catch (e: any) {
      console.error(`  x ${handle}: ${e.message}`)
    }
  }

  console.log("Done!")
}
