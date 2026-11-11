import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Input, Textarea, Button } from "@medusajs/ui"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useEffect, useState } from "react"

type FaqItem = { q: string; a: string }

const ProductFaqWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const meta = (data.metadata || {}) as Record<string, any>
    try {
      const parsed = typeof meta.faqs === "string" ? JSON.parse(meta.faqs) : meta.faqs
      if (Array.isArray(parsed)) setFaqs(parsed)
    } catch {
      setFaqs([])
    }
  }, [data])

  const addFaq = () => setFaqs([...faqs, { q: "", a: "" }])

  const updateFaq = (index: number, field: "q" | "a", value: string) => {
    const updated = [...faqs]
    updated[index][field] = value
    setFaqs(updated)
  }

  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index))

  const handleSave = async () => {
    setSaving(true)
    try {
      const existingMeta = (data.metadata || {}) as Record<string, any>
      const validFaqs = faqs.filter((f) => f.q.trim() && f.a.trim())
      await fetch(`/admin/products/${data.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { ...existingMeta, faqs: JSON.stringify(validFaqs) },
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error("Failed to save FAQs:", e)
    }
    setSaving(false)
  }

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <Heading level="h2">FAQ Produit</Heading>
          <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
            {faqs.length} question{faqs.length > 1 ? "s" : ""} — affichées sur la fiche produit
          </Text>
        </div>
        <Button variant="secondary" size="small" onClick={addFaq}>
          + Ajouter
        </Button>
      </div>

      {faqs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px", color: "#9ca3af", border: "1px dashed #e5e7eb", borderRadius: "8px" }}>
          <Text size="small">Aucune FAQ. Cliquez sur "+ Ajouter" pour en créer une.</Text>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#fafafa" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Input
                    type="text"
                    value={faq.q}
                    onChange={(e) => updateFaq(i, "q", e.target.value)}
                    placeholder="Question..."
                  />
                  <Textarea
                    value={faq.a}
                    onChange={(e) => updateFaq(i, "a", e.target.value)}
                    placeholder="Réponse..."
                    rows={2}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFaq(i)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", color: "#ef4444",
                    fontSize: "18px", padding: "4px", lineHeight: 1,
                  }}
                  title="Supprimer"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
        <Button variant="primary" size="small" onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer les FAQ"}
        </Button>
        {saved && <Text size="small" style={{ color: "#10b981" }}>&#10003; Enregistré</Text>}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductFaqWidget
