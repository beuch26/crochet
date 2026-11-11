import type { SectionSchema } from "../schema-types"

export const videoSchema: SectionSchema = {
  type: "video",
  label: "Vidéo",
  description: "Vidéo YouTube, Vimeo ou fichier MP4 en pleine largeur ou encadrée",
  icon: "🎬",
  category: "media",
  fields: [
    {
      key: "source",
      label: "Source",
      type: "select",
      default: "youtube",
      options: [
        { value: "youtube", label: "YouTube" },
        { value: "vimeo", label: "Vimeo" },
        { value: "mp4", label: "Fichier MP4 (URL)" },
      ],
    },
    {
      key: "url",
      label: "URL de la vidéo",
      type: "url",
      required: true,
      placeholder: "https://www.youtube.com/watch?v=...",
    },
    {
      key: "title",
      label: "Titre (optionnel)",
      type: "text",
      maxLength: 100,
    },
    {
      key: "subtitle",
      label: "Sous-titre (optionnel)",
      type: "text",
      maxLength: 200,
    },
    {
      key: "layout",
      label: "Mise en page",
      type: "select",
      default: "contained",
      options: [
        { value: "contained", label: "Encadrée (avec marges)" },
        { value: "fullwidth", label: "Pleine largeur" },
      ],
    },
    {
      key: "autoplay",
      label: "Lecture automatique (muet)",
      type: "boolean",
      default: false,
    },
    {
      key: "poster_image",
      label: "Image de couverture",
      type: "image",
      recommended: "1920x1080px",
      description: "Affichée avant la lecture (uniquement pour MP4)",
      conditional: { field: "source", equals: "mp4" },
    },
  ],
  default_props: {
    source: "youtube",
    url: "",
    title: "",
    subtitle: "",
    layout: "contained",
    autoplay: false,
  },
}
