/**
 * Manage admin API keys (Medusa built-in + scope encoding).
 *
 * Medusa v2 ships its own admin API key system. This script wraps it so
 * that scopes can be attached to a key — scopes are encoded in the key's
 * title with a `::scopes=…` suffix, then enforced by middleware on
 * /admin/blog* routes.
 *
 * The auth header that Web Guru must send is:
 *   Authorization: Basic <base64(token + ":")>
 *
 * Examples (env-var form, recommended — `medusa exec` argv forwarding can
 * be unreliable):
 *
 *   CMD=create NAME="Web Guru SEO bot" \
 *     SCOPES=blog:read,blog:write \
 *     CREATED_BY=admin@magic-crochet-kit.com \
 *     npx medusa exec src/scripts/api-keys.ts
 *
 *   CMD=list npx medusa exec src/scripts/api-keys.ts
 *
 *   CMD=revoke ID=apk_01... npx medusa exec src/scripts/api-keys.ts
 *
 * Argv form (works when medusa forwards args):
 *   npx medusa exec src/scripts/api-keys.ts create \
 *     --name "Web Guru SEO bot" --scopes blog:read,blog:write \
 *     --created-by admin@magic-crochet-kit.com
 */

import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

const ALLOWED_SCOPES = ["blog:read", "blog:write"] as const
type Scope = typeof ALLOWED_SCOPES[number]

const SCOPE_SUFFIX_RE = /\s*::scopes=([a-z0-9:,_-]+)\s*$/i
function encodeTitle(name: string, scopes: Scope[]): string {
  return `${name.trim()} ::scopes=${scopes.join(",")}`
}
function stripScopeSuffix(title: string): string {
  return (title || "").replace(SCOPE_SUFFIX_RE, "").trim()
}
function parseScopes(title: string): Scope[] {
  const m = (title || "").match(SCOPE_SUFFIX_RE)
  if (!m) return []
  return m[1].split(",").map((s) => s.trim()).filter(Boolean) as Scope[]
}

type ParsedArgs = {
  cmd: "create" | "list" | "revoke" | null
  name?: string
  scopes?: string
  createdBy?: string
  id?: string
}

function parseArgs(): ParsedArgs {
  const env = process.env
  const out: ParsedArgs = {
    cmd: (env.CMD as ParsedArgs["cmd"]) || null,
    name: env.NAME,
    scopes: env.SCOPES,
    createdBy: env.CREATED_BY,
    id: env.ID,
  }
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = argv[i + 1]
    if (!out.cmd && (a === "create" || a === "list" || a === "revoke")) out.cmd = a
    else if (a === "--name" && next) { out.name = next; i++ }
    else if (a === "--scopes" && next) { out.scopes = next; i++ }
    else if (a === "--created-by" && next) { out.createdBy = next; i++ }
    else if (a === "--id" && next) { out.id = next; i++ }
  }
  return out
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—"
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return "—"
  return dt.toISOString().replace("T", " ").substring(0, 19)
}

function statusFor(row: { revoked_at?: any }): string {
  return row.revoked_at ? "revoked" : "active"
}

export default async function manageApiKeys({ container }: ExecArgs) {
  const args = parseArgs()
  const apiKeyService: any = container.resolve(Modules.API_KEY)
  const userService: any = container.resolve(Modules.USER)

  if (args.cmd === "create") {
    if (!args.name) throw new Error("Missing --name (or NAME env var)")
    if (!args.scopes) throw new Error("Missing --scopes (or SCOPES env var)")
    if (!args.createdBy) throw new Error("Missing --created-by EMAIL (or CREATED_BY env var)")

    const scopes = args.scopes.split(",").map((s) => s.trim()).filter(Boolean) as Scope[]
    const unknown = scopes.filter((s) => !(ALLOWED_SCOPES as readonly string[]).includes(s))
    if (unknown.length) throw new Error(`Unknown scope(s): ${unknown.join(", ")}. Allowed: ${ALLOWED_SCOPES.join(", ")}`)

    const users = await userService.listUsers({ email: args.createdBy })
    if (!users || users.length === 0) throw new Error(`No admin user found with email ${args.createdBy}`)
    const userId = users[0].id

    const created = await apiKeyService.createApiKeys({
      title: encodeTitle(args.name, scopes),
      type: "secret",
      created_by: userId,
    })

    const key = Array.isArray(created) ? created[0] : created
    const tokenForHeader = Buffer.from(`${key.token}:`).toString("base64")

    console.log("\n========================================")
    console.log("  ADMIN API KEY CREATED")
    console.log("========================================")
    console.log(`  ID         : ${key.id}`)
    console.log(`  Name       : ${args.name}`)
    console.log(`  Redacted   : ${key.redacted}`)
    console.log(`  Type       : ${key.type}`)
    console.log(`  Scopes     : ${scopes.join(", ")}`)
    console.log(`  Owner      : ${args.createdBy} (${userId})`)
    console.log(`\n  TOKEN              : ${key.token}`)
    console.log(`  HTTP HEADER VALUE  : Basic ${tokenForHeader}`)
    console.log("\n  Web Guru config:")
    console.log(`    Authorization: Basic ${tokenForHeader}`)
    console.log("\n  ⚠  Store this token NOW — it will never be shown again.")
    console.log("========================================\n")
    return
  }

  if (args.cmd === "list") {
    const rows = await apiKeyService.listApiKeys({ type: "secret" }, { order: { created_at: "DESC" }, take: 200 })
    if (!rows.length) {
      console.log("No admin API keys.")
      return
    }
    const userIds: string[] = Array.from(new Set(rows.map((r: any) => r.created_by).filter(Boolean) as string[]))
    const users = userIds.length ? await userService.listUsers({ id: userIds }) : []
    const emailById = new Map<string, string>(users.map((u: any) => [u.id, u.email]))

    console.log(
      "\n" +
      ["ID                              ", "REDACTED        ", "STATUS  ", "SCOPES                  ", "OWNER                          ", "LAST USED            ", "NAME"].join(" │ ")
    )
    console.log("─".repeat(170))
    for (const r of rows) {
      const status = statusFor(r)
      const owner = (emailById.get(r.created_by) || r.created_by || "—").padEnd(30).slice(0, 30)
      const scopes = parseScopes(r.title).join(",").padEnd(24).slice(0, 24)
      const lastUsed = fmtDate(r.last_used_at).padEnd(20).slice(0, 20)
      const redacted = (r.redacted || "—").padEnd(16).slice(0, 16)
      console.log([
        r.id.padEnd(32).slice(0, 32),
        redacted,
        status.padEnd(8),
        scopes,
        owner,
        lastUsed,
        stripScopeSuffix(r.title),
      ].join(" │ "))
    }
    console.log()
    return
  }

  if (args.cmd === "revoke") {
    if (!args.id) throw new Error("Missing --id (or ID env var)")
    try {
      await apiKeyService.retrieveApiKey(args.id)
    } catch {
      throw new Error(`API key not found: ${args.id}`)
    }
    await apiKeyService.revoke(args.id, { revoked_by: "cli" })
    console.log(`Revoked API key ${args.id}`)
    return
  }

  console.log(`Usage:
  CMD=create NAME="..." SCOPES=blog:read,blog:write CREATED_BY=admin@magic-crochet-kit.com
  CMD=list
  CMD=revoke ID=apk_...

Or via argv:
  npx medusa exec src/scripts/api-keys.ts create --name "..." --scopes blog:read,blog:write --created-by EMAIL
  npx medusa exec src/scripts/api-keys.ts list
  npx medusa exec src/scripts/api-keys.ts revoke --id apk_...
`)
}
