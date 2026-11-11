#!/bin/bash
# Re-build et re-déploie le frontend Astro sur le VPS Hetzner.
# Usage: ./deploy/update-frontend.sh  (depuis la racine du repo)

set -euo pipefail

if [ ! -f frontend/.env ]; then
  echo "Erreur : frontend/.env manquant. Copie .env.example et remplis les bonnes valeurs."
  exit 1
fi

echo "==> Build du frontend Astro..."
cd frontend && npm run build && cd ..

echo "==> Tar + ssh vers le VPS (replace frontend-dist)..."
tar -czf - -C frontend/dist . | ssh root@api-hetzner.web-guru.fr '
  rm -rf /opt/magic-crochet-medusa/frontend-dist/* /opt/magic-crochet-medusa/frontend-dist/.* 2>/dev/null
  cd /opt/magic-crochet-medusa/frontend-dist && tar -xzf -
  echo "  Files deployed : $(find . -type f | wc -l)"
'

echo "==> OK. Le site est mis à jour : https://magic-crochet-kit.com/"
