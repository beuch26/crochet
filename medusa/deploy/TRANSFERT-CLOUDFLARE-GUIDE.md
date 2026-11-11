# Guide — Transfert du domaine `magic-crochet-kit.com` de Shopify vers Cloudflare

Objectif : sortir le domaine de chez Shopify pour pouvoir résilier l'abonnement en toute sécurité.

---

## ⚠️ Préalable critique : vérifier l'éligibilité

Un domaine acheté chez un registrar ne peut **pas être transféré dans les 60 jours qui suivent son achat ou son dernier transfert** (règle ICANN).

- Si tu as acheté `magic-crochet-kit.com` chez Shopify **il y a moins de 60 jours** → tu dois attendre la fin du délai (la date apparaît dans l'admin Shopify)
- Si c'est **≥ 60 jours** → tu peux transférer dès maintenant

---

## ⏱ Ordre conseillé : bascule DNS d'abord, transfert en parallèle

Tu as deux options. La plus sûre est de **faire les deux en parallèle** :

### Option recommandée : bascule DNS Shopify d'abord, puis transfert

1. **Jour 0** : suivre `deploy/DNS-SHOPIFY-GUIDE.md` → modifier les DNS Shopify pour faire pointer le site vers le VPS (bascule en 30 min). Site live sur Medusa, plus de trafic Shopify.
2. **Jour 0** (en parallèle) : lancer le transfert Cloudflare (étapes ci-dessous, démarrage immédiat, transfert effectif sous 5-7 jours)
3. **Jour 5-7** : transfert finalisé chez Cloudflare → on reconfigure les mêmes 3 DNS records chez Cloudflare
4. **Jour 7-10** : Shopify ne sert plus rien, on résilie l'abonnement

### Option alternative : transfert seul (sans bascule DNS préalable)

Le site Shopify continue de fonctionner pendant les 5-7 jours du transfert. Ensuite tu configures les DNS chez Cloudflare et tu bascules vers le VPS à ce moment-là. Plus simple en apparence, mais tu paies l'abo Shopify pendant cette semaine supplémentaire.

---

## Étape 1 — Préparation côté Shopify

1. Va sur https://crochetbox-2.myshopify.com/admin → **Settings** → **Domains**
2. Clique sur **magic-crochet-kit.com**
3. Tu vas voir un panneau de gestion du domaine

### 1.a — Désactiver le verrou de transfert

- Cherche **"Transfer lock"** ou **"Domain lock"** (souvent dans une section "Security" ou "Transfer settings")
- Bascule sur **OFF / Unlocked**
- Sans ça, le transfert sera refusé par Shopify

### 1.b — Désactiver la confidentialité WHOIS (temporairement)

- Si tu vois une option **"WHOIS privacy"** ou **"Domain privacy"** activée, **désactive-la**
- Certains registrars exigent que les infos WHOIS soient publiques pour valider un transfert
- Tu pourras la réactiver chez Cloudflare une fois le transfert terminé (Cloudflare l'offre gratuitement)

### 1.c — Vérifier l'email de contact du domaine

- Toujours dans la même section, vérifie que l'email "Registrant" (contact administratif) est **un email que tu peux consulter aujourd'hui**
- Cloudflare va envoyer un email de confirmation à cette adresse — sans réponse, le transfert échoue
- Si c'est `beucher.matthieu26@gmail.com` ou similaire, c'est OK

### 1.d — Récupérer le code de transfert (EPP / Auth code)

- Cherche le bouton **"Get authorization code"**, **"Transfer code"**, **"EPP code"** ou **"Get auth code"**
- Shopify te montre un code du genre `XYZ-9k2dP-MnW3aQ-7zL`
- **Copie ce code** quelque part en sécurité (Notes, gestionnaire de mots de passe)
- ⚠️ Ce code peut **expirer après 7 jours** — récupère-le juste avant de lancer le transfert chez Cloudflare

---

## Étape 2 — Préparation côté Cloudflare

### 2.a — Créer un compte Cloudflare (si pas déjà fait)

1. Va sur https://dash.cloudflare.com/sign-up
2. Email + mot de passe (utilise idéalement la même adresse que chez Shopify pour simplifier les emails de confirmation)
3. Confirme ton email

### 2.b — Lancer le transfert depuis Cloudflare

1. Connecté à Cloudflare → **Domain Registration** (menu latéral) → **Transfer Domains**
2. Saisis `magic-crochet-kit.com` → Cloudflare vérifie l'éligibilité (déverrouillé, hors 60-day lock, etc.)
3. Si tout est OK, Cloudflare te demande :
   - Le **code EPP** (collé depuis l'étape 1.d)
   - Les **nameservers** (Cloudflare en propose 2, du genre `chris.ns.cloudflare.com` et `gina.ns.cloudflare.com`)
   - Tes **infos WHOIS** (nom, adresse, email, téléphone — qui seront masquées automatiquement par leur WHOIS privacy gratuite)
4. **Paiement** : Cloudflare te facture **~$10.44/an** pour un .com (prix coûtant, pas de marge). Carte requise.

### 2.c — Approuver le transfert

Dans les heures qui suivent :

1. **Email de Cloudflare** → "Transfer approval request" → clique sur le lien pour approuver
2. **Email de Shopify** → "Your domain transfer request" → **Approuve le transfert** côté Shopify aussi (très important — sans ça, ça reste bloqué 7 jours puis échoue)
3. Si tu n'as pas reçu l'email Shopify, retourne dans Shopify admin → Settings → Domains → **magic-crochet-kit.com** → tu verras un bouton **"Approve transfer"** : clique dessus

Une fois approuvé : Cloudflare et Shopify se synchronisent, et le transfert se finalise sous **5 à 7 jours** (souvent plus court — parfois 24-48 h).

---

## Étape 3 — Pendant le transfert (5-7 jours)

- Le DNS continue de fonctionner comme avant. **Aucun downtime**.
- Si tu as déjà fait la bascule DNS Shopify (option recommandée), le site est déjà sur le VPS → rien à faire.
- Si tu n'as pas fait la bascule DNS, le site reste sur Shopify pendant cette période.

---

## Étape 4 — Une fois le transfert finalisé

Tu reçois un email "Domain transfer completed" de Cloudflare.

### 4.a — Configurer le DNS chez Cloudflare

1. Cloudflare dash → **Websites** → clique sur `magic-crochet-kit.com` → **DNS** → **Records**
2. Cloudflare aura probablement importé les DNS existants. Vérifie/ajoute les 3 records :

| Type | Nom | Contenu | Proxy | TTL |
|------|-----|---------|-------|-----|
| `A` | `@` | `178.104.112.71` | 🟠 Proxied (orange cloud) | Auto |
| `CNAME` | `www` | `magic-crochet-kit.com` | 🟠 Proxied | Auto |
| `A` | `api` | `178.104.112.71` | ⚪ DNS only (gris) | Auto |

⚠️ **Important** : pour le sous-domaine `api`, mets **DNS only (grey cloud)** et **PAS Proxied**. Si tu actives le proxy Cloudflare sur l'API Medusa, ça va casser les websockets et le streaming SSE qu'utilise Medusa.

### 4.b — Réactiver la WHOIS privacy (Cloudflare l'offre gratuitement)

- Domain Registration → ton domaine → **Registrant** → **Privacy** → activer
- Tes infos perso seront masquées dans le WHOIS public

### 4.c — Mode TLS chez Cloudflare

Une fois les DNS configurés et le site qui répond bien :

- Cloudflare dash → **SSL/TLS** → **Overview** → mettre en **Full (strict)**
  - "Full" = HTTPS entre Cloudflare et ton serveur
  - "strict" = vérifie le cert du serveur (qu'on aura via Let's Encrypt)
- ⚠️ Si tu n'as pas encore lancé certbot sur le VPS, mets temporairement **"Full"** (sans strict) — sinon le site sera inaccessible

---

## Étape 5 — Résilier l'abonnement Shopify

Une fois que tu as vérifié que :
- Le domaine est bien transféré chez Cloudflare (tu le vois dans Cloudflare → Domain Registration)
- Le site magic-crochet-kit.com fonctionne en passant par Cloudflare → VPS → Medusa
- Tu as exporté tes données Shopify (commandes historiques, clients, produits) **au cas où** — même si on les a déjà migrées via le script

Alors tu peux résilier :

1. Shopify admin → **Settings** → **Plan**
2. **Deactivate store** ou **Pause store**
3. Shopify te propose **30 jours de "Pause and build"** gratuit avant la résiliation effective — pratique pour avoir un filet de sécurité

---

## Points de vigilance

1. **Ne pas changer les name servers chez Shopify avant que le transfert soit terminé**. Cloudflare le fera automatiquement à la fin.
2. **Garde le code EPP en sécurité** — il sert d'authentification pour le transfert. Si quelqu'un le récupère, il peut tenter de voler le domaine.
3. **Surveille tes emails** pendant les 7 jours du transfert — Cloudflare ou Shopify peuvent demander des confirmations supplémentaires.
4. **Ne résilie pas Shopify pendant le transfert** — sinon le transfert peut être annulé et le domaine revient à un état "pending delete" sous 30 jours, période durant laquelle tu peux le perdre.

---

## En résumé, le calendrier idéal

| Quand | Action | Qui |
|-------|--------|-----|
| Jour 0 | Modifier DNS Shopify → VPS (suivre `DNS-SHOPIFY-GUIDE.md`) | Toi (5 min) |
| Jour 0 | Lancer certbot sur le VPS pour TLS | Moi (après ton "DNS OK") |
| Jour 0 | Déverrouiller domaine + récupérer EPP chez Shopify | Toi (5 min) |
| Jour 0 | Lancer le transfert chez Cloudflare avec l'EPP | Toi (10 min) |
| Jour 0-1 | Approuver les emails Cloudflare + Shopify | Toi (2 min) |
| Jour 1-7 | Attendre le transfert (rien à faire) | — |
| Jour 7 | Email "transfer completed" → configurer DNS chez Cloudflare | Toi (5 min) |
| Jour 7 | Mode TLS "Full (strict)" chez Cloudflare | Toi (1 min) |
| Jour 7-8 | Vérification finale du site | Toi + moi |
| Jour 8+ | Résiliation Shopify | Toi |
