import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Textarea, Badge, Toaster, toast } from "@medusajs/ui"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { useEffect, useState } from "react"

type Review = {
  id: string
  product_id: string
  product_title: string | null
  product_handle: string | null
  product_thumbnail: string | null
  customer_name: string
  customer_email: string
  rating: number
  title: string | null
  body: string | null
  is_verified: boolean
  is_published: boolean
  admin_reply: string | null
  replied_at: string | null
  created_at: string
}

type Stats = { total: number; published: number; pending: number; avg_rating: number }

const Stars = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div style={{ display: "flex", gap: "1px" }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width={size} height={size} viewBox="0 0 20 20" fill={s <= rating ? "#f59e0b" : "#e5e7eb"}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, pending: 0, avg_rating: 0 })
  const [filter, setFilter] = useState<"all" | "pending" | "published">("all")
  const [ratingFilter, setRatingFilter] = useState<number>(0) // 0 = all
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams()
      if (filter === "pending") params.set("is_published", "false")
      if (filter === "published") params.set("is_published", "true")
      if (ratingFilter > 0) params.set("rating", String(ratingFilter))

      const res = await fetch(`/admin/reviews?${params}`, { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReviews(data.reviews || [])
      setStats(data.stats || { total: 0, published: 0, pending: 0, avg_rating: 0 })
    } catch (e) {
      toast.error("Erreur de chargement des avis")
    }
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [filter, ratingFilter])

  const updateReview = async (id: string, body: any) => {
    await fetch(`/admin/reviews/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    fetchReviews()
  }

  const deleteReview = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return
    await fetch(`/admin/reviews/${id}`, { method: "DELETE", credentials: "include" })
    fetchReviews()
  }

  const submitReply = async (id: string) => {
    await updateReview(id, { admin_reply: replyText })
    setReplyingId(null)
    setReplyText("")
  }

  // Bulk actions
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const selectAllVisible = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(reviews.map(r => r.id)))
    }
  }

  const bulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (selectedIds.size === 0) return
    if (action === "delete" && !confirm(`Supprimer ${selectedIds.size} avis ?`)) return

    const ids = Array.from(selectedIds)
    await Promise.all(ids.map(id => {
      if (action === "delete") {
        return fetch(`/admin/reviews/${id}`, { method: "DELETE", credentials: "include" })
      }
      return fetch(`/admin/reviews/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: action === "publish" }),
      })
    }))
    setSelectedIds(new Set())
    fetchReviews()
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })

  return (
    <>
      <Toaster />
      <Container>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <Heading level="h1">Avis clients</Heading>
            <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
              Gerez et moderez les avis de vos clients
            </Text>
          </div>
        </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: 700 }}>{stats.total}</div>
          <Text size="small" style={{ color: "#6b7280" }}>Total</Text>
        </div>
        <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#f59e0b" }}>{stats.avg_rating}</div>
          <Text size="small" style={{ color: "#6b7280" }}>Note moyenne</Text>
        </div>
        <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb", textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#10b981" }}>{stats.published}</div>
          <Text size="small" style={{ color: "#6b7280" }}>Publies</Text>
        </div>
        <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid #fde68a", background: "#fffbeb", textAlign: "center" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#d97706" }}>{stats.pending}</div>
          <Text size="small" style={{ color: "#92400e" }}>En attente</Text>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #e5e7eb", marginBottom: "16px" }}>
        {([["all", "Tous"], ["pending", "En attente"], ["published", "Publies"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: filter === key ? 600 : 400,
              color: filter === key ? "#2563eb" : "#6b7280",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${filter === key ? "#2563eb" : "transparent"}`,
              cursor: "pointer",
            }}
          >
            {label}
            {key === "pending" && stats.pending > 0 && (
              <span style={{ marginLeft: "6px", padding: "1px 6px", fontSize: "11px", borderRadius: "9999px", background: "#fde68a", color: "#92400e", fontWeight: 700 }}>
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Rating filter pills */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" as const }}>
        <Text size="xsmall" style={{ color: "#6b7280", fontWeight: 500 }}>Note :</Text>
        <button
          onClick={() => setRatingFilter(0)}
          style={{
            padding: "4px 12px",
            fontSize: "12px",
            borderRadius: "9999px",
            border: ratingFilter === 0 ? "1px solid #2563eb" : "1px solid #e5e7eb",
            background: ratingFilter === 0 ? "#eff6ff" : "white",
            color: ratingFilter === 0 ? "#2563eb" : "#6b7280",
            cursor: "pointer",
            fontWeight: ratingFilter === 0 ? 600 : 400,
          }}
        >
          Toutes
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => setRatingFilter(star)}
            style={{
              padding: "4px 12px",
              fontSize: "12px",
              borderRadius: "9999px",
              border: ratingFilter === star ? "1px solid #2563eb" : "1px solid #e5e7eb",
              background: ratingFilter === star ? "#eff6ff" : "white",
              color: ratingFilter === star ? "#2563eb" : (star <= 2 ? "#dc2626" : "#6b7280"),
              cursor: "pointer",
              fontWeight: ratingFilter === star ? 600 : 400,
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            {star} {"★".repeat(1)}
          </button>
        ))}
        {ratingFilter <= 2 && ratingFilter > 0 && (
          <Text size="xsmall" style={{ color: "#dc2626", marginLeft: "4px" }}>
            Avis a traiter en priorite
          </Text>
        )}
      </div>

      {/* Bulk action bar (visible when items selected) */}
      {selectedIds.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", marginBottom: "12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px" }}>
          <Text size="small" weight="plus" style={{ color: "#1e40af" }}>
            {selectedIds.size} avis selectionne{selectedIds.size > 1 ? "s" : ""}
          </Text>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button size="small" variant="primary" onClick={() => bulkAction("publish")}>
              Publier
            </Button>
            <Button size="small" variant="secondary" onClick={() => bulkAction("unpublish")}>
              Depublier
            </Button>
            <Button size="small" variant="danger" onClick={() => bulkAction("delete")}>
              Supprimer
            </Button>
            <Button size="small" variant="secondary" onClick={() => setSelectedIds(new Set())}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Select all toggle */}
      {reviews.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 4px", marginBottom: "8px" }}>
          <input
            type="checkbox"
            checked={selectedIds.size === reviews.length && reviews.length > 0}
            onChange={selectAllVisible}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          <Text size="xsmall" style={{ color: "#6b7280" }}>Tout selectionner</Text>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <Text>Chargement...</Text>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Text style={{ color: "#9ca3af" }}>Aucun avis pour le moment</Text>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${review.is_published ? "#e5e7eb" : "#fde68a"}`,
                background: review.is_published ? "#fff" : "#fffbeb",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(review.id)}
                    onChange={() => toggleSelect(review.id)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", marginTop: "4px" }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Stars rating={review.rating} />
                      {review.is_verified && <Badge color="green">Verifie</Badge>}
                      {!review.is_published && <Badge color="orange">En attente</Badge>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", flexWrap: "wrap" as const }}>
                      <Text size="small" weight="plus">{review.customer_name}</Text>
                      <Text size="xsmall" style={{ color: "#9ca3af" }}>{review.customer_email}</Text>
                      <Text size="xsmall" style={{ color: "#9ca3af" }}>&middot; {formatDate(review.created_at)}</Text>
                    </div>
                  </div>
                </div>
                {review.product_title ? (
                  <a
                    href={review.product_handle ? `/app/products/${review.product_id}` : "#"}
                    style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "#374151", maxWidth: "240px" }}
                  >
                    {review.product_thumbnail && (
                      <img src={review.product_thumbnail} alt={review.product_title} width="32" height="32" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "contain", background: "#f3f4f6", padding: "2px" }} />
                    )}
                    <Text size="xsmall" style={{ fontWeight: 500, lineHeight: "1.3" }}>
                      {review.product_title}
                    </Text>
                  </a>
                ) : (
                  <Text size="xsmall" style={{ color: "#9ca3af", fontFamily: "monospace" }}>
                    {review.product_id.substring(0, 20)}...
                  </Text>
                )}
              </div>

              {/* Content */}
              {review.title && (
                <Text weight="plus" style={{ marginBottom: "4px" }}>{review.title}</Text>
              )}
              {review.body && (
                <Text size="small" style={{ color: "#374151", lineHeight: "1.6" }}>{review.body}</Text>
              )}

              {/* Admin reply */}
              {review.admin_reply && (
                <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", background: "#f0f9ff", borderLeft: "3px solid #2563eb" }}>
                  <Text size="xsmall" weight="plus" style={{ color: "#2563eb", marginBottom: "4px" }}>Reponse de l'equipe</Text>
                  <Text size="small" style={{ color: "#1e40af" }}>{review.admin_reply}</Text>
                </div>
              )}

              {/* Reply form */}
              {replyingId === review.id && (
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Textarea
                    value={replyText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyText(e.target.value)}
                    placeholder="Votre reponse..."
                    rows={3}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button size="small" variant="primary" onClick={() => submitReply(review.id)}>
                      Envoyer
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => { setReplyingId(null); setReplyText("") }}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
                {!review.is_published ? (
                  <Button size="small" variant="primary" onClick={() => updateReview(review.id, { is_published: true })}>
                    Publier
                  </Button>
                ) : (
                  <Button size="small" variant="secondary" onClick={() => updateReview(review.id, { is_published: false })}>
                    Depublier
                  </Button>
                )}
                {!review.is_verified && (
                  <Button size="small" variant="secondary" onClick={() => updateReview(review.id, { is_verified: true })}>
                    Marquer verifie
                  </Button>
                )}
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setReplyingId(review.id)
                    setReplyText(review.admin_reply || "")
                  }}
                >
                  Repondre
                </Button>
                <Button size="small" variant="danger" onClick={() => deleteReview(review.id)}>
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      </Container>
    </>
  )
}

export const config = defineRouteConfig({
  label: "Avis clients",
  icon: ChatBubbleLeftRight,
})

export default ReviewsPage
