import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../modules/review"

// GET /store/reviews?product_id=xxx — get published reviews for a product
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reviewService = req.scope.resolve(REVIEW_MODULE)
  const productId = req.query.product_id as string

  if (!productId) {
    return res.status(400).json({ message: "product_id is required" })
  }

  const reviews = await reviewService.listReviews(
    { product_id: productId, is_published: true },
    { order: { created_at: "DESC" } }
  )

  // Calculate aggregate
  const count = reviews.length
  const avgRating = count > 0
    ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count) * 10) / 10
    : 0

  // Rating distribution
  const distribution = [1, 2, 3, 4, 5].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
  }))

  res.json({
    reviews,
    aggregate: { count, avg_rating: avgRating, distribution },
  })
}

// POST /store/reviews — submit a new review
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const reviewService = req.scope.resolve(REVIEW_MODULE)
  const { product_id, customer_name, customer_email, rating, title, body } = req.body as any

  if (!product_id || !customer_name || !customer_email || !rating) {
    return res.status(400).json({ message: "product_id, customer_name, customer_email and rating are required" })
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" })
  }

  const review = await reviewService.createReviews({
    product_id,
    customer_name: customer_name.trim(),
    customer_email: customer_email.trim().toLowerCase(),
    rating: Number(rating),
    title: title?.trim() || null,
    body: body?.trim() || null,
    is_verified: false,
    is_published: false, // Requires moderation
  })

  res.status(201).json({ review, message: "Merci pour votre avis ! Il sera publié après modération." })
}
