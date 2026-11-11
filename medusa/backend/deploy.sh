#!/bin/bash
# Deploiement du backend Medusa en production.
#
#   ssh root@api-hetzner.web-guru.fr 'PG_CONTAINER=geniuz-postgres /opt/magic-crochet-medusa/backend/deploy.sh'
#
# Ce script ne contient AUCUNE valeur propre a une boutique : il se situe tout
# seul et lit sa configuration dans le .env voisin et dans ecosystem.config.js.
#
# L'ordre des etapes compte. Les trois pieges qui ont coute des interruptions
# de service pendant la migration 2.19 de Geniuz :
#
#   1. `medusa build` REGENERE .medusa/server : il efface son node_modules ET
#      son .env. Sans recopie du .env et sans `npm install --omit=dev` a
#      l'interieur, le service redemarre sans DATABASE_URL ni REDIS_URL et
#      boucle sur "Pg connection failed to connect to the database. Retrying..."
#      / "redisUrl not found. A fake redis instance will be used.".
#
#   2. `medusa build` peut sortir en code NON NUL a cause d'erreurs de typage
#      preexistantes, tout en emettant des artefacts utilisables. Sous `set -e`
#      la suite du script serait sautee : le build resterait sans dependances
#      et le service ne mourrait qu'au redemarrage suivant, sans lien apparent
#      avec le deploiement. On tolere le code de sortie, on verifie l'artefact.
#      (Au 3 septembre 2026 cette boutique compile sans erreur, mais la parade
#      reste : la premiere erreur de typage introduite ne doit pas couper.)
#
#   3. pm2 n'applique ni `cwd` ni `script` sur une app deja enregistree,
#      uniquement `args`. Le `pm2 delete` avant `pm2 start` est OBLIGATOIRE,
#      sinon le process tourne depuis l'ancien repertoire et l'admin repond
#      "Could not find index.html in the admin build directory".
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$APP_DIR/.medusa/server"
cd "$APP_DIR"

# Le nom pm2 est lu dans ecosystem.config.js : plusieurs boutiques tournent sur
# la meme machine et un `pm2 delete` code en dur couperait celle d'a cote.
test -f ecosystem.config.js || { echo "ECHEC : ecosystem.config.js introuvable" >&2; exit 1; }
APP_NAME=$(node -p "require('$APP_DIR/ecosystem.config.js').apps[0].name" 2>/dev/null || true)
test -n "$APP_NAME" || { echo "ECHEC : nom d'application pm2 illisible" >&2; exit 1; }

test -f .env || { echo "ECHEC : pas de .env dans $APP_DIR" >&2; exit 1; }

# Configuration lue dans le .env (source unique de verite)
DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d '\r"')
APP_PORT=$(grep -E '^PORT=' .env | head -1 | cut -d= -f2- | tr -d '\r"')
# Le repli silencieux sur 9000 est un piege : cette boutique ecoute sur 9100.
# Sans PORT dans le .env, le service demarrerait correctement mais le controle
# /health final interrogerait le mauvais port et conclurait a un echec.
if [ -z "$APP_PORT" ]; then
  echo "ATTENTION : PORT absent du .env, repli sur 9000." >&2
  echo "            Cette boutique ecoute sur 9100 : ajouter PORT=9100 dans $APP_DIR/.env" >&2
  APP_PORT=9000
fi
test -n "$DATABASE_URL" || { echo "ECHEC : DATABASE_URL absent du .env" >&2; exit 1; }

# Redis est partage entre les boutiques de la machine : sans index dedie, tout
# le monde ecrit dans db0. Convention en place : Magic Crochet /1, Monsieur CBD
# /2, Artemis /3, Geniuz /4.
REDIS_URL=$(grep -E '^REDIS_URL=' .env | head -1 | cut -d= -f2- | tr -d '\r"')
if [ -z "$REDIS_URL" ]; then
  echo "ATTENTION : REDIS_URL absent - event bus et moteur de workflows resteront en memoire." >&2
else
  # Segment apres le dernier "/" : c'est l'index. Tester la simple presence
  # d'un chiffre apres un slash ne suffit pas, "redis://127.0.0.1:6379" passerait.
  case "${REDIS_URL##*/}" in
    ''|*[!0-9]*) echo "ATTENTION : REDIS_URL sans index de base - cette boutique doit utiliser /1." >&2 ;;
  esac
fi

echo "==> Sauvegarde de la base"
mkdir -p /root/backups
DUMP="/root/backups/deploy_$(date +%Y%m%d_%H%M%S).sql.gz"
# pg_dump accepte l'URI complete : ni parsing ni mot de passe a manipuler.
# Postgres tourne dans un conteneur partage avec une autre boutique, d'ou
# PG_CONTAINER. Depuis le conteneur, "localhost" designe bien Postgres, donc
# la meme URI fonctionne dans les deux cas.
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump "$DATABASE_URL" | gzip > "$DUMP"
elif [ -n "${PG_CONTAINER:-}" ]; then
  docker exec "$PG_CONTAINER" pg_dump "$DATABASE_URL" | gzip > "$DUMP"
else
  echo "ECHEC : ni pg_dump sur l'hote, ni PG_CONTAINER defini." >&2
  echo "        Relancer avec : PG_CONTAINER=geniuz-postgres $0" >&2
  exit 1
fi
gzip -t "$DUMP" || { echo "ECHEC : sauvegarde illisible" >&2; exit 1; }
echo "    $DUMP ($(du -h "$DUMP" | cut -f1))"

echo "==> Dependances"
npm install --no-audit --no-fund

echo "==> Migrations"
npx medusa db:migrate

echo "==> Build"
NODE_ENV=production npx medusa build || echo "    (build termine avec des erreurs de typage, voir ci-dessus)"
test -f "$BUILD_DIR/medusa-config.js" || { echo "ECHEC : build absent" >&2; exit 1; }
test -f "$BUILD_DIR/public/admin/index.html" || { echo "ECHEC : admin absent du build" >&2; exit 1; }

echo "==> Restauration du .env et des dependances dans le build"
cp "$APP_DIR/.env" "$BUILD_DIR/.env"
( cd "$BUILD_DIR" && npm install --omit=dev --no-audit --no-fund )

echo "==> Redemarrage de $APP_NAME"
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
pm2 start "$APP_DIR/ecosystem.config.js"

echo "==> Verification (port $APP_PORT)"
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://127.0.0.1:$APP_PORT/health" || true)
  if [ "$code" = "200" ]; then
    echo "OK : health 200 apres $((i*5))s"
    pm2 save >/dev/null 2>&1
    exit 0
  fi
  sleep 5
done

echo "ECHEC : le service ne repond pas sur $APP_PORT. Voir /var/log/$APP_NAME-error.log" >&2
exit 1
