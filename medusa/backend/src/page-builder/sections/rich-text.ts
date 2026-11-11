import type { SectionSchema } from "../schema-types"

export const richTextSchema: SectionSchema = {
  type: "rich_text",
  label: "Bloc de texte",
  description: "Texte libre avec formatage riche (titre, paragraphes, liens, listes)",
  icon: "📝",
  category: "content",
  fields: [
    {
      key: "alignment",
      label: "Alignement",
      type: "select",
      default: "center",
      options: [
        { value: "left", label: "À gauche" },
        { value: "center", label: "Centré" },
        { value: "right", label: "À droite" },
      ],
    },
    {
      key: "max_width",
      label: "Largeur maximale",
      type: "select",
      default: "medium",
      options: [
        { value: "narrow", label: "Étroit (lecture confortable)" },
        { value: "medium", label: "Moyen" },
        { value: "wide", label: "Large" },
        { value: "full", label: "Pleine largeur" },
      ],
    },
    {
      key: "content",
      label: "Contenu",
      type: "richtext",
      required: true,
      default: "<h2>Titre de la section</h2><p>Votre texte ici. Vous pouvez utiliser du <strong>gras</strong>, de l'<em>italique</em>, et plus encore.</p>",
    },
    {
      key: "background_color",
      label: "Couleur de fond",
      type: "color",
      default: "#ffffff",
    },
    {
      key: "padding_y",
      label: "Espacement vertical",
      type: "select",
      default: "medium",
      options: [
        { value: "small", label: "Petit" },
        { value: "medium", label: "Moyen" },
        { value: "large", label: "Grand" },
      ],
    },
  ],
  default_props: {
    alignment: "center",
    max_width: "medium",
    content: "<h2>Titre de la section</h2><p>Votre texte ici.</p>",
    background_color: "#ffffff",
    padding_y: "medium",
  },
}
