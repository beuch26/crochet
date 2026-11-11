import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Input, Textarea, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

const CollectionContentWidget = ({ data }: { data: any }) => {
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [introText, setIntroText] = useState("")
  const [seoText, setSeoText] = useState("")
  const [filters, setFilters] = useState<string[]>(["price"])
  const [filterInput, setFilterInput] = useState("")
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "filters" | "faq">("content")

  const collectionId = data?.id
  const collectionTitle = data?.title || ""
  const collectionHandle = data?.handle || ""

  useEffect(() => {
    if (!collectionId) return
    fetch(`/admin/collections/${collectionId}?fields=+metadata`, { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        const meta = (res.collection?.metadata || {}) as Record<string, string>
        setMetaTitle(meta.meta_title || "")
        setMetaDescription(meta.meta_description || "")
        setIntroText(meta.intro_text || "")
        setSeoText(meta.seo_text || "")
        try { setFilters(JSON.parse(meta.filters || '["price"]')) } catch { setFilters(["price"]) }
        try {
          const parsed = typeof meta.faqs === "string" ? JSON.parse(meta.faqs) : meta.faqs
          if (Array.isArray(parsed)) setFaqs(parsed)
        } catch { setFaqs([]) }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [collectionId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const currentRes = await fetch(`/admin/collections/${collectionId}?fields=+metadata`, { credentials: "include" })
      const currentData = await currentRes.json()
      const existingMeta = (currentData.collection?.metadata || {}) as Record<string, string>

      await fetch(`/admin/collections/${collectionId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...existingMeta,
            meta_title: metaTitle,
            meta_description: metaDescription,
            intro_text: introText,
            seo_text: seoText,
            filters: JSON.stringify(filters),
            faqs: JSON.stringify(faqs.filter(f => f.q.trim() && f.a.trim())),
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

  if (!loaded) {
    return (
      <Container>
        <Heading level="h2">Contenu & SEO</Heading>
        <Text size="small">Chargement...</Text>
      </Container>
    )
  }

  const titleLength = metaTitle.length
  const descLength = metaDescription.length

  return (
    <Container>
      <div style={{ marginBottom: "16px" }}>
        <Heading level="h2">Contenu & SEO</Heading>
        <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
          Textes de contextualisation et référencement
        </Text>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #e5e7eb", marginBottom: "16px" }}>
        <button
          onClick={() => setActiveTab("content")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: activeTab === "content" ? 600 : 400,
            color: activeTab === "content" ? "#2563eb" : "#6b7280",
            borderBottom: activeTab === "content" ? "2px solid #2563eb" : "2px solid transparent",
            background: "none",
            border: "none",
            borderBottomWidth: "2px",
            borderBottomStyle: "solid",
            borderBottomColor: activeTab === "content" ? "#2563eb" : "transparent",
            cursor: "pointer",
          }}
        >
          Contenu
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: activeTab === "seo" ? 600 : 400,
            color: activeTab === "seo" ? "#2563eb" : "#6b7280",
            background: "none",
            border: "none",
            borderBottomWidth: "2px",
            borderBottomStyle: "solid",
            borderBottomColor: activeTab === "seo" ? "#2563eb" : "transparent",
            cursor: "pointer",
          }}
        >
          SEO
        </button>
        <button
          onClick={() => setActiveTab("filters")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: activeTab === "filters" ? 600 : 400,
            color: activeTab === "filters" ? "#2563eb" : "#6b7280",
            background: "none",
            border: "none",
            borderBottomWidth: "2px",
            borderBottomStyle: "solid",
            borderBottomColor: activeTab === "filters" ? "#2563eb" : "transparent",
            cursor: "pointer",
          }}
        >
          Filtres ({filters.length})
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: activeTab === "faq" ? 600 : 400,
            color: activeTab === "faq" ? "#2563eb" : "#6b7280",
            background: "none",
            border: "none",
            borderBottomWidth: "2px",
            borderBottomStyle: "solid",
            borderBottomColor: activeTab === "faq" ? "#2563eb" : "transparent",
            cursor: "pointer",
          }}
        >
          FAQ ({faqs.length})
        </button>
      </div>

      {activeTab === "content" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>
              Texte d'introduction
            </Text>
            <Textarea
              value={introText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setIntroText(e.target.value)}
              placeholder="Texte affiché sous le titre de la collection (ex: Découvrez notre sélection de...)"
              rows={3}
            />
            <Text size="xsmall" style={{ color: "#6b7280", marginTop: "4px" }}>
              Affiché en haut de la page collection, sous le titre
            </Text>
          </div>

          <div>
            <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>
              Texte SEO (bas de page)
            </Text>
            <Textarea
              value={seoText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSeoText(e.target.value)}
              placeholder="Texte riche pour le référencement, affiché en bas de la page collection"
              rows={5}
            />
            <Text size="xsmall" style={{ color: "#6b7280", marginTop: "4px" }}>
              Texte long pour le SEO, affiché après les produits
            </Text>
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Google Preview */}
          <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fafafa" }}>
            <Text size="xsmall" style={{ color: "#6b7280", marginBottom: "8px", display: "block" }}>
              Aperçu Google
            </Text>
            <div>
              <div style={{ color: "#1a0dab", fontSize: "18px", lineHeight: "1.3", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                {(metaTitle || collectionTitle).substring(0, 60) || "Titre"}
              </div>
              <div style={{ color: "#006621", fontSize: "13px", marginBottom: "4px" }}>
                magic-crochet-kit.com &rsaquo; collections &rsaquo; {collectionHandle}
              </div>
              <div style={{ color: "#545454", fontSize: "13px", lineHeight: "1.5" }}>
                {(metaDescription || introText || `Découvrez nos ${collectionTitle.toLowerCase()}`).substring(0, 160)}
              </div>
            </div>
          </div>

          <div>
            <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>
              Meta Title
            </Text>
            <Input
              type="text"
              value={metaTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaTitle(e.target.value)}
              placeholder={collectionTitle || "Titre SEO"}
            />
            <Text size="xsmall" style={{ color: titleLength > 60 ? "#ef4444" : "#6b7280", marginTop: "4px" }}>
              {titleLength}/60 caractères
            </Text>
          </div>

          <div>
            <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>
              Meta Description
            </Text>
            <Textarea
              value={metaDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)}
              placeholder="Description SEO (max 160 caractères)"
              rows={3}
            />
            <Text size="xsmall" style={{ color: descLength > 160 ? "#ef4444" : "#6b7280", marginTop: "4px" }}>
              {descLength}/160 caractères
            </Text>
          </div>
        </div>
      )}

      {activeTab === "filters" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Text size="small" style={{ color: "#6b7280" }}>
            Choisissez les filtres a afficher sur cette page collection.
            Utilisez les noms exacts des options produit (ex: Taille, Couleur, Matiere).
            "price" active le filtre par prix.
          </Text>

          {/* Current filters */}
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "8px" }}>
            {filters.map((f, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  background: f === "price" ? "#dbeafe" : "#f3f4f6",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: f === "price" ? "#1e40af" : "#374151",
                }}
              >
                {f === "price" ? "Prix" : f}
                <button
                  onClick={() => setFilters(filters.filter((_, idx) => idx !== i))}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: "16px",
                    lineHeight: 1,
                    padding: 0,
                  }}
                  title="Supprimer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          {/* Add filter */}
          <div style={{ display: "flex", gap: "8px" }}>
            <Input
              type="text"
              value={filterInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterInput(e.target.value)}
              placeholder="Nom du filtre (ex: Taille, Couleur...)"
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" && filterInput.trim()) {
                  if (!filters.includes(filterInput.trim())) {
                    setFilters([...filters, filterInput.trim()])
                  }
                  setFilterInput("")
                }
              }}
            />
            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                if (filterInput.trim() && !filters.includes(filterInput.trim())) {
                  setFilters([...filters, filterInput.trim()])
                }
                setFilterInput("")
              }}
            >
              Ajouter
            </Button>
          </div>

          {/* Quick add common filters */}
          <div>
            <Text size="xsmall" style={{ color: "#6b7280", marginBottom: "8px", display: "block" }}>
              Filtres courants :
            </Text>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
              {["price", "Taille", "Couleur", "Matiere", "Marque", "Age"].map(f => (
                <button
                  key={f}
                  onClick={() => {
                    if (!filters.includes(f)) setFilters([...filters, f])
                  }}
                  disabled={filters.includes(f)}
                  style={{
                    padding: "4px 12px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    background: filters.includes(f) ? "#f3f4f6" : "white",
                    color: filters.includes(f) ? "#9ca3af" : "#374151",
                    cursor: filters.includes(f) ? "not-allowed" : "pointer",
                  }}
                >
                  + {f === "price" ? "Prix" : f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "faq" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Text size="small" style={{ color: "#6b7280" }}>
            Questions frequentes affichees en bas de la page collection.
            Genere automatiquement le schema FAQPage pour Google.
          </Text>

          {faqs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#9ca3af", border: "1px dashed #e5e7eb", borderRadius: "8px" }}>
              <Text size="small">Aucune FAQ. Cliquez sur "+ Ajouter" pour en creer une.</Text>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", background: "#fafafa" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "8px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Input
                        type="text"
                        value={faq.q}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const updated = [...faqs]
                          updated[i].q = e.target.value
                          setFaqs(updated)
                        }}
                        placeholder="Question..."
                      />
                      <Textarea
                        value={faq.a}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          const updated = [...faqs]
                          updated[i].a = e.target.value
                          setFaqs(updated)
                        }}
                        placeholder="Reponse..."
                        rows={3}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
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

          <Button
            variant="secondary"
            size="small"
            onClick={() => setFaqs([...faqs, { q: "", a: "" }])}
            style={{ alignSelf: "flex-start" }}
          >
            + Ajouter une question
          </Button>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
        <Button variant="primary" size="small" onClick={handleSave} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
        {saved && (
          <Text size="small" style={{ color: "#10b981" }}>&#10003; Enregistré</Text>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_collection.details.after",
})

export default CollectionContentWidget
