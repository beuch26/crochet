import type { SectionSchema } from "../schema-types"

export const newsletterSchema: SectionSchema = {
  type: "newsletter",
  label: "Newsletter",
  description: "Bloc d'inscription à la newsletter avec design personnalisable",
  icon: "✉️",
  category: "marketing",
  fields: [
    {
      key: "title",
      label: "Titre",
      type: "text",
      default: "Rejoignez notre communauté",
      maxLength: 80,
    },
    {
      key: "subtitle",
      label: "Sous-titre",
      type: "text",
      default: "Recevez nos conseils et offres exclusives",
      maxLength: 200,
    },
    {
      key: "placeholder",
      label: "Texte placeholder du champ email",
      type: "text",
      default: "Votre email",
    },
    {
      key: "button_text",
      label: "Texte du bouton",
      type: "text",
      default: "S'inscrire",
      maxLength: 30,
    },
    {
      key: "incentive",
      label: "Incitation (optionnel)",
      type: "text",
      placeholder: "10% de réduction sur votre première commande",
      maxLength: 120,
    },
    {
      key: "background_style",
      label: "Style de fond",
      type: "select",
      default: "gradient",
      options: [
        { value: "white", label: "Fond blanc" },
        { value: "light", label: "Fond clair" },
        { value: "gradient", label: "Dégradé de couleurs" },
        { value: "image", label: "Image en fond" },
      ],
    },
    {
      key: "background_image",
      label: "Image de fond",
      type: "image",
      conditional: { field: "background_style", equals: "image" },
    },
  ],
  default_props: {
    title: "Rejoignez notre communauté",
    subtitle: "Recevez nos conseils et offres exclusives",
    placeholder: "Votre email",
    button_text: "S'inscrire",
    incentive: "",
    background_style: "gradient",
  },
}
