/**
 * Single source of truth for the integration catalog.
 *
 * Each entry describes:
 *   - identity (slug, name, category, description)
 *   - which env vars to read at seed time (env_map_public / env_map_secret)
 *   - which fields the admin UI should render (public/secret schemas)
 *   - whether changing the secret requires a Medusa restart to take effect
 *     (currently true for Stripe and Brevo, whose SDK/transporter is
 *     instantiated once at process boot)
 */

export type IntegrationCategory =
  | "payment"
  | "email"
  | "analytics"
  | "tracking"
  | "ads"
  | "auth"
  | "deploy"
  | "affiliate"
  | "shipping"

export type IntegrationFieldType = "text" | "password" | "url" | "email" | "number" | "json" | "longtext"

export type IntegrationField = {
  key: string
  label: string
  type: IntegrationFieldType
  required?: boolean
  placeholder?: string
  description?: string
}

export type IntegrationDefinition = {
  slug: string
  name: string
  category: IntegrationCategory
  description: string
  logo_path: string
  /** Show "⚠ Restart Medusa required" badge on the detail page after edit */
  restart_required: boolean
  /** Non-secret config fields (UI shows them in clear) */
  public_fields: IntegrationField[]
  /** Secret config fields (stored encrypted, masked in UI) */
  secret_fields: IntegrationField[]
  /** Env var → public_field key map used by the seed script */
  env_map_public: Record<string, string>
  /** Env var → secret_field key map used by the seed script */
  env_map_secret: Record<string, string>
}

export const INTEGRATIONS: IntegrationDefinition[] = [
  {
    slug: "stripe",
    name: "Stripe",
    category: "payment",
    description: "Paiements en ligne (cartes, 3DS, virements).",
    logo_path: "/admin/assets/logos/stripe.svg",
    restart_required: true,
    public_fields: [
      { key: "publishable_key", label: "Clé publique", type: "text", placeholder: "pk_live_..." },
    ],
    secret_fields: [
      { key: "api_key", label: "Clé secrète API", type: "password", required: true, placeholder: "sk_live_..." },
      { key: "webhook_secret", label: "Secret du webhook", type: "password", placeholder: "whsec_..." },
    ],
    env_map_public: { STRIPE_PUBLISHABLE_KEY: "publishable_key" },
    env_map_secret: { STRIPE_API_KEY: "api_key", STRIPE_WEBHOOK_SECRET: "webhook_secret" },
  },

  {
    slug: "brevo",
    name: "Brevo (SMTP)",
    category: "email",
    description: "Emails transactionnels (auto-reply contact, confirmations de commande, notif admin).",
    logo_path: "/admin/assets/logos/brevo.svg",
    restart_required: true,
    public_fields: [
      { key: "smtp_host", label: "Serveur SMTP", type: "text", placeholder: "smtp-relay.brevo.com" },
      { key: "smtp_port", label: "Port", type: "number", placeholder: "587" },
      { key: "from_email", label: "Adresse expéditeur", type: "email", placeholder: "contact@magic-crochet-kit.com" },
      { key: "from_name", label: "Nom expéditeur", type: "text", placeholder: "Magic Crochet Kit" },
      { key: "admin_notification_email", label: "Email admin (notifications)", type: "email", description: "Adresse qui reçoit les notifs internes (nouveaux messages contact, etc.)" },
    ],
    secret_fields: [
      { key: "smtp_user", label: "Identifiant SMTP", type: "text", required: true, placeholder: "xxxxxx@smtp-brevo.com" },
      { key: "smtp_pass", label: "Mot de passe SMTP / Clé API", type: "password", required: true },
    ],
    env_map_public: {
      SMTP_HOST: "smtp_host",
      SMTP_PORT: "smtp_port",
      SMTP_FROM: "from_email",
      SMTP_FROM_NAME: "from_name",
      CONTACT_ADMIN_EMAIL: "admin_notification_email",
    },
    env_map_secret: {
      SMTP_USER: "smtp_user",
      SMTP_PASS: "smtp_pass",
    },
  },

  {
    slug: "ga4",
    name: "Google Analytics 4",
    category: "analytics",
    description: "Tracking des visites + funnel ecommerce (view_item, add_to_cart, purchase…).",
    logo_path: "/admin/assets/logos/ga4.svg",
    restart_required: false,
    public_fields: [
      { key: "measurement_id", label: "Measurement ID", type: "text", required: true, placeholder: "G-XXXXXXXXXX" },
      { key: "property_id", label: "Property ID (Data API)", type: "text", placeholder: "123456789", description: "Optionnel — requis seulement pour afficher les stats GA dans le dashboard admin." },
    ],
    secret_fields: [
      { key: "service_account_json", label: "Service Account JSON (Data API)", type: "longtext", description: "Optionnel. Coller le JSON brut téléchargé depuis Google Cloud Console." },
    ],
    env_map_public: { PUBLIC_GA4_ID: "measurement_id" },
    env_map_secret: {},
  },

  {
    slug: "gtm",
    name: "Google Tag Manager",
    category: "tracking",
    description: "Container GTM (relais des events vers GA4, Meta Pixel, etc.).",
    logo_path: "/admin/assets/logos/gtm.svg",
    restart_required: false,
    public_fields: [
      { key: "container_id", label: "Container ID", type: "text", required: true, placeholder: "GTM-XXXXXXX" },
    ],
    secret_fields: [],
    env_map_public: { PUBLIC_GTM_ID: "container_id" },
    env_map_secret: {},
  },

  {
    slug: "clarity",
    name: "Microsoft Clarity",
    category: "tracking",
    description: "Heatmaps + session recordings (gratuit, illimité).",
    logo_path: "/admin/assets/logos/clarity.svg",
    restart_required: false,
    public_fields: [
      { key: "project_id", label: "Project ID", type: "text", required: true, placeholder: "xxxxxxxxxx" },
    ],
    secret_fields: [],
    env_map_public: { PUBLIC_CLARITY_ID: "project_id" },
    env_map_secret: {},
  },

  {
    slug: "google_oauth",
    name: "Google OAuth (Login)",
    category: "auth",
    description: "Permet aux clients de se connecter avec leur compte Google.",
    logo_path: "/admin/assets/logos/google_oauth.svg",
    restart_required: true,
    public_fields: [
      { key: "client_id", label: "Client ID", type: "text", required: true, placeholder: "xxxxxxxx.apps.googleusercontent.com" },
      { key: "callback_url", label: "Callback URL", type: "url", placeholder: "https://api.magic-crochet-kit.com/auth/customer/google/callback" },
    ],
    secret_fields: [
      { key: "client_secret", label: "Client Secret", type: "password", required: true },
    ],
    env_map_public: {
      GOOGLE_CLIENT_ID: "client_id",
      GOOGLE_CALLBACK_URL: "callback_url",
    },
    env_map_secret: { GOOGLE_CLIENT_SECRET: "client_secret" },
  },

  {
    slug: "github_blog_rebuild",
    name: "GitHub (rebuild storefront)",
    category: "deploy",
    description: "PAT GitHub utilisé par le subscriber blog-build-hook pour déclencher le rebuild du storefront via repository_dispatch.",
    logo_path: "/admin/assets/logos/github_blog_rebuild.svg",
    restart_required: false,
    public_fields: [
      { key: "hook_url", label: "Dispatch URL", type: "url", required: true, placeholder: "https://api.github.com/repos/owner/repo/dispatches" },
      { key: "event_type", label: "Event type", type: "text", placeholder: "blog-post-changed" },
    ],
    secret_fields: [
      { key: "pat", label: "Personal Access Token", type: "password", required: true, placeholder: "github_pat_..." },
    ],
    env_map_public: {
      BLOG_BUILD_HOOK_URL: "hook_url",
    },
    env_map_secret: {
      BLOG_BUILD_HOOK_TOKEN: "pat",
    },
  },

  {
    slug: "tiktok_pixel",
    name: "TikTok Pixel",
    category: "tracking",
    description: "Pixel TikTok pour mesurer les conversions de tes campagnes TikTok Ads et alimenter les audiences de retargeting.",
    logo_path: "/admin/assets/logos/tiktok_pixel.svg",
    restart_required: false,
    public_fields: [
      { key: "pixel_id", label: "Pixel ID", type: "text", required: true, placeholder: "CXXXXXXXXXXXXXXXX", description: "Trouvable dans TikTok Ads Manager → Outils → Pixel → ID." },
    ],
    secret_fields: [],
    env_map_public: { PUBLIC_TIKTOK_PIXEL_ID: "pixel_id" },
    env_map_secret: {},
  },

  {
    slug: "tiktok_shop_feed",
    name: "TikTok Shop (catalog feed)",
    category: "ads",
    description: "Flux produits XML compatible TikTok Shop Catalog Manager. URL stable à importer depuis l'admin TikTok Shop pour synchroniser ton catalogue.",
    logo_path: "/admin/assets/logos/tiktok_shop_feed.svg",
    restart_required: false,
    public_fields: [
      { key: "feed_url", label: "URL du flux", type: "url", placeholder: "https://magic-crochet-kit.com/feed-tiktok-shop.xml", description: "Lecture seule — colle cette URL dans TikTok Shop → Products → Add via feed." },
      { key: "include_affiliate", label: "Inclure les produits affiliés", type: "text", placeholder: "false", description: "true / false. Par défaut false (TikTok n'accepte pas les produits non-stockés)." },
    ],
    secret_fields: [],
    env_map_public: {},
    env_map_secret: {},
  },

  {
    slug: "google_ads",
    name: "Google Ads",
    category: "ads",
    description: "Suivi des conversions et remarketing (Google Ads conversion ID, événements purchase).",
    logo_path: "/admin/assets/logos/google_ads.svg",
    restart_required: false,
    public_fields: [
      { key: "conversion_id", label: "Conversion ID", type: "text", required: true, placeholder: "AW-NNNNNNNNNN", description: "L'ID de conversion Google Ads, commence par AW-." },
      { key: "conversion_label", label: "Label de conversion (purchase)", type: "text", placeholder: "AbC-DefGhI1JkLmNoPqR", description: "Optionnel — pour pister les achats. Trouvable dans Google Ads > Outils > Conversions." },
    ],
    secret_fields: [],
    env_map_public: { PUBLIC_GOOGLE_ADS_ID: "conversion_id", PUBLIC_GOOGLE_ADS_LABEL: "conversion_label" },
    env_map_secret: {},
  },

  {
    slug: "effiliation",
    name: "Effiliation (affiliation)",
    category: "affiliate",
    description: "Tracker affilié pour les liens 'Acheter' qui pointent vers Vertbaudet et autres partenaires.",
    logo_path: "/admin/assets/logos/effiliation.svg",
    restart_required: false,
    public_fields: [
      { key: "tracker_url", label: "Tracker URL", type: "url", required: true, placeholder: "https://track.effiliation.com/servlet/effi.redir?id_compteur=..." },
      { key: "compteur_id", label: "ID compteur", type: "text", placeholder: "23257207" },
    ],
    secret_fields: [],
    env_map_public: {},
    env_map_secret: {},
  },

  {
    slug: "meta_pixel",
    name: "Meta Pixel (Facebook)",
    category: "tracking",
    description: "Pixel Meta/Facebook pour mesurer les conversions des campagnes Facebook & Instagram Ads et alimenter les audiences de retargeting.",
    logo_path: "/admin/assets/logos/meta_pixel.svg",
    restart_required: false,
    public_fields: [
      { key: "pixel_id", label: "Pixel ID", type: "text", required: true, placeholder: "1234567890123456", description: "Trouvable dans Meta Business Manager → Events Manager → ID du pixel." },
    ],
    secret_fields: [],
    env_map_public: { PUBLIC_META_PIXEL_ID: "pixel_id", META_PIXEL_ID: "pixel_id" },
    env_map_secret: {},
  },

  {
    slug: "packlink",
    name: "Packlink PRO",
    category: "shipping",
    description: "Aggregator d'expédition multi-transporteurs (Mondial Relay, DHL, Colissimo…). Génère les étiquettes depuis l'admin sans contracter chaque transporteur.",
    logo_path: "/admin/assets/logos/packlink.svg",
    restart_required: false,
    public_fields: [
      { key: "warehouse_country", label: "Pays de l'entrepôt", type: "text", required: true, placeholder: "FR", description: "Code ISO 2 lettres (FR, BE, ES…)." },
      { key: "warehouse_zip", label: "Code postal entrepôt", type: "text", required: true, placeholder: "75017" },
    ],
    secret_fields: [
      { key: "api_key", label: "Clé API Packlink PRO", type: "password", required: true, description: "Disponible dans Packlink → Paramètres → Intégrations." },
    ],
    env_map_public: { PACKLINK_WAREHOUSE_COUNTRY: "warehouse_country", PACKLINK_WAREHOUSE_ZIP: "warehouse_zip" },
    env_map_secret: { PACKLINK_API_KEY: "api_key" },
  },
]

export function findIntegration(slug: string): IntegrationDefinition | undefined {
  return INTEGRATIONS.find((d) => d.slug === slug)
}
