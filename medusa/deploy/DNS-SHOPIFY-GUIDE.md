# Guide DNS — Faire pointer magic-crochet-kit.com vers le VPS

Le domaine `magic-crochet-kit.com` est actuellement enregistré chez **Shopify**. Pour faire pointer le site sur ton infra Medusa (VPS Hetzner `178.104.112.71`), on garde Shopify comme registrar temporairement et on modifie juste les enregistrements DNS.

## Étape 1 — Aller dans les paramètres DNS

1. Connecte-toi à ton admin Shopify : https://crochetbox-2.myshopify.com/admin
2. **Settings** (en bas à gauche)
3. **Domains**
4. Clique sur **magic-crochet-kit.com**
5. Clique sur **DNS settings** (ou **DNS records** selon la version)

## Étape 2 — Modifier / supprimer les enregistrements existants

Tu vas voir des enregistrements existants qui pointent vers Shopify (`shops.myshopify.com`, IPs Shopify…). **Supprime** ou **modifie** ceux-ci :

| Type | Hôte/Nom | Valeur (à supprimer) |
|------|----------|----------------------|
| `A` | `@` (root) | `23.227.38.x` (IP Shopify) — **à remplacer** |
| `CNAME` | `www` | `shops.myshopify.com` — **à remplacer** |

⚠️ **Note** : si Shopify ne te laisse pas modifier ces records tant que le domaine est rattaché au shop, va d'abord dans **Settings → Domains** et **détache** le domaine du shop (clique sur les 3 points → "Remove domain from store"). Ça n'affecte pas l'enregistrement du domaine, juste son rattachement au shop.

## Étape 3 — Ajouter ces 3 enregistrements

| Type | Hôte/Nom | Valeur | TTL |
|------|----------|--------|-----|
| `A` | `@` (root / vide) | `178.104.112.71` | 3600 (1 h) |
| `CNAME` | `www` | `magic-crochet-kit.com` | 3600 (1 h) |
| `A` | `api` | `178.104.112.71` | 3600 (1 h) |

**Explications** :
- `@` (root) → fait pointer `magic-crochet-kit.com` vers le VPS (pour le site frontend)
- `www` → fait pointer `www.magic-crochet-kit.com` vers le même endroit
- `api` → fait pointer `api.magic-crochet-kit.com` vers le VPS (pour l'API Medusa déjà déployée)

## Étape 4 — Sauvegarder et attendre la propagation

- Délai habituel : **5 à 30 minutes**
- Pour vérifier la propagation depuis ton PC :
  ```powershell
  nslookup magic-crochet-kit.com
  nslookup api.magic-crochet-kit.com
  ```
  Tu dois voir `178.104.112.71` apparaître.
- Sinon, vérifier en ligne : https://dnschecker.org/#A/api.magic-crochet-kit.com

## Étape 5 — Une fois propagé, dis-le moi

Je lancerai côté serveur :
```bash
ssh root@api-hetzner.web-guru.fr 'certbot --nginx -d magic-crochet-kit.com -d www.magic-crochet-kit.com -d api.magic-crochet-kit.com --non-interactive --agree-tos -m contact@magic-crochet-kit.com --redirect'
```

Ça va automatiquement :
1. Demander 3 certificats Let's Encrypt (gratuits, valables 90 jours, renouvelés auto)
2. Patcher les vhosts Nginx pour servir en HTTPS
3. Mettre en place la redirection 80 → 443

Puis je déploierai le frontend Astro sur le même VPS pour servir le site `https://magic-crochet-kit.com`.

## Plus tard : transférer le domaine vers Cloudflare (option A)

Une fois la bascule terminée et stable, pour vraiment quitter Shopify :

1. **Dans Shopify** : Settings → Domains → magic-crochet-kit.com → **Transfer to another provider** → ils donnent un **EPP code** (auth code)
2. **Chez Cloudflare** : https://dash.cloudflare.com → Add a site → suivre la procédure de transfert avec l'EPP code
3. Cloudflare te demandera de mettre à jour les name servers chez Shopify pour qu'ils pointent vers ceux de Cloudflare (genre `ns1.cloudflare.com`)
4. Le transfert prend **5-7 jours**. Pendant ce temps, le site reste accessible (le DNS ne change pas, juste le registrar derrière)
5. Coût : ~9 €/an chez Cloudflare (vs ~14 €/an chez Shopify)
6. Une fois transféré, tu peux **résilier l'abonnement Shopify** sans perdre le domaine.
