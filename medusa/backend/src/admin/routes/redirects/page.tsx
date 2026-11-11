import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Toaster, toast, Input } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Redirect = {
  id: string
  source: string
  target: string
  status_code: number
  is_active: boolean
  hit_count: number
  last_hit_at: string | null
  note: string | null
  created_at: string
}

const ArrowIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

const RedirectsPage = () => {
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, total_hits: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Form
  const [newSource, setNewSource] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newNote, setNewNote] = useState("")
  const [newCode, setNewCode] = useState("301")

  const fetchRedirects = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/admin/redirects?${params}`, { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setRedirects(data.redirects || [])
      setStats(data.stats || { total: 0, active: 0, total_hits: 0 })
    } catch {
      toast.error("Erreur de chargement")
    }
    setLoading(false)
  }

  useEffect(() => { fetchRedirects() }, [search])

  const createRedirect = async () => {
    if (!newSource.trim() || !newTarget.trim()) {
      toast.error("Source et cible requises")
      return
    }
    try {
      const res = await fetch("/admin/redirects", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: newSource.trim(),
          target: newTarget.trim(),
          status_code: Number(newCode),
          note: newNote.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur")
      toast.success("Redirection creee")
      setNewSource("")
      setNewTarget("")
      setNewNote("")
      setCreateOpen(false)
      fetchRedirects()
    } catch (e: any) {
      toast.error(e.message || "Erreur")
    }
  }

  const toggleActive = async (r: Redirect) => {
    try {
      await fetch(`/admin/redirects/${r.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !r.is_active }),
      })
      fetchRedirects()
    } catch {
      toast.error("Erreur")
    }
  }

  const deleteRedirect = async (id: string) => {
    if (!confirm("Supprimer cette redirection ?")) return
    try {
      await fetch(`/admin/redirects/${id}`, { method: "DELETE", credentials: "include" })
      toast.success("Supprimee")
      fetchRedirects()
    } catch {
      toast.error("Erreur")
    }
  }

  const bulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedIds.size} redirection(s) ?`)) return
    try {
      await Promise.all(Array.from(selectedIds).map(id =>
        fetch(`/admin/redirects/${id}`, { method: "DELETE", credentials: "include" })
      ))
      toast.success(`${selectedIds.size} supprimee(s)`)
      setSelectedIds(new Set())
      fetchRedirects()
    } catch {
      toast.error("Erreur")
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === redirects.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(redirects.map(r => r.id)))
  }

  return (
    <>
      <Toaster />
      <Container className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level="h1">Redirections</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              {stats.total} redirection{stats.total > 1 ? "s" : ""} · {stats.active} active{stats.active > 1 ? "s" : ""} · {stats.total_hits.toLocaleString()} hits total
            </Text>
          </div>
          <Button variant="primary" onClick={() => setCreateOpen(!createOpen)}>
            + Nouvelle redirection
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle">Total</Text>
            <Text className="text-2xl font-bold mt-1 block">{stats.total}</Text>
          </div>
          <div className="p-4 rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle">Actives</Text>
            <Text className="text-2xl font-bold mt-1 text-green-600 block">{stats.active}</Text>
          </div>
          <div className="p-4 rounded-xl border border-ui-border-base">
            <Text size="xsmall" className="text-ui-fg-subtle">Hits totaux</Text>
            <Text className="text-2xl font-bold mt-1 text-blue-600 block">{stats.total_hits.toLocaleString()}</Text>
          </div>
        </div>

        {/* Create form */}
        {createOpen && (
          <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-5 mb-6">
            <Heading level="h2" className="text-base mb-4">Nouvelle redirection</Heading>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Source (ancienne URL)</Text>
                <Input
                  type="text"
                  value={newSource}
                  onChange={(e: any) => setNewSource(e.target.value)}
                  placeholder="/fr/ancien-produit-123.html"
                  style={{ fontFamily: "monospace", fontSize: "12px" }}
                />
              </div>
              <div className="pb-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Cible (nouvelle URL)</Text>
                <Input
                  type="text"
                  value={newTarget}
                  onChange={(e: any) => setNewTarget(e.target.value)}
                  placeholder="/products/nouveau-produit"
                  style={{ fontFamily: "monospace", fontSize: "12px" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Code HTTP</Text>
                <select
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-ui-border-base rounded-lg bg-ui-bg-base"
                >
                  <option value="301">301 — Permanente (SEO)</option>
                  <option value="302">302 — Temporaire</option>
                </select>
              </div>
              <div>
                <Text size="xsmall" weight="plus" className="mb-1 block">Note (optionnel)</Text>
                <Input
                  type="text"
                  value={newNote}
                  onChange={(e: any) => setNewNote(e.target.value)}
                  placeholder="Migration PrestaShop"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="primary" size="small" onClick={createRedirect}>Creer</Button>
              <Button variant="secondary" size="small" onClick={() => setCreateOpen(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <Input
            type="search"
            placeholder="Rechercher par URL source ou cible..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 mb-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Text size="small" weight="plus" className="text-blue-900">
              {selectedIds.size} selectionee(s)
            </Text>
            <div className="flex gap-2">
              <Button size="small" variant="danger" onClick={bulkDelete}>Supprimer</Button>
              <Button size="small" variant="secondary" onClick={() => setSelectedIds(new Set())}>Annuler</Button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <Text>Chargement...</Text>
        ) : redirects.length === 0 ? (
          <div className="text-center py-16">
            <Text className="text-ui-fg-subtle">{search ? "Aucun resultat" : "Aucune redirection"}</Text>
          </div>
        ) : (
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border-base bg-ui-bg-subtle">
                  <th className="text-left px-3 py-2.5 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === redirects.length && redirects.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-3 py-2.5 font-medium text-ui-fg-subtle">Source</th>
                  <th className="text-left px-3 py-2.5 font-medium text-ui-fg-subtle w-8"></th>
                  <th className="text-left px-3 py-2.5 font-medium text-ui-fg-subtle">Cible</th>
                  <th className="text-center px-3 py-2.5 font-medium text-ui-fg-subtle w-16">Code</th>
                  <th className="text-center px-3 py-2.5 font-medium text-ui-fg-subtle w-16">Hits</th>
                  <th className="text-left px-3 py-2.5 font-medium text-ui-fg-subtle w-24">Statut</th>
                  <th className="text-right px-3 py-2.5 font-medium text-ui-fg-subtle w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((r) => (
                  <tr key={r.id} className="border-b border-ui-border-base last:border-0 hover:bg-ui-bg-subtle-hover">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 break-all">{r.source}</code>
                      {r.note && <div className="text-[10px] text-ui-fg-muted mt-0.5">{r.note}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-300">→</td>
                    <td className="px-3 py-2.5">
                      <code className="text-xs bg-green-50 px-1.5 py-0.5 rounded text-green-700 break-all">{r.target}</code>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge color={r.status_code === 301 ? "green" : "blue"} size="2xsmall">
                        {r.status_code}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="text-xs text-ui-fg-subtle">{r.hit_count}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        color={r.is_active ? "green" : "grey"}
                        size="2xsmall"
                        onClick={() => toggleActive(r)}
                        style={{ cursor: "pointer" }}
                      >
                        {r.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button size="small" variant="danger" onClick={() => deleteRedirect(r.id)}>
                        Suppr.
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Redirections",
  icon: ArrowIcon,
})

export default RedirectsPage
