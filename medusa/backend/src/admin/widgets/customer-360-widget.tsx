import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

type CustomerData = {
  customer: any
  summary: {
    lifetime_value: number
    order_count: number
    avg_order_value: number
    first_order_date: string | null
    last_order_date: string | null
    message_count: number
    unread_messages: number
    review_count: number
    avg_review_rating: number
    return_count: number
    pending_returns: number
    segment: string
  }
  orders: any[]
  messages: any[]
  reviews: any[]
  returns: any[]
}

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)

const formatDate = (d: string | null) => {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

const segmentColors: Record<string, any> = {
  VIP: "purple",
  Fidele: "green",
  "Premier achat": "blue",
  Prospect: "grey",
  Nouveau: "grey",
}

const Customer360Widget = ({ data }: { data: any }) => {
  const customerId = data?.id
  const [info, setInfo] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customerId) return
    fetch(`/admin/customer-360?customer_id=${customerId}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setInfo(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [customerId])

  if (loading) {
    return (
      <Container>
        <Heading level="h2">Vue 360°</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-2">Chargement...</Text>
      </Container>
    )
  }

  if (!info) return null

  const s = info.summary
  const daysSinceLast = s.last_order_date
    ? Math.floor((Date.now() - new Date(s.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <Container>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div>
          <Heading level="h2">Vue 360°</Heading>
          <Text size="small" className="text-ui-fg-subtle">Synthèse client complète</Text>
        </div>
        <Badge color={segmentColors[s.segment] || "grey"}>{s.segment}</Badge>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        <div style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fafafa" }}>
          <Text size="xsmall" className="text-ui-fg-subtle">Valeur totale</Text>
          <Text className="text-xl font-bold mt-1 block">{formatPrice(s.lifetime_value)}</Text>
        </div>
        <div style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fafafa" }}>
          <Text size="xsmall" className="text-ui-fg-subtle">Commandes</Text>
          <Text className="text-xl font-bold mt-1 block">{s.order_count}</Text>
        </div>
        <div style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fafafa" }}>
          <Text size="xsmall" className="text-ui-fg-subtle">Panier moyen</Text>
          <Text className="text-xl font-bold mt-1 block">{formatPrice(s.avg_order_value)}</Text>
        </div>
        <div style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#fafafa" }}>
          <Text size="xsmall" className="text-ui-fg-subtle">Dernière cmd</Text>
          <Text className="text-xl font-bold mt-1 block">
            {daysSinceLast !== null ? `${daysSinceLast}j` : "—"}
          </Text>
        </div>
      </div>

      {/* Activity summary */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px", marginBottom: "20px", padding: "12px", borderRadius: "10px", background: "#f9fafb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px" }}>📦</span>
          <Text size="xsmall">{s.order_count} commande(s)</Text>
        </div>
        <span style={{ color: "#d1d5db" }}>·</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px" }}>✉️</span>
          <Text size="xsmall">
            {s.message_count} message(s)
            {s.unread_messages > 0 && <Badge color="red" size="2xsmall" className="ml-1">{s.unread_messages} non lu{s.unread_messages > 1 ? "s" : ""}</Badge>}
          </Text>
        </div>
        <span style={{ color: "#d1d5db" }}>·</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px" }}>⭐</span>
          <Text size="xsmall">
            {s.review_count} avis
            {s.avg_review_rating > 0 && ` (${s.avg_review_rating}/5)`}
          </Text>
        </div>
        <span style={{ color: "#d1d5db" }}>·</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "16px" }}>↩</span>
          <Text size="xsmall">
            {s.return_count} retour(s)
            {s.pending_returns > 0 && <Badge color="orange" size="2xsmall" className="ml-1">{s.pending_returns} en attente</Badge>}
          </Text>
        </div>
      </div>

      {/* Tabs: orders / messages / reviews / returns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Recent orders */}
        <div>
          <Text size="xsmall" weight="plus" className="text-ui-fg-subtle uppercase tracking-wider mb-2 block">
            Dernières commandes
          </Text>
          {info.orders.length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">Aucune commande</Text>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {info.orders.slice(0, 5).map((o) => (
                <a
                  key={o.id}
                  href={`/app/orders/${o.id}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "8px", background: "#fafafa", border: "1px solid #f3f4f6", textDecoration: "none", color: "inherit" }}
                >
                  <div>
                    <Text size="xsmall" weight="plus">#{o.display_id || o.id.substring(0, 8)}</Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">{formatDate(o.created_at)} · {o.item_count} article(s)</Text>
                  </div>
                  <Text size="xsmall" weight="plus">{formatPrice(o.total || 0)}</Text>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div>
          <Text size="xsmall" weight="plus" className="text-ui-fg-subtle uppercase tracking-wider mb-2 block">
            Derniers messages
          </Text>
          {info.messages.length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">Aucun message</Text>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {info.messages.slice(0, 5).map((m) => (
                <a
                  key={m.id}
                  href="/app/contact"
                  style={{ display: "block", padding: "8px 10px", borderRadius: "8px", background: m.is_read ? "#fafafa" : "#fffbeb", border: "1px solid #f3f4f6", textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Text size="xsmall" weight="plus">{m.subject || "Sans objet"}</Text>
                    {m.admin_reply && <Badge color="green" size="2xsmall">Repondu</Badge>}
                  </div>
                  <Text size="xsmall" className="text-ui-fg-subtle line-clamp-1">{m.message}</Text>
                  <Text size="xsmall" className="text-ui-fg-disabled">{formatDate(m.created_at)}</Text>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        {info.reviews.length > 0 && (
          <div>
            <Text size="xsmall" weight="plus" className="text-ui-fg-subtle uppercase tracking-wider mb-2 block">
              Avis postes
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {info.reviews.slice(0, 3).map((r) => (
                <div key={r.id} style={{ padding: "8px 10px", borderRadius: "8px", background: "#fafafa", border: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#f59e0b", fontSize: "12px" }}>{"★".repeat(r.rating)}</span>
                    {!r.is_published && <Badge color="orange" size="2xsmall">En attente</Badge>}
                  </div>
                  {r.title && <Text size="xsmall" weight="plus">{r.title}</Text>}
                  {r.body && <Text size="xsmall" className="text-ui-fg-subtle line-clamp-2">{r.body}</Text>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Returns */}
        {info.returns.length > 0 && (
          <div>
            <Text size="xsmall" weight="plus" className="text-ui-fg-subtle uppercase tracking-wider mb-2 block">
              Retours
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {info.returns.slice(0, 3).map((r) => (
                <a
                  key={r.id}
                  href="/app/returns"
                  style={{ display: "block", padding: "8px 10px", borderRadius: "8px", background: "#fafafa", border: "1px solid #f3f4f6", textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Text size="xsmall" weight="plus">#{r.order_display_id || "Retour"}</Text>
                    <Badge color={r.status === "pending" ? "orange" : r.status === "refunded" ? "green" : "grey"} size="2xsmall">
                      {r.status}
                    </Badge>
                  </div>
                  <Text size="xsmall" className="text-ui-fg-subtle">{r.reason}</Text>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default Customer360Widget
