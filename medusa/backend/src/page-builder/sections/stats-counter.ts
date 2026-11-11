import type { SectionSchema } from "../schema-types"

export const statsCounterSchema: SectionSchema = {
  type: "stats_counter",
  label: "Chiffres clés",
  description: "Compteurs animés pour mettre en avant vos statistiques (clients, produits, années, etc.)",
  icon: "📊",
  category: "social_proof",
  fields: [
    {
      key: "title",
      label: "Titre (optionnel)",
      type: "text",
      maxLength: 80,
    },
    {
      key: "items",
      label: "Statistiques",
      type: "items",
      itemLabel: "statistique",
      maxItems: 6,
      itemSchema: [
        { key: "value", label: "Valeur", type: "text", required: true, placeholder: "1500+", maxLength: 20 },
        { key: "label", label: "Libellé", type: "text", required: true, placeholder: "Clients satisfaits", maxLength: 40 },
        { key: "suffix", label: "Suffixe (optionnel)", type: "text", placeholder: "+, %, €", maxLength: 5 },
      ],
    },
    {
      key: "background_color",
      label: "Couleur de fond",
      type: "color",
      default: "#f8fafc",
    },
  ],
  default_props: {
    title: "",
    items: [
      { value: "1500", label: "Clients satisfaits", suffix: "+" },
      { value: "50", label: "Produits", suffix: "+" },
      { value: "4.8", label: "Note moyenne", suffix: "/5" },
      { value: "24", label: "Délai de livraison", suffix: "h" },
    ],
    background_color: "#f8fafc",
  },
}
