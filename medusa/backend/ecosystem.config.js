// Configuration pm2 du backend Medusa en production.
//
// Le nom de l'application est la SEULE valeur a changer d'une boutique a
// l'autre : plusieurs boutiques cohabitent sur la meme machine et pm2 les
// distingue par ce nom. deploy.sh le relit ici plutot que de le coder en dur,
// pour qu'un `pm2 delete` ne puisse jamais viser l'application d'une autre
// boutique. Les chemins, eux, sont derives de l'emplacement de ce fichier.
//
// Deploiement : utiliser ./deploy.sh, jamais les etapes a la main.
//
// Le `pm2 delete` que fait deploy.sh n'est pas optionnel : pm2 n'applique ni
// `cwd` ni `script` sur une application deja enregistree, uniquement `args`.
// Un simple `pm2 start ecosystem.config.js` laisserait tourner l'ancienne
// commande depuis l'ancien repertoire.
//
// NODE_ENV doit venir d'ici et non du .env : loadEnv() le lit avant de
// charger le fichier. Le PORT, lui, vient du .env (source unique) — il vaut
// 9100 sur cette boutique.
const path = require('path')

const APP_NAME = 'medusa-crochet'
const APP_DIR = __dirname

module.exports = {
  apps: [{
    name: APP_NAME,
    cwd: path.join(APP_DIR, '.medusa', 'server'),
    script: path.join(APP_DIR, 'start-prod.sh'),
    interpreter: 'bash',
    exec_mode: 'fork',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    env: { NODE_ENV: 'production' },
    error_file: `/var/log/${APP_NAME}-error.log`,
    out_file: `/var/log/${APP_NAME}-out.log`,
    merge_logs: true,
  }]
}
