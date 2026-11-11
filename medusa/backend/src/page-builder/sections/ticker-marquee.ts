import type { SectionSchema } from "../schema-types"

export const tickerMarqueeSchema: SectionSchema = {
  type: "ticker_marquee",
  label: "Bandeau défilant",
  description: "Texte qui défile horizontalement (idéal pour des messages courts)",
  icon: "📢",
  category: "marketing",
  fields: [
    {
      key: "items",
      label: "Messages",
      type: "items",
      itemLabel: "message",
      maxItems: 10,
      itemSchema: [
        {
          key: "text",
          label: "Texte",
          type: "text",
          required: true,
          maxLength: 60,
          placeholder: "Livraison gratuite dès 50€",
        },
      ],
    },
    {
      key: "speed",
      label: "Vitesse de défilement",
      type: "select",
      default: "normal",
      options: [
        { value: "slow", label: "Lente" },
        { value: "normal", label: "Normale" },
        { value: "fast", label: "Rapide" },
      ],
    },
    {
      key: "background_color",
      label: "Couleur de fond",
      type: "color",
      default: "#1a1a2e",
    },
    {
      key: "text_color",
      label: "Couleur du texte",
      type: "color",
      default: "#ffffff",
    },
  ],
  default_props: {
    items: [
      { text: "Livraison gratuite dès 50€" },
      { text: "Paiement sécurisé" },
      { text: "Retours offerts" },
    ],
    speed: "normal",
    background_color: "#1a1a2e",
    text_color: "#ffffff",
  },
}
