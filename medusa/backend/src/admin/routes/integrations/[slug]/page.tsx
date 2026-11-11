import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  Textarea,
  toast,
  Toaster,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { IntegrationLogo } from "../_logos"

type Field = {
  key: string
  label: string
  type: "text" | "password" | "url" | "email" | "number" | "json" | "longtext"
  required?: boolean
  placeholder?: string
  description?: string
}

type IntegrationDetail = {
  slug: string
  name: string
  category: string
  description: string
  logo_path: string | null
  restart_required: boolean
  public_fields: Field[]
  secret_fields: Field[]
  enabled: boolean
  config_public: Record<string, string>
  secrets_filled: Record<string, boolean>
  health_status: "ok" | "error" | "unknown"
  health_message: string | null
  last_health_check_at: string | null
  last_used_at: string | null
}

type AuditEntry = {
  id: string
  action: string
  changed_fields: string[]
  notes: string | null
  actor_email: string | null
  actor_id: string | null
  created_at: string
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

function statusBadge(enabled: boolean, status: "ok" | "error" | "unknown") {
  if (!enabled) return <Badge color="grey">Désactivé</Badge>
  if (status === "ok") return <Badge color="green">✓ Connecté</Badge>
  if (status === "error") return <Badge color="red">⚠ Erreur</Badge>
  return <Badge color="orange">○ À tester</Badge>
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
}

const IntegrationDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [data, setData] = useState<IntegrationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [audit, setAudit] = useState<AuditEntry[]>([])

  // Local form state — split public / secret so we can detect "untouched secret" (empty value)
  const [publicForm, setPublicForm] = useState<Record<string, string>>({})
  const [secretForm, setSecretForm] = useState<Record<string, string>>({})
  const [dirtyPub, setDirtyPub] = useState<Set<string>>(new Set())
  const [dirtySec, setDirtySec] = useState<Set<string>>(new Set())

  const refresh = async () => {
    setLoading(true)
    try {
      const [detailRes, auditRes] = await Promise.all([
        fetch(`/admin/integrations/${slug}`, { credentials: "include" }).then((r) => r.json()),
        fetch(`/admin/integrations/${slug}/audit-log?limit=20`, { credentials: "include" }).then((r) => r.json()),
      ])
      if (!detailRes?.integration) throw new Error()
      const d: IntegrationDetail = detailRes.integration
      setData(d)
      const initialPub: Record<string, string> = {}
      d.public_fields.forEach((f) => {
        initialPub[f.key] = String(d.config_public[f.key] ?? "")
      })
      setPublicForm(initialPub)
      setSecretForm({})
      setDirtyPub(new Set())
      setDirtySec(new Set())
      setAudit(auditRes.audit_log || [])
    } catch {
      toast.error("Impossible de charger l'intégration")
    }
    setLoading(false)
  }

  useEffect(() => { refresh() }, [slug])

  const hasChanges = useMemo(() => dirtyPub.size > 0 || dirtySec.size > 0, [dirtyPub, dirtySec])

  const onPublicChange = (key: string, value: string) => {
    setPublicForm((p) => ({ ...p, [key]: value }))
    setDirtyPub((s) => new Set(s).add(key))
  }
  const onSecretChange = (key: string, value: string) => {
    setSecretForm((p) => ({ ...p, [key]: value }))
    setDirtySec((s) => {
      const n = new Set(s)
      if (value === "") n.delete(key); else n.add(key)
      return n
    })
  }

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      const config_public: Record<string, string> = {}
      dirtyPub.forEach((k) => { config_public[k] = publicForm[k] ?? "" })
      const config_secret_in: Record<string, string> = {}
      dirtySec.forEach((k) => { config_secret_in[k] = secretForm[k] ?? "" })

      const res = await fetch(`/admin/integrations/${data.slug}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config_public, config_secret_in }),
      })
      if (!res.ok) throw new Error()
      toast.success("Configuration enregistrée")
      if (data.restart_required && dirtySec.size > 0) {
        toast.warning("Restart de Medusa requis pour appliquer les changements de secret")
      }
      await refresh()
    } catch {
      toast.error("Erreur lors de l'enregistrement")
    }
    setSaving(false)
  }

  const handleTest = async () => {
    if (!data) return
    setTesting(true)
    try {
      const res = await fetch(`/admin/integrations/${data.slug}/test`, {
        method: "POST",
        credentials: "include",
      })
      const body = await res.json()
      if (body.ok) toast.success(`Test OK (${body.duration_ms}ms) ${body.message ? "— " + body.message : ""}`)
      else toast.error(`Test KO — ${body.message || "raison inconnue"}`)
      await refresh()
    } catch {
      toast.error("Erreur lors du test")
    }
    setTesting(false)
  }

  const handleToggle = async () => {
    if (!data) return
    const target = data.enabled ? "disable" : "enable"
    try {
      const res = await fetch(`/admin/integrations/${data.slug}/${target}`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) throw new Error()
      toast.success(data.enabled ? "Intégration désactivée" : "Intégration activée")
      await refresh()
    } catch {
      toast.error("Erreur")
    }
  }

  if (loading || !data) {
    return (
      <Container>
        <Toaster />
        <Text>Chargement…</Text>
      </Container>
    )
  }

  return (
    <Container>
      <Toaster />

      <div style={{ marginBottom: 8 }}>
        <Button size="small" variant="transparent" onClick={() => navigate("/integrations")}>← Retour</Button>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <IntegrationLogo slug={data.slug} size={56} />
          <div>
            <Heading level="h1">{data.name}</Heading>
            <Text className="text-ui-fg-subtle" style={{ marginTop: 4 }}>
              {CATEGORY_LABEL[data.category] || data.category} · {data.description}
            </Text>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {statusBadge(data.enabled, data.health_status)}
          <Switch checked={data.enabled} onCheckedChange={handleToggle} />
        </div>
      </div>

      {data.restart_required && (
        <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ⚠ Cette intégration utilise un SDK chargé au démarrage. Tu devras redémarrer Medusa (<code>pm2 restart medusa</code>) pour que les changements de secret prennent effet.
        </div>
      )}

      {/* Configuration */}
      <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <Heading level="h2" style={{ marginBottom: 16 }}>Configuration</Heading>

        {data.public_fields.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: data.secret_fields.length > 0 ? 24 : 0 }}>
            <Text size="small" weight="plus">Paramètres publics</Text>
            {data.public_fields.map((f) => (
              <div key={f.key}>
                <Label htmlFor={`pub-${f.key}`}>
                  {f.label}{f.required && " *"}
                </Label>
                <Input
                  id={`pub-${f.key}`}
                  type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
                  value={publicForm[f.key] ?? ""}
                  onChange={(e) => onPublicChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={{ fontFamily: "monospace", fontSize: 13 }}
                />
                {f.description && (
                  <Text size="xsmall" className="text-ui-fg-subtle" style={{ marginTop: 4 }}>{f.description}</Text>
                )}
              </div>
            ))}
          </div>
        )}

        {data.secret_fields.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Text size="small" weight="plus">Secrets {data.secret_fields.some((f) => data.secrets_filled[f.key]) ? "(laisser vide = inchangé)" : ""}</Text>
            {data.secret_fields.map((f) => {
              const filled = data.secrets_filled[f.key]
              const placeholder = filled ? "•••••••• (laisser vide pour ne pas modifier)" : f.placeholder || ""
              if (f.type === "longtext" || f.type === "json") {
                return (
                  <div key={f.key}>
                    <Label htmlFor={`sec-${f.key}`}>
                      {f.label}{f.required && " *"}
                    </Label>
                    <Textarea
                      id={`sec-${f.key}`}
                      value={secretForm[f.key] ?? ""}
                      onChange={(e) => onSecretChange(f.key, e.target.value)}
                      placeholder={placeholder}
                      rows={6}
                      style={{ fontFamily: "monospace", fontSize: 12 }}
                    />
                    {filled && !dirtySec.has(f.key) && (
                      <Text size="xsmall" style={{ color: "#10b981", marginTop: 4 }}>✓ Valeur configurée</Text>
                    )}
                    {f.description && (
                      <Text size="xsmall" className="text-ui-fg-subtle" style={{ marginTop: 4 }}>{f.description}</Text>
                    )}
                  </div>
                )
              }
              return (
                <div key={f.key}>
                  <Label htmlFor={`sec-${f.key}`}>
                    {f.label}{f.required && " *"}
                  </Label>
                  <Input
                    id={`sec-${f.key}`}
                    type="password"
                    value={secretForm[f.key] ?? ""}
                    onChange={(e) => onSecretChange(f.key, e.target.value)}
                    placeholder={placeholder}
                    style={{ fontFamily: "monospace", fontSize: 13 }}
                  />
                  {filled && !dirtySec.has(f.key) && (
                    <Text size="xsmall" style={{ color: "#10b981", marginTop: 4 }}>✓ Valeur configurée</Text>
                  )}
                  {f.description && (
                    <Text size="xsmall" className="text-ui-fg-subtle" style={{ marginTop: 4 }}>{f.description}</Text>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button variant="secondary" onClick={handleTest} disabled={testing || !data.enabled}>
            {testing ? "Test en cours…" : "Tester la connexion"}
          </Button>
        </div>
      </section>

      {/* Status */}
      <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <Heading level="h2" style={{ marginBottom: 16 }}>Statut</Heading>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "12px 16px", fontSize: 14 }}>
          <Text size="small" className="text-ui-fg-subtle">État</Text>
          <div>{statusBadge(data.enabled, data.health_status)}</div>
          <Text size="small" className="text-ui-fg-subtle">Dernier check</Text>
          <Text size="small">{fmtDate(data.last_health_check_at)}</Text>
          <Text size="small" className="text-ui-fg-subtle">Dernière utilisation</Text>
          <Text size="small">{fmtDate(data.last_used_at)}</Text>
          {data.health_message && (
            <>
              <Text size="small" className="text-ui-fg-subtle">Message</Text>
              <Text size="small" style={{ color: data.health_status === "error" ? "#dc2626" : "#10b981" }}>
                {data.health_message}
              </Text>
            </>
          )}
        </div>
      </section>

      {/* Audit log */}
      <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
        <Heading level="h2" style={{ marginBottom: 16 }}>Historique (20 dernières actions)</Heading>
        {audit.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">Aucune action enregistrée.</Text>
        ) : (
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "8px 8px 8px 0" }}>Date</th>
                <th style={{ padding: 8 }}>Action</th>
                <th style={{ padding: 8 }}>Acteur</th>
                <th style={{ padding: 8 }}>Détails</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 8px 8px 0", whiteSpace: "nowrap" }}>{fmtDate(a.created_at)}</td>
                  <td style={{ padding: 8 }}>
                    <Badge color={a.action === "tested" ? "blue" : a.action === "enabled" ? "green" : a.action === "disabled" ? "grey" : "orange"} size="2xsmall">
                      {a.action}
                    </Badge>
                  </td>
                  <td style={{ padding: 8 }}>{a.actor_email || a.actor_id?.slice(0, 8) || "—"}</td>
                  <td style={{ padding: 8, color: "#6b7280" }}>
                    {a.notes || (a.changed_fields.length ? a.changed_fields.join(", ") : "—")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Container>
  )
}

export default IntegrationDetailPage
