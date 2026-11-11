import type { SectionSchema } from "../schema-types"

export const promoBannerSchema: SectionSchema = {
  type: "promo_banner",
  label: "Bannière promo",
  description: "Bannière promotionnelle avec compte à rebours (soldes, Black Friday, etc.)",
  icon: "🏷️",
  category: "marketing",
  fields: [
    {
      key: "title",
      label: "Titre",
      type: "text",
      required: true,
      default: "Offre spéciale",
      maxLength: 80,
    },
    {
      key: "subtitle",
      label: "Sous-titre",
      type: "text",
      maxLength: 150,
    },
    {
      key: "end_date",
      label: "Date de fin (pour le compte à rebours)",
      type: "text",
      placeholder: "2026-12-31",
      description: "Format : AAAA-MM-JJ",
    },
    {
      key: "cta",
      label: "Bouton",
      type: "link",
      default: { text: "J'en profite", url: "/collections" },
    },
    {
      key: "background_color",
      label: "Couleur de fond",
      type: "color",
      default: "#1a1a2e",
    },
    {
      key: "text_color",
      label: "Couleur du texte",
      type: "color",
      default: "#ffffff",
    },
    {
      key: "accent_color",
      label: "Couleur d'accent (compteur)",
      type: "color",
      default: "#f59e0b",
    },
  ],
  default_props: {
    title: "Offre spéciale -20%",
    subtitle: "Sur toute la boutique, durée limitée",
    end_date: "",
    cta: { text: "J'en profite", url: "/collections" },
    background_color: "#1a1a2e",
    text_color: "#ffffff",
    accent_color: "#f59e0b",
  },
}
