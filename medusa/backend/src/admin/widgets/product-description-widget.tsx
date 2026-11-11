import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button } from "@medusajs/ui"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useState } from "react"
import WysiwygEditor from "../components/wysiwyg-editor"

const ProductDescriptionWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [content, setContent] = useState(data.description || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/admin/products/${data.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: content }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error("Failed to save description:", e)
    }
    setSaving(false)
  }

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <Heading level="h2">Description (éditeur visuel)</Heading>
          <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
            Mise en forme riche de la description produit
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {saved && <Text size="small" style={{ color: "#10b981" }}>&#10003; Enregistré</Text>}
          <Button variant="primary" size="small" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "Enregistrer"}
          </Button>
        </div>
      </div>
      <WysiwygEditor
        content={content}
        onChange={setContent}
        placeholder="Décrivez votre produit..."
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default ProductDescriptionWidget
