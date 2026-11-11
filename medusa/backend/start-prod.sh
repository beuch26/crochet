#!/bin/bash
# Lance le backend Medusa depuis le repertoire de build.
#
# Le cwd fixe le repertoire de configuration (.env, medusa-config.js) : lance
# depuis la racine du projet, Medusa ne trouve pas l'admin et s'arrete sur
# "Could not find index.html in the admin build directory".
#
# Le binaire est pris a la racine du projet : @medusajs/cli est une
# devDependency, et `npm install --omit=dev` laisse dans
# .medusa/server/node_modules/.bin un lien `medusa` pointant vers une cible
# absente. Passer par la racine fonctionne dans les deux cas.
#
# Rappel : `medusa build` regenere .medusa/server et efface son node_modules.
# Il faut y relancer `npm install --omit=dev` apres chaque build et recopier
# le .env — c'est ce que fait deploy.sh.
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR/.medusa/server" || exit 1
exec "$APP_DIR/node_modules/.bin/medusa" start
