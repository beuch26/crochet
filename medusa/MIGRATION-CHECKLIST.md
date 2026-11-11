# Migration Shopify → Medusa : Checklist

## Phase 1 — Setup local ✅

- [x] Copier `geniuz-project` → `magic-crochet-medusa`
- [x] Renommer dans `backend/package.json` et `frontend/package.json`
- [x] Adapter `medusa-config.ts` (allowedHosts → `api-crochet.web-guru.fr`)
- [x] Créer `CLAUDE.md` du nouveau projet
- [x] `npm install` frontend (Astro)
- [x] `npm install` backend (Medusa)
- [x] `npm install` migration (tsx, dotenv, cross-env, @types/node)
- [x] Initialiser le git et premier commit
- [ ] **À faire toi** : créer `backend/.env` à partir de `.env.template` avec une DB Postgres locale + Redis local

## Phase 2 — Setup serveur Hetzner

- [ ] **À faire toi** : Créer une base Postgres dédiée `magic_crochet_medusa` sur le VPS
- [ ] **À faire toi** : Créer un namespace Redis distinct
- [ ] **À faire toi** : Sous-domaine DNS : `api-crochet.web-guru.fr` → IP du VPS Hetzner
- [ ] **À faire toi** : Cert TLS via Caddy/Nginx + Let's Encrypt
- [ ] **À faire toi** : Process manager (PM2 ou systemd) pour le service Medusa
- [ ] **À faire toi** : Configurer les vars d'env de prod sur le serveur :
  - `DATABASE_URL`, `REDIS_URL`
  - `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`
  - `JWT_SECRET`, `COOKIE_SECRET` (**nouveaux secrets**, pas ceux de geniuz)
  - `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `SMTP_*` (`SMTP_FROM=contact@magic-crochet-kit.com`, `SMTP_FROM_NAME=Magic Crochet Kit`)
  - `GOOGLE_CLIENT_ID/SECRET` + callback `https://api-crochet.web-guru.fr/auth/customer/google/callback` (facultatif)

## Phase 3 — Script de migration Shopify → Medusa ✅

Le script [`migration/shopify-to-medusa.ts`](migration/shopify-to-medusa.ts) couvre :

| Étape | Statut | Endpoint Medusa | Notes |
|-------|--------|-----------------|-------|
| Collections | ✅ | `POST /admin/collections` | Title, handle, metadata.image_url, seo_*, descriptionHtml |
| Produits + variantes + options | ✅ | `POST /admin/products` | Toutes options Shopify mappées en options Medusa |
| Images produits | ✅ | inline `images:[{url}]` | Pas d'upload séparé (plus simple) |
| Métafields | ✅ | `metadata.<ns>__<key>` | Préservés tels quels (composition, care, benefice, affiliate_url…) |
| Pages CMS | ✅ | `POST /admin/pages` | Module `page` custom : title, handle, content, is_published |
| Customers | ✅ | `POST /admin/customers` | Sans password (mot de passe oublié à la 1ère connexion) |
| Orders historiques | ✅ | `POST /admin/customers/:id` (metadata) | Stockés en `metadata.shopify_orders[]` sur la customer (lecture seule) |
| Redirects 301 | ✅ | `POST /admin/redirects` | `/products/<h>` → `/p/<h>`, `/pages/<h>` → `/<h>` |

**Options du script** :
- `DRY_RUN=1` : aucune écriture, juste les logs
- `ONLY=collections,products,pages,customers,orders,redirects` : limiter aux étapes choisies
- `PRODUCT_LIMIT=10` : limiter le nombre de produits (utile pour test)

**Idempotence** : skip basé sur catch des erreurs "handle already exists" (l'API Medusa v2 n'expose pas de filtre `metadata[shopify_id]` queryable). Conséquence : on peut relancer le script sans risque de doublon.

**Pour lancer** (côté toi) :
```bash
cd "C:\Users\Matthieu\Desktop\magic-crochet-medusa\migration"
cp .env.example .env
# Editer .env : SHOPIFY_ADMIN_TOKEN=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
# (Medusa local doit tourner et MEDUSA_ADMIN_TOKEN doit être obtenu via `npx medusa user`)
DRY_RUN=1 npm run migrate:shopify          # test à blanc
PRODUCT_LIMIT=5 npm run migrate:shopify    # vrai test sur 5 produits
npm run migrate:shopify                     # migration complète
```

## Phase 4 — Re-thématisation frontend ✅ (largement avancé)

- [x] `frontend/src/styles/global.css` — palette MCK (bleu `#0369a1`, accent `#50b7f1`, secondary `#103166`) + polices Circe via `@font-face` (CDN Shopify)
- [x] `frontend/src/layouts/Layout.astro` — fallbacks par défaut MCK (siteName, copyright, contact, SEO suffix, color tokens)
- [x] Remplacement global `Geniuz` → `Magic Crochet Kit` (48 fichiers frontend, 51 backend) — emails, schemas SEO, localStorage keys
- [x] Build frontend validé : 24 pages OK en 8.6s (warnings ECONNREFUSED attendus = backend pas démarré → fallbacks utilisés)
- [ ] **À faire dans une itération suivante** : adapter Header (méga-menu MCK avec "Fils et matériaux", "Fil Acrylique"…), Footer (texte intro MCK, logo `logo-noir.png`)
- [ ] **À faire dans une itération suivante** : recharger les médias spécifiques MCK (logo `Capture_d_ecran_2025-11-19_154222.avif`, favicon, logo footer)
- [ ] **À faire dans une itération suivante** : adapter les `pages/a-propos.astro`, `faq.astro`, `cgv.astro`, `livraison.astro`, `mentions-legales.astro` aux textes Magic Crochet Kit

## Phase 5 — Validation et bascule

- [ ] Tester checkout Stripe en mode test
- [ ] Vérifier feed Google Merchant et TikTok Shop
- [ ] Vérifier que les redirects 301 fonctionnent (test `/products/<old-handle>` → 301 → `/p/<old-handle>`)
- [ ] **À faire toi** : DNS — basculer le domaine custom vers le frontend Astro déployé
- [ ] **À faire toi** : Garder Shopify en lecture seule pendant 30 jours en backup
- [ ] **À faire toi** : Résilier l'abonnement Shopify

---

## Historique des commits

```
17a9737 Migration Shopify->Medusa: script fiabilise + reskin frontend MCK
af9edd1 Add Shopify to Medusa migration script
f998a55 Init magic-crochet-medusa from geniuz-project
```

## Mémoire claude-code

Le contexte est sauvegardé dans `~/.claude/projects/c--Users-Matthieu-Desktop-magic-crochet-kit-theme/memory/` :
- `project_migration_shopify_medusa.md` : initiative globale
- `reference_geniuz_infra.md` : détails infra Hetzner / Medusa
- `feedback_autonomy.md` : préférence pour mode autonome
