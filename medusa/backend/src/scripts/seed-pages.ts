import { ExecArgs } from "@medusajs/framework/types"
import { PAGE_MODULE } from "../modules/page"

const defaultPages = [
  {
    title: "Conditions Générales de Vente",
    handle: "cgv",
    content: `<h2>Article 1 - Objet</h2>
<p>Les présentes conditions générales de vente régissent les ventes de produits sur le site magic-crochet-kit.com, exploité par TN GROUP SASU.</p>

<h2>Article 2 - Prix</h2>
<p>Les prix sont indiqués en euros toutes taxes comprises (TTC). Les frais de livraison sont en supplément et indiqués avant la validation de la commande.</p>

<h2>Article 3 - Commandes</h2>
<p>Toute commande implique l'acceptation des présentes conditions. La confirmation de commande entraîne l'acceptation des présentes conditions de vente.</p>

<h2>Article 4 - Livraison</h2>
<p>Les produits sont livrés en France métropolitaine. Les délais de livraison sont de 3 à 5 jours ouvrés.</p>

<h2>Article 5 - Droit de rétractation</h2>
<p>Conformément au Code de la Consommation, vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation.</p>

<h2>Article 6 - Contact</h2>
<p>Pour toute question, contactez-nous à contact@magic-crochet-kit.com ou au 09 51 76 17 11.</p>`,
    seo_title: "CGV — Magic Crochet Kit",
    seo_description: "Conditions générales de vente du site magic-crochet-kit.com — TN GROUP SASU",
  },
  {
    title: "Mentions légales",
    handle: "mentions-legales",
    content: `<h2>Éditeur du site</h2>
<p><strong>TN GROUP SASU</strong><br>6 Rue d'Armaille, 75017 Paris<br>Email : contact@magic-crochet-kit.com<br>Téléphone : 09 51 76 17 11</p>

<h2>Hébergement</h2>
<p>Le site est hébergé par Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Allemagne.</p>

<h2>Propriété intellectuelle</h2>
<p>L'ensemble du contenu du site (textes, images, vidéos, logos) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation.</p>

<h2>Données personnelles</h2>
<p>Consultez notre <a href="/politique-de-confidentialite">politique de confidentialité</a> pour en savoir plus sur le traitement de vos données.</p>`,
    seo_title: "Mentions légales — Magic Crochet Kit",
    seo_description: "Mentions légales et informations sur l'éditeur du site magic-crochet-kit.com",
  },
  {
    title: "Politique de confidentialité",
    handle: "politique-de-confidentialite",
    content: `<h2>Collecte des données</h2>
<p>Nous collectons les données nécessaires au traitement de vos commandes : nom, prénom, adresse, email, téléphone.</p>

<h2>Utilisation des données</h2>
<p>Vos données sont utilisées pour le traitement des commandes, la livraison, le service client et, avec votre consentement, l'envoi de newsletters.</p>

<h2>Cookies</h2>
<p>Le site utilise des cookies pour améliorer votre expérience. Vous pouvez les refuser via le bandeau de consentement.</p>

<h2>Vos droits</h2>
<p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à contact@magic-crochet-kit.com.</p>`,
    seo_title: "Politique de confidentialité — Magic Crochet Kit",
    seo_description: "Politique de confidentialité et traitement des données personnelles sur magic-crochet-kit.com",
  },
  {
    title: "Livraison",
    handle: "livraison",
    content: `<h2>Zones de livraison</h2>
<p>Nous livrons en France métropolitaine, en Belgique, en Suisse et au Luxembourg.</p>

<h2>Délais de livraison</h2>
<p>Les commandes sont expédiées sous 24 à 48h ouvrées. La livraison s'effectue en 3 à 5 jours ouvrés.</p>

<h2>Frais de livraison</h2>
<p>La livraison est <strong>gratuite dès 50€ d'achat</strong>. En dessous de ce montant, les frais de port sont de 4,90€.</p>

<h2>Suivi de commande</h2>
<p>Un email de confirmation avec un numéro de suivi vous est envoyé dès l'expédition de votre colis.</p>`,
    seo_title: "Livraison — Magic Crochet Kit",
    seo_description: "Informations sur la livraison : délais, frais de port, zones de livraison — Magic Crochet Kit",
  },
  {
    title: "À propos",
    handle: "a-propos",
    content: `<h2>Notre histoire</h2>
<p>Magic Crochet Kit est née d'une passion : accompagner les mamans et les bébés avec des produits soigneusement sélectionnés pour chaque étape de la maternité.</p>

<h2>Notre engagement</h2>
<p>Nous sélectionnons des produits de qualité, sûrs et pratiques, pour faciliter le quotidien des parents. Chaque produit est choisi avec soin par notre équipe.</p>

<h2>Notre équipe</h2>
<p>Basée à Paris, notre équipe est composée de passionnés de puériculture et de maternité, toujours à l'écoute de vos besoins.</p>`,
    seo_title: "À propos — Magic Crochet Kit",
    seo_description: "Découvrez l'histoire de Magic Crochet Kit, boutique dédiée aux mamans et bébés",
  },
  {
    title: "FAQ",
    handle: "faq",
    content: `<h2>Commandes</h2>
<details><summary>Comment passer commande ?</summary><p>Ajoutez les produits au panier, puis suivez les étapes de paiement. Vous recevrez un email de confirmation.</p></details>
<details><summary>Puis-je modifier ma commande ?</summary><p>Contactez-nous rapidement après votre commande à contact@magic-crochet-kit.com. Si elle n'est pas encore expédiée, nous pourrons la modifier.</p></details>

<h2>Livraison</h2>
<details><summary>Quels sont les délais de livraison ?</summary><p>Expédition sous 24-48h ouvrées, livraison en 3 à 5 jours ouvrés en France métropolitaine.</p></details>
<details><summary>La livraison est-elle gratuite ?</summary><p>Oui, la livraison est gratuite pour toute commande supérieure à 50€.</p></details>

<h2>Retours</h2>
<details><summary>Comment retourner un article ?</summary><p>Vous disposez de 30 jours pour retourner un article. Contactez-nous pour obtenir une étiquette de retour gratuite.</p></details>
<details><summary>Quand serai-je remboursé ?</summary><p>Le remboursement est effectué sous 15 jours après réception du retour.</p></details>

<h2>Paiement</h2>
<details><summary>Quels moyens de paiement acceptez-vous ?</summary><p>Nous acceptons Visa, Mastercard, CB et Apple Pay via notre partenaire de paiement sécurisé Stripe.</p></details>`,
    seo_title: "FAQ — Magic Crochet Kit",
    seo_description: "Questions fréquentes sur les commandes, livraisons, retours et paiements — Magic Crochet Kit",
  },
]

export default async function seedPages({ container }: ExecArgs) {
  const pageService = container.resolve(PAGE_MODULE)

  console.log("Seeding CMS pages...")

  for (const page of defaultPages) {
    try {
      const existing = await pageService.listPages({ handle: page.handle })
      if (!existing || existing.length === 0) {
        await pageService.createPages(page)
        console.log(`  + ${page.handle}`)
      } else {
        console.log(`  = ${page.handle} (exists)`)
      }
    } catch {
      await pageService.createPages(page)
      console.log(`  + ${page.handle}`)
    }
  }

  console.log("CMS pages seeded!")
}
