# Logos des transporteurs (checkout)

Dépose ici les **logos officiels** des transporteurs proposés au checkout.
Ils s'affichent automatiquement à la place de la pastille colorée de repli.

## Nommage attendu (PNG, fond transparent, ~80×40 px conseillé)

| Fichier | Transporteur |
|---|---|
| `chronopost.png` | Chronopost |
| `mondial-relay.png` | Mondial Relay |
| `colis-prive.png` | Colis Privé |
| `colissimo.png` | Colissimo |
| `ups.png` | UPS |
| `dhl.png` | DHL |
| `gls.png` | GLS |
| `dpd.png` | DPD |
| `relais-colis.png` | Relais Colis |

Le nom de fichier suit le transporteur (voir `carrierSlug()` dans `checkout.astro`).
Si le fichier n'existe pas, le checkout affiche une pastille de marque colorée (aucune image cassée).

Les huit fichiers présents ici ont été repris de la boutique pilote
(Monsieur CBD). Ce sont des **marques déposées**, servies publiquement sur le
site pour identifier le transporteur au moment du choix de livraison.

Pour les retirer : `git rm -r frontend/public/carriers`. Le checkout continue
de fonctionner — il retombe sur les pastilles de marque colorées définies par
`carrierBadge()` dans `checkout.astro`, déjà bien plus lisibles que les
abréviations à trois lettres d'avant.
