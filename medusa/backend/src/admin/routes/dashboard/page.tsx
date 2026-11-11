import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Analytics = {
  totals: {
    revenue: number
    orders: number
    avg_order_value: number
    customers: number
    new_customers: number
    returning_customers: number
  }
  deltas: { revenue: number; orders: number }
  daily_series: { date: string; revenue: number; orders: number }[]
  top_products: { product_id: string; title: string; thumbnail: string | null; quantity: number; revenue: number }[]
  status_breakdown: Record<string, number>
}

const HouseIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
)

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount)

const formatPriceFull = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)

// Inline SVG line chart (no external dependency)
function LineChart({ data, height = 220 }: { data: { date: string; revenue: number }[]; height?: number }) {
  if (data.length === 0) return null
  const width = 800
  const padding = { top: 20, right: 20, bottom: 30, left: 60 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW
    const y = padding.top + chartH - (d.revenue / maxRevenue) * chartH
    return { x, y, ...d }
  })

  // Build smooth path
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  // Y-axis labels (4 levels)
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    y: padding.top + chartH - pct * chartH,
    value: maxRevenue * pct,
  }))

  // X-axis labels (every Nth point)
  const xLabelStep = Math.max(1, Math.floor(data.length / 7))

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((label, i) => (
        <line
          key={i}
          x1={padding.left}
          y1={label.y}
          x2={width - padding.right}
          y2={label.y}
          stroke="#f3f4f6"
          strokeWidth="1"
        />
      ))}

      {/* Y axis labels */}
      {yLabels.map((label, i) => (
        <text key={i} x={padding.left - 10} y={label.y + 4} fontSize="11" fill="#9ca3af" textAnchor="end">
          {formatPrice(label.value)}
        </text>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#lineGradient)" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#2563eb" strokeWidth="2" />
          <title>{`${new Date(p.date).toLocaleDateString("fr-FR")} : ${formatPriceFull(p.revenue)}`}</title>
        </g>
      ))}

      {/* X axis labels */}
      {points.filter((_, i) => i % xLabelStep === 0 || i === points.length - 1).map((p, i) => {
        const date = new Date(p.date)
        const label = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
        return (
          <text key={i} x={p.x} y={height - 10} fontSize="11" fill="#6b7280" textAnchor="middle">
            {label}
          </text>
        )
      })}
    </svg>
  )
}

const StatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "#f59e0b" },
  completed: { label: "Completee", color: "#10b981" },
  archived: { label: "Archivee", color: "#9ca3af" },
  canceled: { label: "Annulee", color: "#ef4444" },
  requires_action: { label: "Action requise", color: "#f97316" },
}

const DashboardPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "365d">("30d")

  useEffect(() => {
    setLoading(true)
    fetch(`/admin/analytics?range=${range}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [range])

  const ranges: { key: "7d" | "30d" | "90d" | "365d"; label: string }[] = [
    { key: "7d", label: "7 jours" },
    { key: "30d", label: "30 jours" },
    { key: "90d", label: "90 jours" },
    { key: "365d", label: "1 an" },
  ]

  const totalStatuses = analytics ? Object.values(analytics.status_breakdown).reduce((s, v) => s + v, 0) : 0

  return (
    <Container className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <Heading level="h1">Tableau de bord</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Analytics de votre boutique
          </Text>
        </div>
        <div className="flex gap-1 p-1 bg-ui-bg-subtle rounded-lg">
          {ranges.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                range === r.key ? "bg-white text-ui-fg-base shadow-sm" : "text-ui-fg-subtle hover:text-ui-fg-base"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Text className="text-ui-fg-subtle">Chargement des donnees...</Text>
      ) : !analytics ? (
        <Text className="text-ui-fg-subtle">Aucune donnee disponible</Text>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-ui-border-base rounded-xl p-5">
              <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">Revenu</Text>
              <div className="flex items-baseline gap-2 mt-2">
                <Text className="text-3xl font-bold leading-none">{formatPriceFull(analytics.totals.revenue)}</Text>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className={`text-xs font-semibold ${analytics.deltas.revenue >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {analytics.deltas.revenue >= 0 ? "↑" : "↓"} {Math.abs(analytics.deltas.revenue)}%
                </span>
                <Text size="xsmall" className="text-ui-fg-muted">vs periode precedente</Text>
              </div>
            </div>

            <div className="bg-white border border-ui-border-base rounded-xl p-5">
              <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">Commandes</Text>
              <div className="flex items-baseline gap-2 mt-2">
                <Text className="text-3xl font-bold leading-none">{analytics.totals.orders}</Text>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className={`text-xs font-semibold ${analytics.deltas.orders >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {analytics.deltas.orders >= 0 ? "↑" : "↓"} {Math.abs(analytics.deltas.orders)}%
                </span>
                <Text size="xsmall" className="text-ui-fg-muted">vs periode precedente</Text>
              </div>
            </div>

            <div className="bg-white border border-ui-border-base rounded-xl p-5">
              <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">Panier moyen</Text>
              <div className="flex items-baseline gap-2 mt-2">
                <Text className="text-3xl font-bold leading-none">{formatPrice(analytics.totals.avg_order_value)}</Text>
              </div>
              <Text size="xsmall" className="text-ui-fg-muted mt-2 block">Valeur moyenne par commande</Text>
            </div>

            <div className="bg-white border border-ui-border-base rounded-xl p-5">
              <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">Clients</Text>
              <div className="flex items-baseline gap-2 mt-2">
                <Text className="text-3xl font-bold leading-none">{analytics.totals.customers}</Text>
              </div>
              <Text size="xsmall" className="text-ui-fg-muted mt-2 block">
                {analytics.totals.new_customers} nouveau{analytics.totals.new_customers > 1 ? "x" : ""} · {analytics.totals.returning_customers} fideles
              </Text>
            </div>
          </div>

          {/* Revenue chart */}
          <div className="bg-white border border-ui-border-base rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Text size="small" weight="plus">Evolution du revenu</Text>
                <Text size="xsmall" className="text-ui-fg-subtle">Total : {formatPriceFull(analytics.totals.revenue)}</Text>
              </div>
            </div>
            {analytics.daily_series.length > 0 && analytics.totals.revenue > 0 ? (
              <LineChart data={analytics.daily_series} />
            ) : (
              <div className="text-center py-12">
                <Text className="text-ui-fg-subtle">Aucune vente sur cette periode</Text>
              </div>
            )}
          </div>

          {/* Bottom row: Top products + Status breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
            {/* Top products */}
            <div className="bg-white border border-ui-border-base rounded-xl p-6">
              <Text size="small" weight="plus" className="mb-4 block">Top produits</Text>
              {analytics.top_products.length === 0 ? (
                <Text size="small" className="text-ui-fg-subtle">Aucune vente</Text>
              ) : (
                <div className="space-y-3">
                  {analytics.top_products.slice(0, 8).map((p, i) => (
                    <div key={p.product_id} className="flex items-center gap-3">
                      <div className="text-xs font-bold text-ui-fg-muted w-5">{i + 1}</div>
                      {p.thumbnail ? (
                        <img src={p.thumbnail} alt={p.title} className="w-10 h-10 rounded-lg object-contain bg-ui-bg-subtle" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-ui-bg-subtle flex items-center justify-center text-ui-fg-muted text-xs">📦</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Text size="small" weight="plus" className="truncate">{p.title}</Text>
                        <Text size="xsmall" className="text-ui-fg-subtle">{p.quantity} vendus</Text>
                      </div>
                      <Text size="small" weight="plus">{formatPrice(p.revenue)}</Text>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status breakdown */}
            <div className="bg-white border border-ui-border-base rounded-xl p-6">
              <Text size="small" weight="plus" className="mb-4 block">Statuts des commandes</Text>
              {totalStatuses === 0 ? (
                <Text size="small" className="text-ui-fg-subtle">Aucune commande</Text>
              ) : (
                <div className="space-y-3">
                  {Object.entries(analytics.status_breakdown).map(([status, count]) => {
                    const info = StatusLabels[status] || { label: status, color: "#9ca3af" }
                    const pct = (count / totalStatuses) * 100
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: info.color }}></span>
                            <Text size="xsmall">{info.label}</Text>
                          </div>
                          <Text size="xsmall" weight="plus">{count}</Text>
                        </div>
                        <div className="h-1.5 bg-ui-bg-subtle rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: info.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <a href="/app/orders" className="flex items-center gap-3 p-4 bg-white border border-ui-border-base rounded-xl hover:border-blue-500 transition-colors">
              <span className="text-2xl">📦</span>
              <div>
                <Text size="small" weight="plus">Commandes</Text>
                <Text size="xsmall" className="text-ui-fg-subtle">Voir toutes</Text>
              </div>
            </a>
            <a href="/app/products" className="flex items-center gap-3 p-4 bg-white border border-ui-border-base rounded-xl hover:border-blue-500 transition-colors">
              <span className="text-2xl">🛍</span>
              <div>
                <Text size="small" weight="plus">Produits</Text>
                <Text size="xsmall" className="text-ui-fg-subtle">Catalogue</Text>
              </div>
            </a>
            <a href="/app/customers" className="flex items-center gap-3 p-4 bg-white border border-ui-border-base rounded-xl hover:border-blue-500 transition-colors">
              <span className="text-2xl">👥</span>
              <div>
                <Text size="small" weight="plus">Clients</Text>
                <Text size="xsmall" className="text-ui-fg-subtle">Base clients</Text>
              </div>
            </a>
            <a href="/app/theme" className="flex items-center gap-3 p-4 bg-white border border-ui-border-base rounded-xl hover:border-blue-500 transition-colors">
              <span className="text-2xl">🎨</span>
              <div>
                <Text size="small" weight="plus">Theme</Text>
                <Text size="xsmall" className="text-ui-fg-subtle">Personnaliser</Text>
              </div>
            </a>
          </div>
        </>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Accueil",
  icon: HouseIcon,
})

export default DashboardPage
