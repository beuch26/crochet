/**
 * Per-integration health-check functions. Each tester receives the
 * merged config (public + secret) and returns
 *   { ok: true } when the integration responds correctly
 *   { ok: false, message: "..." } when it doesn't
 *
 * All testers use AbortSignal.timeout(8000) and catch every exception
 * — they never throw, so the caller can map straight to DB without a
 * surrounding try/catch.
 */

type TestResult = { ok: boolean; message?: string; details?: any }
type Cfg = Record<string, unknown>

const TIMEOUT_MS = 8000

const s = (cfg: Cfg, key: string): string => (typeof cfg[key] === "string" ? (cfg[key] as string) : "")

async function fetchTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
}

async function testStripe(cfg: Cfg): Promise<TestResult> {
  const key = s(cfg, "api_key")
  if (!key) return { ok: false, message: "api_key manquant" }
  try {
    const r = await fetchTimeout("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (r.status === 401) return { ok: false, message: "Clé Stripe invalide ou expirée" }
    if (!r.ok) return { ok: false, message: `Stripe HTTP ${r.status}` }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Stripe inaccessible" }
  }
}

async function testBrevo(cfg: Cfg): Promise<TestResult> {
  const host = s(cfg, "smtp_host") || "smtp-relay.brevo.com"
  const port = Number(cfg.smtp_port) || 587
  const user = s(cfg, "smtp_user")
  const pass = s(cfg, "smtp_pass")
  if (!user || !pass) return { ok: false, message: "smtp_user / smtp_pass manquant" }
  // Use nodemailer.verify() — already a dependency via the email-smtp provider
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require("nodemailer")
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: TIMEOUT_MS,
      greetingTimeout: TIMEOUT_MS,
      socketTimeout: TIMEOUT_MS,
    })
    await transport.verify()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, message: e?.message || "SMTP verify failed" }
  }
}

async function testGtm(cfg: Cfg): Promise<TestResult> {
  const id = s(cfg, "container_id")
  if (!id) return { ok: false, message: "container_id manquant" }
  try {
    const r = await fetchTimeout(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`)
    if (!r.ok) return { ok: false, message: `GTM HTTP ${r.status}` }
    const body = await r.text()
    if (body.length < 100 || !body.includes("gtm.start")) {
      return { ok: false, message: "Réponse GTM inattendue (container ID invalide ?)" }
    }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, message: e?.message || "GTM inaccessible" }
  }
}

async function testGa4(cfg: Cfg): Promise<TestResult> {
  const id = s(cfg, "measurement_id")
  if (!id) return { ok: false, message: "measurement_id manquant" }
  // Without the service_account_json we can't hit the Data API; we just
  // sanity-check that the gtag JS is reachable for that measurement ID.
  try {
    const r = await fetchTimeout(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`)
    if (!r.ok) return { ok: false, message: `gtag HTTP ${r.status}` }
    return { ok: true, message: cfg.service_account_json ? "ID OK (Data API non testé)" : "Measurement ID répond" }
  } catch (e: any) {
    return { ok: false, message: e?.message || "GA4 inaccessible" }
  }
}

async function testClarity(cfg: Cfg): Promise<TestResult> {
  const id = s(cfg, "project_id")
  if (!id) return { ok: false, message: "project_id manquant" }
  try {
    const r = await fetchTimeout(`https://www.clarity.ms/tag/${encodeURIComponent(id)}`)
    if (!r.ok) return { ok: false, message: `Clarity HTTP ${r.status}` }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Clarity inaccessible" }
  }
}

async function testGoogleOauth(cfg: Cfg): Promise<TestResult> {
  const id = s(cfg, "client_id")
  if (!id) return { ok: false, message: "client_id manquant" }
  // No public endpoint to validate a client_id against. Best-effort:
  // ensure Google's OpenID discovery doc is reachable (= network OK).
  try {
    const r = await fetchTimeout("https://accounts.google.com/.well-known/openid-configuration")
    if (!r.ok) return { ok: false, message: `Discovery HTTP ${r.status}` }
    return { ok: true, message: "Client ID stocké (validation OAuth réelle au prochain login)" }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Google inaccessible" }
  }
}

async function testGithubBlogRebuild(cfg: Cfg): Promise<TestResult> {
  const pat = s(cfg, "pat")
  if (!pat) return { ok: false, message: "PAT manquant" }
  try {
    const r = await fetchTimeout("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${pat}`, Accept: "application/vnd.github+json" },
    })
    if (r.status === 401) return { ok: false, message: "PAT GitHub invalide ou révoqué" }
    if (r.status === 403) return { ok: false, message: "PAT GitHub sans permissions suffisantes" }
    if (!r.ok) return { ok: false, message: `GitHub HTTP ${r.status}` }
    const data: any = await r.json().catch(() => ({}))
    return { ok: true, message: data.login ? `Connecté en tant que ${data.login}` : "OK" }
  } catch (e: any) {
    return { ok: false, message: e?.message || "GitHub inaccessible" }
  }
}

async function testTiktokPixel(cfg: Cfg): Promise<TestResult> {
  const id = s(cfg, "pixel_id")
  if (!id) return { ok: false, message: "pixel_id manquant" }
  if (!/^[A-Z0-9]{15,30}$/i.test(id.trim())) {
    return { ok: false, message: "Format attendu : alphanumérique ~20 caractères (ex: CXXXXXXXXXXXXXXXX)" }
  }
  // TikTok n'expose pas d'endpoint public pour valider un pixel ID. On
  // pingue le bundle JS du Pixel SDK pour s'assurer qu'il est accessible.
  try {
    const r = await fetchTimeout("https://analytics.tiktok.com/i18n/pixel/events.js")
    if (!r.ok) return { ok: false, message: `TikTok pixel SDK HTTP ${r.status}` }
    return { ok: true, message: "Format Pixel ID OK (validation finale au moment d'un event live)" }
  } catch (e: any) {
    return { ok: false, message: e?.message || "TikTok inaccessible" }
  }
}

async function testTiktokShopFeed(cfg: Cfg): Promise<TestResult> {
  const url = s(cfg, "feed_url") || "https://magic-crochet-kit.com/feed-tiktok-shop.xml"
  try {
    const r = await fetchTimeout(url, { method: "HEAD" })
    if (!r.ok) return { ok: false, message: `Feed HTTP ${r.status}` }
    const ct = r.headers.get("content-type") || ""
    if (!ct.includes("xml")) return { ok: false, message: `Feed retourne ${ct}, pas du XML` }
    return { ok: true, message: "Flux accessible et au bon format" }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Feed inaccessible" }
  }
}

async function testGoogleAds(cfg: Cfg): Promise<TestResult> {
  const id = s(cfg, "conversion_id")
  if (!id) return { ok: false, message: "conversion_id manquant" }
  if (!/^AW-\d+$/.test(id.trim())) {
    return { ok: false, message: "Format attendu : AW-suivi de chiffres (ex: AW-1234567890)" }
  }
  // Like GA4: we can't validate the conversion ID without an OAuth token
  // to the Google Ads API. Best-effort: confirm the gtag JS serves a
  // response for that ID.
  try {
    const r = await fetchTimeout(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`)
    if (!r.ok) return { ok: false, message: `gtag HTTP ${r.status}` }
    return { ok: true, message: "Conversion ID valide en syntaxe (validation Ads réelle au moment d'un purchase)" }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Google Ads inaccessible" }
  }
}

async function testEffiliation(cfg: Cfg): Promise<TestResult> {
  const url = s(cfg, "tracker_url")
  if (!url) return { ok: false, message: "tracker_url manquant" }
  try {
    // HEAD request to avoid downloading the affiliate redirect page
    const r = await fetchTimeout(url, { method: "HEAD", redirect: "manual" })
    if (r.status >= 500) return { ok: false, message: `Tracker HTTP ${r.status}` }
    return { ok: true, message: `Tracker répond (HTTP ${r.status})` }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Tracker inaccessible" }
  }
}

async function testMetaPixel(cfg: Cfg): Promise<TestResult> {
  const id = s(cfg, "pixel_id")
  if (!id) return { ok: false, message: "pixel_id manquant" }
  if (!/^\d{8,20}$/.test(id.trim())) {
    return { ok: false, message: "Format attendu : 8-20 chiffres (ex: 1234567890123456)" }
  }
  try {
    const r = await fetchTimeout("https://connect.facebook.net/en_US/fbevents.js")
    if (!r.ok) return { ok: false, message: `Meta SDK HTTP ${r.status}` }
    return { ok: true, message: "Format Pixel ID OK, SDK Meta accessible." }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Meta inaccessible" }
  }
}

async function testPacklink(cfg: Cfg): Promise<TestResult> {
  const key = s(cfg, "api_key")
  if (!key) return { ok: false, message: "api_key manquant" }
  try {
    const r = await fetchTimeout("https://api.packlink.com/v1/shipments?limit=1", {
      headers: { Authorization: key, Accept: "application/json" },
    })
    if (r.status === 401 || r.status === 403) {
      return { ok: false, message: `Clé refusée par Packlink (HTTP ${r.status})` }
    }
    if (!r.ok) return { ok: false, message: `Packlink HTTP ${r.status}` }
    return { ok: true, message: "Clé valide, API Packlink accessible." }
  } catch (e: any) {
    return { ok: false, message: e?.message || "Packlink inaccessible" }
  }
}

const TESTERS: Record<string, (cfg: Cfg) => Promise<TestResult>> = {
  stripe: testStripe,
  brevo: testBrevo,
  ga4: testGa4,
  gtm: testGtm,
  clarity: testClarity,
  google_oauth: testGoogleOauth,
  github_blog_rebuild: testGithubBlogRebuild,
  google_ads: testGoogleAds,
  tiktok_pixel: testTiktokPixel,
  tiktok_shop_feed: testTiktokShopFeed,
  effiliation: testEffiliation,
  meta_pixel: testMetaPixel,
  packlink: testPacklink,
}

export async function runIntegrationTest(slug: string, cfg: Cfg): Promise<TestResult> {
  const fn = TESTERS[slug]
  if (!fn) return { ok: false, message: `Pas de tester implémenté pour le slug "${slug}"` }
  try {
    return await fn(cfg)
  } catch (e: any) {
    return { ok: false, message: e?.message || "Exception inattendue dans le tester" }
  }
}

export const SUPPORTED_TEST_SLUGS = Object.keys(TESTERS)
