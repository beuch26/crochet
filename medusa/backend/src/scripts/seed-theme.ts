import { ExecArgs } from "@medusajs/framework/types"
import { THEME_MODULE } from "../modules/theme"

const defaultSettings: { key: string; value: string; type: "text" | "number" | "boolean" | "color" | "image" | "textarea"; group: string; label: string; sort_order: number; description?: string }[] = [
  // === Général ===
  { key: "site_name", value: "Magic Crochet Kit", type: "text", group: "general", label: "Nom du site", sort_order: 1 },
  { key: "site_description", value: "L'essentiel pour bébé & maman", type: "text", group: "general", label: "Description du site", sort_order: 2 },
  { key: "logo_url", value: "", type: "image", group: "general", label: "Logo (URL)", sort_order: 3 },
  { key: "favicon_url", value: "", type: "image", group: "general", label: "Favicon (URL)", sort_order: 4 },

  // === Couleurs ===
  { key: "color_primary", value: "#2563eb", type: "color", group: "colors", label: "Couleur principale", sort_order: 1 },
  { key: "color_secondary", value: "#7c3aed", type: "color", group: "colors", label: "Couleur secondaire", sort_order: 2 },
  { key: "color_accent", value: "#f472b6", type: "color", group: "colors", label: "Couleur d'accent", sort_order: 3 },
  { key: "color_text", value: "#1e293b", type: "color", group: "colors", label: "Couleur du texte", sort_order: 4 },
  { key: "color_background", value: "#ffffff", type: "color", group: "colors", label: "Couleur de fond", sort_order: 5 },

  // === Typographie ===
  { key: "font_heading", value: "DM Serif Display", type: "text", group: "typography", label: "Police des titres", description: "Nom Google Fonts ou police système (ex: DM Serif Display, Playfair Display, Lora)", sort_order: 1 },
  { key: "font_body", value: "DM Sans", type: "text", group: "typography", label: "Police du corps", description: "Nom Google Fonts ou police système (ex: DM Sans, Inter, Poppins)", sort_order: 2 },
  { key: "font_custom_url", value: "", type: "text", group: "typography", label: "URL police personnalisée", description: "URL d'un fichier CSS de police custom (Google Fonts embed ou @font-face)", sort_order: 3 },
  { key: "font_size_base", value: "16", type: "number", group: "typography", label: "Taille de base (px)", description: "Taille de police par défaut du texte", sort_order: 4 },

  // === Hero ===
  { key: "hero_title", value: "L'essentiel pour <span class=\"text-primary\">bébé</span> & <span class=\"text-secondary\">maman</span>", type: "textarea", group: "hero", label: "Titre du hero", sort_order: 1 },
  { key: "hero_subtitle", value: "Des produits soigneusement sélectionnés pour accompagner chaque étape de la maternité, avec amour et expertise.", type: "textarea", group: "hero", label: "Sous-titre du hero", sort_order: 2 },
  { key: "hero_cta_text", value: "Découvrir la boutique", type: "text", group: "hero", label: "Texte du bouton principal", sort_order: 3 },
  { key: "hero_cta_link", value: "/collections", type: "text", group: "hero", label: "Lien du bouton principal", sort_order: 4 },
  { key: "hero_cta2_text", value: "Lire nos conseils", type: "text", group: "hero", label: "Texte du bouton secondaire", sort_order: 5 },
  { key: "hero_cta2_link", value: "/blog", type: "text", group: "hero", label: "Lien du bouton secondaire", sort_order: 6 },
  { key: "hero_badge_text", value: "Livraison gratuite dès 50€", type: "text", group: "hero", label: "Badge au-dessus du titre", sort_order: 7 },

  // === Bandeau annonce ===
  { key: "announcement_enabled", value: "true", type: "boolean", group: "announcement", label: "Afficher le bandeau", sort_order: 1 },
  { key: "announcement_text", value: "Livraison gratuite dès 50€ d'achat", type: "text", group: "announcement", label: "Texte du bandeau", sort_order: 2 },
  { key: "announcement_link", value: "/collections", type: "text", group: "announcement", label: "Lien du bandeau", sort_order: 3 },
  { key: "announcement_bg_color", value: "#1e293b", type: "color", group: "announcement", label: "Couleur de fond", sort_order: 4 },

  // === Produits ===
  { key: "products_per_page", value: "12", type: "number", group: "products", label: "Produits par page", sort_order: 1 },
  { key: "products_show_quick_view", value: "true", type: "boolean", group: "products", label: "Afficher l'aperçu rapide", sort_order: 2 },
  { key: "products_show_wishlist", value: "true", type: "boolean", group: "products", label: "Afficher le bouton wishlist", sort_order: 3 },
  { key: "products_show_discount_badge", value: "true", type: "boolean", group: "products", label: "Afficher le badge promo", sort_order: 4 },

  // === Livraison ===
  { key: "shipping_free_threshold", value: "50", type: "number", group: "shipping", label: "Seuil livraison gratuite (€)", description: "Montant en euros pour la livraison gratuite", sort_order: 1 },
  { key: "shipping_delay", value: "3-5 jours ouvrés", type: "text", group: "shipping", label: "Délai de livraison", sort_order: 2 },
  { key: "shipping_cutoff_hour", value: "14", type: "number", group: "shipping", label: "Heure limite expédition", description: "Commandes avant cette heure = expédié le jour même", sort_order: 3 },
  { key: "shipping_return_days", value: "30", type: "number", group: "shipping", label: "Jours de retour", sort_order: 4 },

  // === Badges de confiance ===
  { key: "trust_badge_1_text", value: "Livraison gratuite dès 50€", type: "text", group: "trust", label: "Badge 1 - Texte", sort_order: 1 },
  { key: "trust_badge_1_icon", value: "truck", type: "text", group: "trust", label: "Badge 1 - Icône", description: "truck, shield, return, lock, star, heart", sort_order: 2 },
  { key: "trust_badge_2_text", value: "Retours gratuits 30 jours", type: "text", group: "trust", label: "Badge 2 - Texte", sort_order: 3 },
  { key: "trust_badge_2_icon", value: "return", type: "text", group: "trust", label: "Badge 2 - Icône", sort_order: 4 },
  { key: "trust_badge_3_text", value: "Paiement 100% sécurisé", type: "text", group: "trust", label: "Badge 3 - Texte", sort_order: 5 },
  { key: "trust_badge_3_icon", value: "shield", type: "text", group: "trust", label: "Badge 3 - Icône", sort_order: 6 },
  { key: "trust_badge_4_text", value: "Service client réactif", type: "text", group: "trust", label: "Badge 4 - Texte", sort_order: 7 },
  { key: "trust_badge_4_icon", value: "heart", type: "text", group: "trust", label: "Badge 4 - Icône", sort_order: 8 },

  // === Footer ===
  { key: "footer_copyright", value: "© {year} Magic Crochet Kit. Tous droits réservés.", type: "text", group: "footer", label: "Texte copyright", description: "{year} sera remplacé automatiquement", sort_order: 1 },
  { key: "footer_show_payment_badges", value: "true", type: "boolean", group: "footer", label: "Afficher les badges de paiement", sort_order: 2 },
  { key: "footer_show_newsletter", value: "true", type: "boolean", group: "footer", label: "Afficher la newsletter dans le footer", sort_order: 3 },

  // === Newsletter ===
  { key: "newsletter_title", value: "Rejoignez la communauté Magic Crochet Kit", type: "text", group: "newsletter", label: "Titre newsletter", sort_order: 1 },
  { key: "newsletter_subtitle", value: "Recevez nos conseils, nouveautés et offres exclusives directement dans votre boîte mail.", type: "textarea", group: "newsletter", label: "Sous-titre newsletter", sort_order: 2 },
  { key: "newsletter_enabled", value: "true", type: "boolean", group: "newsletter", label: "Afficher la section newsletter", sort_order: 3 },

  // === Contact ===
  { key: "contact_email", value: "contact@magic-crochet-kit.com", type: "text", group: "contact", label: "Email de contact", sort_order: 1 },
  { key: "contact_phone", value: "09 51 76 17 11", type: "text", group: "contact", label: "Téléphone", sort_order: 2 },
  { key: "contact_address", value: "6 Rue d'Armaille, 75017 Paris", type: "text", group: "contact", label: "Adresse", sort_order: 3 },
  { key: "contact_company", value: "TN GROUP SASU", type: "text", group: "contact", label: "Nom de l'entreprise", sort_order: 4 },

  // === Réseaux sociaux ===
  { key: "social_facebook", value: "", type: "text", group: "social", label: "Facebook (URL)", sort_order: 1 },
  { key: "social_instagram", value: "", type: "text", group: "social", label: "Instagram (URL)", sort_order: 2 },
  { key: "social_tiktok", value: "", type: "text", group: "social", label: "TikTok (URL)", sort_order: 3 },

  // === SEO ===
  { key: "seo_title_suffix", value: "| Magic Crochet Kit", type: "text", group: "seo", label: "Suffixe des titres", sort_order: 1 },
  { key: "seo_default_description", value: "Magic Crochet Kit — Tout pour bébé et maman. Produits soigneusement sélectionnés pour accompagner la maternité.", type: "textarea", group: "seo", label: "Description par défaut", sort_order: 2 },
  { key: "seo_og_image", value: "", type: "image", group: "seo", label: "Image Open Graph par défaut", sort_order: 3 },

  // === Promo banner ===
  { key: "promo_enabled", value: "false", type: "boolean", group: "promo", label: "Activer le bandeau promo", sort_order: 1 },
  { key: "promo_title", value: "Vente Flash", type: "text", group: "promo", label: "Titre", sort_order: 2 },
  { key: "promo_subtitle", value: "Profitez de nos offres exceptionnelles", type: "text", group: "promo", label: "Sous-titre", sort_order: 3 },
  { key: "promo_end_date", value: "", type: "text", group: "promo", label: "Date de fin (YYYY-MM-DD HH:mm)", description: "Ex: 2026-04-15 23:59", sort_order: 4 },
  { key: "promo_cta_text", value: "En profiter", type: "text", group: "promo", label: "Texte du bouton", sort_order: 5 },
  { key: "promo_cta_link", value: "/collections", type: "text", group: "promo", label: "Lien du bouton", sort_order: 6 },

  // === Navigation ===
  { key: "nav_link_1_text", value: "Blog", type: "text" as const, group: "navigation", label: "Lien 1 — Texte", sort_order: 1 },
  { key: "nav_link_1_url", value: "/blog", type: "text" as const, group: "navigation", label: "Lien 1 — URL", sort_order: 2 },
  { key: "nav_link_2_text", value: "Contact", type: "text" as const, group: "navigation", label: "Lien 2 — Texte", sort_order: 3 },
  { key: "nav_link_2_url", value: "/contact", type: "text" as const, group: "navigation", label: "Lien 2 — URL", sort_order: 4 },
  { key: "nav_link_3_text", value: "", type: "text" as const, group: "navigation", label: "Lien 3 — Texte", sort_order: 5 },
  { key: "nav_link_3_url", value: "", type: "text" as const, group: "navigation", label: "Lien 3 — URL", sort_order: 6 },
  { key: "nav_link_4_text", value: "", type: "text" as const, group: "navigation", label: "Lien 4 — Texte", sort_order: 7 },
  { key: "nav_link_4_url", value: "", type: "text" as const, group: "navigation", label: "Lien 4 — URL", sort_order: 8 },

  // === Medusa config ===
  { key: "medusa_region_id", value: "reg_01KNMDW1PJAW5BV63ARBR3V1XH", type: "text", group: "medusa", label: "Region ID", description: "ID de la région Medusa pour le panier", sort_order: 1 },

  // === Blog ===
  { key: "blog_default_author", value: "Fanny", type: "text", group: "blog", label: "Auteur par défaut", description: "Nom affiché quand l'article n'a pas d'auteur", sort_order: 1 },
  { key: "blog_author_bio", value: "Elle crochète depuis plusieurs années et partage avec passion ses conseils, astuces et tutoriels pour vous accompagner dans tous vos projets, du tout premier point aux créations les plus ambitieuses.", type: "textarea", group: "blog", label: "Bio auteur (E-E-A-T)", description: "Texte affiché en fin d'article pour le référencement", sort_order: 2 },
  { key: "blog_author_role", value: "Passionnée de crochet", type: "text", group: "blog", label: "Rôle de l'auteur", sort_order: 3 },

  // NOTE: `fulfillment` (Packlink PRO), `payment` (Stripe) and `tracking`
  // (GA4 / GTM / Meta Pixel) used to live here. They moved to the
  // integrations module — see backend/src/modules/integration/catalog.ts.
  // Don't reintroduce them as theme settings; the storefront reads from
  // /store/integrations/public at build time.
]

export default async function seedTheme({ container }: ExecArgs) {
  const themeService = container.resolve(THEME_MODULE)

  console.log("Seeding theme settings...")

  for (const setting of defaultSettings) {
    try {
      const existing = await themeService.listThemeSettings({ key: setting.key })
      if (!existing || existing.length === 0) {
        await themeService.createThemeSettings(setting)
        console.log(`  + ${setting.group}.${setting.key}`)
      } else {
        console.log(`  = ${setting.group}.${setting.key} (exists)`)
      }
    } catch {
      await themeService.createThemeSettings(setting)
      console.log(`  + ${setting.group}.${setting.key}`)
    }
  }

  console.log("Theme settings seeded!")
}
