import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Toaster, toast, Input, Textarea } from "@medusajs/ui"
import { Gift } from "@medusajs/icons"
import { useEffect, useState } from "react"

type GiftCard = {
  id: string
  code: string
  initial_amount: number
  current_balance: number
  currency_code: string
  recipient_email: string | null
  recipient_name: string | null
  sender_name: string | null
  message: string | null
  is_active: boolean
  expires_at: string | null
  redeemed_at: string | null
  created_at: string
}

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100)

const GiftCardsPage = () => {
  const [cards, setCards] = useState<GiftCard[]>([])
  const [stats, setStats] = useState({ count: 0, active: 0, total_issued: 0, total_balance: 0, total_used: 0 })
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Form
  const [amount, setAmount] = useState("50")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [senderName, setSenderName] = useState("")
  const [giftMessage, setGiftMessage] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  const fetchCards = async () => {
    try {
      const res = await fetch("/admin/gift-cards", { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCards(data.gift_cards || [])
      setStats(data.stats || { count: 0, active: 0, total_issued: 0, total_balance: 0, total_used: 0 })
    } catch {
      toast.error("Erreur de chargement")
    }
    setLoading(false)
  }

  useEffect(() => { fetchCards() }, [])

  const createCard = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Montant invalide")
      return
    }
    try {
      const res = await fetch("/admin/gift-cards", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          recipient_email: recipientEmail || undefined,
          recipient_name: recipientName || undefined,
          sender_name: senderName || undefined,
          message: giftMessage || undefined,
          expires_at: expiresAt || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success(`Carte cadeau creee : ${data.gift_card.code}`)
      // Reset form
      setAmount("50")
      setRecipientEmail("")
      setRecipientName("")
      setSenderName("")
      setGiftMessage("")
      setExpiresAt("")
      setCreateOpen(false)
      fetchCards()
    } catch {
      toast.error("Erreur lors de la creation")
    }
  }

  const toggleActive = async (card: GiftCard) => {
    try {
      await fetch(`/admin/gift-cards/${card.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !card.is_active }),
      })
      toast.success(card.is_active ? "Desactivee" : "Reactivee")
      fetchCards()
    } catch {
      toast.error("Erreur")
    }
  }

  const deleteCard = async (id: string) => {
    if (!confirm("Supprimer cette carte cadeau ?")) return
    try {
      await fetch(`/admin/gift-cards/${id}`, { method: "DELETE", credentials: "include" })
      toast.success("Supprimee")
      fetchCards()
    } catch {
      toast.error("Erreur")
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Code ${code} copie`)
  }

  const filtered = cards.filter(c =>
    !search ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.recipient_email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.recipient_name || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Toaster />
      <Container className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level="h1">Cartes cadeaux</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              {stats.count} carte{stats.count > 1 ? "s" : ""} — {stats.active} active{stats.active > 1 ? "s" : ""}
            </Text>
          </div>
          <Button variant="primary" onClick={() => setCreateOpen(!createOpen)}>
            + Nouvelle carte
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle">Montant emis</Text>
            <Text className="text-xl font-bold mt-1 block">{formatPrice(stats.total_issued)}</Text>
          </div>
          <div className="p-4 rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle">Solde restant</Text>
            <Text className="text-xl font-bold mt-1 text-blue-600 block">{formatPrice(stats.total_balance)}</Text>
          </div>
          <div className="p-4 rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle">Utilise</Text>
            <Text className="text-xl font-bold mt-1 text-green-600 block">{formatPrice(stats.total_used)}</Text>
          </div>
        </div>

        {/* Create form */}
        {createOpen && (
          <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-5 mb-6">
            <Heading level="h2" className="text-base mb-4">Nouvelle carte cadeau</Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Montant (€) *</Text>
                <Input type="number" value={amount} onChange={(e: any) => setAmount(e.target.value)} placeholder="50" />
              </div>
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Date d'expiration</Text>
                <Input type="date" value={expiresAt} onChange={(e: any) => setExpiresAt(e.target.value)} />
              </div>
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Email destinataire</Text>
                <Input type="email" value={recipientEmail} onChange={(e: any) => setRecipientEmail(e.target.value)} placeholder="destinataire@email.fr" />
              </div>
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Nom destinataire</Text>
                <Input type="text" value={recipientName} onChange={(e: any) => setRecipientName(e.target.value)} placeholder="Marie" />
              </div>
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Nom expediteur</Text>
                <Input type="text" value={senderName} onChange={(e: any) => setSenderName(e.target.value)} placeholder="Jean" />
              </div>
              <div className="col-span-2">
                <Text size="xsmall" weight="plus" className="mb-1 block">Message personnalise</Text>
                <Textarea value={giftMessage} onChange={(e: any) => setGiftMessage(e.target.value)} rows={2} placeholder="Joyeux anniversaire !" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="primary" size="small" onClick={createCard}>Generer la carte</Button>
              <Button variant="secondary" size="small" onClick={() => setCreateOpen(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Search */}
        {cards.length > 0 && (
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Rechercher par code, email ou nom..."
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* List */}
        {loading ? (
          <Text>Chargement...</Text>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Text className="text-ui-fg-subtle">Aucune carte cadeau</Text>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((card) => (
              <div
                key={card.id}
                className={`p-4 rounded-xl border ${card.is_active ? "border-ui-border-base bg-white" : "border-ui-border-base bg-ui-bg-subtle opacity-60"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyCode(card.code)}
                        className="px-3 py-1.5 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-lg font-mono text-sm font-semibold border border-ui-border-base"
                        title="Copier"
                      >
                        {card.code}
                      </button>
                      {card.is_active ? (
                        <Badge color="green" size="2xsmall">Active</Badge>
                      ) : (
                        <Badge color="grey" size="2xsmall">Inactive</Badge>
                      )}
                      {card.expires_at && new Date(card.expires_at) < new Date() && (
                        <Badge color="red" size="2xsmall">Expiree</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-ui-fg-subtle">
                      {card.recipient_name && <span>👤 {card.recipient_name}</span>}
                      {card.recipient_email && <span>📧 {card.recipient_email}</span>}
                      <span>📅 {new Date(card.created_at).toLocaleDateString("fr-FR")}</span>
                      {card.expires_at && <span>⏱ Expire le {new Date(card.expires_at).toLocaleDateString("fr-FR")}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Text size="xsmall" className="text-ui-fg-subtle">Solde / Initial</Text>
                    <Text className="text-base font-bold">
                      {formatPrice(card.current_balance)} <span className="text-ui-fg-muted text-xs font-normal">/ {formatPrice(card.initial_amount)}</span>
                    </Text>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="small" variant="secondary" onClick={() => toggleActive(card)}>
                      {card.is_active ? "Desactiver" : "Reactiver"}
                    </Button>
                    <Button size="small" variant="danger" onClick={() => deleteCard(card.id)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Cartes cadeaux",
  icon: Gift,
})

export default GiftCardsPage
