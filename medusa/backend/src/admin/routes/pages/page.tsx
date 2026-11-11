import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Badge,
  Table,
  Switch,
  Toaster,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import WysiwygEditor from "../../components/wysiwyg-editor"

type PageData = {
  id: string
  title: string
  handle: string
  content: string
  seo_title: string | null
  seo_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

const PagesPage = () => {
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PageData | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formTitle, setFormTitle] = useState("")
  const [formHandle, setFormHandle] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formSeoTitle, setFormSeoTitle] = useState("")
  const [formSeoDesc, setFormSeoDesc] = useState("")
  const [formPublished, setFormPublished] = useState(true)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchPages = () => {
    fetch("/admin/pages", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load pages")
        return r.json()
      })
      .then((data) => {
        setPages(data.pages || [])
        setLoading(false)
      })
      .catch((e) => {
        toast.error("Erreur de chargement des pages")
        setLoading(false)
      })
  }

  useEffect(() => { fetchPages() }, [])

  const resetForm = () => {
    setFormTitle("")
    setFormHandle("")
    setFormContent("")
    setFormSeoTitle("")
    setFormSeoDesc("")
    setFormPublished(true)
  }

  const openEdit = (page: PageData) => {
    setEditing(page)
    setCreating(false)
    setFormTitle(page.title)
    setFormHandle(page.handle)
    setFormContent(page.content || "")
    setFormSeoTitle(page.seo_title || "")
    setFormSeoDesc(page.seo_description || "")
    setFormPublished(page.is_published)
  }

  const openCreate = () => {
    setEditing(null)
    setCreating(true)
    resetForm()
  }

  const handleSave = async () => {
    setSaving(true)
    const body = {
      title: formTitle,
      handle: formHandle,
      content: formContent,
      seo_title: formSeoTitle || null,
      seo_description: formSeoDesc || null,
      is_published: formPublished,
    }

    try {
      const res = editing
        ? await fetch(`/admin/pages/${editing.handle}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/admin/pages", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
      if (!res.ok) throw new Error("Save failed")
      toast.success(editing ? "Page mise a jour" : "Page creee")
      setEditing(null)
      setCreating(false)
      resetForm()
      fetchPages()
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement")
    }
    setSaving(false)
  }

  const handleDelete = async (handle: string) => {
    if (!confirm("Supprimer cette page ?")) return
    try {
      const res = await fetch(`/admin/pages/${handle}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error()
      toast.success("Page supprimee")
      fetchPages()
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  // Bulk actions
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === pages.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(pages.map(p => p.handle)))
  }

  const bulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (selectedIds.size === 0) return
    if (action === "delete" && !confirm(`Supprimer ${selectedIds.size} page(s) ?`)) return

    const handles = Array.from(selectedIds)
    try {
      await Promise.all(handles.map(h => {
        if (action === "delete") {
          return fetch(`/admin/pages/${h}`, { method: "DELETE", credentials: "include" })
        }
        return fetch(`/admin/pages/${h}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_published: action === "publish" }),
        })
      }))
      toast.success(`${handles.length} page(s) ${action === "delete" ? "supprimees" : action === "publish" ? "publiees" : "depubliees"}`)
      setSelectedIds(new Set())
      fetchPages()
    } catch {
      toast.error("Erreur lors de l'operation")
    }
  }

  const generateHandle = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  // Editor view
  if (editing || creating) {
    return (
      <Container>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <Heading level="h1">{editing ? "Modifier la page" : "Nouvelle page"}</Heading>
            <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
              {editing ? editing.handle : "Créer une page de contenu"}
            </Text>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="secondary" size="small" onClick={() => { setEditing(null); setCreating(false); resetForm() }}>
              Annuler
            </Button>
            <Button variant="primary" size="small" onClick={handleSave} disabled={saving || !formTitle || !formHandle}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Container>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>Titre</Text>
                  <Input
                    type="text"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value)
                      if (creating) setFormHandle(generateHandle(e.target.value))
                    }}
                    placeholder="Titre de la page"
                  />
                </div>

                <div>
                  <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>Handle (URL)</Text>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Text size="small" style={{ color: "#6b7280" }}>magic-crochet-kit.com/</Text>
                    <Input
                      type="text"
                      value={formHandle}
                      onChange={(e) => setFormHandle(e.target.value)}
                      placeholder="handle-de-la-page"
                    />
                  </div>
                </div>
              </div>
            </Container>

            <Container>
              <Text size="small" weight="plus" style={{ marginBottom: "6px", display: "block" }}>Contenu</Text>
              <WysiwygEditor
                content={formContent}
                onChange={(html) => setFormContent(html)}
                placeholder="Rédigez le contenu de la page..."
              />
            </Container>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Container>
              <Heading level="h2">Publication</Heading>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Text size="small">Publié</Text>
                <Switch
                  checked={formPublished}
                  onCheckedChange={setFormPublished}
                />
              </div>
            </Container>

            <Container>
              <Heading level="h2">SEO</Heading>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                <div>
                  <Text size="xsmall" weight="plus" style={{ marginBottom: "4px", display: "block" }}>Meta Title</Text>
                  <Input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder={formTitle || "Titre SEO"}
                  />
                  <Text size="xsmall" style={{ color: formSeoTitle.length > 60 ? "#ef4444" : "#6b7280", marginTop: "2px" }}>
                    {formSeoTitle.length}/60
                  </Text>
                </div>
                <div>
                  <Text size="xsmall" weight="plus" style={{ marginBottom: "4px", display: "block" }}>Meta Description</Text>
                  <Textarea
                    value={formSeoDesc}
                    onChange={(e) => setFormSeoDesc(e.target.value)}
                    placeholder="Description SEO (max 160 caractères)"
                    rows={3}
                  />
                  <Text size="xsmall" style={{ color: formSeoDesc.length > 160 ? "#ef4444" : "#6b7280", marginTop: "2px" }}>
                    {formSeoDesc.length}/160
                  </Text>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </Container>
    )
  }

  // List view
  return (
    <>
      <Toaster />
      <Container>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <Heading level="h1">Pages</Heading>
            <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
              {pages.length} page{pages.length > 1 ? "s" : ""} — CGV, mentions légales, FAQ, etc.
            </Text>
          </div>
          <Button variant="primary" size="small" onClick={openCreate}>
            + Nouvelle page
          </Button>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", marginBottom: "12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px" }}>
            <Text size="small" weight="plus" style={{ color: "#1e40af" }}>
              {selectedIds.size} page{selectedIds.size > 1 ? "s" : ""} selectionnee{selectedIds.size > 1 ? "s" : ""}
            </Text>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="small" variant="primary" onClick={() => bulkAction("publish")}>Publier</Button>
              <Button size="small" variant="secondary" onClick={() => bulkAction("unpublish")}>Depublier</Button>
              <Button size="small" variant="danger" onClick={() => bulkAction("delete")}>Supprimer</Button>
              <Button size="small" variant="secondary" onClick={() => setSelectedIds(new Set())}>Annuler</Button>
            </div>
          </div>
        )}

        {loading ? (
          <Text>Chargement...</Text>
        ) : pages.length === 0 ? (
          <Container>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Text style={{ color: "#6b7280", marginBottom: "16px" }}>Aucune page créée</Text>
              <Button variant="primary" size="small" onClick={openCreate}>
                Créer la première page
              </Button>
            </div>
          </Container>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === pages.length && pages.length > 0}
                    onChange={selectAll}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>Titre</Table.HeaderCell>
                <Table.HeaderCell>URL</Table.HeaderCell>
                <Table.HeaderCell>Statut</Table.HeaderCell>
                <Table.HeaderCell>Modifié</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {pages.map((page) => (
                <Table.Row key={page.id}>
                  <Table.Cell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(page.handle)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(page.handle)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                  </Table.Cell>
                  <Table.Cell style={{ cursor: "pointer" }} onClick={() => openEdit(page)}>
                    <Text size="small" weight="plus">{page.title}</Text>
                  </Table.Cell>
                  <Table.Cell style={{ cursor: "pointer" }} onClick={() => openEdit(page)}>
                    <Text size="xsmall" style={{ color: "#6b7280" }}>/{page.handle}</Text>
                  </Table.Cell>
                  <Table.Cell style={{ cursor: "pointer" }} onClick={() => openEdit(page)}>
                    <Badge color={page.is_published ? "green" : "grey"} size="2xsmall">
                      {page.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell style={{ cursor: "pointer" }} onClick={() => openEdit(page)}>
                    <Text size="xsmall" style={{ color: "#6b7280" }}>
                      {new Date(page.updated_at).toLocaleDateString("fr-FR")}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleDelete(page.handle) }}
                    >
                      Supprimer
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Pages",
  icon: DocumentText,
})

export default PagesPage
