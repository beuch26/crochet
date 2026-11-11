# Premium SEO Shopify Theme

Un thème Shopify ultra-complet, moderne et optimisé pour le SEO. Conçu pour être polyvalent et adapté à plusieurs secteurs d'activité (vêtements de golf, CBD, et plus encore).

## 🎯 Caractéristiques Principales

### ✅ SEO Ultra-Optimisé

- **Schema.org JSON-LD complet** pour tous les types de contenu
- **Open Graph & Twitter Cards** pour le partage social
- **Breadcrumbs** avec données structurées et affichage visuel
- **Balises meta complètes** (description, robots, canonical)
- **Hreflang tags** pour le multilingue
- **Optimisations Core Web Vitals** (LCP, FID, CLS)

#### Schémas Structurés Implémentés

| Type de Page | Schema Type | Fonctionnalités |
|--------------|-------------|-----------------|
| Homepage | Organization/LocalBusiness, WebSite | Knowledge Graph, Search Box |
| Product | Product | Prix, disponibilité, avis (aggregateRating), marque, SKU, shipping |
| Article | BlogPosting | Auteur (E-E-A-T), dates, sommaire, temps de lecture |
| Collection | BreadcrumbList | Navigation hiérarchique |
| FAQ | FAQPage | Questions/réponses dans les résultats |
| All Pages | BreadcrumbList | Fil d'Ariane SEO |

### 🎨 Design System Complet

- **CSS Variables** pour personnalisation facile
- **Mobile-First Responsive**
- **Accessibilité WCAG 2.1 AA**
- **Animations subtiles** et transitions fluides
- **Design tokens** (couleurs, typographie, espacements)

### ⚡ Performance

- **Lazy loading** des images
- **Preconnect & Preload** des ressources critiques
- **Critical CSS inline**
- **Vanilla JavaScript** (pas de jQuery) - ~12KB minifié
- **Optimisé pour Core Web Vitals**

### 🛠️ Fonctionnalités E-Commerce

- **Panier Ajax** avec drawer animé
- **Recherche prédictive** (autocomplete)
- **Quick view** produit
- **Wishlist** (localStorage)
- **Recently viewed** products
- **Product recommendations**
- **Filtrage Ajax** des collections
- **Variantes dynamiques** avec images
- **Badges produits** (nouveau, promo, rupture)
- **Reviews & Ratings** avec Schema

### 🌍 Multilingue

- **Traductions EN & FR** complètes (extensible)
- **Hreflang tags** automatiques
- **RTL support** configurable

### 📊 Analytics & Tracking

- **Google Analytics 4** intégré
- **Meta Pixel (Facebook)** intégré
- **Paramètres configurables** via theme editor

## 📁 Structure du Thème

```
shopify_theme/
├── assets/
│   ├── theme.css          # CSS principal (design system complet)
│   └── theme.js           # JavaScript modulaire (panier, recherche, etc.)
├── config/
│   ├── settings_schema.json   # Configuration du thème (100+ options)
│   └── settings_data.json     # Valeurs par défaut
├── layout/
│   └── theme.liquid           # Layout principal optimisé SEO
├── locales/
│   ├── en.default.json        # Traductions anglais
│   └── fr.json                # Traductions français
├── sections/
│   # À créer selon vos besoins (voir Customization)
├── snippets/
│   ├── seo-meta.liquid        # Open Graph, Twitter Cards
│   ├── seo-schema-product.liquid
│   ├── seo-schema-article.liquid
│   ├── seo-schema-organization.liquid
│   ├── seo-schema-breadcrumbs.liquid
│   ├── seo-schema-faq.liquid
│   ├── breadcrumbs.liquid     # Fil d'Ariane visuel
│   ├── header.liquid          # En-tête responsive
│   ├── footer.liquid          # Pied de page avec newsletter
│   ├── cart-drawer.liquid     # Panier Ajax sidebar
│   ├── mobile-nav-drawer.liquid
│   ├── newsletter-popup.liquid
│   └── product-card.liquid    # Carte produit réutilisable
└── templates/
    ├── index.liquid           # Homepage
    ├── product.liquid         # Page produit
    ├── collection.liquid      # Page collection
    ├── page.liquid            # Pages standards
    └── 404.liquid             # Page d'erreur
```

## 🚀 Installation

### Méthode 1 : Upload ZIP

1. Compressez tous les fichiers du thème en ZIP
2. Dans Shopify Admin : **Online Store > Themes > Upload theme**
3. Uploadez le fichier ZIP
4. Cliquez sur **Customize** pour configurer

### Méthode 2 : Shopify CLI

```bash
# Installer Shopify CLI
npm install -g @shopify/cli

# Se connecter à votre store
shopify login --store your-store.myshopify.com

# Push le thème
shopify theme push

# Ou développement en temps réel
shopify theme dev
```

### Méthode 3 : GitHub Integration

Connectez votre repository GitHub directement à Shopify pour un déploiement automatique.

## ⚙️ Configuration

### 1. Paramètres Essentiels (Theme Editor)

#### Logo & Branding
- Uploadez votre **logo** (recommandé : 400x100px PNG transparent)
- Définissez la **largeur du logo**
- Ajoutez un **favicon** (32x32px)
- Image de **partage social** par défaut (1200x630px)

#### Couleurs
Personnalisez toutes les couleurs via le theme editor :
- Couleur primaire (boutons, liens)
- Couleur secondaire
- Couleurs de texte
- Couleurs de fond
- Couleurs de succès/erreur/warning

#### Typographie
- Choisissez vos **polices Google Fonts**
- Ajustez la **taille de base** (14-20px)
- Configurez l'**interlignage** (tight/normal/relaxed)

### 2. SEO Configuration

#### Google Analytics 4
```
Theme Settings > SEO & Analytics > Google Analytics
Entrez votre Measurement ID (format: G-XXXXXXXXXX)
```

#### Meta Pixel (Facebook)
```
Theme Settings > SEO & Analytics > Meta Pixel
Entrez votre Pixel ID
```

#### Local Business (pour SEO local)
```
Theme Settings > Local Business
✓ Activez "Enable Local Business Schema"
Remplissez :
- Adresse complète
- Coordonnées GPS (optionnel)
- Horaires d'ouverture
- Fourchette de prix
```

Format horaires d'ouverture :
```
Monday:09:00-17:00|Tuesday:09:00-17:00|Wednesday:09:00-17:00
```

#### Réseaux Sociaux
Ajoutez toutes vos URLs de réseaux sociaux pour :
- Knowledge Graph Google
- Partage social optimisé
- Footer links

### 3. Navigation

Créez les menus de navigation :

**Main Menu** (Navigation principale)
```
Shopify Admin > Online Store > Navigation
Créez "main-menu" avec vos liens principaux
```

**Footer Menu**
```
Créez "footer" avec liens secondaires
```

### 4. Blog & Articles (E-E-A-T)

Pour optimiser vos articles de blog pour le SEO :

#### Encadré Auteur
Ajoutez des metafields à vos articles :
- `custom.author_image` : Photo de l'auteur
- `custom.author_bio` : Biographie courte

Ou définissez des valeurs par défaut dans :
```
Theme Settings > Author Information (Blog E-E-A-T)
```

#### Sommaire Automatique
Le thème génère automatiquement un sommaire cliquable pour vos articles en utilisant les titres H2 et H3.

### 5. Product Reviews

Pour activer les avis produits avec Schema :

**Option 1 : Metafields**
Ajoutez ces metafields aux produits :
- `reviews.rating_count` : Nombre d'avis
- `reviews.rating` : Note moyenne (1-5)

**Option 2 : App Shopify Product Reviews**
Le thème est compatible avec l'app native de Shopify.

## 🎨 Customization

### Créer des Sections

Le thème est conçu pour être modulaire. Créez vos propres sections dans `/sections/` :

**Exemple : Hero Banner**

```liquid
<!-- sections/hero-banner.liquid -->
<div class="hero-banner" style="background-image: url({{ section.settings.image | image_url: width: 1600 }});">
  <div class="container">
    <h1>{{ section.settings.title }}</h1>
    <p>{{ section.settings.subtitle }}</p>
    <a href="{{ section.settings.button_link }}" class="btn btn--primary btn--large">
      {{ section.settings.button_text }}
    </a>
  </div>
</div>

{% schema %}
{
  "name": "Hero Banner",
  "settings": [
    {
      "type": "image_picker",
      "id": "image",
      "label": "Background Image"
    },
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Welcome to Our Store"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtitle"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button Link"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button Text",
      "default": "Shop Now"
    }
  ],
  "presets": [
    {
      "name": "Hero Banner"
    }
  ]
}
{% endschema %}
```

### Ajouter du CSS Personnalisé

**Option 1 : Via Theme Editor**
```
Theme Settings > Custom Code > Custom CSS
```

**Option 2 : Modifier `assets/theme.css`**
Ajoutez vos styles à la fin du fichier.

### Variables CSS Disponibles

Utilisez ces variables pour maintenir la cohérence :

```css
/* Couleurs */
--color-primary
--color-secondary
--color-text
--color-text-light
--color-background
--color-background-light
--color-border
--color-success
--color-warning
--color-error

/* Typographie */
--font-heading
--font-body
--font-size-base
--line-height-base

/* Espacements */
--spacing-xs    /* 0.5rem */
--spacing-sm    /* 1rem */
--spacing-md    /* 1.5rem */
--spacing-lg    /* 2rem */
--spacing-xl    /* 3rem */
--spacing-2xl   /* 4rem */

/* Border Radius */
--radius-sm
--radius-md
--radius-lg

/* Transitions */
--transition-speed
--transition-ease

/* Layout */
--container-width
```

## 🧩 Modules JavaScript

Le thème inclut des modules JavaScript prêts à l'emploi :

### Cart (Panier Ajax)
```javascript
// Ajouté automatiquement
// Accessible via window.Cart
Cart.addToCart(formData)
Cart.updateQuantity(line, quantity)
Cart.toggleDrawer()
```

### Search (Recherche Prédictive)
```javascript
// Activé automatiquement sur les inputs [data-search-input]
```

### Wishlist
```javascript
// Stockage localStorage
// Boutons : [data-wishlist-toggle]
Wishlist.add(productId)
Wishlist.remove(productId)
```

### Product Variants
```javascript
// Gestion automatique des variantes
// Détecte les selects [data-variant-select]
```

## 📱 Responsive Breakpoints

```css
/* Mobile First */
Default: < 768px

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1280px) { }
```

## ♿ Accessibilité

Le thème respecte les standards WCAG 2.1 AA :

- ✅ Navigation au clavier complète
- ✅ Attributs ARIA appropriés
- ✅ Contrastes couleurs optimisés
- ✅ Focus visible sur tous les éléments interactifs
- ✅ Labels sur tous les formulaires
- ✅ Skip to content link
- ✅ Alt text sur toutes les images

## 🔧 Développement

### Structure du Code

**CSS**
- Mobile-first approach
- BEM-like naming convention
- Utility classes disponibles
- Composants réutilisables

**JavaScript**
- Vanilla JS (pas de dépendances)
- Modules séparés
- Event delegation
- Performance optimisé

### Best Practices

1. **Images** : Toujours utiliser `loading="lazy"`
2. **Liens** : Utiliser `rel="noopener"` pour liens externes
3. **Forms** : Toujours inclure labels pour accessibilité
4. **Performance** : Minimiser les requêtes HTTP

## 📊 Performance Checklist

- ✅ Images optimisées (WebP recommandé)
- ✅ CSS minifié en production
- ✅ JavaScript defer/async
- ✅ Lazy loading activé
- ✅ Preconnect aux domaines critiques
- ✅ Font display: swap
- ✅ Critical CSS inline
- ✅ Pas de jQuery (JavaScript léger)

## 🐛 Troubleshooting

### Le panier Ajax ne fonctionne pas
- Vérifiez que `theme.js` est bien chargé
- Ouvrez la console pour voir les erreurs
- Vérifiez que les routes Shopify sont disponibles

### Les schémas Schema.org ne s'affichent pas
- Testez avec [Google Rich Results Test](https://search.google.com/test/rich-results)
- Vérifiez que les metafields sont bien renseignés
- Consultez la Search Console

### Les traductions ne fonctionnent pas
- Vérifiez que le fichier de locale existe
- Vérifiez la syntaxe JSON (pas de virgule en trop)
- Videz le cache du navigateur

## 📞 Support

Pour toute question ou problème :

1. Vérifiez ce README
2. Consultez la [documentation Shopify](https://shopify.dev/docs/themes)
3. Ouvrez une issue sur le repository

## 📄 License

Ce thème est propriétaire. Tous droits réservés.

## 🙏 Crédits

Développé avec ❤️ par Claude Code
[https://claude.com/claude-code](https://claude.com/claude-code)

---

**Version**: 1.0.0
**Last Updated**: 2025-10-21
**Shopify API Version**: 2024-01
