/**
 * Create an admin user
 *
 * Run: npx medusa exec src/scripts/create-admin.ts
 *
 * Or use the CLI: npx medusa user -e admin@magic-crochet-kit.com -p VotreMotDePasse
 */

import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function createAdmin({ container }: ExecArgs) {
  const userService = container.resolve(Modules.USER)
  const authService = container.resolve(Modules.AUTH)

  const email = "admin@magic-crochet-kit.com"
  const password = "Magic Crochet Kit2026!"

  console.log(`Creating admin user: ${email}`)

  try {
    // Check if user exists
    const existing = await userService.listUsers({ email })
    if (existing.length > 0) {
      console.log("User already exists:", existing[0].id)
      return
    }

    // Create user
    const user = await userService.createUsers({
      email,
      first_name: "Admin",
      last_name: "Magic Crochet Kit",
    })

    console.log("User created:", user.id)

    // Create auth identity
    try {
      await authService.createAuthIdentities({
        provider_identities: [
          {
            provider: "emailpass",
            entity_id: email,
            provider_metadata: { password },
          },
        ],
        app_metadata: {
          user_id: user.id,
        },
      })
      console.log("Auth identity created")
    } catch (e: any) {
      console.log("Auth identity might already exist:", e.message)
    }

    console.log(`\nAdmin created! Login at /app with:\n  Email: ${email}\n  Password: ${password}`)
  } catch (e: any) {
    console.error("Error:", e.message)
  }
}
