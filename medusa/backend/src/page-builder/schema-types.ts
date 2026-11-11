/**
 * Page Builder — Schema type definitions.
 *
 * Each section type (hero, marquee, etc.) is described by a SectionSchema.
 * The schema is the single source of truth for:
 *   1. The admin editor form (auto-generated from the field list)
 *   2. The default props when adding a new section
 *   3. (Eventually) validation before saving
 *
 * Schemas are static — defined in code, not in DB. They are owned by us.
 */

// ========================================
// FIELD TYPES (UI primitives for the form)
// ========================================

export type FieldType =
  | "text"          // single-line input
  | "textarea"      // multi-line input
  | "richtext"      // HTML rich text (limited tags allowed)
  | "number"        // numeric input
  | "boolean"       // toggle switch
  | "color"         // color picker
  | "image"         // image URL with preview
  | "url"           // URL input (with validation)
  | "select"        // single choice from options
  | "multiselect"   // multiple choices
  | "link"          // composite { text, url }
  | "items"         // array of sub-items (each with its own schema)
  | "section"       // visual section header in the form (no value)

export type FieldOption = {
  value: string
  label: string
  icon?: string  // optional emoji or icon name
}

export type BaseField = {
  key: string                  // identifier in props (e.g. "title", "cta_primary")
  label: string                // shown in the editor form
  type: FieldType
  description?: string         // help text under the label
  required?: boolean
  default?: any                // default value
  conditional?: {              // show this field only if another field has a value
    field: string              // key of the field to check
    equals: any                // value(s) to match — can be array for OR
  }
}

export type TextField = BaseField & {
  type: "text" | "textarea" | "richtext" | "url"
  placeholder?: string
  maxLength?: number
}

export type NumberField = BaseField & {
  type: "number"
  min?: number
  max?: number
  step?: number
  unit?: string  // displayed after the input (e.g. "px", "%")
}

export type BooleanField = BaseField & {
  type: "boolean"
}

export type ColorField = BaseField & {
  type: "color"
}

export type ImageField = BaseField & {
  type: "image"
  recommended?: string  // e.g. "1600×900px"
}

export type SelectField = BaseField & {
  type: "select" | "multiselect"
  options: FieldOption[]
}

export type LinkField = BaseField & {
  type: "link"
  // value shape: { text: string, url: string }
}

export type ItemsField = BaseField & {
  type: "items"
  itemLabel: string  // singular label, e.g. "trust badge"
  maxItems?: number
  itemSchema: Field[]  // schema for each item
}

export type SectionHeaderField = BaseField & {
  type: "section"
  // value: none — visual separator only
}

export type Field =
  | TextField
  | NumberField
  | BooleanField
  | ColorField
  | ImageField
  | SelectField
  | LinkField
  | ItemsField
  | SectionHeaderField

// ========================================
// SECTION SCHEMA
// ========================================

export type SectionSchema = {
  type: string                    // unique identifier (e.g. "hero")
  label: string                   // display name in the editor
  description: string             // shown in the "add section" picker
  icon: string                    // emoji icon for the picker
  category: SectionCategory       // grouping in the picker
  preview_image?: string          // optional URL for visual preview in the picker
  fields: Field[]                 // editable fields
  default_props: Record<string, any>  // initial props when added
}

export type SectionCategory =
  | "header"        // top-of-page sections (hero, banner)
  | "content"       // text/image content blocks
  | "products"      // product showcases
  | "social_proof"  // testimonials, reviews, social wall
  | "marketing"     // promo, newsletter, CTA
  | "structural"    // dividers, spacers
  | "media"         // video, gallery, marquee

// ========================================
// SECTION INSTANCE (saved in DB)
// ========================================

/**
 * A section instance as stored in page_layout.sections.
 * The "type" must match a SectionSchema.type from the catalog.
 * The "props" shape must conform to the schema's fields.
 */
export type SectionInstance = {
  id: string                  // unique within the page (uuid-ish)
  type: string                // matches SectionSchema.type
  visible: boolean
  props: Record<string, any>
}
