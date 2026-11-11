/**
 * Collection-specific FAQ questions for product pages.
 * Used to render a FAQ block on product pages when no metafield FAQ is provided.
 */

interface FaqItem {
  q: string
  a: string
}

export const productFaqs: Record<string, FaqItem[]> = {
  "kits-de-crochet": [
    { q: "Qu'est-ce qu'il y a dans le kit ?", a: "Chaque kit contient tout le matériel nécessaire : le fil de qualité dans la bonne quantité, un crochet adapté, le rembourrage, les yeux de sécurité et un livret avec le tutoriel pas à pas." },
    { q: "Faut-il déjà savoir crocheter ?", a: "Non ! Nos kits sont pensés pour les débutants. Le livret reprend chaque point depuis le début, et nous proposons aussi des tutoriels vidéo gratuits pour vous accompagner." },
    { q: "Combien de temps pour terminer un projet ?", a: "Comptez 4 à 8 heures pour un kit débutant amigurumi, en fonction de votre rythme. Les kits intermédiaires demandent 8 à 15 heures." },
  ],
  "kits-debutants-faciles": [
    { q: "Quel kit choisir pour commencer ?", a: "Tous nos kits débutants conviennent. Les plus petits modèles (10-12 cm) comme Pipo le pingouin ou Foxy le renard sont les plus rapides à réaliser." },
    { q: "Le tutoriel est-il en français ?", a: "Oui, tous nos kits incluent un livret papier en français avec des photos étape par étape." },
  ],
  "amigurumi": [
    { q: "Qu'est-ce qu'un amigurumi ?", a: "L'amigurumi est l'art japonais de crocheter de petites peluches. Tous nos amigurumis se réalisent en spirale, sans couture, avec quelques points de base très simples." },
    { q: "Quelle taille feront mes amigurumis ?", a: "La taille indiquée dans la fiche produit (ex. 11 cm pour Pipo) est obtenue avec le crochet et le fil fournis. Avec une laine plus épaisse, ils peuvent doubler de taille." },
  ],
  "fils-materiaux": [
    { q: "Quelle est la différence entre les fils proposés ?", a: "Nos fils sont sélectionnés pour leur qualité : acrylique doux pour débuter, laines mélangées pour les projets plus élaborés. Chaque fiche indique le grammage et le métrage." },
    { q: "Pourquoi cliquer sur 'Acheter sur LoveCrafts' ?", a: "Les fils et matériaux complémentaires sont livrés par notre partenaire LoveCrafts (UK), qui offre la plus grande sélection en Europe et la livraison rapide en France." },
  ],
  "fil-acrylique": [
    { q: "Pourquoi choisir un fil acrylique pour débuter ?", a: "L'acrylique est doux, peu cher, résistant au lavage en machine et disponible dans une infinité de couleurs. C'est le fil idéal pour vos premiers amigurumis et accessoires." },
    { q: "Le fil rétrécit-il au lavage ?", a: "Non, l'acrylique est très stable. Vous pouvez laver vos créations en machine à 30°C." },
  ],
  "crochets": [
    { q: "Quelle taille de crochet utiliser ?", a: "Pour les amigurumis : crochet 2,5 mm à 4 mm selon l'épaisseur du fil. Pour les vêtements : 4 mm à 6 mm. Chaque fiche produit indique la taille recommandée." },
    { q: "Crochet en bois ou en métal ?", a: "Les crochets en bois (bambou, olivier) sont légers et chaleureux dans la main. Les crochets en métal glissent mieux dans le fil, parfait pour les débutants qui crochet serré." },
  ],
  "modeles-crochet": [
    { q: "Que reçoit-on en achetant un patron ?", a: "Vous recevez un PDF par email contenant le patron complet : matériel nécessaire, point par point, photos illustratives et conseils. Le fil et les accessoires ne sont pas inclus." },
    { q: "Puis-je revendre ce que je fabrique ?", a: "Oui, les créations réalisées à partir de nos patrons peuvent être vendues. Le patron lui-même ne peut pas être revendu ou partagé." },
  ],
  "default": [
    { q: "La livraison est-elle gratuite ?", a: "Oui, la livraison est offerte en France métropolitaine dès 50 € d'achat. En dessous, comptez 4,90 €." },
    { q: "Sous combien de temps mon colis arrive ?", a: "Préparation 1-2 jours ouvrés + livraison 2-5 jours selon votre adresse. La plupart des commandes arrivent en moins d'une semaine." },
    { q: "Puis-je retourner un produit ?", a: "Oui, vous disposez de 30 jours après réception pour nous renvoyer un produit non utilisé dans son emballage d'origine." },
    { q: "Comment contacter le service client ?", a: "Par email à contact@magic-crochet-kit.com. Nous répondons sous 24 h ouvrées." },
  ],
}

export function getFaqsForProduct(collectionHandle: string): FaqItem[] {
  const specific = productFaqs[collectionHandle]
  const defaults = productFaqs["default"]
  if (specific) return [...specific, ...defaults]
  return defaults
}
