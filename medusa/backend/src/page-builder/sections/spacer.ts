import type { SectionSchema } from "../schema-types"

export const spacerSchema: SectionSchema = {
  type: "spacer",
  label: "Séparateur / Espace",
  description: "Espace vide ou ligne de séparation entre deux sections",
  icon: "📏",
  category: "structural",
  fields: [
    {
      key: "height",
      label: "Hauteur",
      type: "select",
      default: "medium",
      options: [
        { value: "small", label: "Petit (24px)" },
        { value: "medium", label: "Moyen (48px)" },
        { value: "large", label: "Grand (80px)" },
        { value: "xlarge", label: "Très grand (120px)" },
      ],
    },
    {
      key: "show_line",
      label: "Afficher une ligne",
      type: "boolean",
      default: false,
    },
    {
      key: "line_width",
      label: "Largeur de la ligne",
      type: "select",
      default: "short",
      options: [
        { value: "short", label: "Courte (60px)" },
        { value: "medium", label: "Moyenne (200px)" },
        { value: "full", label: "Pleine largeur" },
      ],
      conditional: { field: "show_line", equals: true },
    },
    {
      key: "line_color",
      label: "Couleur de la ligne",
      type: "color",
      default: "#e2e8f0",
      conditional: { field: "show_line", equals: true },
    },
  ],
  default_props: {
    height: "medium",
    show_line: false,
    line_width: "short",
    line_color: "#e2e8f0",
  },
}
