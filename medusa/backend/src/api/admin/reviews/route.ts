import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../modules/review"
import { Modules } from "@medusajs/framework/utils"

// GET /admin/reviews — list all reviews with filters + product titles
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reviewService = req.scope.resolve(REVIEW_MODULE)
  const productService = req.scope.resolve(Modules.PRODUCT) as any
  const { product_id, is_published, rating } = req.query as any

  const filters: any = {}
  if (product_id) filters.product_id = product_id
  if (is_published !== undefined) filters.is_published = is_published === "true"
  if (rating) filters.rating = Number(rating)

  const reviews = await reviewService.listReviews(filters, {
    order: { created_at: "DESC" },
  })

  // Enrich with product titles
  const productIds = [...new Set(reviews.map((r: any) => r.product_id).filter(Boolean))]
  let productMap: Record<string, { title: string; handle: string; thumbnail: string }> = {}
  if (productIds.length > 0) {
    try {
      const products = await productService.listProducts({ id: productIds })
      productMap = Object.fromEntries(
        products.map((p: any) => [p.id, { title: p.title, handle: p.handle, thumbnail: p.thumbnail }])
      )
    } catch {}
  }
  const enrichedReviews = reviews.map((r: any) => ({
    ...r,
    product_title: productMap[r.product_id]?.title || null,
    product_handle: productMap[r.product_id]?.handle || null,
    product_thumbnail: productMap[r.product_id]?.thumbnail || null,
  }))

  // Aggregate stats
  const allReviews = await reviewService.listReviews({})
  const published = allReviews.filter((r: any) => r.is_published)
  const pending = allReviews.filter((r: any) => !r.is_published)

  res.json({
    reviews: enrichedReviews,
    count: enrichedReviews.length,
    stats: {
      total: allReviews.length,
      published: published.length,
      pending: pending.length,
      avg_rating: published.length > 0
        ? Math.round((published.reduce((s: number, r: any) => s + r.rating, 0) / published.length) * 10) / 10
        : 0,
    },
  })
}
