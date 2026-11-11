# Magic Crochet Medusa

Migration de la boutique **Magic Crochet Kit** depuis le thème Shopify (`crochetbox-2.myshopify.com`) vers une stack Medusa + Astro, basée sur une copie du projet `geniuz-project`.

**Objectif** : supprimer l'abonnement Shopify mensuel en réutilisant l'infra Medusa déjà en place pour Geniuz.

---

## Architecture

| Composant | Stack | Dossier |
|-----------|-------|---------|
| Backend e-commerce | Medusa.js v2 | `backend/` |
| Frontend | Astro | `frontend/` |
| Scripts de migration | Node + TypeScript | `migration/` |

## Sources et contexte

- **Thème Shopify d'origine** : `C:\Users\Matthieu\Desktop\magic-crochet-kit-theme`
  - Reste en prod tant que la migration n'est pas terminée
  - Contient les instructions métier (fiches produits FR, métafields, affiliation LoveCrafts) — voir son `CLAUDE.md`
- **Projet source du code Medusa** : `C:\Users\Matthieu\Desktop\geniuz-project`
  - Backend + frontend dupliqués ici comme point de départ
  - Modules custom préservés : blog, theme, contact, newsletter, page, review, gift-card, return-request, page-layout, redirect, integration, email-smtp

## Données à migrer depuis Shopify

- Produits + variantes (couleur) + images
- Métafields custom : `composition`, `care`, `dimensions`, `benefice`, `box_content`, `faq`, `qna`, `affiliate_url`, `affiliate_name`, `source_url`, `title_tag`, `description_tag`
- Collections (notamment "Fils et matériaux", "Fil Acrylique")
- Pages CMS (À propos, FAQ, CGV, Livraison, Mentions légales, Politique de confidentialité, Suivi de commande)
- Clients (avec invitation de reset password — les hashes Shopify ne sont pas portables)
- Commandes historiques (statut archivé en lecture seule)

## Spécificités à préserver

- **Affiliation LoveCrafts** : `LOVECRAFTS_AFFILIATE_ID=baa5aae9`, lien affilié visible sur chaque fiche produit
- **Couleurs FR** : noms des variantes traduits via dictionnaire (`scrapelovecraftr/translate_colors.js`)
- **Titres FR** sans emojis, "Ball" → "Pelote", etc. (cf. CLAUDE.md du thème Shopify)
- **Pas plus de 30 variantes couleur** par produit

## Cibles d'hébergement

- Backend Medusa : `https://api-crochet.web-guru.fr` (sur le même VPS Hetzner que geniuz)
- Frontend Astro : à définir (probablement même VPS via reverse proxy)
- Base Postgres dédiée + namespace Redis séparé de geniuz

## État de la migration

Voir `MIGRATION-CHECKLIST.md` pour les étapes restantes (serveur, DNS, env vars, données).
