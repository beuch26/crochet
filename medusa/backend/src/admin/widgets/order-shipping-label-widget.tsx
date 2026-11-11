import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Toaster, toast, Badge } from "@medusajs/ui"
import { useState } from "react"

type Service = {
  id: string
  name: string
  carrier: string
  logo: string | null
  price: number
  delivery_days: number | null
}

type LabelResult = {
  shipment_id: string
  tracking_number: string | null
  tracking_url: string | null
  label_url: string | null
  carrier: string | null
}

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100)

const ShippingLabelWidget = ({ data }: { data: any }) => {
  const orderId = data?.id
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<LabelResult | null>(null)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/shipping-label", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur")
      setServices(data.services || [])
      if (data.services?.length > 0) setSelectedService(data.services[0].id)
    } catch (e: any) {
      toast.error(e.message || "Erreur de chargement des transporteurs")
    }
    setLoading(false)
  }

  const createLabel = async () => {
    if (!selectedService) return
    setCreating(true)
    try {
      const res = await fetch("/admin/shipping-label", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, service_id: selectedService }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur")
      setResult(data)
      toast.success("Etiquette generee !")
    } catch (e: any) {
      toast.error(e.message || "Erreur de generation")
    }
    setCreating(false)
  }

  return (
    <>
      <Toaster />
      <Container>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Heading level="h2">Etiquette d'expedition</Heading>
            <Text size="small" className="text-ui-fg-subtle">Packlink PRO — generer et imprimer</Text>
          </div>
          {!result && services.length === 0 && (
            <Button variant="secondary" size="small" onClick={fetchServices} disabled={loading}>
              {loading ? "Chargement..." : "Calculer les tarifs"}
            </Button>
          )}
        </div>

        {/* Result: label generated */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <Text size="small" weight="plus" className="text-green-900">Etiquette generee avec succes</Text>
            </div>
            {result.tracking_number && (
              <div>
                <Text size="xsmall" className="text-ui-fg-subtle">Numero de suivi</Text>
                <Text className="font-mono text-sm">{result.tracking_number}</Text>
              </div>
            )}
            {result.carrier && <Badge color="green">{result.carrier}</Badge>}
            <div className="flex gap-2 pt-2">
              {result.label_url && (
                <a
                  href={result.label_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  📄 Telecharger l'etiquette PDF
                </a>
              )}
              {result.tracking_url && (
                <a
                  href={result.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-ui-border-base text-sm font-semibold rounded-lg hover:bg-ui-bg-subtle transition-colors"
                >
                  Suivre le colis
                </a>
              )}
            </div>
          </div>
        )}

        {/* Services list */}
        {!result && services.length > 0 && (
          <div className="space-y-3">
            <Text size="small" weight="plus">Choisir un transporteur</Text>
            <div className="space-y-2">
              {services.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedService === s.id ? "border-blue-500 bg-blue-50" : "border-ui-border-base hover:bg-ui-bg-subtle"
                  }`}
                >
                  <input
                    type="radio"
                    name="service"
                    checked={selectedService === s.id}
                    onChange={() => setSelectedService(s.id)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {s.logo && <img src={s.logo} alt={s.carrier} className="h-6 max-w-16 object-contain" />}
                  <div className="flex-1 min-w-0">
                    <Text size="small" weight="plus">{s.carrier}</Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {s.name}
                      {s.delivery_days && ` · ${s.delivery_days}j`}
                    </Text>
                  </div>
                  <Text size="small" weight="plus">{formatPrice(s.price)}</Text>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="primary" size="small" onClick={createLabel} disabled={creating || !selectedService}>
                {creating ? "Generation..." : "Generer l'etiquette"}
              </Button>
              <Button variant="secondary" size="small" onClick={() => setServices([])}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && services.length === 0 && !loading && (
          <Text size="small" className="text-ui-fg-subtle">
            Cliquez sur "Calculer les tarifs" pour voir les transporteurs disponibles et generer une etiquette d'expedition.
          </Text>
        )}
      </Container>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default ShippingLabelWidget
