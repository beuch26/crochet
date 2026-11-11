import type { SectionSchema } from "../schema-types"

export const trustBarSchema: SectionSchema = {
  type: "trust_bar",
  label: "Bandeau de réassurance",
  description: "Bandeau horizontal avec icônes et arguments de confiance (livraison, paiement sécurisé, etc.)",
  icon: "🛡️",
  category: "marketing",
  fields: [
    {
      key: "items",
      label: "Arguments",
      type: "items",
      itemLabel: "argument",
      maxItems: 6,
      itemSchema: [
        {
          key: "icon",
          label: "Icône",
          type: "select",
          default: "truck",
          options: [
            { value: "truck", label: "🚚 Camion (livraison)" },
            { value: "card", label: "💳 Carte (paiement)" },
            { value: "return", label: "↩ Retour (remboursement)" },
            { value: "headset", label: "🎧 Casque (support)" },
            { value: "shield", label: "🛡 Bouclier (sécurité)" },
            { value: "gift", label: "🎁 Cadeau (offre)" },
            { value: "leaf", label: "🌿 Feuille (écologie)" },
            { value: "star", label: "⭐ Étoile (qualité)" },
          ],
        },
        {
          key: "title",
          label: "Titre",
          type: "text",
          required: true,
          maxLength: 30,
          placeholder: "Livraison 24-48h",
        },
        {
          key: "subtitle",
          label: "Sous-titre",
          type: "text",
          maxLength: 40,
          placeholder: "Gratuite dès 50€",
        },
      ],
    },
  ],
  default_props: {
    items: [
      { icon: "truck", title: "Livraison 24-48h", subtitle: "Gratuite dès 50€" },
      { icon: "card", title: "Paiement sécurisé", subtitle: "Stripe · 3D Secure" },
      { icon: "return", title: "Retour offert", subtitle: "30 jours satisfait" },
      { icon: "headset", title: "Conseil expert", subtitle: "Réponse sous 24h" },
    ],
  },
}
