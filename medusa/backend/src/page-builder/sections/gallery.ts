import type { SectionSchema } from "../schema-types"

export const gallerySchema: SectionSchema = {
  type: "gallery",
  label: "Galerie d'images",
  description: "Grille ou carrousel d'images (lookbook, Instagram, lifestyle)",
  icon: "🖼️",
  category: "media",
  fields: [
    {
      key: "title",
      label: "Titre (optionnel)",
      type: "text",
      maxLength: 80,
    },
    {
      key: "layout",
      label: "Disposition",
      type: "select",
      default: "grid",
      options: [
        { value: "grid", label: "Grille (3 colonnes)" },
        { value: "masonry", label: "Grille masonry (hauteurs variées)" },
        { value: "carousel", label: "Carrousel défilant" },
        { value: "grid_2", label: "Grille (2 colonnes)" },
        { value: "grid_4", label: "Grille (4 colonnes)" },
      ],
    },
    {
      key: "items",
      label: "Images",
      type: "items",
      itemLabel: "image",
      maxItems: 20,
      itemSchema: [
        { key: "image_url", label: "Image", type: "image", required: true, recommended: "800x800px" },
        { key: "alt", label: "Texte alternatif", type: "text", placeholder: "Description de l'image", maxLength: 120 },
        { key: "link_url", label: "Lien (optionnel)", type: "url" },
      ],
    },
    {
      key: "aspect_ratio",
      label: "Ratio des images",
      type: "select",
      default: "square",
      options: [
        { value: "square", label: "Carré (1:1)" },
        { value: "landscape", label: "Paysage (16:10)" },
        { value: "portrait", label: "Portrait (3:4)" },
        { value: "auto", label: "Automatique" },
      ],
    },
    {
      key: "gap",
      label: "Espacement entre images",
      type: "select",
      default: "small",
      options: [
        { value: "none", label: "Aucun" },
        { value: "small", label: "Petit (4px)" },
        { value: "medium", label: "Moyen (12px)" },
        { value: "large", label: "Grand (24px)" },
      ],
    },
  ],
  default_props: {
    title: "",
    layout: "grid",
    items: [],
    aspect_ratio: "square",
    gap: "small",
  },
}
