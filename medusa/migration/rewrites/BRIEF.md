# Brief — Réécriture des fiches produits Magic Crochet Kit

Magic Crochet Kit vend des kits de crochet (amigurumis), des patrons de crochet, des fils/laines et des crochets/outils. Les descriptions actuelles ont été générées par IA : trop d'émojis, titres ultra-marketing, gras partout, superlatifs vides. On veut un ton **naturel, sobre et humain**, comme une créatrice qui parle vraiment de ses produits.

## Règles ABSOLUES

1. **Ne RIEN inventer.** Tu réécris uniquement à partir des faits déjà présents dans la description source et les `metadata`. Aucune nouvelle caractéristique, garantie, chiffre, matériau ou fonctionnalité. Si un fait n'est pas dans la source, il n'apparaît pas.
2. **Zéro émoji** — ni dans le titre, ni dans la description.
3. **Titre** : retirer l'émoji en préfixe et nettoyer. Ex : `🐧Pipo le Pingouin (11 cm) Kit Crochet Débutant` → `Pipo le Pingouin (11 cm) – Kit crochet débutant`. Garder les infos factuelles (taille, niveau). Majuscules : seulement en début et noms propres (pas de "Kit Crochet Débutant" → "Kit crochet débutant").
4. **Supprimer les superlatifs vides** : « succès garanti », « 100% », « exclusif », « hyper/ultra-détaillé », « anti-erreur », « de A à Z », « haute qualité » répété, « MAGIC KIT CROCHET » en gras martelé, etc. On peut dire les choses simplement.
5. **Gras allégé** : seulement sur les 3-4 points clés d'une liste, pas chaque ligne.
6. **HTML propre** : supprimer tous les attributs `data-path-to-node`, les `<hr>` superflus, les `<p> </p>` vides. Balises autorisées : `<p>`, `<h3>`, `<ul>`/`<li>`, `<b>`. Pas de styles inline.

## Structure imposée (validée par le client)

- 2 à 3 courts paragraphes rédigés (intro naturelle + le concret).
- **UN** sous-titre `<h3>` (sans émoji, sobre, ex : « Ce qui rend ce kit facile », « Le fil en bref », « Bon à savoir »).
- **UNE** liste `<ul>` de 3 à 5 points clés (gras léger sur l'amorce).
- Optionnellement un court paragraphe de clôture.
- Longueur cible : proche de l'originale (≈ 600-1000 caractères), ni plus long, ni squelettique.

## Exemple AVANT → APRÈS (référence de ton)

AVANT :
`<h3><b>⭐ Succès Garanti : Réalisez Pipo le Pingouin en Seulement 3 Heures !</b></h3>` + « Oubliez la frustration… le **MAGIC KIT CROCHET**… **débutant absolu**… **garantit un succès**… **Zéro expérience requise**… **Laine Anti-Erreur Exclusive**… »

APRÈS :
```html
<p>Pipo, c'est un petit pingouin de 11 cm à crocheter soi-même, même si vous n'avez jamais tenu un crochet. Le kit réunit tout le nécessaire et un tutoriel vidéo pas à pas : vous ouvrez la boîte et vous vous lancez.</p>
<p>Comptez environ 3 heures pour le terminer. La laine a été choisie pour les débutants — épaisse et bien lisible, elle laisse voir chaque maille, ce qui simplifie l'apprentissage et évite les erreurs du début.</p>
<h3>Ce qui rend ce kit facile</h3>
<ul>
<li><b>Pensé pour les vrais débutants</b> : on part de zéro, aucune expérience nécessaire.</li>
<li><b>Un tutoriel vidéo complet</b>, du premier nœud à la finition.</li>
<li><b>Une laine facile à travailler</b>, assez nette pour repérer ses mailles.</li>
<li><b>Tout est dans la boîte</b> : laine, crochet, rembourrage, yeux et accessoires.</li>
</ul>
<p>Une activité posée pour décrocher des écrans — et la petite fierté du « c'est moi qui l'ai fait » à la fin.</p>
```

## Adapter au type de produit (garder le même ton sobre)

- **Amigurumi / kit** : storytelling léger (le personnage, le plaisir de le faire) + le concret (niveau, durée, contenu du kit).
- **Patron** : c'est un patron PDF/téléchargeable (pas un kit physique sauf indication contraire dans la source). Mettre en avant le modèle, le niveau, ce dont on a besoin SI c'est indiqué dans la source. Ne pas promettre de matériel fourni si la source ne le dit pas.
- **Fil / laine** : factuel et concret (composition, métrage, poids, sensation, usages) — uniquement ce qui est dans la source/metadata. Sous-titre type « Le fil en bref ».
- **Crochet / outil** : factuel (matériau, taille, ergonomie) d'après la source. Sobre.

## Sortie attendue

Écris un fichier JSON `rewrites/out_<NOM>.json` = tableau d'objets :
```json
[{ "id": "<product id inchangé>", "handle": "<inchangé>", "new_title": "...", "new_description": "<html propre>" }]
```
Ne mets QUE les produits de ton lot. N'altère pas `id` ni `handle`.
