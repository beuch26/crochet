import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Two fixes on blog posts:
 *   1. Replace author "Magic Crochet Kit" with expert personas keyed on category.
 *   2. Attach a featured_image to posts that still have none, using
 *      topical matches from /images/blog-posts/ where possible, and
 *      the Alpine Muffy Baby product thumbnail as fallback for every
 *      casque-anti-bruit article.
 *
 * Author format: "Firstname — Role" — the frontend splits on " — ".
 */

// Avoid regulated French health professions (sage-femme, puéricultrice, etc.)
// — use generic non-protected titles.
const PERSONAS: Record<string, string> = {
  "Maman": "Clara — Rédactrice spécialisée maternité",
  "Pour Bébé": "Marine — Experte puériculture",
  "Santé": "Clara — Rédactrice spécialisée maternité",
  "Conseils": "Julie — Conseillère puériculture",
  "Guide d'achat": "Julie — Conseillère puériculture",
  "Test produit": "Julie — Conseillère puériculture",
  "Diversification": "Marine — Experte puériculture",
}
const PERSONA_DEFAULT = "Clara — Rédactrice spécialisée maternité"

const FEATURED_IMAGES: Record<string, string> = {
  // Topical matches from existing /images/blog-posts/ assets
  "allaitement-poisson-cru": "les-aliments-interdits-pendant-l-allaitement.webp",
  "calendrier-chinois-grossesse": "calendrier-chinois-de-grossesse.webp",
  "chocolat-pendant-l-allaitement": "les-aliments-interdits-pendant-l-allaitement.webp",
  "comment-mettre-les-coquillages-d-allaitement-en-nacre": "Qu_est_ce_qu_une_coquille_d_allaitement_blog.webp",
  "jumeaux-nos-astuces-pour-sorganiser-au-quotidien": "preparer-arrivee-de-bebe.webp",
  "age-bebe-claque-la-langue": "faire-accepter-biberon-bebe-allaite.webp",
  // Casque anti-bruit articles — use the Alpine Muffy Baby product thumbnail
  "a-partir-de-quel-age-casque-anti-bruit-bebe": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "alpine-muffy-baby-test-avis": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "alpine-vs-kidywolf-vs-banz-comparatif": "/images/products/116-large_default.webp",
  "casque-anti-bruit-bebe-avion": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "casque-anti-bruit-bebe-efficace-ou-marketing": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "casque-anti-bruit-bebe-feu-artifice": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "casque-anti-bruit-enfant-tdah-hypersensibilite": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "casque-anti-bruit-sommeil-bebe": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "combien-de-decibels-dangereux-bebe": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "comment-choisir-casque-anti-bruit-bebe": "/images/products/116-large_default.webp",
  "comment-fonctionne-casque-anti-bruit-bebe": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "comment-mettre-casque-anti-bruit-bebe": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "emmener-bebe-concert-protection-auditive": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "kidywolf-kidynoise-avis": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "mariage-avec-bebe-proteger-oreilles": "/images/products/vertbaudet/muffy-baby-vert-1.webp",
  "meilleur-casque-anti-bruit-bebe-comparatif": "/images/products/116-large_default.webp",
  "ou-acheter-casque-anti-bruit-bebe": "/images/products/116-large_default.webp",
}

export default async function fixBlogAuthorsImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const res = await pg.raw(`
    SELECT id, handle, category, author, featured_image FROM blog_post WHERE deleted_at IS NULL
  `)

  let authorsFixed = 0
  let imagesFixed = 0

  for (const row of res.rows || []) {
    const updates: Record<string, string> = {}

    // Author rewrite — if currently Magic Crochet Kit, empty, or one of the older
    // regulated-profession personas that we need to swap out.
    const needsRewrite = !row.author || row.author === "Magic Crochet Kit"
      || /^(Clara|Marine|Julie)\s+—\s+(Sage-femme|Puéricultrice)$/.test(row.author)
    if (needsRewrite) {
      const persona = PERSONAS[row.category] || PERSONA_DEFAULT
      if (persona !== row.author) {
        updates.author = persona
        authorsFixed++
      }
    }

    // Featured image assignment for posts without one
    if (!row.featured_image || row.featured_image.trim() === "") {
      const image = FEATURED_IMAGES[row.handle]
      if (image) {
        updates.featured_image = image
        imagesFixed++
      }
    }

    if (Object.keys(updates).length === 0) continue

    const sets: string[] = []
    const params: any[] = []
    for (const [k, v] of Object.entries(updates)) {
      sets.push(`${k} = ?`)
      params.push(v)
    }
    params.push(row.id)
    await pg.raw(`UPDATE blog_post SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`, params)
    logger.info(`  + ${row.handle} — ${Object.keys(updates).join(" + ")}`)
  }

  logger.info(`\nDone: ${authorsFixed} authors rewritten, ${imagesFixed} featured images attached.`)
}
