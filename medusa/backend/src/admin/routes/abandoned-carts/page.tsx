import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Toaster, toast } from "@medusajs/ui"
import { ShoppingBag } from "@medusajs/icons"
import { useEffect, useState } from "react"

type AbandonedCart = {
  id: string
  email: string
  item_count: number
  total_quantity: number
  subtotal: number
  currency_code: string
  updated_at: string
  hours_ago: number
  email_sent: boolean
  email_sent_at: string | null
  items_preview: { title: string; quantity: number; unit_price: number; thumbnail: string | null }[]
  shipping_first_name: string | null
  shipping_last_name: string | null
}

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount)

const formatTimeAgo = (hours: number) => {
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

const AbandonedCartsPage = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [stats, setStats] = useState({ count: 0, total_value: 0, emailed: 0, not_emailed: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "emailed" | "not_emailed">("all")

  const fetchCarts = async () => {
    try {
      const res = await fetch("/admin/abandoned-carts", { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCarts(data.abandoned_carts || [])
      setStats(data.stats || { count: 0, total_value: 0, emailed: 0, not_emailed: 0 })
    } catch {
      toast.error("Erreur de chargement")
    }
    setLoading(false)
  }

  useEffect(() => { fetchCarts() }, [])

  const filtered = carts.filter(c => {
    if (filter === "emailed") return c.email_sent
    if (filter === "not_emailed") return !c.email_sent
    return true
  })

  const totalRecoverable = filtered.reduce((s, c) => s + c.subtotal, 0)

  return (
    <>
      <Toaster />
      <Container className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level="h1">Paniers abandonnés</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Paniers laissés depuis plus d'1h, dans les 7 derniers jours
            </Text>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-5 bg-white rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">Paniers</Text>
            <Text className="text-3xl font-bold mt-2 block">{stats.count}</Text>
            <Text size="xsmall" className="text-ui-fg-muted mt-1 block">{stats.emailed} relancés · {stats.not_emailed} non relancés</Text>
          </div>
          <div className="p-5 bg-white rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wider">Valeur totale</Text>
            <Text className="text-3xl font-bold mt-2 block text-blue-600">{formatPrice(stats.total_value)}</Text>
            <Text size="xsmall" className="text-ui-fg-muted mt-1 block">Potentiel de récupération</Text>
          </div>
          <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <Text size="xsmall" className="text-blue-700 uppercase tracking-wider">Relance auto</Text>
            <Text className="text-base font-semibold mt-2 block text-blue-900">Email envoyé entre 2h et 24h</Text>
            <Text size="xsmall" className="text-blue-700 mt-1 block">Cron quotidien actif</Text>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 border-b border-ui-border-base">
          {[
            { key: "all", label: `Tous (${stats.count})` },
            { key: "not_emailed", label: `Non relancés (${stats.not_emailed})` },
            { key: "emailed", label: `Relancés (${stats.emailed})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                filter === tab.key ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filter !== "all" && filtered.length > 0 && (
          <Text size="xsmall" className="text-ui-fg-subtle mb-3 block">
            Valeur filtrée : <strong>{formatPrice(totalRecoverable)}</strong>
          </Text>
        )}

        {loading ? (
          <Text>Chargement...</Text>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Text className="text-ui-fg-subtle">Aucun panier abandonné</Text>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cart) => (
              <div
                key={cart.id}
                className="bg-white border border-ui-border-base rounded-xl p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Items preview */}
                  <div className="flex -space-x-2 shrink-0">
                    {cart.items_preview.map((item, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-lg border-2 border-white bg-ui-bg-subtle overflow-hidden"
                        style={{ zIndex: cart.items_preview.length - i }}
                        title={item.title}
                      >
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-ui-fg-muted">📦</div>
                        )}
                      </div>
                    ))}
                    {cart.item_count > 3 && (
                      <div className="w-12 h-12 rounded-lg border-2 border-white bg-ui-bg-subtle flex items-center justify-center text-xs font-semibold text-ui-fg-subtle">
                        +{cart.item_count - 3}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Text size="small" weight="plus">
                        {cart.shipping_first_name ? `${cart.shipping_first_name} ${cart.shipping_last_name || ""}` : cart.email}
                      </Text>
                      {cart.email_sent ? (
                        <Badge color="green" size="2xsmall">Relancé</Badge>
                      ) : (
                        <Badge color="orange" size="2xsmall">Non relancé</Badge>
                      )}
                    </div>
                    <Text size="xsmall" className="text-ui-fg-subtle">{cart.email}</Text>
                    <Text size="xsmall" className="text-ui-fg-muted mt-1">
                      {cart.item_count} article{cart.item_count > 1 ? "s" : ""} ({cart.total_quantity} unités) · {formatTimeAgo(cart.hours_ago)}
                    </Text>
                  </div>

                  {/* Value */}
                  <div className="text-right shrink-0">
                    <Text className="text-lg font-bold">{formatPrice(cart.subtotal)}</Text>
                    <Text size="xsmall" className="text-ui-fg-muted">Sous-total</Text>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => window.open(`mailto:${cart.email}?subject=Votre panier vous attend&body=Bonjour,%0A%0AVous avez laissé des articles dans votre panier sur Magic Crochet Kit. Ils n'attendent que vous !%0A%0AReprenez votre commande : https://magic-crochet-kit.com/cart`)}
                    >
                      Contacter
                    </Button>
                  </div>
                </div>

                {/* Items detail (expandable) */}
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-blue-600 hover:underline">
                    Voir le détail
                  </summary>
                  <div className="mt-3 pl-4 border-l-2 border-ui-border-base space-y-1">
                    {cart.items_preview.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <Text size="xsmall">{item.title} × {item.quantity}</Text>
                        <Text size="xsmall" weight="plus">{formatPrice(item.unit_price * item.quantity)}</Text>
                      </div>
                    ))}
                    {cart.email_sent && cart.email_sent_at && (
                      <Text size="xsmall" className="text-ui-fg-muted mt-2 block">
                        ✉ Email de relance envoyé le {new Date(cart.email_sent_at).toLocaleDateString("fr-FR")}
                      </Text>
                    )}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Paniers abandonnés",
  icon: ShoppingBag,
})

export default AbandonedCartsPage
