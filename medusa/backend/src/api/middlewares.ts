import { defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * Scope enforcement for admin API keys (Medusa v2).
 *
 * Medusa's built-in `authenticate` validates `Authorization: Basic
 * base64(sk_xxx:)` for the entire `/admin/*` namespace and populates
 * `req.auth_context.actor_type === 'api-key'`. Without this middleware,
 * any valid admin API key would have access to ALL /admin/* routes
 * (products, customers, orders, …) regardless of its labelled scope —
 * effectively making every "scoped" key a full admin key.
 *
 * Therefore this middleware is registered on the WHOLE `/admin/*` and
 * applies a default-deny rule for api-key-authenticated requests:
 *   1. If the actor is not an api-key (dashboard session, JWT user, …),
 *      do nothing — Medusa has already authorized them.
 *   2. If the actor IS an api-key, look up its title-encoded scopes
 *      (`title = "<name> ::scopes=blog:read,blog:write"`).
 *   3. The route must match a SCOPE_RULE; otherwise 403. This keeps the
 *      blast radius of any scoped key strictly to routes we have
 *      classified.
 *   4. Emit one structured access-log line per validated request.
 *
 * Scopes live in the title because Medusa's built-in api_key model does
 * not expose a metadata field. The CLI writes the suffix on creation
 * and strips it on listing.
 *
 * Limits:
 *   - Keys created from the Medusa admin dashboard without the encoded
 *     suffix carry no scopes → denied on every gated route.
 *   - Adding a new scoped /admin/* route requires updating SCOPE_RULES.
 */

const SCOPE_SUFFIX_RE = /\s*::scopes=([a-z0-9:,_-]+)\s*$/i

export type Scope = "blog:read" | "blog:write"

const SCOPE_RULES: Array<{ method: RegExp; path: RegExp; scope: Scope }> = [
  { method: /^GET$/i, path: /^\/admin\/blog(\/|$|\?)/, scope: "blog:read" },
  { method: /^(POST|PUT|PATCH|DELETE)$/i, path: /^\/admin\/blog(\/|$|\?)/, scope: "blog:write" },
]

function requiredScopeFor(method: string, path: string): Scope | null {
  for (const rule of SCOPE_RULES) {
    if (rule.method.test(method) && rule.path.test(path)) return rule.scope
  }
  return null
}

export function parseScopesFromTitle(title: string | undefined): Scope[] {
  if (!title) return []
  const m = title.match(SCOPE_SUFFIX_RE)
  if (!m) return []
  return m[1].split(",").map((s) => s.trim()).filter(Boolean) as Scope[]
}

export function stripScopeSuffix(title: string): string {
  return title.replace(SCOPE_SUFFIX_RE, "").trim()
}

export const adminApiKeyScopeMiddleware = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) => {
  const ctx = (req as any).auth_context
  const isApiKeyAuth = ctx?.actor_type === "api-key" && typeof ctx?.actor_id === "string"
  if (!isApiKeyAuth) {
    // Session/JWT request from the dashboard → Medusa already authorized.
    return next()
  }

  const path = req.originalUrl || req.url || ""
  const required = requiredScopeFor(req.method || "GET", path)
  if (!required) {
    // Default-deny: api-key-authenticated requests are allowed ONLY on
    // routes we explicitly classify in SCOPE_RULES. Without this, an api
    // key labelled `blog:read` would still have full /admin/* access.
    return res.status(403).json({
      message: "API key not allowed on this route",
    })
  }

  let key: any = null
  try {
    const apiKeyService: any = req.scope.resolve(Modules.API_KEY)
    key = await apiKeyService.retrieveApiKey(ctx.actor_id)
  } catch {
    return res.status(401).json({ message: "API key not found" })
  }

  const scopes = parseScopesFromTitle(key?.title)
  if (!scopes.includes(required)) {
    return res.status(403).json({
      message: `API key missing required scope: ${required}`,
    })
  }

  // Structured access log (single JSON line per validated, scope-checked request).
  const startedAt = Date.now()
  res.on("finish", () => {
    try {
      const log = {
        event: "admin_api_key_use",
        key_id: key.id,
        key_redacted: key.redacted,
        actor_id: ctx.actor_id,
        scope_required: required,
        method: req.method,
        route: path,
        status: res.statusCode,
        duration_ms: Date.now() - startedAt,
        ip:
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
          || (req as any).ip
          || (req.socket as any)?.remoteAddress
          || null,
        user_agent: (req.headers["user-agent"] as string) || null,
      }
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(log))
    } catch {
      // never throw from logging
    }
  })

  return next()
}

export default defineMiddlewares({
  routes: [
    {
      // Cover the whole admin namespace so api-key requests on routes we
      // do NOT classify (products, customers, settings…) get 403 instead
      // of falling through with full-admin power.
      matcher: "/admin/*",
      middlewares: [adminApiKeyScopeMiddleware],
    },
  ],
})
