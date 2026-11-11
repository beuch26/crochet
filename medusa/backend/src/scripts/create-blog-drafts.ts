import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Create blog post drafts (is_published=false) for the editorial roadmap
 * around "casque anti-bruit bebe" keyword cluster.
 */
export default async function createBlogDrafts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const drafts: Array<{
    handle: string
    title: string
    seo_title: string
    seo_description: string
    category: string
    tags: string[]
  }> = [
    // Cluster 1 — Guide d'achat
    {
      handle: "meilleur-casque-anti-bruit-bebe-comparatif",
      title: "Meilleur casque anti-bruit bébé 2026 : comparatif complet",
      seo_title: "Meilleur casque anti-bruit bébé 2026 : notre comparatif",
      seo_description: "Comparatif des meilleurs casques anti-bruit pour bébé en 2026 : Alpine, Kidywolf, Banz, Peltor. Prix, atténuation, avis et recommandations.",
      category: "Guide d'achat",
      tags: ["casque anti-bruit", "comparatif", "guide d'achat", "audition bébé"],
    },
    {
      handle: "comment-choisir-casque-anti-bruit-bebe",
      title: "Casque anti-bruit bébé : comment choisir ? (guide 2026)",
      seo_title: "Comment choisir un casque anti-bruit bébé ? Guide 2026",
      seo_description: "Les 7 critères essentiels pour bien choisir un casque anti-bruit bébé : atténuation, confort, âge, certifications. Le guide complet.",
      category: "Guide d'achat",
      tags: ["casque anti-bruit", "comment choisir", "guide d'achat"],
    },

    // Cluster 2 — Age
    {
      handle: "a-partir-de-quel-age-casque-anti-bruit-bebe",
      title: "À partir de quel âge un casque anti-bruit pour bébé ?",
      seo_title: "Casque anti-bruit bébé : à partir de quel âge ?",
      seo_description: "0 mois, 3 mois, 1 an : à partir de quel âge votre bébé peut-il porter un casque anti-bruit ? Conseils et recommandations des pédiatres.",
      category: "Conseils",
      tags: ["casque anti-bruit", "âge bébé", "audition bébé"],
    },

    // Cluster 3 — Situations d'usage
    {
      handle: "casque-anti-bruit-bebe-avion",
      title: "Faut-il un casque anti-bruit pour bébé en avion ?",
      seo_title: "Casque anti-bruit bébé en avion : indispensable ou pas ?",
      seo_description: "Votre bébé prend l'avion ? Découvrez si un casque anti-bruit est nécessaire pendant le décollage et l'atterrissage, et comment le choisir.",
      category: "Conseils",
      tags: ["casque anti-bruit", "avion", "voyage bébé"],
    },
    {
      handle: "casque-anti-bruit-bebe-feu-artifice",
      title: "Casque anti-bruit bébé pour feu d'artifice : indispensable ?",
      seo_title: "Casque anti-bruit bébé feu d'artifice : pourquoi et comment",
      seo_description: "Les feux d'artifice produisent jusqu'à 150 dB. Découvrez pourquoi un casque anti-bruit est indispensable pour bébé et comment le choisir.",
      category: "Conseils",
      tags: ["casque anti-bruit", "feu d'artifice", "14 juillet"],
    },
    {
      handle: "emmener-bebe-concert-protection-auditive",
      title: "Emmener bébé à un concert : quelle protection auditive ?",
      seo_title: "Bébé au concert : quelle protection auditive choisir ?",
      seo_description: "Vous voulez emmener bébé à un concert ? Guide complet sur la protection auditive indispensable pour préserver ses oreilles fragiles.",
      category: "Conseils",
      tags: ["casque anti-bruit", "concert", "festival"],
    },
    {
      handle: "mariage-avec-bebe-proteger-oreilles",
      title: "Mariage avec bébé : comment protéger ses oreilles",
      seo_title: "Mariage avec bébé : protéger ses oreilles de la musique",
      seo_description: "Musique DJ, applaudissements, vin d'honneur : comment protéger les oreilles de votre bébé pendant un mariage ? Conseils pratiques.",
      category: "Conseils",
      tags: ["casque anti-bruit", "mariage", "événement"],
    },

    // Cluster 4 — Sommeil / neuroatypie
    {
      handle: "casque-anti-bruit-sommeil-bebe",
      title: "Casque anti-bruit pour le sommeil de bébé : bonne idée ?",
      seo_title: "Casque anti-bruit pour faire dormir bébé : efficace ?",
      seo_description: "Peut-on utiliser un casque anti-bruit pour aider bébé à dormir ? Avis des pédiatres, alternatives et précautions à prendre.",
      category: "Conseils",
      tags: ["casque anti-bruit", "sommeil", "dormir"],
    },
    {
      handle: "casque-anti-bruit-enfant-tdah-hypersensibilite",
      title: "TDAH, hypersensibilité : le casque anti-bruit peut-il aider votre enfant ?",
      seo_title: "Casque anti-bruit TDAH et hypersensibilité : aide ou pas ?",
      seo_description: "Votre enfant est TDAH, autiste ou hypersensible aux bruits ? Comment le casque anti-bruit peut l'aider au quotidien (école, sorties).",
      category: "Conseils",
      tags: ["casque anti-bruit", "TDAH", "autisme", "hypersensibilité"],
    },

    // Cluster 5 — Science
    {
      handle: "combien-de-decibels-dangereux-bebe",
      title: "Combien de décibels sont dangereux pour les oreilles de bébé ?",
      seo_title: "Combien de dB sont dangereux pour bébé ? Guide décibels",
      seo_description: "Aspirateur, concert, feu d'artifice : combien de décibels sont dangereux pour les oreilles fragiles de bébé ? Le guide des seuils.",
      category: "Santé",
      tags: ["décibels", "audition bébé", "bruit"],
    },
    {
      handle: "comment-fonctionne-casque-anti-bruit-bebe",
      title: "Comment fonctionne un casque anti-bruit bébé ? (atténuation, matériaux, normes)",
      seo_title: "Comment fonctionne un casque anti-bruit bébé ?",
      seo_description: "Mousse, passive, norme CE EN 352-1:2020, SNR : découvrez comment fonctionne un casque anti-bruit bébé et ce qui le rend efficace.",
      category: "Santé",
      tags: ["casque anti-bruit", "technologie", "norme CE"],
    },

    // Cluster 6 — Tests produits
    {
      handle: "alpine-muffy-baby-test-avis",
      title: "Alpine Muffy Baby : test complet après 6 mois d'usage",
      seo_title: "Alpine Muffy Baby : notre test et avis complet",
      seo_description: "Test détaillé du casque anti-bruit Alpine Muffy Baby après 6 mois d'utilisation. Confort, efficacité, rapport qualité/prix.",
      category: "Test produit",
      tags: ["Alpine", "Muffy Baby", "test", "avis"],
    },
    {
      handle: "kidywolf-kidynoise-avis",
      title: "Kidywolf Kidynoise : avis d'une maman",
      seo_title: "Kidywolf Kidynoise : notre avis après 3 mois",
      seo_description: "Casque anti-bruit Kidywolf Kidynoise : avis complet d'une maman après 3 mois d'usage. Points forts, limites et comparaison.",
      category: "Test produit",
      tags: ["Kidywolf", "Kidynoise", "test", "avis"],
    },
    {
      handle: "alpine-vs-kidywolf-vs-banz-comparatif",
      title: "Alpine vs Kidywolf vs Banz : le match des casques anti-bruit bébé",
      seo_title: "Alpine vs Kidywolf vs Banz : comparatif casques bébé",
      seo_description: "Trois marques phares du casque anti-bruit bébé face à face : Alpine Muffy, Kidywolf Kidynoise et Baby Banz. Lequel choisir ?",
      category: "Guide d'achat",
      tags: ["Alpine", "Kidywolf", "Banz", "comparatif"],
    },

    // Cluster 7 — Questions pratiques
    {
      handle: "comment-mettre-casque-anti-bruit-bebe",
      title: "Casque anti-bruit bébé : comment le mettre correctement ?",
      seo_title: "Comment mettre un casque anti-bruit à bébé ?",
      seo_description: "Étape par étape : comment bien positionner le casque anti-bruit sur la tête de votre bébé pour un confort et une efficacité optimale.",
      category: "Conseils",
      tags: ["casque anti-bruit", "comment mettre", "tutoriel"],
    },
    {
      handle: "casque-anti-bruit-bebe-efficace-ou-marketing",
      title: "Casque anti-bruit bébé : efficace ou simple marketing ?",
      seo_title: "Casque anti-bruit bébé : vraiment efficace ?",
      seo_description: "Le casque anti-bruit bébé est-il vraiment efficace ou un simple argument marketing ? Études, tests indépendants et avis des ORL.",
      category: "Santé",
      tags: ["casque anti-bruit", "efficacité", "avis ORL"],
    },
    {
      handle: "ou-acheter-casque-anti-bruit-bebe",
      title: "Où acheter un casque anti-bruit pour bébé ? (pharmacie, Amazon, Decathlon)",
      seo_title: "Où acheter un casque anti-bruit bébé ? Comparatif",
      seo_description: "Pharmacie, Amazon, Decathlon, Leclerc : où trouver le meilleur casque anti-bruit pour bébé ? Prix, disponibilité et conseils.",
      category: "Guide d'achat",
      tags: ["casque anti-bruit", "où acheter", "pharmacie"],
    },
  ]

  logger.info(`Creating ${drafts.length} blog post drafts...`)

  const PLACEHOLDER_CONTENT = `<p><em>Brouillon — contenu a rediger.</em></p><h2>Introduction</h2><p>[A completer]</p><h2>Points cles</h2><ul><li>[A completer]</li></ul><h2>Conclusion</h2><p>[A completer]</p>`

  for (const d of drafts) {
    // Check if already exists
    const existing = await pg.raw(`SELECT id FROM blog_post WHERE handle = '${d.handle}' AND deleted_at IS NULL`)
    if (existing.rows?.length > 0) {
      logger.info(`  = ${d.handle} already exists, skipping`)
      continue
    }

    const id = `bp_${Math.random().toString(36).substring(2, 14)}${Date.now().toString(36)}`

    await pg.raw(
      `INSERT INTO blog_post (id, title, handle, content, excerpt, seo_title, seo_description, category, tags, is_published, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, false, NULL, NOW(), NOW())`,
      [id, d.title, d.handle, PLACEHOLDER_CONTENT, d.seo_title, d.seo_description, d.category, d.tags]
    )
    logger.info(`  + ${d.handle}`)
  }

  logger.info("Done!")
}
