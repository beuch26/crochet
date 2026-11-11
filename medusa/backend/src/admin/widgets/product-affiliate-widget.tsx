import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Input, Button, Switch, Label } from "@medusajs/ui"
import { useEffect, useState } from "react"

const ProductAffiliateWidget = ({ data }: { data: any }) => {
  const [enabled, setEnabled] = useState(false)
  const [url, setUrl] = useState("")
  const [label, setLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const productId = data?.id

  useEffect(() => {
    if (!productId) return
    fetch(`/admin/products/${productId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        const meta = (res.product?.metadata || {}) as Record<string, string>
        setEnabled(meta.affiliate_enabled === "true")
        setUrl(meta.affiliate_url || "")
        setLabel(meta.affiliate_label || "")
      })
      .catch(() => {})
  }, [productId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const currentRes = await fetch(`/admin/products/${productId}`, { credentials: "include" })
      const currentData = await currentRes.json()
      const existingMeta = (currentData.product?.metadata || {}) as Record<string, string>

      await fetch(`/admin/products/${productId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...existingMeta,
            affiliate_enabled: String(enabled),
            affiliate_url: url,
            affiliate_label: label || "Voir sur le site partenaire",
          },
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error("Failed to save:", e)
    }
    setSaving(false)
  }

  return (
    <Container>
      <div style={{ marginBottom: "16px" }}>
        <Heading level="h2">Mode affiliation</Heading>
        <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
          Redirige vers un site partenaire au lieu d'ajouter au panier
        </Text>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Enable toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Label>
            {enabled ? "Affiliation activee" : "Affiliation desactivee"}
          </Label>
        </div>

        {enabled && (
          <>
            <div>
              <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>
                Lien d'affiliation *
              </Text>
              <Input
                type="url"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                placeholder="https://www.amazon.fr/dp/XXXXXX?tag=geniuz-21"
              />
              <Text size="xsmall" style={{ color: "#6b7280", marginTop: "4px" }}>
                URL complete avec votre tag d'affiliation
              </Text>
            </div>

            <div>
              <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>
                Texte du bouton
              </Text>
              <Input
                type="text"
                value={label}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
                placeholder="Voir sur le site partenaire"
              />
              <Text size="xsmall" style={{ color: "#6b7280", marginTop: "4px" }}>
                Texte affiche sur le bouton CTA (defaut: "Voir sur le site partenaire")
              </Text>
            </div>

            {url && (
              <div style={{ padding: "12px", borderRadius: "8px", background: "#fef3c7", border: "1px solid #fde68a" }}>
                <Text size="small" style={{ color: "#92400e" }}>
                  Le bouton "Ajouter au panier" sera remplace par un lien vers : {url.substring(0, 60)}{url.length > 60 ? "..." : ""}
                </Text>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
        <Button variant="primary" size="small" onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
        {saved && (
          <Text size="small" style={{ color: "#10b981" }}>&#10003; Enregistre</Text>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductAffiliateWidget
