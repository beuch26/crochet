import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Toaster, toast, Input, Textarea } from "@medusajs/ui"
import { Tag } from "@medusajs/icons"
import { useEffect, useState } from "react"

type Promotion = {
  id: string
  code: string
  type: string  // "standard" | "buyget"
  is_automatic: boolean
  application_method?: {
    type: "fixed" | "percentage"
    value: number
    target_type?: string
    currency_code?: string
    max_quantity?: number
  }
  rules?: any[]
  campaign?: any
  created_at: string
}

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")

  // Form state
  const [code, setCode] = useState("")
  const [type, setType] = useState<"percentage" | "fixed">("percentage")
  const [value, setValue] = useState("10")
  const [description, setDescription] = useState("")

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/admin/promotions", { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPromotions(data.promotions || [])
    } catch {
      toast.error("Erreur de chargement des promotions")
    }
    setLoading(false)
  }

  useEffect(() => { fetchPromotions() }, [])

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let c = ""
    for (let i = 0; i < 8; i++) c += chars.charAt(Math.floor(Math.random() * chars.length))
    setCode(c)
  }

  const createPromotion = async () => {
    if (!code.trim() || !value) {
      toast.error("Code et valeur requis")
      return
    }
    const numValue = Number(value)
    if (numValue <= 0) {
      toast.error("Valeur invalide")
      return
    }

    try {
      const body = {
        code: code.trim().toUpperCase(),
        type: "standard",
        is_automatic: false,
        application_method: {
          type,
          value: numValue,
          target_type: "order",
          allocation: "across",
          currency_code: type === "fixed" ? "eur" : undefined,
        },
      }

      const res = await fetch("/admin/promotions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Erreur de creation")
      }

      toast.success("Code promo cree")
      setCode("")
      setValue("10")
      setDescription("")
      setCreateOpen(false)
      fetchPromotions()
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la creation")
    }
  }

  const deletePromotion = async (id: string) => {
    if (!confirm("Supprimer ce code promo ?")) return
    try {
      const res = await fetch(`/admin/promotions/${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) throw new Error()
      toast.success("Supprime")
      fetchPromotions()
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Code ${code} copie`)
  }

  const formatValue = (p: Promotion) => {
    const m = p.application_method
    if (!m) return "—"
    if (m.type === "percentage") return `-${m.value}%`
    if (m.type === "fixed") return `-${Number(m.value).toFixed(2)} €`
    return `${m.value}`
  }

  const filtered = promotions.filter(p =>
    !search || p.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Toaster />
      <Container className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level="h1">Codes promo</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              {promotions.length} code{promotions.length > 1 ? "s" : ""} actif{promotions.length > 1 ? "s" : ""}
            </Text>
          </div>
          <Button variant="primary" onClick={() => setCreateOpen(!createOpen)}>
            + Nouveau code
          </Button>
        </div>

        {/* Create form */}
        {createOpen && (
          <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-5 mb-6">
            <Heading level="h2" className="text-base mb-4">Nouveau code promo</Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Code *</Text>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={code}
                    onChange={(e: any) => setCode(e.target.value.toUpperCase())}
                    placeholder="GENIUZ10"
                    style={{ fontFamily: "monospace", fontWeight: 600 }}
                  />
                  <Button variant="secondary" size="small" onClick={generateCode}>
                    Generer
                  </Button>
                </div>
              </div>
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Type *</Text>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("percentage")}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg border ${type === "percentage" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-ui-border-base bg-white"}`}
                  >
                    Pourcentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("fixed")}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg border ${type === "fixed" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-ui-border-base bg-white"}`}
                  >
                    Montant fixe
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <Text size="xsmall" weight="plus" className="mb-1 block">
                  {type === "percentage" ? "Reduction (%)" : "Montant (€)"} *
                </Text>
                <Input
                  type="number"
                  value={value}
                  onChange={(e: any) => setValue(e.target.value)}
                  placeholder={type === "percentage" ? "10" : "5"}
                  step={type === "fixed" ? "0.01" : "1"}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="primary" size="small" onClick={createPromotion}>Creer le code</Button>
              <Button variant="secondary" size="small" onClick={() => setCreateOpen(false)}>Annuler</Button>
            </div>
            <Text size="xsmall" className="text-ui-fg-muted mt-3 block">
              💡 Pour plus d'options (date d'expiration, conditions, produits eligibles), utilisez la page native Medusa "Promotions" du menu de gauche.
            </Text>
          </div>
        )}

        {/* Search */}
        {promotions.length > 0 && (
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Rechercher un code..."
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
            <Text className="text-ui-fg-subtle">{search ? "Aucun resultat" : "Aucun code promo"}</Text>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white border border-ui-border-base rounded-xl hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => copyCode(p.code)}
                    className="px-3 py-1.5 bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover rounded-lg font-mono text-sm font-bold border border-ui-border-base"
                    title="Copier"
                  >
                    {p.code}
                  </button>
                  <div className="flex items-center gap-2">
                    <Badge color="blue" size="small">{formatValue(p)}</Badge>
                    {p.is_automatic && <Badge color="purple" size="2xsmall">Auto</Badge>}
                  </div>
                  <Text size="xsmall" className="text-ui-fg-subtle ml-auto mr-4">
                    {new Date(p.created_at).toLocaleDateString("fr-FR")}
                  </Text>
                </div>
                <div className="flex gap-2">
                  <Button size="small" variant="secondary" onClick={() => copyCode(p.code)}>
                    Copier
                  </Button>
                  <Button size="small" variant="danger" onClick={() => deletePromotion(p.id)}>
                    Supprimer
                  </Button>
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
  label: "Codes promo",
  icon: Tag,
})

export default PromotionsPage
