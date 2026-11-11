import type { SectionSchema } from "../schema-types"

export const customHtmlSchema: SectionSchema = {
  type: "custom_html",
  label: "HTML personnalisé",
  description: "Bloc de code HTML libre — pour les embeds, widgets tiers, ou designs sur mesure",
  icon: "🧩",
  category: "structural",
  fields: [
    {
      key: "html",
      label: "Code HTML",
      type: "richtext",
      required: true,
      description: "Collez votre code HTML, embed, ou widget ici. Attention : le CSS/JS inline est autorisé.",
    },
    {
      key: "max_width",
      label: "Largeur maximale",
      type: "select",
      default: "full",
      options: [
        { value: "narrow", label: "Étroit (640px)" },
        { value: "medium", label: "Moyen (960px)" },
        { value: "wide", label: "Large (1280px)" },
        { value: "full", label: "Pleine largeur" },
      ],
    },
    {
      key: "padding_y",
      label: "Espacement vertical",
      type: "select",
      default: "medium",
      options: [
        { value: "none", label: "Aucun" },
        { value: "small", label: "Petit" },
        { value: "medium", label: "Moyen" },
        { value: "large", label: "Grand" },
      ],
    },
  ],
  default_props: {
    html: "<!-- Votre code HTML ici -->",
    max_width: "full",
    padding_y: "medium",
  },
}
