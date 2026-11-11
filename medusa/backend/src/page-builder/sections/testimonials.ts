import type { SectionSchema } from "../schema-types"

export const testimonialsSchema: SectionSchema = {
  type: "testimonials",
  label: "Témoignages clients",
  description: "Cartes avec photo, note, citation et auteur",
  icon: "💬",
  category: "social_proof",
  fields: [
    {
      key: "title",
      label: "Titre",
      type: "text",
      default: "Ce que disent nos clients",
      maxLength: 80,
    },
    {
      key: "subtitle",
      label: "Sous-titre",
      type: "text",
      default: "Plus de 1500 clients nous font confiance",
      maxLength: 120,
    },
    {
      key: "layout",
      label: "Disposition",
      type: "select",
      default: "grid_3",
      options: [
        { value: "grid_2", label: "Grille 2 colonnes" },
        { value: "grid_3", label: "Grille 3 colonnes" },
        { value: "carousel", label: "Carrousel défilant" },
      ],
    },
    {
      key: "items",
      label: "Témoignages",
      type: "items",
      itemLabel: "témoignage",
      maxItems: 12,
      itemSchema: [
        { key: "name", label: "Nom du client", type: "text", required: true, placeholder: "Marie L." },
        { key: "location", label: "Ville", type: "text", placeholder: "Paris" },
        { key: "image", label: "Photo (optionnelle)", type: "image", recommended: "200×200px" },
        { key: "rating", label: "Note (1-5)", type: "number", default: 5, min: 1, max: 5 },
        { key: "text", label: "Témoignage", type: "textarea", required: true, maxLength: 300 },
        { key: "product", label: "Produit acheté (optionnel)", type: "text", placeholder: "Nom du produit" },
      ],
    },
  ],
  default_props: {
    title: "Ce que disent nos clients",
    subtitle: "Plus de 1500 clients nous font confiance",
    layout: "grid_3",
    items: [],
  },
}
