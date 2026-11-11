import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Toaster, toast, Input, Textarea } from "@medusajs/ui"
import { EnvelopeSolid } from "@medusajs/icons"
import { useEffect, useState, useRef } from "react"

type Subscriber = {
  id: string
  email: string
  is_active: boolean
  created_at: string
}

const NewsletterPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [importText, setImportText] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/admin/newsletter?limit=500", { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSubscribers(data.subscribers || [])
      setCount(data.count || 0)
    } catch {
      toast.error("Erreur de chargement des abonnes")
    }
    setLoading(false)
  }

  useEffect(() => { fetchSubscribers() }, [])

  // Filtered list
  const filtered = subscribers.filter(s => {
    if (filter === "active" && !s.is_active) return false
    if (filter === "inactive" && s.is_active) return false
    if (search && !s.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const exportCSV = () => {
    const csv = "Email,Date d'inscription,Statut\n" + filtered.map(s =>
      `${s.email},${new Date(s.created_at).toLocaleDateString("fr-FR")},${s.is_active ? "Actif" : "Desabonne"}`
    ).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `newsletter-geniuz-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filtered.length} emails exportes`)
  }

  const addSubscriber = async () => {
    if (!newEmail.trim()) return
    try {
      const res = await fetch("/admin/newsletter", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur")
      toast.success("Abonne ajoute")
      setNewEmail("")
      setAddOpen(false)
      fetchSubscribers()
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'ajout")
    }
  }

  const importCSV = async () => {
    const emails = importText
      .split(/[\n,;]/)
      .map(e => e.trim())
      .filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

    if (emails.length === 0) {
      toast.error("Aucun email valide trouve")
      return
    }
    try {
      const res = await fetch("/admin/newsletter", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      toast.success(data.message || "Import termine")
      setImportText("")
      setImportOpen(false)
      fetchSubscribers()
    } catch {
      toast.error("Erreur lors de l'import")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImportText(String(ev.target?.result || ""))
    }
    reader.readAsText(file)
  }

  const toggleActive = async (sub: Subscriber) => {
    try {
      const res = await fetch(`/admin/newsletter/${sub.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !sub.is_active }),
      })
      if (!res.ok) throw new Error()
      toast.success(sub.is_active ? "Desabonne" : "Reactive")
      fetchSubscribers()
    } catch {
      toast.error("Erreur")
    }
  }

  const deleteSub = async (id: string) => {
    if (!confirm("Supprimer cet abonne ?")) return
    try {
      const res = await fetch(`/admin/newsletter/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error()
      toast.success("Supprime")
      fetchSubscribers()
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
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(s => s.id)))
  }

  const bulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedIds.size} abonne(s) ?`)) return
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map(id =>
        fetch(`/admin/newsletter/${id}`, { method: "DELETE", credentials: "include" })
      ))
      toast.success(`${ids.length} abonne(s) supprime(s)`)
      setSelectedIds(new Set())
      fetchSubscribers()
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  const activeCount = subscribers.filter(s => s.is_active).length

  return (
    <>
      <Toaster />
      <Container className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level="h1">Newsletter</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              {activeCount} abonné{activeCount > 1 ? "s" : ""} actif{activeCount > 1 ? "s" : ""}
              {count !== activeCount && ` · ${count} total`}
            </Text>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(!importOpen)}>
              Importer CSV
            </Button>
            <Button variant="secondary" onClick={exportCSV} disabled={filtered.length === 0}>
              Exporter
            </Button>
            <Button variant="primary" onClick={() => setAddOpen(!addOpen)}>
              + Ajouter
            </Button>
          </div>
        </div>

        {/* Add subscriber form */}
        {addOpen && (
          <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-4 mb-4">
            <Text size="small" weight="plus" className="mb-2 block">Ajouter un abonné</Text>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemple.fr"
                value={newEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && addSubscriber()}
              />
              <Button variant="primary" size="small" onClick={addSubscriber}>Ajouter</Button>
              <Button variant="secondary" size="small" onClick={() => { setAddOpen(false); setNewEmail("") }}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Import CSV form */}
        {importOpen && (
          <div className="bg-ui-bg-subtle border border-ui-border-base rounded-xl p-4 mb-4">
            <Text size="small" weight="plus" className="mb-2 block">Importer des emails (CSV ou liste)</Text>
            <Text size="xsmall" className="text-ui-fg-subtle mb-3 block">
              Un email par ligne, ou separes par virgule. Les doublons sont ignores automatiquement.
            </Text>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="mb-2 text-xs"
            />
            <Textarea
              value={importText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportText(e.target.value)}
              placeholder="email1@exemple.fr&#10;email2@exemple.fr&#10;..."
              rows={6}
            />
            <div className="flex gap-2 mt-3">
              <Button variant="primary" size="small" onClick={importCSV}>Importer</Button>
              <Button variant="secondary" size="small" onClick={() => { setImportOpen(false); setImportText("") }}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Filters + search */}
        <div className="flex items-center gap-3 mb-4">
          <Input
            type="search"
            placeholder="Rechercher un email..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 text-sm border border-ui-border-base rounded-lg bg-ui-bg-base"
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Desabonnes</option>
          </select>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 mb-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Text size="small" weight="plus" className="text-blue-900">
              {selectedIds.size} abonne(s) selectionne(s)
            </Text>
            <div className="flex gap-2">
              <Button size="small" variant="danger" onClick={bulkDelete}>Supprimer</Button>
              <Button size="small" variant="secondary" onClick={() => setSelectedIds(new Set())}>Annuler</Button>
            </div>
          </div>
        )}

        {loading ? (
          <Text>Chargement...</Text>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Text className="text-ui-fg-subtle">{search ? "Aucun resultat" : "Aucun abonne"}</Text>
          </div>
        ) : (
          <div className="bg-ui-bg-base border border-ui-border-base rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ui-border-base bg-ui-bg-subtle">
                  <th className="text-left px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-ui-fg-subtle">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-ui-fg-subtle">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-ui-fg-subtle">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-ui-fg-subtle">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id} className="border-b border-ui-border-base last:border-0 hover:bg-ui-bg-subtle-hover">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sub.id)}
                        onChange={() => toggleSelect(sub.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">{sub.email}</td>
                    <td className="px-4 py-3 text-ui-fg-subtle">
                      {new Date(sub.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={sub.is_active ? "green" : "grey"} size="2xsmall">
                        {sub.is_active ? "Actif" : "Désabonné"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="small" variant="secondary" onClick={() => toggleActive(sub)}>
                          {sub.is_active ? "Desabonner" : "Reactiver"}
                        </Button>
                        <Button size="small" variant="danger" onClick={() => deleteSub(sub.id)}>
                          Supprimer
                        </Button>
                      </div>
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
  label: "Newsletter",
  icon: EnvelopeSolid,
})

export default NewsletterPage
