import type { SectionSchema } from "../schema-types"

export const imageWithTextSchema: SectionSchema = {
  type: "image_with_text",
  label: "Image avec texte",
  description: "Section split avec une image et un bloc de texte (idéal pour 'À propos')",
  icon: "🖼️",
  category: "content",
  fields: [
    {
      key: "layout",
      label: "Position de l'image",
      type: "select",
      default: "left",
      options: [
        { value: "left", label: "Image à gauche" },
        { value: "right", label: "Image à droite" },
      ],
    },
    {
      key: "image_url",
      label: "Image",
      type: "image",
      required: true,
      recommended: "800×600px",
    },
    {
      key: "tagline",
      label: "Pré-titre (petit texte au-dessus)",
      type: "text",
      placeholder: "À PROPOS",
      maxLength: 50,
    },
    {
      key: "title",
      label: "Titre",
      type: "text",
      required: true,
      default: "Notre histoire",
      maxLength: 100,
    },
    {
      key: "content",
      label: "Texte",
      type: "richtext",
      required: true,
      default: "<p>Ajoutez votre texte ici...</p>",
    },
    {
      key: "cta",
      label: "Bouton (optionnel)",
      type: "link",
      default: { text: "", url: "" },
    },
    {
      key: "background_color",
      label: "Couleur de fond",
      type: "color",
      default: "#ffffff",
    },
  ],
  default_props: {
    layout: "left",
    image_url: "",
    tagline: "",
    title: "Notre histoire",
    content: "<p>Ajoutez votre texte ici...</p>",
    cta: { text: "", url: "" },
    background_color: "#ffffff",
  },
}
