import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Input, Textarea, Label, Switch, Toaster, toast } from "@medusajs/ui"
import { Swatch } from "@medusajs/icons"
import { useEffect, useState } from "react"

type ThemeSetting = {
  id: string
  key: string
  value: string
  type: string
  group: string
  label: string
  description: string | null
  sort_order: number
}

// Note: `fulfillment` (Packlink), `payment` (Stripe) and `tracking`
// (GA4 / GTM / Meta Pixel) moved to /app/integrations and are no longer
// exposed here. Keeping them out of GROUP_LABELS is enough — the page
// just won't render them even if old rows linger in the DB.
const GROUP_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  general: { label: "Général", icon: "⚙️", description: "Nom du site, logo, favicon" },
  colors: { label: "Couleurs", icon: "🎨", description: "Palette de couleurs du site" },
  typography: { label: "Typographie", icon: "🔤", description: "Polices d'écriture" },
  hero: { label: "Hero / Accueil", icon: "🏠", description: "Section principale de la page d'accueil" },
  announcement: { label: "Bandeau d'annonce", icon: "📢", description: "Barre en haut du site" },
  promo: { label: "Promotion", icon: "🏷️", description: "Bandeau promotionnel" },
  products: { label: "Produits", icon: "📦", description: "Affichage des fiches produits" },
  shipping: { label: "Livraison", icon: "🚚", description: "Délais, seuils, retours" },
  trust: { label: "Confiance", icon: "🛡️", description: "Badges de réassurance" },
  blog: { label: "Blog", icon: "📝", description: "Auteur par défaut et E-E-A-T" },
  newsletter: { label: "Newsletter", icon: "📧", description: "Section d'inscription" },
  navigation: { label: "Navigation", icon: "🧭", description: "Liens du menu principal" },
  contact: { label: "Contact", icon: "📞", description: "Coordonnées de l'entreprise" },
  social: { label: "Réseaux sociaux", icon: "📱", description: "Liens vers vos réseaux" },
  footer: { label: "Footer", icon: "📄", description: "Bas de page" },
  seo: { label: "SEO", icon: "🔍", description: "Référencement naturel" },
  medusa: { label: "Medusa", icon: "⚡", description: "Configuration technique" },
}

const GROUP_ORDER = [
  "general", "colors", "typography", "hero", "announcement", "promo",
  "navigation", "products", "shipping", "trust", "blog",
  "newsletter", "contact", "social", "footer", "seo", "medusa",
]

const SENSITIVE_KEYS = ["stripe", "secret", "api_key", "webhook", "pixel", "password"]

function SettingField({ setting, value, onChange }: {
  setting: ThemeSetting
  value: string
  onChange: (val: string) => void
}) {
  const isSensitive = SENSITIVE_KEYS.some((k) => setting.key.toLowerCase().includes(k))

  if (isSensitive && setting.type === "text") {
    return (
      <div>
        <Input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          style={{ fontFamily: "monospace", fontSize: "13px" }}
        />
        {value && (
          <Text size="xsmall" style={{ color: "#10b981", marginTop: "4px" }}>
            &#10003; Clé configurée ({value.length} caractères)
          </Text>
        )}
      </div>
    )
  }

  switch (setting.type) {
    case "color":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer", padding: "2px" }}
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            style={{ fontFamily: "monospace", fontSize: "13px" }}
          />
          {value && (
            <div style={{ width: "80px", height: "32px", borderRadius: "6px", background: value, border: "1px solid #e5e7eb" }} />
          )}
        </div>
      )
    case "textarea":
      return <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
    case "boolean":
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Switch checked={value === "true"} onCheckedChange={(checked) => onChange(checked ? "true" : "false")} />
          <Text size="small" style={{ color: "#6b7280" }}>{value === "true" ? "Activé" : "Désactivé"}</Text>
        </div>
      )
    case "number":
      return <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} />
    case "image":
      return (
        <div>
          {value && (
            <div style={{ marginBottom: "8px" }}>
              <img src={value} alt="Preview" style={{ maxHeight: "60px", borderRadius: "6px", border: "1px solid #e5e7eb" }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            </div>
          )}
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
        </div>
      )
    default:
      return <Input value={value} onChange={(e) => onChange(e.target.value)} />
  }
}

const ThemePage = () => {
  const [settings, setSettings] = useState<ThemeSetting[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeGroup, setActiveGroup] = useState("general")
  const [hasChanges, setHasChanges] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetch("/admin/theme", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        const s = data.settings || []
        setSettings(s)
        const v: Record<string, string> = {}
        s.forEach((setting: ThemeSetting) => { v[setting.key] = setting.value })
        setValues(v)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Erreur de chargement du theme")
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = Object.entries(values).map(([key, value]) => ({ key, value }))
      await fetch("/admin/theme", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updates }),
      })
      toast.success("Thème sauvegardé", { description: "Les modifications seront visibles au prochain build." })
      setHasChanges(false)
    } catch {
      toast.error("Erreur lors de la sauvegarde")
    }
    setSaving(false)
  }

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Group settings
  const grouped: Record<string, ThemeSetting[]> = {}
  settings.forEach((s) => {
    if (!grouped[s.group]) grouped[s.group] = []
    grouped[s.group].push(s)
  })

  const knownGroups = GROUP_ORDER.filter((g) => grouped[g]?.length > 0)
  const extraGroups = Object.keys(grouped).filter((g) => !GROUP_ORDER.includes(g))
  const sortedGroups = [...knownGroups, ...extraGroups]

  // Search mode: show matching settings across all groups
  const isSearching = searchQuery.trim().length > 0
  const searchResults = isSearching
    ? settings.filter((s) => {
        const q = searchQuery.toLowerCase()
        return (
          s.key.toLowerCase().includes(q) ||
          (s.label || "").toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (GROUP_LABELS[s.group]?.label || s.group).toLowerCase().includes(q)
        )
      }).sort((a, b) => a.group.localeCompare(b.group) || a.sort_order - b.sort_order)
    : []

  const currentSettings = grouped[activeGroup]?.sort((a, b) => a.sort_order - b.sort_order) || []
  const groupInfo = GROUP_LABELS[activeGroup] || { label: activeGroup, icon: "📋", description: "" }

  if (loading) {
    return (
      <Container style={{ padding: "32px" }}>
        <Text>Chargement du thème...</Text>
      </Container>
    )
  }

  return (
    <>
      <Toaster />
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e5e7eb", background: "white", flexShrink: 0 }}>
          <div>
            <Heading level="h1">Configuration du thème</Heading>
            <Text size="small" style={{ color: "#6b7280", marginTop: "2px" }}>
              {sortedGroups.length} catégories — {settings.length} paramètres
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {hasChanges && (
              <Text size="small" style={{ color: "#f59e0b" }}>Modifications non sauvegardées</Text>
            )}
            <Button onClick={handleSave} isLoading={saving} variant="primary" disabled={!hasChanges}>
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Main layout: sidebar tabs + content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar navigation */}
          <nav style={{ width: "260px", borderRight: "1px solid #e5e7eb", overflowY: "auto", background: "#fafafa", flexShrink: 0, padding: "12px 8px" }}>
            {/* Search input */}
            <div style={{ padding: "0 4px 12px", marginBottom: "4px", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un parametre..."
                  style={{
                    width: "100%",
                    paddingLeft: "32px",
                    paddingRight: "10px",
                    paddingTop: "7px",
                    paddingBottom: "7px",
                    fontSize: "12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    background: "white",
                    outline: "none",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px", lineHeight: 1, padding: "2px" }}
                  >
                    &times;
                  </button>
                )}
              </div>
              {isSearching && (
                <Text size="xsmall" style={{ color: "#6b7280", marginTop: "8px", paddingLeft: "4px" }}>
                  {searchResults.length} resultat{searchResults.length > 1 ? "s" : ""}
                </Text>
              )}
            </div>

            {sortedGroups.map((group) => {
              const info = GROUP_LABELS[group] || { label: group, icon: "📋", description: "" }
              const isActive = activeGroup === group
              const count = grouped[group]?.length || 0
              return (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: isActive ? "white" : "transparent",
                    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    cursor: "pointer",
                    textAlign: "left" as const,
                    marginBottom: "2px",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "16px", width: "24px", textAlign: "center" as const }}>{info.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? "#111827" : "#6b7280" }}>
                      {info.label}
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", color: "#9ca3af", background: isActive ? "#f3f4f6" : "transparent", padding: "1px 6px", borderRadius: "10px" }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
            <div style={{ maxWidth: "720px" }}>
              {isSearching ? (
                <>
                  {/* Search results header */}
                  <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e5e7eb" }}>
                    <Heading level="h2">Resultats de recherche</Heading>
                    <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
                      {searchResults.length} parametre{searchResults.length > 1 ? "s" : ""} trouve{searchResults.length > 1 ? "s" : ""} pour "<strong>{searchQuery}</strong>"
                    </Text>
                  </div>

                  {searchResults.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
                      <Text>Aucun parametre ne correspond a votre recherche</Text>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {searchResults.map((setting) => {
                        const groupLbl = GROUP_LABELS[setting.group]?.label || setting.group
                        const groupIcon = GROUP_LABELS[setting.group]?.icon || "📋"
                        return (
                          <div key={setting.key} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "16px", alignItems: "start", padding: "12px", borderRadius: "8px", border: "1px solid #f3f4f6", background: "#fafafa" }}>
                            <div style={{ paddingTop: "6px" }}>
                              <div style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: "4px" }}>
                                {groupIcon} {groupLbl}
                              </div>
                              <Label style={{ fontWeight: 500, fontSize: "13px" }}>{setting.label}</Label>
                              {setting.description && (
                                <Text size="xsmall" style={{ color: "#9ca3af", marginTop: "2px", lineHeight: "1.4" }}>
                                  {setting.description}
                                </Text>
                              )}
                            </div>
                            <SettingField
                              setting={setting}
                              value={values[setting.key] || ""}
                              onChange={(val) => handleChange(setting.key, val)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Group header */}
                  <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "24px" }}>{groupInfo.icon}</span>
                      <Heading level="h2">{groupInfo.label}</Heading>
                    </div>
                    {groupInfo.description && (
                      <Text size="small" style={{ color: "#6b7280" }}>{groupInfo.description}</Text>
                    )}
                  </div>

                  {/* Settings */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {currentSettings.map((setting) => (
                      <div key={setting.key} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "16px", alignItems: "start" }}>
                        <div style={{ paddingTop: "6px" }}>
                          <Label style={{ fontWeight: 500, fontSize: "13px" }}>{setting.label}</Label>
                          {setting.description && (
                            <Text size="xsmall" style={{ color: "#9ca3af", marginTop: "2px", lineHeight: "1.4" }}>
                              {setting.description}
                            </Text>
                          )}
                        </div>
                        <SettingField
                          setting={setting}
                          value={values[setting.key] || ""}
                          onChange={(val) => handleChange(setting.key, val)}
                        />
                      </div>
                    ))}
                  </div>

                  {currentSettings.length === 0 && (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
                      <Text>Aucun paramètre dans cette catégorie</Text>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Thème",
  icon: Swatch,
})

export default ThemePage
