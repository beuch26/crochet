# Guide de Personnalisation des Spécifications Produit

## 📋 Vue d'ensemble

La section **Product Specifications** permet d'afficher des informations détaillées sur chaque produit. Par défaut, elle affiche les mêmes informations pour tous les produits, mais vous pouvez **personnaliser les spécifications pour chaque produit** individuellement.

## 🎯 Personnaliser les Spécifications par Produit

### Méthode : Utiliser les Metafields Shopify

Les metafields vous permettent de stocker des données personnalisées pour chaque produit.

### Étape 1 : Créer les Définitions de Metafields

1. Allez dans **Shopify Admin** → **Paramètres** → **Metafields**
2. Cliquez sur **Produits**
3. Ajoutez les définitions suivantes :

#### Composition

- **Namespace et clé** : `specifications.composition`
- **Nom** : Composition
- **Type** : Texte sur plusieurs lignes
- **Description** : Composition du produit (ex: 80% Coton, 20% Polyester)

#### Guide des tailles

- **Namespace et clé** : `specifications.size_guide`
- **Nom** : Guide des tailles
- **Type** : Texte enrichi (ou texte sur plusieurs lignes)
- **Description** : Informations sur les tailles disponibles

#### Instructions d'entretien

- **Namespace et clé** : `specifications.care`
- **Nom** : Instructions d'entretien
- **Type** : Texte enrichi (ou texte sur plusieurs lignes)
- **Description** : Instructions de lavage et d'entretien

#### Dimensions

- **Namespace et clé** : `specifications.dimensions`
- **Nom** : Dimensions
- **Type** : Texte sur une seule ligne
- **Description** : Dimensions du produit (ex: L: 70cm x l: 50cm)

### Étape 2 : Remplir les Metafields pour Chaque Produit

1. Allez dans **Produits** → Sélectionnez un produit
2. Scrollez vers le bas jusqu'à la section **Metafields**
3. Remplissez les champs créés précédemment

#### Exemples de valeurs :

**Composition :**
```
100% Coton biologique certifié GOTS
```

**Guide des tailles :**
```
S: Tour de poitrine 88-92cm
M: Tour de poitrine 92-96cm
L: Tour de poitrine 96-100cm
XL: Tour de poitrine 100-104cm
```

**Instructions d'entretien :**
```
- Lavage en machine à 30°C
- Ne pas javelliser
- Séchage en tambour interdit
- Repassage à basse température
- Nettoyage à sec autorisé
```

**Dimensions :**
```
L: 70cm x l: 50cm x h: 2cm
```

## 🎨 Personnaliser l'Apparence

### Dans l'Éditeur de Thème

1. Allez dans **Boutique en ligne** → **Thèmes** → **Personnaliser**
2. Ouvrez une page produit
3. Cliquez sur la section **Product Specifications**
4. Vous pouvez :
   - Modifier le titre de la section
   - Activer/désactiver chaque spécification
   - Modifier les libellés (Composition, Entretien, etc.)
   - Définir des valeurs par défaut (utilisées si les metafields sont vides)

## 💡 Conseils

### Quand utiliser les Metafields vs Valeurs par Défaut

**Metafields (recommandé)** :
- ✅ Produits avec des spécifications différentes
- ✅ Vêtements, accessoires, produits techniques
- ✅ Besoin de flexibilité maximale

**Valeurs par défaut** :
- ✅ Tous vos produits ont les mêmes spécifications
- ✅ Vous voulez un affichage rapide sans configuration
- ✅ Produits simples

### Masquer une Spécification

Si un produit n'a pas besoin d'une spécification particulière :
1. Laissez simplement le metafield vide
2. ET décochez l'option dans les paramètres de la section

Ou utilisez du CSS pour masquer :
```css
.specification-item:has(.specification-item__title:contains("Dimensions")) {
  display: none;
}
```

## 🚀 Exemple Complet

### Produit : Polo Golf Premium

**Metafields configurés :**

```yaml
specifications.composition: "85% Coton Pima, 15% Élasthanne"
specifications.size_guide: "S: 88-92cm | M: 92-96cm | L: 96-100cm | XL: 100-104cm"
specifications.care: "Lavage machine 30°C | Pas de sèche-linge | Repassage doux"
```

**Résultat** : Le produit affichera ces informations personnalisées au lieu des valeurs par défaut.

## 🔧 Dépannage

**Les metafields n'apparaissent pas ?**
- Vérifiez que le namespace est bien `specifications`
- Vérifiez que la clé correspond exactement (composition, size_guide, care, dimensions)
- Assurez-vous que l'option est activée dans les paramètres de la section

**Les valeurs par défaut s'affichent toujours ?**
- Vérifiez que vous avez bien rempli les metafields pour ce produit spécifique
- Videz le cache de votre navigateur (Ctrl+Shift+R)

## 📚 Ressources

- [Documentation Shopify Metafields](https://shopify.dev/docs/apps/custom-data/metafields)
- Support : https://github.com/beuch26/shopify_theme/issues
