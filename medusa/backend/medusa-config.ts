import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    // Infrastructure. Sans ces deux modules, Medusa retombe sur des
    // implémentations en mémoire : l'état des jobs planifiés et des workflows
    // est alors perdu à chaque redémarrage du process.
    //
    // Déclarés uniquement si REDIS_URL est renseigné, pour qu'un poste de dev
    // sans Redis local démarre quand même. En production REDIS_URL est
    // toujours défini, avec l'index dédié à la boutique (Magic Crochet = /1 ;
    // Redis est partagé avec les autres boutiques de la machine).
    ...(process.env.REDIS_URL ? [
      {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
        },
      },
      {
        resolve: "@medusajs/medusa/workflow-engine-redis",
        options: {
          // Attention, ce module n'a PAS la même forme que l'event bus
          // ci-dessus : son loader fait `= options?.redis`, donc la clé doit
          // rester IMBRIQUÉE. La remonter d'un cran (`options.redisUrl`)
          // laisse `options.redis` à undefined et empêche le bootstrap —
          // "Cannot destructure property 'url' of '(intermediate value)'
          // as it is undefined".
          //
          // À l'intérieur de `redis`, `redisUrl` est la clé courante et `url`
          // est déprécié (le module émet un avertissement au démarrage si on
          // utilise `url`). On prend donc `redisUrl` : imbriqué comme il faut,
          // et sans avertissement que quelqu'un serait tenté de « corriger ».
          redis: {
            redisUrl: process.env.REDIS_URL,
          },
        },
      },
    ] : []),
    {
      resolve: "./src/modules/blog",
    },
    {
      resolve: "./src/modules/theme",
    },
    {
      resolve: "./src/modules/contact",
    },
    {
      resolve: "./src/modules/newsletter",
    },
    {
      resolve: "./src/modules/page",
    },
    {
      resolve: "./src/modules/review",
    },
    {
      resolve: "./src/modules/gift-card",
    },
    {
      resolve: "./src/modules/return-request",
    },
    {
      resolve: "./src/modules/page-layout",
    },
    {
      resolve: "./src/modules/redirect",
    },
    {
      resolve: "./src/modules/integration",
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/email-smtp",
            id: "smtp",
            options: {
              channels: ["email"],
              host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
              port: Number(process.env.SMTP_PORT || "587"),
              user: process.env.SMTP_USER || "",
              pass: process.env.SMTP_PASS || "",
              from: process.env.SMTP_FROM || "contact@geniuz.fr",
              from_name: process.env.SMTP_FROM_NAME || "Geniuz",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/fulfillment-manual",
            id: "manual",
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY || "",
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
            },
          },
        ],
      },
    },
    ...(process.env.GOOGLE_CLIENT_ID ? [{
      resolve: "@medusajs/medusa/auth",
      dependencies: ["cache", "logger"],
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          {
            resolve: "@medusajs/medusa/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_CALLBACK_URL || "https://api-hetzner.web-guru.fr/auth/customer/google/callback",
            },
          },
        ],
      },
    }] : []),
  ],
  admin: {
    vite: () => ({
      server: {
        allowedHosts: ["api.magic-crochet-kit.com", ".magic-crochet-kit.com", "api-crochet.web-guru.fr", ".web-guru.fr"],
      },
    }),
  },
})
