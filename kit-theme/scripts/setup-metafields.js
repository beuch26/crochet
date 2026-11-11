/**
 * Magic Crochet Kit - Script d'installation des Metafields
 *
 * Ce script crée automatiquement les définitions de metafields nécessaires
 * pour le bon fonctionnement du thème.
 *
 * UTILISATION:
 * 1. Créer un token d'accès Admin API dans Shopify Admin > Settings > Apps > Develop apps
 * 2. Copier le fichier .env.example vers .env et ajouter vos credentials
 * 3. Exécuter: node scripts/setup-metafields.js
 *
 * PERMISSIONS REQUISES:
 * - write_metafield_definitions
 * - write_metaobject_definitions
 */

const METAFIELD_DEFINITIONS = [
  // FAQ / Q&A pour les produits
  {
    name: "FAQ",
    namespace: "custom",
    key: "faq",
    description: "Questions/Réponses pour l'onglet FAQ du produit",
    type: "list.single_line_text_field",
    ownerType: "PRODUCT",
    pin: true
  },
  {
    name: "Questions & Réponses (JSON)",
    namespace: "custom",
    key: "qna",
    description: "FAQ au format JSON [{question, answer}]",
    type: "json",
    ownerType: "PRODUCT",
    pin: true
  },

  // Bénéfices produit
  {
    name: "Bénéfices",
    namespace: "custom",
    key: "benefice",
    description: "Liste des bénéfices/avantages du produit",
    type: "list.single_line_text_field",
    ownerType: "PRODUCT",
    pin: true
  },

  // Promotion Buy X Get Y
  {
    name: "Cadeau quantité",
    namespace: "custom",
    key: "quantity_gift",
    description: "Configuration promo Buy X Get Y au format JSON",
    type: "json",
    ownerType: "PRODUCT",
    pin: false
  },

  // Champs personnalisés produit
  {
    name: "Champs personnalisés",
    namespace: "custom",
    key: "product_fields",
    description: "Champs additionnels au format JSON",
    type: "json",
    ownerType: "PRODUCT",
    pin: false
  },

  // Précommande
  {
    name: "Précommande",
    namespace: "inventory",
    key: "preorder",
    description: "Activer le mode précommande pour ce produit",
    type: "boolean",
    ownerType: "PRODUCT",
    pin: true
  },
  {
    name: "Date d'expédition précommande",
    namespace: "inventory",
    key: "preorder_ship_date",
    description: "Date prévue d'expédition pour les précommandes",
    type: "date",
    ownerType: "PRODUCT",
    pin: false
  },

  // Spécifications produit
  {
    name: "Composition",
    namespace: "specifications",
    key: "composition",
    description: "Composition/matériaux du produit",
    type: "multi_line_text_field",
    ownerType: "PRODUCT",
    pin: true
  },
  {
    name: "Guide des tailles",
    namespace: "specifications",
    key: "size_guide",
    description: "Informations sur les tailles",
    type: "multi_line_text_field",
    ownerType: "PRODUCT",
    pin: false
  },
  {
    name: "Instructions d'entretien",
    namespace: "specifications",
    key: "care",
    description: "Instructions de lavage/entretien",
    type: "multi_line_text_field",
    ownerType: "PRODUCT",
    pin: true
  },
  {
    name: "Dimensions",
    namespace: "specifications",
    key: "dimensions",
    description: "Dimensions du produit",
    type: "single_line_text_field",
    ownerType: "PRODUCT",
    pin: true
  },

  // Image pour onglet personnalisé
  {
    name: "Image onglet personnalisé",
    namespace: "custom",
    key: "tab_image",
    description: "Image à afficher dans l'onglet personnalisé",
    type: "file_reference",
    ownerType: "PRODUCT",
    pin: false
  }
];

// GraphQL mutation pour créer une définition de metafield
const CREATE_METAFIELD_DEFINITION = `
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        name
        namespace
        key
        type {
          name
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

async function createMetafieldDefinition(shopDomain, accessToken, definition) {
  const response = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({
      query: CREATE_METAFIELD_DEFINITION,
      variables: {
        definition: {
          name: definition.name,
          namespace: definition.namespace,
          key: definition.key,
          description: definition.description,
          type: definition.type,
          ownerType: definition.ownerType,
          pin: definition.pin
        }
      }
    })
  });

  const result = await response.json();
  return result;
}

async function main() {
  // Charger les variables d'environnement
  const dotenv = await import('dotenv').catch(() => null);
  if (dotenv) {
    dotenv.config();
  }

  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!shopDomain || !accessToken) {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║           MAGIC CROCHET KIT - SETUP METAFIELDS                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Ce script crée automatiquement les metafields nécessaires.     ║
║                                                                  ║
║  CONFIGURATION REQUISE:                                          ║
║                                                                  ║
║  1. Créer un fichier .env à la racine du thème avec:            ║
║                                                                  ║
║     SHOPIFY_SHOP_DOMAIN=votre-boutique.myshopify.com            ║
║     SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxx                 ║
║                                                                  ║
║  2. Obtenir le token dans Shopify Admin:                        ║
║     Settings > Apps > Develop apps > Create an app              ║
║     > Configure Admin API scopes:                               ║
║       - write_metafield_definitions                             ║
║       - read_metafield_definitions                              ║
║     > Install app > Reveal token                                ║
║                                                                  ║
║  3. Relancer: node scripts/setup-metafields.js                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

METAFIELDS QUI SERONT CRÉÉS:
`);

    METAFIELD_DEFINITIONS.forEach((def, i) => {
      console.log(`  ${i + 1}. ${def.namespace}.${def.key} (${def.type})`);
      console.log(`     ${def.description}`);
    });

    console.log(`
────────────────────────────────────────────────────────────────────
ALTERNATIVE MANUELLE:

Vous pouvez aussi créer ces metafields manuellement dans:
Shopify Admin > Settings > Custom data > Products > Add definition
`);
    return;
  }

  console.log('🚀 Création des définitions de metafields...\n');

  let success = 0;
  let errors = 0;
  let skipped = 0;

  for (const definition of METAFIELD_DEFINITIONS) {
    process.stdout.write(`  ${definition.namespace}.${definition.key}... `);

    try {
      const result = await createMetafieldDefinition(shopDomain, accessToken, definition);

      if (result.data?.metafieldDefinitionCreate?.createdDefinition) {
        console.log('✅ Créé');
        success++;
      } else if (result.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
        const error = result.data.metafieldDefinitionCreate.userErrors[0];
        if (error.code === 'TAKEN' || error.message.includes('already exists')) {
          console.log('⏭️  Existe déjà');
          skipped++;
        } else {
          console.log(`❌ ${error.message}`);
          errors++;
        }
      } else {
        console.log('❌ Erreur inconnue');
        errors++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
  }

  console.log(`
────────────────────────────────────────────────────────────────────
RÉSUMÉ:
  ✅ Créés: ${success}
  ⏭️  Existants: ${skipped}
  ❌ Erreurs: ${errors}
────────────────────────────────────────────────────────────────────
`);
}

main();
