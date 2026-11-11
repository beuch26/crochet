# Instructions pour Magic Crochet Kit

## Déploiement du Thème

**IMPORTANT** : Le thème est synchronisé via **GitHub**, pas via Shopify CLI.

Pour déployer des modifications du thème :
1. Faire les modifications dans le dossier `C:\Users\Matthieu\Desktop\magic-crochet-kit-theme`
2. Commit et push vers GitHub
3. Shopify se synchronise automatiquement avec le repo GitHub

```bash
cd "C:\Users\Matthieu\Desktop\magic-crochet-kit-theme"
git add <fichiers>
git commit -m "Description des changements"
git push
```

**NE PAS utiliser** `shopify theme push` - ça ne fonctionnera pas.

---

## Credentials Shopify

```
SHOPIFY_SHOP_DOMAIN=crochetbox-2.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=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
```

Fichier .env : `C:\Users\Matthieu\Desktop\magic-crochet-kit-theme\.env`

## Affiliation LoveCrafts

```
LOVECRAFTS_AFFILIATE_ID=baa5aae9
AFFILIATE_NAME=LoveCrafts
```

---

## Instructions pour les Fiches Produits

### Titres des Produits

Les titres doivent être **traduits en français**. Traductions courantes :
- "Yarn" (isolé à la fin) → supprimer
- "Ball" → "Pelote"
- "Balls" → "Pelotes"
- "Value Pack" → "Pack"
- "Chunky", "DK", "Aran" → garder tel quel (termes techniques)

**IMPORTANT** :
- **Pas d'émojis** dans les titres de produits
- **Noms de marque** : Ne PAS traduire "Yarns" quand il fait partie du nom de marque (ex: "Paintbox Yarns" reste "Paintbox Yarns")
- Ajouter "Fil" au début si pas déjà présent

Exemple : "Paintbox Yarns Simply Chunky 5 Ball Value Pack" → "Fil Paintbox Yarns Simply Chunky Pack 5 Pelotes"

### Structure de la Description

- **Titres H3** avec emojis et texte en gras
- **Listes à puces** avec points clés en gras
- **SEULEMENT 2 séparateurs `---`** (pas `<hr>`, pas plus de 2)
- Contenu en **FRANÇAIS**
- **Majuscules** : uniquement en début de phrase et noms propres (ex: "✨ Pourquoi choisir ce fil ?" et non "✨ Pourquoi Choisir Ce Fil ?")

### Meta SEO

- **Meta title** (`global.title_tag`) : En français, max 60 caractères
- **Meta description** (`global.description_tag`) : En français, max 155 caractères

---

## Metafields à Remplir

| Namespace | Key | Type | Description |
|-----------|-----|------|-------------|
| `global` | `title_tag` | single_line_text_field | Meta title SEO |
| `global` | `description_tag` | single_line_text_field | Meta description SEO |
| `specifications` | `composition` | multi_line_text_field | Composition du produit |
| `specifications` | `care` | multi_line_text_field | Instructions d'entretien |
| `specifications` | `dimensions` | single_line_text_field | Poids / Métrage |
| `custom` | `benefice` | rich_text_field | Liste des bénéfices (JSON rich text) |
| `custom` | `box_content` | rich_text_field | Contenu du kit (JSON rich text) |
| `custom` | `faq` | **list.metaobject_reference** | FAQ - Références vers Metaobjects |
| `custom` | `qna` | json | FAQ format JSON [{question, answer}] |
| `custom` | `affiliate_url` | url | URL affiliée |
| `custom` | `affiliate_name` | single_line_text_field | Nom du partenaire (LoveCrafts) |
| `custom` | `source_url` | url | URL source originale |

### IMPORTANT : Champ FAQ (`custom.faq`)

Le champ `custom.faq` est de type `list.metaobject_reference`. Il ne contient PAS du JSON mais des **références vers des Metaobjects FAQ**.

Format de la valeur : `["gid://shopify/Metaobject/123", "gid://shopify/Metaobject/456"]`

Pour remplir ce champ, il faut :
1. Créer des Metaobjects FAQ via l'API ou l'admin Shopify
2. Récupérer leurs IDs
3. Les assigner au produit

Alternative : utiliser le champ `custom.qna` (type JSON) qui accepte directement le format :
```json
[{"question": "...", "answer": "..."}]
```

---

## Format Rich Text (benefice, box_content)

```json
{
  "type": "root",
  "children": [{
    "type": "list",
    "listType": "unordered",
    "children": [
      {
        "type": "list-item",
        "children": [{"type": "text", "value": "Premier élément"}]
      },
      {
        "type": "list-item",
        "children": [{"type": "text", "value": "Deuxième élément"}]
      }
    ]
  }]
}
```

---

## Exemple de Description Correcte

```html
<h3><b>🧶 Fil Paintbox Yarns Simply Chunky - Le Fil Idéal pour Vos Créations</b></h3>
<p> </p>
<p>Découvrez ce fil de qualité supérieure...</p>
<p> </p>
<p>---</p>
<p> </p>
<h3><b>📋 Caractéristiques Techniques</b></h3>
<p> </p>
<ul>
<li><p><b>Composition :</b> 100% Acrylique</p></li>
<li><p><b>Poids :</b> 100g</p></li>
</ul>
<p> </p>
<p>---</p>
<p> </p>
<h3><b>✨ Pourquoi Choisir Ce Fil ?</b></h3>
<ul>
<li><p><b>Qualité Premium :</b> Fil doux et résistant.</p></li>
</ul>
<p>🚚 <b>Livraison rapide</b> depuis notre partenaire LoveCrafts.</p>
```

---

## Scripts Utiles

| Script | Chemin |
|--------|--------|
| Scraper V5 (variantes + images) | `C:\Users\Matthieu\Desktop\scrapelovecraftr\scraper_variants_v5.js` |
| Import V5 | `C:\Users\Matthieu\Desktop\scrapelovecraftr\import_shopify_yarns_v5.js` |
| Association images variantes | `C:\Users\Matthieu\Desktop\scrapelovecraftr\associate_variant_images.js` |
| Traduction couleurs FR | `C:\Users\Matthieu\Desktop\scrapelovecraftr\translate_colors.js` |
| JSON avec variantes | `C:\Users\Matthieu\Desktop\scrapelovecraftr\products_with_variants.json` |

**Workflow d'import :**
1. Exécuter `scraper_variants_v5.js` pour scraper les produits avec variantes ET images
2. Exécuter `import_shopify_yarns_v5.js` pour importer dans Shopify
3. Exécuter `associate_variant_images.js` pour associer les images aux variantes
4. Exécuter `translate_colors.js` pour traduire les noms des couleurs en français

**Limites :**
- Max 30 variantes de couleur par produit (configurable dans le script)
- Le scraper gère les cookies automatiquement
- Les images des variantes sont uploadées avec alt = nom de la couleur
- Les noms des couleurs sont traduits en français (241 couleurs dans le dictionnaire)

---

## Variantes de Couleur

- Importer **toutes les variantes de couleur en stock** pour chaque produit
- Chaque variante devient une option "Couleur" dans Shopify
- Ne pas importer les variantes en rupture de stock

## Collection

Les fils doivent être ajoutés à la collection **"Fils et matériaux"** ou une collection spécifique comme **"Fil Acrylique"**.

### Création d'une collection

**IMPORTANT - Encodage** : Utiliser `--data-binary` avec heredoc pour éviter les problèmes d'accents :

```bash
curl -s -X POST "https://crochetbox-2.myshopify.com/admin/api/2024-01/graphql.json" \
  -H "Content-Type: application/json; charset=utf-8" \
  -H "X-Shopify-Access-Token: $TOKEN" \
  --data-binary @- << 'EOF'
{
  "query": "mutation($input: CollectionInput!) { collectionCreate(input: $input) { collection { id } userErrors { message } } }",
  "variables": {
    "input": {
      "title": "Nom de la collection",
      "descriptionHtml": "<p>Description détaillée (2-3 phrases)...</p>",
      "seo": {
        "title": "Meta title (max 60 car.)",
        "description": "Meta description (max 155 car.)"
      }
    }
  }
}
EOF
```

### Contenu de la description

La description doit contenir **2-3 phrases** qui :
- Présentent le type de produits
- Mettent en avant les qualités (doux, résistant, facile d'entretien...)
- Indiquent le public cible (débutants, experts...)

**Exemple** :
> Explorez notre gamme de fils acryliques soigneusement sélectionnés pour tous vos projets créatifs. Doux, résistants et faciles d'entretien, ces fils sont parfaits pour le tricot comme pour le crochet. Disponibles dans une large palette de coloris, ils conviennent aussi bien aux débutants qu'aux créateurs expérimentés.

### Après création

1. Ajouter les produits : `collectionAddProducts`
2. Publier sur la boutique : `publishablePublish` avec `publicationId: "gid://shopify/Publication/299509350729"`
3. Ajouter au menu si nécessaire

## Canal de Vente

**IMPORTANT** : Les produits doivent être publiés sur le canal **"Online Store"** (boutique en ligne) pour être visibles.

Publication ID : `gid://shopify/Publication/299509350729`

```graphql
mutation {
  publishablePublish(id: "gid://shopify/Product/XXX", input: {publicationId: "gid://shopify/Publication/299509350729"}) {
    userErrors { message }
  }
}
```

---

## Prix

Le prix doit être défini via `productVariantsBulkUpdate` après la création du produit car `ProductInput` ne permet pas de définir le prix directement.

**IMPORTANT** : La mutation `productVariantUpdate` n'existe plus dans l'API Shopify 2024-01. Utiliser `productVariantsBulkUpdate` à la place :

```graphql
mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
    productVariants { id price }
    userErrors { message }
  }
}
```
