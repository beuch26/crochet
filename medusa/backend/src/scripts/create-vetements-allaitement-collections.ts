import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Create the "Vêtements d'allaitement" collection family:
 *   - 1 parent: vetements-allaitement
 *   - 8 sub-collections: robe, tunique, pyjama, pull, t-shirt, salopette,
 *     maillot-bain, pantalon
 * Each collection gets SEO content (intro_text, seo_text, faqs,
 * meta_title, meta_description).
 */
export default async function createVetementsAllaitementCols({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any
  const productModuleService = container.resolve(Modules.PRODUCT)

  type ColCfg = {
    handle: string
    title: string
    intro: string
    seoText: string
    metaTitle: string
    metaDesc: string
    faqs: { q: string; a: string }[]
  }

  const collections: ColCfg[] = [
    // ============ PARENT ============
    {
      handle: "vetements-allaitement",
      title: "Vêtements d'allaitement",
      intro: "Tous les vêtements pensés pour faciliter l'allaitement au quotidien : robes, tuniques, pyjamas, pulls et plus, avec ouvertures discrètes adaptées aux tétées.",
      seoText: `Allaiter tout en restant élégante et à l'aise, c'est possible avec des vêtements spécialement conçus pour cela. Notre sélection regroupe robes d'allaitement, tuniques à ouverture discrète, pyjamas avec accès facilité, pulls évolutifs et bien plus.

Chaque pièce est pensée pour offrir un accès rapide au sein lors des tétées (zips invisibles, double épaisseur, ouvertures latérales) tout en restant élégante au quotidien — au bureau comme à la maison, en sortie comme en pyjama.

Notre sélection est issue des marques de référence en maternité (Pomkin, Cache Cœur, etc.) avec des coupes flatteuses qui s'adaptent à la silhouette post-partum.`,
      metaTitle: "Vêtements d'allaitement : robes, pyjamas, tuniques et plus",
      metaDesc: "Découvrez notre sélection de vêtements d'allaitement : robes, tuniques, pyjamas et pulls avec ouvertures discrètes pour tétées faciles.",
      faqs: [
        { q: "Pourquoi acheter des vêtements d'allaitement ?", a: "Les vêtements d'allaitement permettent de donner le sein discrètement et facilement, sans avoir à se déshabiller. Ils sont conçus avec des ouvertures invisibles (zips latéraux, double épaisseur, plis croisés) qui rendent les tétées plus confortables, surtout en public ou la nuit." },
        { q: "Pendant combien de temps porter ces vêtements ?", a: "Aussi longtemps que vous allaitez, généralement entre 6 mois et 2 ans. Beaucoup de pièces sont aussi évolutives et peuvent se porter pendant la grossesse et après le sevrage." },
        { q: "Quelles marques sont disponibles ?", a: "Nous sélectionnons les marques spécialisées en maternité et allaitement : Pomkin, Cache Cœur, Boob Design, Mamalicious, et plus." },
      ],
    },

    // ============ SUB-COLLECTIONS ============
    {
      handle: "robe-allaitement",
      title: "Robes d'allaitement",
      intro: "Robes confortables et élégantes avec accès discret au sein. Pour le bureau, les sorties ou tout simplement profiter de votre jour-J avec bébé.",
      seoText: `Une robe d'allaitement combine élégance et fonctionnalité. Grâce à des ouvertures invisibles intégrées dans la coupe (plis croisés, double épaisseur, zips latéraux), vous pouvez allaiter en quelques secondes, où que vous soyez.

Les robes d'allaitement sont aussi parfaites pour les évènements (mariages, baptêmes) où vous voulez rester chic tout en restant disponible pour bébé. La plupart sont également utilisables pendant la grossesse grâce à leur coupe adaptable.`,
      metaTitle: "Robes d'allaitement : élégantes et pratiques pour maman",
      metaDesc: "Robes d'allaitement avec ouvertures discrètes pour tétées faciles. Coupes flatteuses post-partum, idéales pour le quotidien et les évènements.",
      faqs: [
        { q: "Comment fonctionne une robe d'allaitement ?", a: "La plupart des robes d'allaitement utilisent un système de double épaisseur ou de plis croisés qui permet de soulever discrètement le tissu pour donner le sein. D'autres ont des zips latéraux invisibles qui s'ouvrent au niveau de la poitrine." },
        { q: "Peut-on porter une robe d'allaitement enceinte ?", a: "Oui, la plupart sont évolutives et s'adaptent à la silhouette pendant la grossesse. C'est un excellent investissement qui couvre les 9 mois de grossesse + la période d'allaitement." },
      ],
    },
    {
      handle: "tunique-allaitement",
      title: "Tuniques et chemisiers d'allaitement",
      intro: "Tuniques et chemisiers à porter au bureau ou en sortie, avec ouvertures discrètes pour allaiter sans se découvrir.",
      seoText: `Les tuniques et chemisiers d'allaitement sont parfaits pour reprendre le travail tout en continuant à allaiter. Les ouvertures sont totalement invisibles à l'œil nu — collègues et clients ne verront aucune différence avec une tunique classique.

À porter avec un legging, un pantalon de tailleur ou une jupe, ces pièces couvrent toutes les occasions professionnelles et de ville.`,
      metaTitle: "Tuniques d'allaitement bureau : discrètes et élégantes",
      metaDesc: "Tuniques et chemisiers d'allaitement avec ouvertures invisibles. Parfait pour le bureau, les sorties ou la reprise du travail.",
      faqs: [
        { q: "Les ouvertures sont-elles visibles ?", a: "Non, les tuniques d'allaitement modernes ont des ouvertures totalement invisibles : double épaisseur, zips cachés sous des plis, ou ouvertures latérales sous les bras. Personne ne saura qu'il s'agit d'une tunique d'allaitement." },
      ],
    },
    {
      handle: "pyjama-allaitement",
      title: "Pyjamas et nuisettes d'allaitement",
      intro: "Pyjamas et nuisettes confortables pour les tétées de nuit, avec ouvertures faciles d'accès même à moitié endormie.",
      seoText: `Les nuits d'allaitement sont fatigantes : un pyjama adapté change tout. Avec des ouvertures faciles à manipuler d'une seule main (boutons stratégiques, débardeurs intégrés sous le haut), vous donnez le sein sans avoir à vous lever ni allumer la lumière.

Les pyjamas d'allaitement sont aussi pensés pour le confort post-partum : matières douces (coton bio, modal), coupes amples, ceintures élastiquées qui ne compriment pas le ventre.`,
      metaTitle: "Pyjamas d'allaitement : confort pour tétées de nuit",
      metaDesc: "Pyjamas et nuisettes d'allaitement avec ouvertures faciles pour les tétées nocturnes. Coton bio, coupes amples post-partum.",
      faqs: [
        { q: "Pourquoi un pyjama d'allaitement spécifique ?", a: "Les ouvertures sont conçues pour être manipulées d'une seule main et dans le noir. C'est un détail essentiel quand vous donnez le sein la nuit, à moitié endormie, avec bébé dans les bras." },
        { q: "Le pyjama est-il aussi adapté à la grossesse ?", a: "Oui, la plupart des modèles sont évolutifs et s'adaptent à la silhouette de la grossesse comme à celle du post-partum." },
      ],
    },
    {
      handle: "pull-allaitement",
      title: "Pulls et gilets d'allaitement",
      intro: "Pulls, gilets et sweats avec ouvertures pour allaiter, à porter pendant l'automne et l'hiver pour garder bébé bien au chaud lors des tétées.",
      seoText: `Allaiter en hiver demande un peu d'organisation pour ne pas exposer bébé au froid. Les pulls et gilets d'allaitement résolvent ce problème grâce à des ouvertures situées à l'avant qui permettent de donner le sein sans avoir à se découvrir.

Idéaux pour les sorties au parc, les cafés en terrasse ou simplement pour rester au chaud à la maison.`,
      metaTitle: "Pulls d'allaitement : chaleur et discrétion pour l'hiver",
      metaDesc: "Pulls, gilets et sweats d'allaitement avec ouvertures discrètes. Maintenir bébé au chaud lors des tétées d'automne et d'hiver.",
      faqs: [
        { q: "Comment fonctionne un pull d'allaitement ?", a: "Les pulls d'allaitement ont généralement un zip caché ou une fente verticale au niveau de la poitrine, dissimulée par un repli ou une superposition de tissu. Vous soulevez et bébé peut téter sans être exposé au froid." },
      ],
    },
    {
      handle: "t-shirt-allaitement",
      title: "T-shirts et débardeurs d'allaitement",
      intro: "T-shirts et débardeurs basiques d'allaitement à porter au quotidien, en pyjama ou sous d'autres vêtements pour faciliter chaque tétée.",
      seoText: `Le t-shirt d'allaitement est la base du dressing de toute jeune maman. Simple, confortable, lavable régulièrement, il se porte tout au long de la journée et facilite chaque tétée grâce à une ouverture invisible.

Optez pour plusieurs t-shirts (3 à 5) pour pouvoir alterner sans souci, surtout les premiers mois où les fuites de lait sont plus fréquentes.`,
      metaTitle: "T-shirts d'allaitement basiques pour tous les jours",
      metaDesc: "T-shirts et débardeurs d'allaitement basiques. À porter au quotidien, en pyjama ou en sous-couche pour faciliter les tétées.",
      faqs: [
        { q: "Combien de t-shirts d'allaitement prévoir ?", a: "Comptez 3 à 5 t-shirts pour pouvoir alterner. Les premiers mois, les fuites de lait sont fréquentes et vous devrez peut-être en changer plusieurs fois par jour." },
      ],
    },
    {
      handle: "salopette-allaitement",
      title: "Salopettes et combinaisons d'allaitement",
      intro: "Salopettes et combinaisons confortables avec ouvertures pour allaiter, parfaites pour un look décontracté tendance.",
      seoText: `Les salopettes et combinaisons d'allaitement sont la solution parfaite pour celles qui veulent rester tendance sans renoncer à allaiter facilement. Les ouvertures sont intégrées au plastron pour un accès rapide au sein.

À porter avec un t-shirt, un body ou une chemise selon la saison.`,
      metaTitle: "Salopettes d'allaitement tendance pour mamans actives",
      metaDesc: "Salopettes et combinaisons d'allaitement. Look tendance avec ouvertures discrètes pour allaitement facile.",
      faqs: [
        { q: "Comment allaiter avec une salopette ?", a: "Les salopettes d'allaitement ont des ouvertures intégrées au plastron : zips latéraux, boutons-pression invisibles, ou plis croisés qui se soulèvent. Vous accédez au sein en quelques secondes." },
      ],
    },
    {
      handle: "maillot-bain-allaitement",
      title: "Maillots de bain d'allaitement",
      intro: "Maillots de bain spécialement conçus pour les mamans allaitantes, avec ouvertures discrètes pour profiter de la piscine ou de la plage avec bébé.",
      seoText: `Allaiter à la piscine ou à la plage demande un maillot de bain adapté. Les modèles d'allaitement ont des bonnets ouvrables (clips ou plis croisés) qui permettent de donner le sein sans avoir à enlever le maillot complet.

Disponibles en deux pièces, une pièce et tankini, pour s'adapter à toutes les morphologies post-partum.`,
      metaTitle: "Maillots de bain d'allaitement : piscine et plage facile",
      metaDesc: "Maillots de bain d'allaitement avec bonnets ouvrables. Pour profiter de la piscine ou de la plage en allaitant en toute discrétion.",
      faqs: [
        { q: "Comment allaiter avec un maillot de bain ?", a: "Les maillots de bain d'allaitement ont des bonnets ouvrables avec clips invisibles ou plis croisés. Vous pouvez donner le sein discrètement sans avoir à retirer le maillot." },
      ],
    },
    {
      handle: "pantalon-allaitement",
      title: "Pantalons et leggings d'allaitement",
      intro: "Pantalons et leggings d'allaitement avec ceintures élastiques douces, idéaux pour le confort post-partum.",
      seoText: `Les pantalons d'allaitement (et de grossesse) sont des indispensables du dressing post-partum. Les ceintures élastiques douces ou les bandeaux extensibles s'adaptent parfaitement à la silhouette qui change semaine après semaine.

À porter avec une tunique ou un t-shirt d'allaitement pour une tenue complète et fonctionnelle.`,
      metaTitle: "Pantalons et leggings d'allaitement post-partum",
      metaDesc: "Pantalons et leggings d'allaitement avec ceintures élastiques. Confort post-partum pour s'adapter à la silhouette qui change.",
      faqs: [
        { q: "Quelle taille de pantalon prendre après l'accouchement ?", a: "Prenez votre taille de grossesse au début, puis ajustez selon votre silhouette. La plupart des pantalons d'allaitement ont des ceintures élastiques qui s'adaptent à plusieurs tailles." },
      ],
    },
  ]

  let created = 0
  let skipped = 0

  for (const cfg of collections) {
    // Check if collection already exists
    const exists = await pg.raw(
      `SELECT id FROM product_collection WHERE handle = ? AND deleted_at IS NULL`,
      [cfg.handle]
    )
    if (exists.rows?.length > 0) {
      logger.info(`  = ${cfg.handle} already exists`)
      skipped++
      continue
    }

    // Create via service to get proper ULID
    const [created_col] = await productModuleService.createProductCollections([
      { title: cfg.title, handle: cfg.handle },
    ])

    // Update metadata + filters config
    await pg.raw(
      `UPDATE product_collection SET metadata =
         jsonb_build_object(
           'meta_title', ?::text,
           'meta_description', ?::text,
           'intro_text', ?::text,
           'seo_text', ?::text,
           'faqs', ?::jsonb,
           'filters', ?::text
         )
       WHERE id = ?`,
      [
        cfg.metaTitle,
        cfg.metaDesc,
        cfg.intro,
        cfg.seoText,
        JSON.stringify(cfg.faqs),
        JSON.stringify(["price"]),
        created_col.id,
      ]
    )
    logger.info(`  + Created: ${cfg.handle}`)
    created++
  }

  logger.info(`Done! ${created} created, ${skipped} skipped`)
}
