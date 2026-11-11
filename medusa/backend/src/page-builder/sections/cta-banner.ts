import type { SectionSchema } from "../schema-types"

export const ctaBannerSchema: SectionSchema = {
  type: "cta_banner",
  label: "Bannière CTA",
  description: "Bannière d'appel à l'action pleine largeur avec fond personnalisable",
  icon: "🔔",
  category: "marketing",
  fields: [
    {
      key: "title",
      label: "Titre",
      type: "text",
      required: true,
      default: "Prêt à découvrir nos produits ?",
      maxLength: 100,
    },
    {
      key: "subtitle",
      label: "Sous-titre",
      type: "text",
      maxLength: 200,
    },
    {
      key: "cta",
      label: "Bouton",
      type: "link",
      default: { text: "Voir la boutique", url: "/collections" },
    },
    {
      key: "alignment",
      label: "Alignement",
      type: "select",
      default: "center",
      options: [
        { value: "left", label: "À gauche" },
        { value: "center", label: "Centré" },
      ],
    },
    {
      key: "background_style",
      label: "Style de fond",
      type: "select",
      default: "dark",
      options: [
        { value: "dark", label: "Fond sombre" },
        { value: "light", label: "Fond clair" },
        { value: "gradient", label: "Dégradé couleur primaire" },
        { value: "image", label: "Image en fond" },
      ],
    },
    {
      key: "background_image",
      label: "Image de fond",
      type: "image",
      conditional: { field: "background_style", equals: "image" },
    },
  ],
  default_props: {
    title: "Prêt à découvrir nos produits ?",
    subtitle: "Livraison gratuite dès 50€ d'achat",
    cta: { text: "Voir la boutique", url: "/collections" },
    alignment: "center",
    background_style: "dark",
  },
}
