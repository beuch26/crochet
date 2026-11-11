/**
 * Page Builder — Section catalog.
 *
 * This file is the single registry of all available sections.
 * To add a new section type:
 *   1. Create a new file in src/page-builder/sections/
 *   2. Export a SectionSchema
 *   3. Import and add it to SECTION_CATALOG below
 */

import type { SectionSchema, SectionCategory } from "./schema-types"
import { heroSchema } from "./sections/hero"
import { trustBarSchema } from "./sections/trust-bar"
import { featuredProductsSchema } from "./sections/featured-products"
import { collectionBubblesSchema } from "./sections/collection-bubbles"
import { tickerMarqueeSchema } from "./sections/ticker-marquee"
import { testimonialsSchema } from "./sections/testimonials"
import { videoTestimonialsSchema } from "./sections/video-testimonials"
import { imageWithTextSchema } from "./sections/image-with-text"
import { faqSchema } from "./sections/faq"
import { newsletterSchema } from "./sections/newsletter"
import { richTextSchema } from "./sections/rich-text"
import { videoSchema } from "./sections/video"
import { promoBannerSchema } from "./sections/promo-banner"
import { logoCloudSchema } from "./sections/logo-cloud"
import { statsCounterSchema } from "./sections/stats-counter"
import { ctaBannerSchema } from "./sections/cta-banner"
import { spacerSchema } from "./sections/spacer"
import { customHtmlSchema } from "./sections/custom-html"
import { gallerySchema } from "./sections/gallery"

export const SECTION_CATALOG: SectionSchema[] = [
  heroSchema,
  trustBarSchema,
  featuredProductsSchema,
  collectionBubblesSchema,
  tickerMarqueeSchema,
  testimonialsSchema,
  videoTestimonialsSchema,
  imageWithTextSchema,
  faqSchema,
  newsletterSchema,
  richTextSchema,
  // New sections
  videoSchema,
  promoBannerSchema,
  logoCloudSchema,
  statsCounterSchema,
  ctaBannerSchema,
  spacerSchema,
  customHtmlSchema,
  gallerySchema,
]

// Lookup helpers
export function getSchemaByType(type: string): SectionSchema | undefined {
  return SECTION_CATALOG.find((s) => s.type === type)
}

export function getSchemasByCategory(category: SectionCategory): SectionSchema[] {
  return SECTION_CATALOG.filter((s) => s.category === category)
}

// Categories metadata for the section picker
export const CATEGORY_META: Record<SectionCategory, { label: string; icon: string; order: number }> = {
  header: { label: "En-tête", icon: "🎯", order: 1 },
  content: { label: "Contenu", icon: "📝", order: 2 },
  products: { label: "Produits", icon: "🛍", order: 3 },
  social_proof: { label: "Social proof", icon: "💬", order: 4 },
  marketing: { label: "Marketing", icon: "📢", order: 5 },
  media: { label: "Média", icon: "🎬", order: 6 },
  structural: { label: "Structurel", icon: "📐", order: 7 },
}
