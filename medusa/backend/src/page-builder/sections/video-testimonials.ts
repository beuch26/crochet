import type { SectionSchema } from "../schema-types"

export const videoTestimonialsSchema: SectionSchema = {
  type: "video_testimonials",
  label: "Témoignages vidéo",
  description: "Grille de vidéos témoignages avec lightbox YouTube/Vimeo",
  icon: "🎥",
  category: "social_proof",
  fields: [
    {
      key: "title",
      label: "Titre",
      type: "text",
      default: "Elles en parlent mieux que nous",
      maxLength: 80,
    },
    {
      key: "subtitle",
      label: "Sous-titre",
      type: "text",
      default: "Découvrez les témoignages de mamans qui utilisent Magic Crochet Kit",
      maxLength: 140,
    },
    {
      key: "cta_text",
      label: "Texte du bouton (optionnel)",
      type: "text",
      default: "",
      placeholder: "Voir plus de témoignages",
      maxLength: 40,
    },
    {
      key: "cta_url",
      label: "Lien du bouton",
      type: "text",
      default: "",
      placeholder: "/temoignages",
    },
    {
      key: "columns",
      label: "Colonnes (desktop)",
      type: "select",
      default: "4",
      options: [
        { value: "3", label: "3 colonnes" },
        { value: "4", label: "4 colonnes" },
        { value: "5", label: "5 colonnes" },
      ],
    },
    {
      key: "items",
      label: "Vidéos",
      type: "items",
      itemLabel: "vidéo",
      maxItems: 12,
      itemSchema: [
        { key: "name", label: "Prénom", type: "text", required: true, placeholder: "Marie" },
        { key: "age", label: "Âge / Statut", type: "text", placeholder: "32 ans — Maman de 2" },
        { key: "role", label: "Produit / Catégorie", type: "text", placeholder: "Tire-lait électrique" },
        { key: "thumbnail", label: "Miniature", type: "image", required: true, recommended: "400×500px (portrait)" },
        { key: "video_url", label: "URL vidéo (YouTube ou Vimeo)", type: "text", required: true, placeholder: "https://www.youtube.com/watch?v=..." },
      ],
    },
  ],
  default_props: {
    title: "Elles en parlent mieux que nous",
    subtitle: "Découvrez les témoignages de mamans qui utilisent Magic Crochet Kit",
    cta_text: "",
    cta_url: "",
    columns: "4",
    items: [],
  },
}
