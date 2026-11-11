import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Toaster, toast, Textarea, Input } from "@medusajs/ui"
import { ArrowUturnLeft } from "@medusajs/icons"
import { useEffect, useState } from "react"

type ReturnRequest = {
  id: string
  order_id: string
  order_display_id: string | null
  customer_email: string
  customer_name: string | null
  reason: string
  description: string | null
  items: any[] | null
  status: string
  admin_notes: string | null
  refund_amount: number | null
  processed_at: string | null
  created_at: string
}

const REASONS: Record<string, string> = {
  damaged: "Produit endommage",
  wrong_item: "Mauvais produit",
  not_satisfied: "Pas satisfait",
  size_issue: "Probleme de taille",
  other: "Autre",
}

const STATUS_LABELS: Record<string, { label: string; color: any }> = {
  pending: { label: "En attente", color: "orange" },
  approved: { label: "Approuvee", color: "blue" },
  rejected: { label: "Refusee", color: "red" },
  refunded: { label: "Remboursee", color: "green" },
  completed: { label: "Completee", color: "green" },
}

const ReturnsPage = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, refunded: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [selected, setSelected] = useState<ReturnRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [refundAmount, setRefundAmount] = useState("")

  const fetchReturns = async () => {
    try {
      const params = new URLSearchParams()
      if (filter) params.set("status", filter)
      const res = await fetch(`/admin/returns?${params}`, { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReturns(data.returns || [])
      setStats(data.stats || { total: 0, pending: 0, approved: 0, refunded: 0 })
    } catch {
      toast.error("Erreur de chargement")
    }
    setLoading(false)
  }

  useEffect(() => { fetchReturns() }, [filter])

  useEffect(() => {
    if (selected) {
      setAdminNotes(selected.admin_notes || "")
      setRefundAmount(selected.refund_amount ? (selected.refund_amount / 100).toString() : "")
    }
  }, [selected?.id])

  const updateStatus = async (status: string) => {
    if (!selected) return
    try {
      const body: any = { status, admin_notes: adminNotes }
      if (refundAmount && status === "refunded") body.refund_amount = Math.round(Number(refundAmount) * 100)

      await fetch(`/admin/returns/${selected.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      toast.success(`Statut mis a jour : ${STATUS_LABELS[status]?.label || status}`)
      fetchReturns()
      setSelected(null)
    } catch {
      toast.error("Erreur")
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <>
      <Toaster />
      <Container className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level="h1">Retours / SAV</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              {stats.total} demande{stats.total > 1 ? "s" : ""} — {stats.pending} en attente
            </Text>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle">Total</Text>
            <Text className="text-2xl font-bold">{stats.total}</Text>
          </div>
          <div className="p-4 rounded-xl border border-orange-200 bg-orange-50">
            <Text size="xsmall" className="text-orange-700">En attente</Text>
            <Text className="text-2xl font-bold text-orange-700">{stats.pending}</Text>
          </div>
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
            <Text size="xsmall" className="text-blue-700">Approuvees</Text>
            <Text className="text-2xl font-bold text-blue-700">{stats.approved}</Text>
          </div>
          <div className="p-4 rounded-xl border border-green-200 bg-green-50">
            <Text size="xsmall" className="text-green-700">Remboursees</Text>
            <Text className="text-2xl font-bold text-green-700">{stats.refunded}</Text>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 border-b border-ui-border-base">
          {[["", "Toutes"], ["pending", "En attente"], ["approved", "Approuvees"], ["refunded", "Remboursees"], ["rejected", "Refusees"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                filter === key ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <Text>Chargement...</Text>
        ) : returns.length === 0 ? (
          <div className="text-center py-16">
            <Text className="text-ui-fg-subtle">Aucune demande de retour</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2">
              {returns.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected?.id === r.id ? "border-blue-500 bg-blue-50" : "border-ui-border-base hover:bg-ui-bg-subtle"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Text size="small" weight="plus">#{r.order_display_id || r.order_id.substring(0, 8)}</Text>
                    <Badge color={STATUS_LABELS[r.status]?.color || "grey"} size="2xsmall">
                      {STATUS_LABELS[r.status]?.label || r.status}
                    </Badge>
                  </div>
                  <Text size="xsmall" className="text-ui-fg-muted">{r.customer_name || r.customer_email}</Text>
                  <Text size="xsmall" className="text-ui-fg-subtle mt-1">{REASONS[r.reason] || r.reason}</Text>
                  <Text size="xsmall" className="text-ui-fg-disabled mt-1">{formatDate(r.created_at)}</Text>
                </button>
              ))}
            </div>

            {selected ? (
              <div className="bg-white border border-ui-border-base rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Heading level="h2" className="text-base">Retour #{selected.order_display_id || selected.order_id.substring(0, 8)}</Heading>
                    <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                      {selected.customer_name} · {selected.customer_email}
                    </Text>
                  </div>
                  <Badge color={STATUS_LABELS[selected.status]?.color || "grey"}>
                    {STATUS_LABELS[selected.status]?.label || selected.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <Text size="xsmall" weight="plus" className="block mb-1">Motif</Text>
                    <Text size="small">{REASONS[selected.reason] || selected.reason}</Text>
                  </div>

                  {selected.description && (
                    <div>
                      <Text size="xsmall" weight="plus" className="block mb-1">Description du client</Text>
                      <div className="bg-ui-bg-subtle p-3 rounded-lg">
                        <Text size="small" className="whitespace-pre-wrap">{selected.description}</Text>
                      </div>
                    </div>
                  )}

                  {selected.items && Array.isArray(selected.items) && selected.items.length > 0 && (
                    <div>
                      <Text size="xsmall" weight="plus" className="block mb-1">Articles concernes</Text>
                      <div className="space-y-1">
                        {selected.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-ui-bg-subtle p-2 rounded">
                            <span>{item.title || item.item_id}</span>
                            <span className="text-ui-fg-muted">x{item.quantity || 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Text size="xsmall" weight="plus" className="block mb-1">Notes admin (visibles par le client)</Text>
                    <Textarea
                      value={adminNotes}
                      onChange={(e: any) => setAdminNotes(e.target.value)}
                      rows={3}
                      placeholder="Instructions pour le retour, motif du refus, etc."
                    />
                  </div>

                  {(selected.status === "approved" || selected.status === "refunded") && (
                    <div>
                      <Text size="xsmall" weight="plus" className="block mb-1">Montant rembourse (€)</Text>
                      <Input
                        type="number"
                        step="0.01"
                        value={refundAmount}
                        onChange={(e: any) => setRefundAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-ui-border-base flex flex-wrap gap-2">
                    {selected.status === "pending" && (
                      <>
                        <Button size="small" variant="primary" onClick={() => updateStatus("approved")}>Approuver</Button>
                        <Button size="small" variant="danger" onClick={() => updateStatus("rejected")}>Refuser</Button>
                      </>
                    )}
                    {selected.status === "approved" && (
                      <Button size="small" variant="primary" onClick={() => updateStatus("refunded")}>Marquer rembourse</Button>
                    )}
                    {selected.status !== "pending" && (
                      <Button size="small" variant="secondary" onClick={() => updateStatus("pending")}>Remettre en attente</Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-ui-bg-subtle rounded-xl p-12 min-h-[400px]">
                <Text className="text-ui-fg-muted">Selectionnez un retour</Text>
              </div>
            )}
          </div>
        )}
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Retours",
  icon: ArrowUturnLeft,
})

export default ReturnsPage
