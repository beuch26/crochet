import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Input, Textarea, Button } from "@medusajs/ui"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { useEffect, useState } from "react"

const ProductSeoWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const meta = (data.metadata || {}) as Record<string, string>
    setMetaTitle(meta.meta_title || "")
    setMetaDescription(meta.meta_description || "")
  }, [data])

  const handleSave = async () => {
    setSaving(true)
    try {
      const existingMeta = (data.metadata || {}) as Record<string, string>
      await fetch(`/admin/products/${data.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...existingMeta,
            meta_title: metaTitle,
            meta_description: metaDescription,
          },
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error("Failed to save SEO metadata:", e)
    }
    setSaving(false)
  }

  const titleLength = metaTitle.length
  const descLength = metaDescription.length
  const previewTitle = metaTitle || data.title || ""
  const previewDesc = metaDescription || (data.description || "").replace(/<[^>]*>/g, "").substring(0, 160)

  return (
    <Container>
      <div style={{ marginBottom: "16px" }}>
        <Heading level="h2">SEO</Heading>
        <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
          Optimisez le référencement de ce produit
        </Text>
      </div>

      {/* Google Preview */}
      <div style={{ marginBottom: "20px", padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fafafa" }}>
        <Text size="xsmall" style={{ color: "#6b7280", marginBottom: "8px", display: "block" }}>
          Aperçu Google
        </Text>
        <div>
          <div style={{ color: "#1a0dab", fontSize: "18px", lineHeight: "1.3", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {previewTitle.substring(0, 60) || "Titre du produit"}
          </div>
          <div style={{ color: "#006621", fontSize: "13px", marginBottom: "4px" }}>
            magic-crochet-kit.com › products › {data.handle}
          </div>
          <div style={{ color: "#545454", fontSize: "13px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {previewDesc.substring(0, 160) || "Description du produit..."}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>
            Meta Title
          </Text>
          <Input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder={data.title || "Titre SEO du produit"}
          />
          <Text size="xsmall" style={{ color: titleLength > 60 ? "#ef4444" : "#6b7280", marginTop: "4px" }}>
            {titleLength}/60 caractères {titleLength > 60 ? "(trop long)" : ""}
          </Text>
        </div>

        <div>
          <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>
            Meta Description
          </Text>
          <Textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Description SEO du produit (max 160 caractères)"
            rows={3}
          />
          <Text size="xsmall" style={{ color: descLength > 160 ? "#ef4444" : "#6b7280", marginTop: "4px" }}>
            {descLength}/160 caractères {descLength > 160 ? "(trop long)" : ""}
          </Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button
            variant="primary"
            size="small"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer le SEO"}
          </Button>
          {saved && (
            <Text size="small" style={{ color: "#10b981" }}>
              ✓ Enregistré
            </Text>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.after",
})

export default ProductSeoWidget
