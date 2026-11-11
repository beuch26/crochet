import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PuzzleSolid } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Input, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { IntegrationLogo } from "./_logos"
import { ThemeToggle } from "../../components/theme-toggle"

type SecretFilledMap = Record<string, boolean>

type IntegrationCardData = {
  slug: string
  name: string
  category: string
  description: string
  logo_path: string | null
  enabled: boolean
  health_status: "ok" | "error" | "unknown"
  health_message: string | null
  last_health_check_at: string | null
  last_used_at: string | null
  secrets_filled: SecretFilledMap
  restart_required: boolean
}

const CATEGORY_LABEL: Record<string, string> = {
  payment: "Paiement",
  email: "Email",
  analytics: "Analytics",
  tracking: "Tracking",
  ads: "Publicité",
  auth: "Authentification",
  deploy: "Déploiement",
  affiliate: "Affiliation",
}

function StatusBadge({ enabled, status }: { enabled: boolean; status: "ok" | "error" | "unknown" }) {
  if (!enabled) {
    return <Badge color="grey" size="2xsmall">Désactivé</Badge>
  }
  if (status === "ok") return <Badge color="green" size="2xsmall">✓ Connecté</Badge>
  if (status === "error") return <Badge color="red" size="2xsmall">⚠ Erreur</Badge>
  return <Badge color="orange" size="2xsmall">○ À tester</Badge>
}

function relTime(iso: string | null): string {
  if (!iso) return "—"
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms)) return "—"
  const s = Math.floor(ms / 1000)
  if (s < 60) return "il y a quelques secondes"
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`
  return `il y a ${Math.floor(s / 86400)} j`
}

const IntegrationsPage = () => {
  const [items, setItems] = useState<IntegrationCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  useEffect(() => {
    fetch("/admin/integrations", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setItems(data.integrations || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((it) => {
      if (categoryFilter !== "all" && it.category !== categoryFilter) return false
      if (!q) return true
      return it.name.toLowerCase().includes(q) || it.slug.includes(q) || it.description.toLowerCase().includes(q)
    })
  }, [items, search, categoryFilter])

  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => set.add(i.category))
    return Array.from(set)
  }, [items])

  return (
    <Container>
      <ThemeToggle />
      <div style={{ marginBottom: 24 }}>
        <Heading level="h1">Intégrations</Heading>
        <Text className="text-ui-fg-subtle">
          Gérez toutes les connexions tierces (paiement, email, analytics, déploiement, affiliation) au même endroit.
        </Text>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
        <Input
          placeholder="Rechercher une intégration…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 280 }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Button
            size="small"
            variant={categoryFilter === "all" ? "primary" : "secondary"}
            onClick={() => setCategoryFilter("all")}
          >
            Toutes
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              size="small"
              variant={categoryFilter === c ? "primary" : "secondary"}
              onClick={() => setCategoryFilter(c)}
            >
              {CATEGORY_LABEL[c] || c}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <Text>Chargement…</Text>
      ) : filtered.length === 0 ? (
        <Text>Aucune intégration ne correspond.</Text>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((it) => (
            <Link
              key={it.slug}
              to={`/integrations/${it.slug}`}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#9ca3af"
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IntegrationLogo slug={it.slug} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="base" weight="plus" style={{ display: "block", marginBottom: 2 }}>
                    {it.name}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {CATEGORY_LABEL[it.category] || it.category}
                  </Text>
                </div>
                <StatusBadge enabled={it.enabled} status={it.health_status} />
              </div>
              <Text size="small" className="text-ui-fg-subtle" style={{ lineHeight: 1.4 }}>
                {it.description}
              </Text>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {it.last_health_check_at ? `Vérifié ${relTime(it.last_health_check_at)}` : "Jamais testé"}
                </Text>
                {it.restart_required && (
                  <Text size="xsmall" style={{ color: "#f59e0b" }}>
                    ⚠ Restart requis si modifié
                  </Text>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Intégrations",
  icon: PuzzleSolid,
})

export default IntegrationsPage
