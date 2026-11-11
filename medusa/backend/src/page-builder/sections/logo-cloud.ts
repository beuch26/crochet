import type { SectionSchema } from "../schema-types"

export const logoCloudSchema: SectionSchema = {
  type: "logo_cloud",
  label: "Logos partenaires",
  description: "Bandeau de logos de marques, partenaires ou médias (défilant ou fixe)",
  icon: "🏢",
  category: "social_proof",
  fields: [
    {
      key: "title",
      label: "Titre (optionnel)",
      type: "text",
      maxLength: 80,
      placeholder: "Ils nous font confiance",
    },
    {
      key: "layout",
      label: "Disposition",
      type: "select",
      default: "scroll",
      options: [
        { value: "scroll", label: "Défilement continu" },
        { value: "grid", label: "Grille fixe" },
      ],
    },
    {
      key: "items",
      label: "Logos",
      type: "items",
      itemLabel: "logo",
      maxItems: 20,
      itemSchema: [
        { key: "image_url", label: "Image du logo", type: "image", required: true, recommended: "200x80px, SVG ou PNG transparent" },
        { key: "name", label: "Nom (pour l'attribut alt)", type: "text", required: true, placeholder: "Nom de la marque" },
        { key: "url", label: "Lien (optionnel)", type: "url" },
      ],
    },
    {
      key: "grayscale",
      label: "Logos en niveaux de gris",
      type: "boolean",
      default: true,
      description: "Les logos deviennent colorés au survol",
    },
  ],
  default_props: {
    title: "",
    layout: "scroll",
    items: [],
    grayscale: true,
  },
}
