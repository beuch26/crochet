/**
 * Client API Medusa.js
 */
import { canonicalCategory } from './blog'

const MEDUSA_URL = import.meta.env.PUBLIC_MEDUSA_URL || 'http://localhost:9000'
const API_KEY = import.meta.env.PUBLIC_MEDUSA_API_KEY || ''
const REGION_ID = import.meta.env.PUBLIC_MEDUSA_REGION_ID || 'reg_01KNMDW1PJAW5BV63ARBR3V1XH'

// Build-time promise cache — Astro SSG calls the same read endpoints from
// hundreds of pages; memoizing GETs during build drops total time from ~13min
// to ~2min. Mutations (POST/DELETE) bypass the cache.
const buildCache = new Map<string, Promise<any>>()

async function medusaFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase()
  const canCache = method === 'GET'
  const cacheKey = canCache ? endpoint : null

  if (cacheKey && buildCache.has(cacheKey)) {
    return buildCache.get(cacheKey) as Promise<T>
  }

  const p = (async () => {
    const res = await fetch(`${MEDUSA_URL}/store${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': API_KEY,
        ...options?.headers,
      },
    })

    if (!res.ok) {
      throw new Error(`Medusa API error: ${res.status} ${res.statusText}`)
    }

    return res.json() as Promise<T>
  })()

  if (cacheKey) {
    buildCache.set(cacheKey, p)
    // Drop from cache on error so retries aren't permanently broken
    p.catch(() => buildCache.delete(cacheKey))
  }

  return p
}

// Products — always include region_id for prices
export async function getProducts(limit = 50, offset = 0) {
  return medusaFetch<{ products: any[]; count: number }>(
    `/products?limit=${limit}&offset=${offset}&region_id=${REGION_ID}&fields=+variants.calculated_price,+variants.options,+variants.metadata,+images,+options,+options.values,+metadata,+collection.handle,+collection.title`
  )
}

export async function getProduct(handle: string) {
  return medusaFetch<{ products: any[] }>(
    `/products?handle=${handle}&region_id=${REGION_ID}&fields=+variants.calculated_price,+variants.options,+variants.metadata,+images,+options,+options.values,+metadata`
  )
}

// Collections
export async function getCollections() {
  return medusaFetch<{ collections: any[] }>('/collections?limit=100&fields=+metadata')
}

export async function getCollectionByHandle(handle: string) {
  return medusaFetch<{ collections: any[] }>(`/collections?handle=${handle}&fields=+metadata`)
}

export async function getCollectionProducts(collectionId: string, limit = 50) {
  return medusaFetch<{ products: any[]; count: number }>(
    `/products?collection_id[]=${collectionId}&limit=${limit}&region_id=${REGION_ID}&fields=+variants.calculated_price,+variants.options,+images,+options,+options.values,+metadata`
  )
}

// Categories
export async function getCategories() {
  return medusaFetch<{ product_categories: any[] }>('/product-categories')
}

// Cart
export async function createCart() {
  return medusaFetch<{ cart: any }>('/carts', {
    method: 'POST',
    body: JSON.stringify({ region_id: REGION_ID }),
  })
}

export async function getCart(cartId: string) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}`)
}

export async function addToCart(cartId: string, variantId: string, quantity = 1) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}/line-items`, {
    method: 'POST',
    body: JSON.stringify({ variant_id: variantId, quantity }),
  })
}

export async function updateLineItem(cartId: string, lineItemId: string, quantity: number) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  })
}

export async function removeLineItem(cartId: string, lineItemId: string) {
  return medusaFetch<{ cart: any }>(`/carts/${cartId}/line-items/${lineItemId}`, {
    method: 'DELETE',
  })
}

// Blog (module custom)
export async function getBlogPosts(limit = 20, offset = 0) {
  const data = await medusaFetch<{ blog_posts: any[]; count: number }>(
    `/blog?limit=${limit}&offset=${offset}`
  )
  for (const p of data.blog_posts || []) {
    if (p?.category != null) p.category = canonicalCategory(p.category)
  }
  return data
}

export async function getBlogPost(handle: string) {
  const data = await medusaFetch<{ blog_post: any }>(`/blog/${handle}`)
  if (data.blog_post?.category != null) {
    data.blog_post.category = canonicalCategory(data.blog_post.category)
  }
  return data
}

// Helper: extract price from product
export function getProductPrice(product: any): number {
  const variant = product.variants?.[0]
  return variant?.calculated_price?.calculated_amount || 0
}

// Helper: get second image for hover swap
export function getProductHoverImage(product: any): string | undefined {
  const images = product.images || []
  if (images.length < 2) return undefined
  // Return second image that isn't the thumbnail
  const second = images.find((img: any) => img.url !== product.thumbnail)
  return second?.url
}

// Public integration config (GA4, GTM, Clarity IDs etc).
// Returns a nested map: { category: { slug: { ...public_fields } } }
// Always safe — never includes secret values, never throws.
export async function getPublicIntegrations(): Promise<Record<string, Record<string, Record<string, any>>>> {
  try {
    return await medusaFetch<Record<string, Record<string, Record<string, any>>>>('/integrations/public')
  } catch {
    return {}
  }
}

// CMS Pages
export async function getPages() {
  return medusaFetch<{ pages: any[] }>('/pages')
}

export async function getPage(handle: string) {
  return medusaFetch<{ page: any }>(`/pages/${handle}`)
}

// Reviews
export async function getProductReviews(productId: string) {
  return medusaFetch<{
    reviews: any[]
    aggregate: { count: number; avg_rating: number; distribution: { star: number; count: number }[] }
  }>(`/reviews?product_id=${productId}`)
}

// Theme settings
export async function getThemeSettings() {
  return medusaFetch<{ settings: Record<string, Record<string, any>>; raw: any[] }>(
    '/theme'
  )
}

// Page layouts (Page Builder)
export type SectionInstance = {
  id: string
  type: string
  visible: boolean
  props: Record<string, any>
}

export type PageLayout = {
  page_key: string
  sections: SectionInstance[]
  custom_css: string | null
  meta_title: string | null
  meta_description: string | null
  published_at?: string
}

export async function getPageLayout(pageKey: string, preview = false): Promise<PageLayout | null> {
  try {
    const data = await medusaFetch<{ layout: PageLayout }>(
      `/page-layouts/${pageKey}${preview ? '?preview=draft' : ''}`
    )
    return data.layout || null
  } catch {
    return null
  }
}
