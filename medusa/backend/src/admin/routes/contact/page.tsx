import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button, Toaster, toast, Textarea, Input } from "@medusajs/ui"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { useEffect, useState } from "react"

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  customer_id: string | null
  admin_reply: string | null
  replied_at: string | null
  created_at: string
}

const ContactPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [history, setHistory] = useState<ContactMessage[]>([])
  const [replyText, setReplyText] = useState("")
  const [replying, setReplying] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [templates, setTemplates] = useState<{ name: string; content: string }[]>([])
  const [templateOpen, setTemplateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateContent, setNewTemplateContent] = useState("")

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("geniuz_contact_templates")
      if (saved) {
        setTemplates(JSON.parse(saved))
      } else {
        // Default templates
        const defaults = [
          { name: "Confirmation reception", content: "Bonjour {{name}},\n\nNous avons bien recu votre message et notre equipe l'examine avec attention.\n\nVous recevrez une reponse detaillee sous 24 a 48 heures ouvrees.\n\nCordialement,\nL'equipe Magic Crochet Kit" },
          { name: "Suivi commande", content: "Bonjour {{name}},\n\nVotre commande est actuellement en cours de preparation. Vous recevrez un email de suivi des qu'elle sera expediee.\n\nN'hesitez pas a revenir vers nous si besoin.\n\nCordialement,\nL'equipe Magic Crochet Kit" },
          { name: "Retour produit", content: "Bonjour {{name}},\n\nNous sommes desoles pour ce desagrement. Vous pouvez retourner le produit dans les 30 jours suivant la reception.\n\nVoici la procedure :\n1. Emballez le produit dans son emballage d'origine\n2. Joignez votre numero de commande\n3. Envoyez a : 6 Rue d'Armaille, 75017 Paris\n\nLe remboursement sera effectue sous 5-7 jours apres reception.\n\nCordialement,\nL'equipe Magic Crochet Kit" },
        ]
        setTemplates(defaults)
        localStorage.setItem("geniuz_contact_templates", JSON.stringify(defaults))
      }
    } catch {}
  }, [])

  const saveTemplates = (next: { name: string; content: string }[]) => {
    setTemplates(next)
    localStorage.setItem("geniuz_contact_templates", JSON.stringify(next))
  }

  const insertTemplate = (template: { name: string; content: string }) => {
    let content = template.content
    if (selected) {
      content = content.replace(/\{\{name\}\}/g, selected.name).replace(/\{\{email\}\}/g, selected.email)
    }
    setReplyText(content)
    setTemplateOpen(false)
  }

  const addTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return
    saveTemplates([...templates, { name: newTemplateName, content: newTemplateContent }])
    setNewTemplateName("")
    setNewTemplateContent("")
    setEditingTemplate(false)
    toast.success("Template enregistre")
  }

  const deleteTemplate = (idx: number) => {
    if (!confirm("Supprimer ce template ?")) return
    saveTemplates(templates.filter((_, i) => i !== idx))
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch("/admin/contact?limit=100", { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(data.contact_messages || [])
      setCount(data.count || 0)
    } catch {
      toast.error("Erreur lors du chargement des messages")
    }
    setLoading(false)
  }

  // Bulk actions
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAll = () => {
    if (selectedIds.size === messages.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(messages.map(m => m.id)))
  }

  const bulkAction = async (action: "read" | "delete") => {
    if (selectedIds.size === 0) return
    if (action === "delete" && !confirm(`Supprimer ${selectedIds.size} message(s) ?`)) return
    const ids = Array.from(selectedIds)
    try {
      await Promise.all(ids.map(id => {
        if (action === "delete") {
          return fetch(`/admin/contact/${id}`, { method: "DELETE", credentials: "include" })
        }
        return fetch(`/admin/contact/${id}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_read: true }),
        })
      }))
      toast.success(`${ids.length} message(s) ${action === "delete" ? "supprimes" : "marques comme lus"}`)
      setSelectedIds(new Set())
      if (action === "delete" && selected && ids.includes(selected.id)) setSelected(null)
      fetchMessages()
    } catch {
      toast.error("Erreur lors de l'operation")
    }
  }

  // Load history of all messages from same email
  const loadHistory = async (email: string) => {
    try {
      const res = await fetch(`/admin/contact?email=${encodeURIComponent(email)}&limit=20`, { credentials: "include" })
      const data = await res.json()
      setHistory(data.contact_messages || [])
    } catch {
      setHistory([])
    }
  }

  useEffect(() => { fetchMessages() }, [])
  useEffect(() => {
    if (selected?.email) loadHistory(selected.email)
  }, [selected?.id])

  const markAsRead = async (id: string) => {
    await fetch(`/admin/contact/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_read: true }),
    })
    fetchMessages()
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return
    await fetch(`/admin/contact/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    toast.success("Message supprimé")
    setSelected(null)
    fetchMessages()
  }

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return
    setReplying(true)
    try {
      await fetch(`/admin/contact/${selected.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_reply: replyText, replied_by: "Admin" }),
      })
      toast.success("Réponse envoyée par email")
      setReplyText("")
      fetchMessages()
      // Refresh selected
      const fresh = await fetch(`/admin/contact?email=${encodeURIComponent(selected.email)}`, { credentials: "include" })
      const data = await fresh.json()
      const updated = (data.contact_messages || []).find((m: ContactMessage) => m.id === selected.id)
      if (updated) setSelected(updated)
      loadHistory(selected.email)
    } catch {
      toast.error("Erreur lors de l'envoi")
    }
    setReplying(false)
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  if (loading) {
    return <Container className="p-8"><Text>Chargement...</Text></Container>
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <>
      <Toaster />
      <Container className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level="h1">Messages de contact</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              {count} message{count > 1 ? "s" : ""} — {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
            </Text>
          </div>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-3 mb-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Text size="small" weight="plus" className="text-blue-900">
              {selectedIds.size} message{selectedIds.size > 1 ? "s" : ""} selectionne{selectedIds.size > 1 ? "s" : ""}
            </Text>
            <div className="flex gap-2">
              <Button size="small" variant="secondary" onClick={() => bulkAction("read")}>Marquer comme lus</Button>
              <Button size="small" variant="danger" onClick={() => bulkAction("delete")}>Supprimer</Button>
              <Button size="small" variant="secondary" onClick={() => setSelectedIds(new Set())}>Annuler</Button>
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={selectedIds.size === messages.length && messages.length > 0}
              onChange={selectAll}
              className="w-4 h-4 cursor-pointer"
            />
            <Text size="xsmall" className="text-ui-fg-subtle">Tout selectionner</Text>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-16">
            <Text className="text-ui-fg-subtle">Aucun message reçu</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Message list */}
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => { setSelected(msg); if (!msg.is_read) markAsRead(msg.id) }}
                  className={`flex items-start gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                    selected?.id === msg.id
                      ? "border-ui-border-interactive bg-ui-bg-interactive/5"
                      : msg.is_read
                        ? "border-ui-border-base hover:bg-ui-bg-subtle"
                        : "border-ui-border-base bg-ui-bg-subtle-hover"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(msg.id)}
                    onClick={(e) => toggleSelect(msg.id, e)}
                    onChange={() => {}}
                    className="w-4 h-4 cursor-pointer mt-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${msg.is_read ? "" : "font-semibold"}`}>{msg.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {msg.admin_reply && <Badge color="green" size="2xsmall">Répondu</Badge>}
                        {!msg.is_read && <Badge color="blue" size="2xsmall">Nouveau</Badge>}
                      </div>
                    </div>
                    <Text className="text-ui-fg-subtle text-xs mt-0.5 truncate">{msg.email}</Text>
                    <Text className="text-ui-fg-muted text-xs mt-1 line-clamp-2">{msg.message}</Text>
                    <Text className="text-ui-fg-disabled text-[10px] mt-1">
                      {formatDate(msg.created_at)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>

            {/* Message detail */}
            {selected ? (
              <div className="space-y-4">
                {/* Customer card */}
                <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-ui-bg-interactive/10 flex items-center justify-center text-ui-fg-interactive font-semibold text-lg">
                        {selected.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Heading level="h2" className="text-base">{selected.name}</Heading>
                        <Text className="text-ui-fg-subtle text-sm">{selected.email}</Text>
                        {selected.customer_id && (
                          <a
                            href={`/app/customers/${selected.customer_id}`}
                            className="text-xs text-ui-fg-interactive hover:underline mt-1 inline-flex items-center gap-1"
                          >
                            Voir la fiche client →
                          </a>
                        )}
                      </div>
                    </div>
                    <Button variant="danger" size="small" onClick={() => deleteMessage(selected.id)}>
                      Supprimer
                    </Button>
                  </div>
                  {history.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-ui-border-base">
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        📜 {history.length} message{history.length > 1 ? "s" : ""} dans l'historique de ce client
                      </Text>
                    </div>
                  )}
                </div>

                {/* Current message */}
                <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    {selected.subject && <Badge>{selected.subject}</Badge>}
                    <Text className="text-ui-fg-disabled text-xs">{formatDate(selected.created_at)}</Text>
                  </div>
                  <div className="bg-ui-bg-subtle rounded-lg p-4">
                    <Text className="whitespace-pre-wrap text-sm">{selected.message}</Text>
                  </div>

                  {/* Existing reply */}
                  {selected.admin_reply && (
                    <div className="mt-4 pt-4 border-t border-ui-border-base">
                      <Text size="xsmall" weight="plus" className="text-ui-fg-interactive mb-2">
                        ✓ Réponse envoyée {selected.replied_at ? `le ${formatDate(selected.replied_at)}` : ""}
                      </Text>
                      <div className="bg-ui-bg-interactive/5 border-l-4 border-ui-border-interactive rounded-r-lg p-4">
                        <Text className="whitespace-pre-wrap text-sm">{selected.admin_reply}</Text>
                      </div>
                    </div>
                  )}

                  {/* Reply form */}
                  {!selected.admin_reply && (
                    <div className="mt-4 pt-4 border-t border-ui-border-base">
                      <div className="flex items-center justify-between mb-2">
                        <Text size="small" weight="plus">Répondre par email</Text>
                        <div className="relative">
                          <Button size="small" variant="secondary" onClick={() => setTemplateOpen(!templateOpen)}>
                            📋 Templates ({templates.length})
                          </Button>
                          {templateOpen && (
                            <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-ui-border-base rounded-xl shadow-xl z-50 p-2">
                              <div className="max-h-64 overflow-y-auto">
                                {templates.length === 0 ? (
                                  <Text size="xsmall" className="text-ui-fg-muted text-center py-4 block">
                                    Aucun template
                                  </Text>
                                ) : (
                                  templates.map((tpl, i) => (
                                    <div key={i} className="flex items-center gap-1 group">
                                      <button
                                        onClick={() => insertTemplate(tpl)}
                                        className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-ui-bg-subtle text-sm"
                                      >
                                        <Text size="small" weight="plus">{tpl.name}</Text>
                                        <Text size="xsmall" className="text-ui-fg-muted line-clamp-1">{tpl.content.replace(/\{\{name\}\}/g, "...")}</Text>
                                      </button>
                                      <button
                                        onClick={() => deleteTemplate(i)}
                                        className="opacity-0 group-hover:opacity-100 px-2 text-red-500 hover:text-red-700 transition-opacity"
                                        title="Supprimer"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                              <div className="border-t border-ui-border-base mt-2 pt-2">
                                {!editingTemplate ? (
                                  <Button size="small" variant="secondary" onClick={() => setEditingTemplate(true)} className="w-full">
                                    + Nouveau template
                                  </Button>
                                ) : (
                                  <div className="space-y-2 p-2">
                                    <Input
                                      type="text"
                                      placeholder="Nom du template"
                                      value={newTemplateName}
                                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTemplateName(e.target.value)}
                                    />
                                    <Textarea
                                      placeholder="Contenu... ({{name}} = nom du client)"
                                      value={newTemplateContent}
                                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewTemplateContent(e.target.value)}
                                      rows={4}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="small" variant="primary" onClick={addTemplate}>Sauvegarder</Button>
                                      <Button size="small" variant="secondary" onClick={() => { setEditingTemplate(false); setNewTemplateName(""); setNewTemplateContent("") }}>Annuler</Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={replyText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                        placeholder="Votre réponse au client..."
                        rows={6}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button variant="primary" size="small" onClick={sendReply} disabled={replying || !replyText.trim()}>
                          {replying ? "Envoi..." : "Envoyer la réponse"}
                        </Button>
                        <Text size="xsmall" className="text-ui-fg-muted self-center">
                          La réponse sera envoyée par email et sauvegardée
                        </Text>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message history */}
                {history.length > 1 && (
                  <div className="bg-ui-bg-base border border-ui-border-base rounded-xl p-5">
                    <Heading level="h3" className="text-sm mb-3">Historique des messages</Heading>
                    <div className="space-y-2">
                      {history.filter(h => h.id !== selected.id).map((h) => (
                        <button
                          key={h.id}
                          onClick={() => setSelected(h)}
                          className="w-full text-left p-3 rounded-lg border border-ui-border-base hover:bg-ui-bg-subtle transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Text size="xsmall" weight="plus">{h.subject || "Service client"}</Text>
                            <Text className="text-ui-fg-disabled text-[10px]">{formatDate(h.created_at)}</Text>
                          </div>
                          <Text className="text-ui-fg-muted text-xs mt-1 line-clamp-1">{h.message}</Text>
                          {h.admin_reply && <Badge color="green" size="2xsmall" className="mt-1">Répondu</Badge>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center bg-ui-bg-subtle rounded-xl p-12 min-h-[400px]">
                <Text className="text-ui-fg-muted">Sélectionnez un message pour voir le détail</Text>
              </div>
            )}
          </div>
        )}
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Messages",
  icon: ChatBubbleLeftRight,
})

export default ContactPage
