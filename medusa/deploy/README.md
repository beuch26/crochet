# Déploiement Magic Crochet Medusa

État actuel : **backend Medusa + frontend Astro + TLS HTTPS sont en ligne** sur le VPS Hetzner. Le site est accessible à `https://magic-crochet-kit.com/`.

## Infra de prod

| Composant | Valeur |
|-----------|--------|
| Serveur | `api-hetzner.web-guru.fr` (`178.104.112.71`), Ubuntu 24.04 |
| Code backend | `/opt/magic-crochet-medusa/backend/` |
| Process | PM2 `medusa-crochet` (port 9100, `npx medusa develop`) |
| Postgres | container `geniuz-postgres`, user `crochet`, DB `crochet_medusa` |
| Redis | `redis://localhost:6379/1` (DB index 1, geniuz utilise 0) |
| Nginx vhost | `/etc/nginx/sites-available/crochet-medusa-api` (HTTP only) |
| Logs PM2 | `/var/log/medusa-crochet-{error,out}.log` |
| Compte admin | `admin@magic-crochet-kit.fr` — back office : `https://api.magic-crochet-kit.com/app` (mot de passe : voir gestionnaire de mots de passe) |

## Test rapide depuis le VPS

```bash
curl -H 'Host: api-crochet.web-guru.fr' http://localhost/health  # -> HTTP 200
```

## Pour rendre l'API accessible depuis l'extérieur (action manuelle)

L'API tourne mais n'est pas joignable depuis l'extérieur tant que le DNS n'est pas configuré.

**1. Ajouter le DNS chez le registrar de `web-guru.fr`** :
- Type : `A`
- Nom : `api-crochet` (sous-domaine de `web-guru.fr`)
- Valeur : `178.104.112.71`
- TTL : 3600 (1 heure)

**2. Une fois le DNS propagé (5-30 min)**, émettre le cert TLS via Let's Encrypt :
```bash
ssh root@api-hetzner.web-guru.fr 'certbot --nginx -d api-crochet.web-guru.fr --non-interactive --agree-tos -m contact@magic-crochet-kit.com'
```

Certbot va automatiquement éditer le vhost Nginx pour ajouter le bloc `listen 443 ssl` et la redirection 80→443.

## Commandes utiles

```bash
# Logs en direct
ssh root@api-hetzner.web-guru.fr 'pm2 logs medusa-crochet --lines 50'

# Redémarrer
ssh root@api-hetzner.web-guru.fr 'pm2 restart medusa-crochet'

# Voir le statut
ssh root@api-hetzner.web-guru.fr 'pm2 list'

# Accès direct à la DB (depuis le VPS)
ssh root@api-hetzner.web-guru.fr
docker exec -it geniuz-postgres psql -U crochet -d crochet_medusa

# Re-déployer du code depuis le PC local (depuis le dossier magic-crochet-medusa)
tar --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='.astro' --exclude='.medusa' --exclude='*.env' \
    -czf - . | ssh root@api-hetzner.web-guru.fr 'cd /opt/magic-crochet-medusa && tar -xzf - && cd backend && npm install && pm2 restart medusa-crochet'
```

## État Stripe + SMTP

**Stripe** ✅ **live mode actif** :
- Clés `sk_live_*` et `pk_live_*` reprises du backend Geniuz (même entité juridique, deux boutiques sur un seul compte Stripe)
- Lié à la région France
- Webhook endpoint MCK créé séparément dans Stripe dashboard, secret `whsec_*` configuré dans `.env`
- ⚠️ Mode LIVE : tout paiement de test sera un vrai débit. Pour tester sans frais, switcher vers `sk_test_*` / `pk_test_*` ou créer un coupon 100%.

**SMTP** ⚠️ **pas configuré** :
- `SMTP_HOST/USER/PASS` vides dans `.env`
- Les emails de confirmation commande / reset password ne sont pas envoyés
- Reprendre quand prêt : Brevo (gratuit 300/jour) ou Resend (3000/mois gratuit)

## Limitations à corriger plus tard

- **Mode `medusa develop` en prod** : choisi pour la simplicité (cohérent avec geniuz), mais consomme + de RAM et recompile à chaque fichier. À migrer vers `cd .medusa/server && npm install && npm start` en mode `production` quand on aura stabilisé.
- **Local Event Bus + in-memory locking** : warnings au boot ("not recommended for production"). À remplacer par les modules Redis-based de Medusa (`@medusajs/event-bus-redis` + `@medusajs/cache-redis`) pour la robustesse multi-process / restart.
- **Erreurs TypeScript dans `subscribers/order-placed.ts`, `order-shipped.ts`, `scripts/rewrite-non-ascii-urls-everywhere.ts`** : hérités du code geniuz, ne bloquent pas le runtime mais à fixer (incompatibilités types Medusa v2.x récentes).

## Frontend (Astro)

Pas encore déployé sur le VPS. Le build est validé en local (`npm run build` → 24 pages). Plusieurs options :
- Héberger le `dist/` sur Nginx du même VPS (sous-domaine `magic-crochet-kit.com` ou similaire)
- Déployer sur Vercel/Netlify (build à chaque push GitHub)
- À décider quand on aura le domaine custom.
