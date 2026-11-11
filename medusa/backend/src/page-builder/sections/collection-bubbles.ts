import type { SectionSchema } from "../schema-types"

export const collectionBubblesSchema: SectionSchema = {
  type: "collection_bubbles",
  label: "Bulles de catégories",
  description: "Catégories rondes avec image, parfait pour la navigation rapide",
  icon: "⭕",
  category: "products",
  fields: [
    {
      key: "title",
      label: "Titre",
      type: "text",
      default: "Nos univers",
      maxLength: 80,
    },
    {
      key: "limit",
      label: "Nombre de catégories",
      type: "number",
      default: 12,
      min: 3,
      max: 20,
    },
    {
      key: "shape",
      label: "Forme",
      type: "select",
      default: "circle",
      options: [
        { value: "circle", label: "Cercle" },
        { value: "square", label: "Carré arrondi" },
      ],
    },
  ],
  default_props: {
    title: "Nos univers",
    limit: 12,
    shape: "circle",
  },
}
