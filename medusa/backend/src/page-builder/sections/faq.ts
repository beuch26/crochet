import type { SectionSchema } from "../schema-types"

export const faqSchema: SectionSchema = {
  type: "faq",
  label: "FAQ",
  description: "Liste de questions fréquentes en accordéon (génère le Schema FAQ pour Google)",
  icon: "❓",
  category: "content",
  fields: [
    {
      key: "title",
      label: "Titre",
      type: "text",
      default: "Questions fréquentes",
      maxLength: 80,
    },
    {
      key: "subtitle",
      label: "Sous-titre",
      type: "text",
      maxLength: 120,
    },
    {
      key: "items",
      label: "Questions",
      type: "items",
      itemLabel: "question",
      maxItems: 20,
      itemSchema: [
        { key: "q", label: "Question", type: "text", required: true, maxLength: 200 },
        { key: "a", label: "Réponse", type: "textarea", required: true },
      ],
    },
    {
      key: "first_open",
      label: "Ouvrir la première question par défaut",
      type: "boolean",
      default: true,
    },
  ],
  default_props: {
    title: "Questions fréquentes",
    subtitle: "",
    items: [
      { q: "Quel est le délai de livraison ?", a: "Nous livrons sous 24 à 48h ouvrées en France métropolitaine." },
      { q: "Comment retourner un produit ?", a: "Vous avez 30 jours pour retourner un produit. Contactez-nous pour obtenir l'étiquette de retour." },
    ],
    first_open: true,
  },
}
