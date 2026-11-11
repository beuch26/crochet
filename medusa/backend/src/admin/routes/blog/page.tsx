import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  Switch,
  Drawer,
  Table,
  usePrompt,
  Toaster,
  toast,
} from "@medusajs/ui"
import { DocumentText } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import WysiwygEditor from "../../components/wysiwyg-editor"

// ---------- Types ----------

type BlogPost = {
  id: string
  title: string
  handle: string
  content: string
  excerpt: string | null
  featured_image: string | null
  author: string | null
  published_at: string | null
  is_published: boolean
  seo_title: string | null
  seo_description: string | null
  tags: string[]
  category: string | null
  created_at: string
  updated_at: string
}

type BlogFormData = {
  title: string
  handle: string
  content: string
  excerpt: string
  featured_image: string
  author: string
  is_published: boolean
  seo_title: string
  seo_description: string
  tags: string
  category: string
}

const emptyForm: BlogFormData = {
  title: "",
  handle: "",
  content: "",
  excerpt: "",
  featured_image: "",
  author: "",
  is_published: false,
  seo_title: "",
  seo_description: "",
  tags: "",
  category: "",
}

// ---------- Helpers ----------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// ---------- API ----------

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(errBody.message || `Erreur ${res.status}`)
  }
  return res.json()
}

// ---------- Component ----------

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 20

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<BlogFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const prompt = usePrompt()

  // Bulk actions
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === posts.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(posts.map(p => p.id)))
  }

  const bulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (selectedIds.size === 0) return
    if (action === "delete") {
      const confirmed = await prompt({
        title: "Supprimer les articles",
        description: `Voulez-vous vraiment supprimer ${selectedIds.size} article(s) ? Cette action est irreversible.`,
      })
      if (!confirmed) return
    }
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map(id => {
        if (action === "delete") {
          return apiFetch(`/admin/blog/${id}`, { method: "DELETE" })
        }
        return apiFetch(`/admin/blog/${id}`, {
          method: "POST",
          body: JSON.stringify({
            is_published: action === "publish",
            ...(action === "publish" ? { published_at: new Date().toISOString() } : {}),
          }),
        })
      }))
      toast.success(`${ids.length} article(s) ${action === "delete" ? "supprimes" : action === "publish" ? "publies" : "depublies"}`)
      setSelectedIds(new Set())
      fetchPosts()
    } catch {
      toast.error("Erreur lors de l'operation")
    }
  }

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/admin/blog?limit=${limit}&offset=${offset}`)
      setPosts(data.blog_posts)
      setCount(data.count)
    } catch {
      toast.error("Erreur lors du chargement des articles")
    } finally {
      setLoading(false)
    }
  }, [offset])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Auto-generate handle from title
  const handleTitleChange = (value: string) => {
    const shouldAutoHandle = !editingPost && (form.handle === "" || form.handle === slugify(form.title))
    setForm((prev) => ({
      ...prev,
      title: value,
      ...(shouldAutoHandle ? { handle: slugify(value) } : {}),
    }))
  }

  // Open drawer for create
  const openCreate = () => {
    setEditingPost(null)
    setForm(emptyForm)
    setDrawerOpen(true)
  }

  // Open drawer for edit
  const openEdit = (post: BlogPost) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      handle: post.handle,
      content: post.content,
      excerpt: post.excerpt || "",
      featured_image: post.featured_image || "",
      author: post.author || "",
      is_published: post.is_published,
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      tags: (post.tags || []).join(", "),
      category: post.category || "",
    })
    setDrawerOpen(true)
  }

  // Save (create or update)
  const handleSave = async () => {
    if (!form.title.trim() || !form.handle.trim()) {
      toast.error("Le titre et le handle sont requis")
      return
    }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        handle: form.handle.trim(),
        content: form.content,
        excerpt: form.excerpt || null,
        featured_image: form.featured_image || null,
        author: form.author || null,
        is_published: form.is_published,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        category: form.category || null,
      }

      if (form.is_published && !editingPost?.published_at) {
        body.published_at = new Date().toISOString()
      }

      if (editingPost) {
        await apiFetch(`/admin/blog/${editingPost.id}`, {
          method: "POST",
          body: JSON.stringify(body),
        })
        toast.success("Article mis a jour")
      } else {
        await apiFetch("/admin/blog", {
          method: "POST",
          body: JSON.stringify(body),
        })
        toast.success("Article cree")
      }

      setDrawerOpen(false)
      fetchPosts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const handleDelete = async (post: BlogPost) => {
    const confirmed = await prompt({
      title: "Supprimer l'article",
      description: `Voulez-vous vraiment supprimer "${post.title}" ? Cette action est irreversible.`,
    })

    if (!confirmed) return

    try {
      await apiFetch(`/admin/blog/${post.id}`, { method: "DELETE" })
      toast.success("Article supprime")
      fetchPosts()
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  // Toggle publish
  const togglePublish = async (post: BlogPost) => {
    try {
      const body: Record<string, unknown> = {
        is_published: !post.is_published,
      }
      if (!post.is_published) {
        body.published_at = new Date().toISOString()
      }
      await apiFetch(`/admin/blog/${post.id}`, {
        method: "POST",
        body: JSON.stringify(body),
      })
      toast.success(post.is_published ? "Article depublie" : "Article publie")
      fetchPosts()
    } catch {
      toast.error("Erreur lors de la mise a jour")
    }
  }

  const totalPages = Math.ceil(count / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <>
      <Toaster />
      <Container>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <Heading level="h1">Blog</Heading>
            <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
              Gerez vos articles de blog
            </Text>
          </div>
          <Button variant="primary" onClick={openCreate}>
            Nouvel article
          </Button>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", marginBottom: "12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px" }}>
            <Text size="small" weight="plus" style={{ color: "#1e40af" }}>
              {selectedIds.size} article{selectedIds.size > 1 ? "s" : ""} selectionne{selectedIds.size > 1 ? "s" : ""}
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
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Text style={{ color: "#6b7280" }}>Aucun article pour le moment.</Text>
            <div style={{ marginTop: "16px" }}>
              <Button variant="secondary" onClick={openCreate}>
                Creer votre premier article
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.size === posts.length && posts.length > 0}
                      onChange={selectAll}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ width: "50px" }}>Image</Table.HeaderCell>
                  <Table.HeaderCell>Titre</Table.HeaderCell>
                  <Table.HeaderCell>Categorie</Table.HeaderCell>
                  <Table.HeaderCell>Statut</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell style={{ textAlign: "right" }}>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {posts.map((post) => (
                  <Table.Row key={post.id}>
                    <Table.Cell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(post.id)}
                        onChange={() => toggleSelect(post.id)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      {post.featured_image ? (
                        <img
                          src={post.featured_image.startsWith("http") ? post.featured_image : `https://magic-crochet-kit.com/img/ybc_blog/post/${post.featured_image}`}
                          alt=""
                          style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                        />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", fontSize: "12px" }}>—</div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <Text size="small" weight="plus">{post.title}</Text>
                        <Text size="xsmall" style={{ color: "#9ca3af" }}>/{post.handle}</Text>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{post.category || "-"}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={post.is_published ? "green" : "grey"}
                        size="2xsmall"
                        onClick={() => togglePublish(post)}
                        style={{ cursor: "pointer" }}
                      >
                        {post.is_published ? "Publie" : "Brouillon"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="small">{formatDate(post.published_at || post.created_at)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <Button variant="secondary" size="small" onClick={() => openEdit(post)}>
                          Modifier
                        </Button>
                        <Button variant="danger" size="small" onClick={() => handleDelete(post)}>
                          Supprimer
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <Text size="small" style={{ color: "#6b7280" }}>
                  Page {currentPage} sur {totalPages} ({count} articles)
                </Text>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                  >
                    Precedent
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={offset + limit >= count}
                    onClick={() => setOffset(offset + limit)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Container>

      {/* Create/Edit Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {editingPost ? "Modifier l'article" : "Nouvel article"}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body style={{ display: "flex", flexDirection: "column", gap: "16px", overflow: "auto" }}>
            {/* Title */}
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                placeholder="Titre de l'article"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            {/* Handle */}
            <div>
              <Label htmlFor="handle">Handle (URL) *</Label>
              <Input
                id="handle"
                placeholder="mon-article"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Categorie</Label>
              <Input
                id="category"
                placeholder="Ex: Conseils, Actualites..."
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            {/* Author */}
            <div>
              <Label htmlFor="author">Auteur</Label>
              <Input
                id="author"
                placeholder="Nom de l'auteur"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Extrait</Label>
              <Textarea
                id="excerpt"
                placeholder="Court resume de l'article"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
              />
            </div>

            {/* Content - WYSIWYG */}
            <div>
              <Label htmlFor="content">Contenu</Label>
              <WysiwygEditor
                content={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                placeholder="Rédigez votre article..."
              />
            </div>

            {/* Featured Image */}
            <div>
              <Label htmlFor="featured_image">Image mise en avant</Label>
              {form.featured_image && (
                <div style={{ marginBottom: "8px", position: "relative", display: "inline-block" }}>
                  <img
                    src={form.featured_image.startsWith("http") ? form.featured_image : `https://magic-crochet-kit.com/img/ybc_blog/post/${form.featured_image}`}
                    alt="Preview"
                    style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, featured_image: "" })}
                    style={{
                      position: "absolute", top: "4px", right: "4px", width: "24px", height: "24px",
                      borderRadius: "50%", background: "rgba(0,0,0,0.6)", color: "white", border: "none",
                      cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <Input
                id="featured_image"
                placeholder="URL de l'image ou nom de fichier"
                value={form.featured_image}
                onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
              />
              <Text size="xsmall" style={{ color: "#9ca3af", marginTop: "4px" }}>
                Collez une URL complète (https://...) ou un nom de fichier PrestaShop (ex: blog_post_1.jpg)
              </Text>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (separes par des virgules)</Label>
              <Input
                id="tags"
                placeholder="seo, marketing, e-commerce"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            {/* SEO Title */}
            <div>
              <Label htmlFor="seo_title">Titre SEO</Label>
              <Input
                id="seo_title"
                placeholder="Titre pour les moteurs de recherche"
                value={form.seo_title}
                onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
              />
            </div>

            {/* SEO Description */}
            <div>
              <Label htmlFor="seo_description">Meta description</Label>
              <Textarea
                id="seo_description"
                placeholder="Description pour les moteurs de recherche"
                value={form.seo_description}
                onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Published */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Switch
                id="is_published"
                checked={form.is_published}
                onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
              />
              <Label htmlFor="is_published">Publier l'article</Label>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="secondary">Annuler</Button>
            </Drawer.Close>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement..." : editingPost ? "Mettre a jour" : "Creer"}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Blog",
  icon: DocumentText,
})

export default BlogPage
