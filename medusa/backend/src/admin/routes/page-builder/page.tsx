import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Input, Textarea, Switch, Badge, Toaster, toast } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// ========================================
// TYPES
// ========================================

type SectionInstance = {
  id: string
  type: string
  visible: boolean
  props: Record<string, any>
}

type Field = {
  key: string
  label: string
  type: string
  description?: string
  required?: boolean
  default?: any
  placeholder?: string
  maxLength?: number
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: { value: string; label: string; icon?: string }[]
  recommended?: string
  conditional?: { field: string; equals: any }
  itemLabel?: string
  maxItems?: number
  itemSchema?: Field[]
}

type SectionSchema = {
  type: string
  label: string
  description: string
  icon: string
  category: string
  fields: Field[]
  default_props: Record<string, any>
}

type CategoryMeta = Record<string, { label: string; icon: string; order: number }>

// ========================================
// SECTION ICON (SVG, no emoji)
// ========================================

function SectionIcon({ type, className = "" }: { type: string; className?: string }) {
  const icons: Record<string, string> = {
    hero: "M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 4h10M7 13h4",
    trust_bar: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    featured_products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    collection_bubbles: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    ticker_marquee: "M13 10V3L4 14h7v7l9-11h-7z",
    testimonials: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    video_testimonials: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    image_with_text: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    faq: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    newsletter: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    rich_text: "M4 6h16M4 12h16M4 18h7",
    video: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    promo_banner: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
    logo_cloud: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    stats_counter: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    cta_banner: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
    spacer: "M4 12h16",
    custom_html: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    gallery: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  }
  const d = icons[type] || "M4 6h16M4 12h16M4 18h16"
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

// ========================================
// SORTABLE SECTION ITEM
// ========================================

function SortableSection({
  section,
  schema,
  isSelected,
  onClick,
  onToggleVisible,
  onDuplicate,
  onDelete,
}: {
  section: SectionInstance
  schema: SectionSchema | undefined
  isSelected: boolean
  onClick: () => void
  onToggleVisible: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : section.visible ? 1 : 0.5,
    zIndex: isDragging ? 100 : "auto",
  }

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      className={`flex items-center gap-2 py-2 px-2 rounded-lg text-sm cursor-pointer transition-all ${
        isSelected
          ? "bg-gray-100 shadow-sm"
          : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 text-gray-300 hover:text-gray-500 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.2" /><circle cx="11" cy="3" r="1.2" />
          <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
          <circle cx="5" cy="13" r="1.2" /><circle cx="11" cy="13" r="1.2" />
        </svg>
      </button>

      {/* Section icon (SVG, not emoji) */}
      <SectionIcon type={section.type} className="w-4 h-4 text-gray-400 shrink-0" />

      {/* Label */}
      <span className={`flex-1 truncate text-[13px] ${isSelected ? "font-medium text-gray-900" : "text-gray-700"}`}>
        {schema?.label || section.type}
      </span>

      {/* Visibility indicator */}
      {!section.visible && (
        <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      )}

      {/* Chevron */}
      <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? "text-gray-600 rotate-90" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  )
}

// ========================================
// FIELD RENDERER (dynamic form from schema)
// ========================================

function FieldRenderer({
  field,
  value,
  allValues,
  onChange,
}: {
  field: Field
  value: any
  allValues: Record<string, any>
  onChange: (val: any) => void
}) {
  // Check conditional visibility
  if (field.conditional) {
    const condVal = allValues[field.conditional.field]
    const equals = field.conditional.equals
    const matches = Array.isArray(equals) ? equals.includes(condVal) : condVal === equals
    if (!matches) return null
  }

  if (field.type === "section") {
    return (
      <div className="col-span-full mt-4 mb-1 pt-4 border-t border-gray-200">
        <Text size="xsmall" weight="plus" className="text-gray-500 uppercase tracking-wider">{field.label}</Text>
      </div>
    )
  }

  const fieldId = `field-${field.key}`

  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="block text-xs font-medium text-gray-700 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {field.type === "text" && (
        <input
          id={fieldId}
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      )}

      {field.type === "textarea" && (
        <textarea
          id={fieldId}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      )}

      {field.type === "richtext" && (
        <textarea
          id={fieldId}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-xs"
        />
      )}

      {field.type === "url" && (
        <input
          id={fieldId}
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || "https://"}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      )}

      {field.type === "number" && (
        <div className="flex items-center gap-2">
          <input
            id={fieldId}
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {field.unit && <span className="text-xs text-gray-500 shrink-0">{field.unit}</span>}
        </div>
      )}

      {field.type === "boolean" && (
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className="text-xs text-gray-600">{value ? "Activé" : "Désactivé"}</span>
        </div>
      )}

      {field.type === "color" && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono"
            placeholder="#000000"
          />
        </div>
      )}

      {field.type === "image" && (
        <div>
          <input
            id={fieldId}
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {value && (
            <img src={value} alt="Preview" className="mt-2 max-h-24 rounded-lg border border-gray-200 object-contain bg-gray-50" />
          )}
          {field.recommended && (
            <span className="text-[10px] text-gray-400 mt-1 block">Recommandé : {field.recommended}</span>
          )}
        </div>
      )}

      {(field.type === "select" || field.type === "multiselect") && (
        <select
          id={fieldId}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.icon ? `${opt.icon} ` : ""}{opt.label}</option>
          ))}
        </select>
      )}

      {field.type === "link" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={(value as any)?.text || ""}
            onChange={(e) => onChange({ ...(value || {}), text: e.target.value })}
            placeholder="Texte du lien"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={(value as any)?.url || ""}
            onChange={(e) => onChange({ ...(value || {}), url: e.target.value })}
            placeholder="/url"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
          />
        </div>
      )}

      {field.type === "items" && (
        <div className="space-y-2 mt-1">
          {((value as any[]) || []).map((item: any, i: number) => (
            <div key={i} className="p-3 border border-gray-200 rounded-lg bg-gray-50 relative group">
              <button
                onClick={() => {
                  const next = [...(value || [])]
                  next.splice(i, 1)
                  onChange(next)
                }}
                className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs p-1"
              >
                ✕
              </button>
              {field.itemSchema?.map((subField) => (
                <FieldRenderer
                  key={subField.key}
                  field={subField}
                  value={item[subField.key]}
                  allValues={item}
                  onChange={(v) => {
                    const next = [...(value || [])]
                    next[i] = { ...next[i], [subField.key]: v }
                    onChange(next)
                  }}
                />
              ))}
            </div>
          ))}
          {(!field.maxItems || ((value as any[]) || []).length < field.maxItems) && (
            <button
              type="button"
              onClick={() => {
                const defaults: Record<string, any> = {}
                field.itemSchema?.forEach(f => { if (f.default !== undefined) defaults[f.key] = f.default })
                onChange([...(value || []), defaults])
              }}
              className="w-full py-2 text-xs text-blue-600 font-medium border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              + Ajouter un {field.itemLabel || "élément"}
            </button>
          )}
        </div>
      )}

      {field.description && (
        <p className="text-[10px] text-gray-400 mt-1">{field.description}</p>
      )}
      {field.maxLength && (value || "").length > 0 && (
        <p className={`text-[10px] mt-0.5 ${(value || "").length > field.maxLength ? "text-red-500" : "text-gray-400"}`}>
          {(value || "").length}/{field.maxLength}
        </p>
      )}
    </div>
  )
}

// ========================================
// MAIN PAGE BUILDER
// ========================================

const PageBuilderPage = () => {
  const [sections, setSections] = useState<SectionInstance[]>([])
  const [catalog, setCatalog] = useState<SectionSchema[]>([])
  const [categories, setCategories] = useState<CategoryMeta>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [insertIndex, setInsertIndex] = useState<number | null>(null) // null = add to end
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [customCss, setCustomCss] = useState("")
  const [customJs, setCustomJs] = useState("")
  const [showCode, setShowCode] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [previewMode, setPreviewMode] = useState<"live" | "iframe">("live")
  const [pageKey, setPageKey] = useState("homepage")
  const [templateOpen, setTemplateOpen] = useState(false)

  const PAGES = [
    { key: "homepage", label: "Page d'accueil", icon: "🏠" },
  ]

  // Pre-built templates
  const TEMPLATES = [
    {
      name: "Boutique Bébé",
      description: "Template complet pour une boutique maternité/bébé",
      icon: "👶",
      sections: [
        { id: "t_hero", type: "hero", visible: true, props: { variant: "split-right", badge: "Livraison gratuite dès 50€", title: "L'essentiel pour <span class=\"text-primary\">bébé</span> & <span class=\"text-secondary\">maman</span>", subtitle: "Des produits soigneusement sélectionnés pour accompagner chaque étape de la maternité.", cta_primary: { text: "Découvrir", url: "/collections" }, cta_secondary: { text: "Nos conseils", url: "/blog" }, image_url: "/images/hero/hero-mother-baby.webp" }},
        { id: "t_trust", type: "trust_bar", visible: true, props: { items: [{ icon: "truck", title: "Livraison 24-48h", subtitle: "Gratuite dès 50€" }, { icon: "card", title: "Paiement sécurisé", subtitle: "Stripe · 3D Secure" }, { icon: "return", title: "Retour offert", subtitle: "30 jours" }, { icon: "headset", title: "Conseil expert", subtitle: "Réponse sous 24h" }] }},
        { id: "t_products", type: "featured_products", visible: true, props: { title: "Nos produits phares", subtitle: "Sélectionnés avec soin", source: "latest", limit: 8, columns: "4", show_cta: true, cta_text: "Tout voir", cta_url: "/collections" }},
        { id: "t_testimonials", type: "testimonials", visible: true, props: { title: "Ce que disent nos clientes", subtitle: "Plus de 1500 mamans nous font confiance", layout: "grid_3", items: [] }},
        { id: "t_newsletter", type: "newsletter", visible: true, props: { title: "Rejoignez notre communauté", subtitle: "Recevez nos conseils et offres exclusives", background_style: "gradient", button_text: "S'inscrire" }},
      ],
    },
    {
      name: "Mode & Accessoires",
      description: "Template épuré pour une boutique mode",
      icon: "👗",
      sections: [
        { id: "t_hero", type: "hero", visible: true, props: { variant: "fullscreen", title: "Nouvelle collection", subtitle: "Découvrez les tendances de la saison", cta_primary: { text: "Shop now", url: "/collections" }, image_url: "" }},
        { id: "t_marquee", type: "ticker_marquee", visible: true, props: { items: [{ text: "Free shipping on orders over 50€" }, { text: "New arrivals weekly" }], speed: "normal", background_color: "#000000", text_color: "#ffffff" }},
        { id: "t_products", type: "featured_products", visible: true, props: { title: "Best sellers", source: "latest", limit: 6, columns: "3", show_cta: true, cta_text: "View all", cta_url: "/collections" }},
        { id: "t_imagetext", type: "image_with_text", visible: true, props: { layout: "left", title: "Notre histoire", content: "<p>Depuis 2020, nous sélectionnons les meilleures pièces...</p>", cta: { text: "En savoir plus", url: "/a-propos" } }},
        { id: "t_newsletter", type: "newsletter", visible: true, props: { title: "Stay in the loop", subtitle: "10% off your first order", background_style: "gradient", incentive: "-10% sur votre première commande" }},
      ],
    },
    {
      name: "Minimaliste",
      description: "Design épuré et minimaliste, centré sur les produits",
      icon: "✨",
      sections: [
        { id: "t_hero", type: "hero", visible: true, props: { variant: "centered", title: "Bienvenue", subtitle: "Découvrez notre sélection.", cta_primary: { text: "Voir les produits", url: "/collections" } }},
        { id: "t_products", type: "featured_products", visible: true, props: { title: "Nos produits", source: "latest", limit: 4, columns: "2", show_cta: false }},
      ],
    },
  ]

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    if (!confirm(`Remplacer le contenu actuel par le template "${template.name}" ? Cette action est irréversible.`)) return
    const withIds = template.sections.map(s => ({
      ...s,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    }))
    setSections(withIds)
    setSelectedId(null)
    setHasChanges(true)
    setTemplateOpen(false)
    toast.success(`Template "${template.name}" appliqué`)
  }

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Load layout + catalog
  useEffect(() => {
    Promise.all([
      fetch(`/admin/page-layouts/${pageKey}?status=draft`, { credentials: "include" }).then(r => r.json()),
      fetch("/admin/page-builder/catalog", { credentials: "include" }).then(r => r.json()),
    ]).then(([layoutData, catalogData]) => {
      setSections(layoutData.layout?.sections || [])
      setCustomCss(layoutData.layout?.custom_css || "")
      setCustomJs(layoutData.layout?.custom_js || "")
      setCatalog(catalogData.sections || [])
      setCategories(catalogData.categories || {})
      setLoading(false)
    }).catch(() => {
      toast.error("Erreur de chargement")
      setLoading(false)
    })
  }, [])

  const getSchema = (type: string) => catalog.find(s => s.type === type)
  const selectedSection = sections.find(s => s.id === selectedId)

  // CRUD
  const updateSection = (id: string, updates: Partial<SectionInstance>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    setHasChanges(true)
  }

  const updateProp = (id: string, key: string, value: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, props: { ...s.props, [key]: value } } : s))
    setHasChanges(true)
  }

  const addSection = (schema: SectionSchema) => {
    const newSection: SectionInstance = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: schema.type,
      visible: true,
      props: { ...schema.default_props },
    }
    if (insertIndex !== null) {
      setSections(prev => {
        const next = [...prev]
        next.splice(insertIndex, 0, newSection)
        return next
      })
    } else {
      setSections(prev => [...prev, newSection])
    }
    setSelectedId(newSection.id)
    setAddModalOpen(false)
    setInsertIndex(null)
    setHasChanges(true)
  }

  const duplicateSection = (id: string) => {
    const original = sections.find(s => s.id === id)
    if (!original) return
    const dupe: SectionInstance = {
      ...JSON.parse(JSON.stringify(original)),
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    }
    const idx = sections.findIndex(s => s.id === id)
    const next = [...sections]
    next.splice(idx + 1, 0, dupe)
    setSections(next)
    setSelectedId(dupe.id)
    setHasChanges(true)
  }

  const deleteSection = (id: string) => {
    if (!confirm("Supprimer cette section ?")) return
    setSections(prev => prev.filter(s => s.id !== id))
    if (selectedId === id) setSelectedId(null)
    setHasChanges(true)
  }

  // Drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections(prev => {
      const oldIdx = prev.findIndex(s => s.id === active.id)
      const newIdx = prev.findIndex(s => s.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
    setHasChanges(true)
  }

  // Save draft
  const saveDraft = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/page-layouts/${pageKey}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections, custom_css: customCss || null, custom_js: customJs || null }),
      })
      if (!res.ok) throw new Error()
      toast.success("Brouillon sauvegardé")
      setHasChanges(false)
    } catch {
      toast.error("Erreur de sauvegarde")
    }
    setSaving(false)
  }

  // Publish
  const publish = async () => {
    if (!confirm("Publier ces modifications ? Elles seront visibles par les visiteurs au prochain build du frontend.")) return
    setPublishing(true)
    try {
      // Save draft first
      await fetch(`/admin/page-layouts/${pageKey}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections, custom_css: customCss || null, custom_js: customJs || null }),
      })
      // Publish
      const res = await fetch(`/admin/page-layouts/${pageKey}/publish`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) throw new Error()
      toast.success("Layout publié ! Les changements seront visibles au prochain build.")
      setHasChanges(false)
    } catch {
      toast.error("Erreur de publication")
    }
    setPublishing(false)
  }

  if (loading) {
    return <Container className="p-8"><Text>Chargement du builder...</Text></Container>
  }

  // Group catalog by category
  const groupedCatalog: Record<string, SectionSchema[]> = {}
  catalog.forEach(s => {
    if (!groupedCatalog[s.category]) groupedCatalog[s.category] = []
    groupedCatalog[s.category].push(s)
  })

  return (
    <>
      <Toaster />
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)" }}>
        {/* Top toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #e5e7eb", background: "white", flexShrink: 0, gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Heading level="h2" className="text-base">Page Builder</Heading>
            <select
              value={pageKey}
              onChange={(e) => {
                if (hasChanges && !confirm("Changer de page ? Les modifications non sauvegardées seront perdues.")) return
                setPageKey(e.target.value)
              }}
              className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white font-medium"
            >
              {PAGES.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            {hasChanges && <Badge color="orange" size="2xsmall">Non sauvegardé</Badge>}
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <Text size="xsmall" className="text-gray-400">{sections.length} section{sections.length > 1 ? "s" : ""}</Text>

            {/* Responsive toggle — moved to toolbar */}
            <div style={{ display: "flex", gap: "1px", background: "#f3f4f6", borderRadius: "6px", padding: "2px", marginLeft: "8px" }}>
              {([
                { key: "desktop", label: "Desktop", path: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                { key: "tablet", label: "Tablet", path: "M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
                { key: "mobile", label: "Mobile", path: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
              ] as const).map(d => (
                <button
                  key={d.key}
                  onClick={() => setPreviewDevice(d.key)}
                  className={`p-1.5 rounded transition-all ${
                    previewDevice === d.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={d.label}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={d.path} />
                  </svg>
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <button
              onClick={() => setTemplateOpen(true)}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Templates
            </button>
            <button
              onClick={() => setShowCode(!showCode)}
              className={`px-3 py-1.5 text-xs rounded-lg border ${showCode ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              {"</>"}
            </button>
            <Button size="small" variant="secondary" onClick={saveDraft} disabled={saving || !hasChanges}>
              {saving ? "..." : "Sauvegarder"}
            </Button>
            <Button size="small" variant="primary" onClick={publish} disabled={publishing}>
              {publishing ? "..." : "Publier"}
            </Button>
          </div>
        </div>

        {/* Main area — 3 columns */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* LEFT: Section list + add */}
          <div style={{ width: "260px", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", background: "white", flexShrink: 0 }}>
            <div style={{ padding: "12px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Text size="xsmall" weight="plus" className="text-gray-500 uppercase tracking-wider">Sections</Text>
              <button
                onClick={() => { setInsertIndex(null); setAddModalOpen(true) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="Ajouter une section"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14m-7-7h14" /></svg>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  {sections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      schema={getSchema(section.type)}
                      isSelected={selectedId === section.id}
                      onClick={() => setSelectedId(section.id)}
                      onToggleVisible={() => updateSection(section.id, { visible: !section.visible })}
                      onDuplicate={() => duplicateSection(section.id)}
                      onDelete={() => deleteSection(section.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {sections.length === 0 && (
                <div className="text-center py-8">
                  <Text size="xsmall" className="text-gray-400">Aucune section</Text>
                  <button
                    onClick={() => setAddModalOpen(true)}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    + Ajouter une section
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Preview area — toggle between live (inline) and iframe (real site) */}
          <div style={{ flex: 1, background: "#f3f4f6", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Mini toolbar */}
            <div style={{ padding: "4px 16px", display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "center" }}>
              <button
                onClick={() => setPreviewMode(previewMode === "live" ? "iframe" : "live")}
                className="text-[11px] text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
              >
                {previewMode === "live" ? (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    Voir le vrai site
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Mode edition
                  </>
                )}
              </button>
              <a
                href="https://magic-crochet-kit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-gray-400 hover:text-blue-600 transition-colors"
              >
                Ouvrir dans un nouvel onglet ↗
              </a>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: previewMode === "iframe" ? "0" : "0 12px 12px" }}>

              {/* IFRAME MODE — shows the real published site */}
              {previewMode === "iframe" && (
                <iframe
                  src="https://magic-crochet-kit.com"
                  style={{
                    width: previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px",
                    height: "100%",
                    border: "none",
                    margin: previewDevice === "desktop" ? "0" : "0 auto",
                    display: "block",
                    background: "white",
                    transition: "width 0.3s ease",
                  }}
                  title="Site publié"
                />
              )}

              {/* LIVE EDIT MODE — simplified inline preview */}
              {previewMode === "live" && (
              <div style={{
                maxWidth: previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "768px" : "375px",
                margin: "0 auto",
                background: "white",
                borderRadius: previewDevice === "desktop" ? "0" : "12px",
                border: previewDevice === "desktop" ? "none" : "1px solid #d1d5db",
                overflow: "hidden",
                boxShadow: previewDevice === "desktop" ? "none" : "0 4px 20px rgba(0,0,0,0.06)",
                transition: "max-width 0.3s ease",
              }}>

                {/* Insert button at top */}
                <div className="group/insert relative h-0">
                  <div className="absolute left-0 right-0 top-0 -translate-y-1/2 z-20 flex items-center justify-center opacity-0 group-hover/insert:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setAddModalOpen(true); setInsertIndex(0) }}
                      className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded-full shadow-md hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14m-7-7h14" /></svg>
                    </button>
                  </div>
                </div>

                {/* Mini preview — render simplified blocks for each section */}
                {sections.filter(s => s.visible !== false).map((section, idx) => {
                  const schema = getSchema(section.type)
                  const p = section.props || {}

                  return (
                    <div
                      key={section.id}
                      onClick={() => setSelectedId(section.id)}
                      className={`relative group cursor-pointer transition-all border-2 ${
                        selectedId === section.id ? "border-blue-500" : "border-transparent hover:border-blue-300"
                      }`}
                    >
                      {/* Section type label (overlay on hover) */}
                      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="px-2 py-1 bg-blue-600 text-white text-[10px] font-semibold rounded-md shadow-sm">
                          {schema?.icon} {schema?.label || section.type}
                        </span>
                      </div>

                      {/* Simplified visual for each section type */}
                      {section.type === "hero" && (
                        <div style={{ padding: "40px 32px", background: "linear-gradient(135deg, #eff6ff, #f5f3ff, #fdf2f8)", textAlign: p.variant === "centered" ? "center" : "left" }}>
                          {p.badge && <span style={{ display: "inline-block", padding: "4px 12px", background: "#dbeafe", color: "#2563eb", fontSize: "11px", borderRadius: "999px", marginBottom: "12px", fontWeight: 600 }}>{p.badge}</span>}
                          <div style={{ fontSize: "24px", fontWeight: 700, lineHeight: 1.2, fontFamily: "Georgia, serif" }} dangerouslySetInnerHTML={{ __html: p.title || "Titre hero" }} />
                          {p.subtitle && <p style={{ marginTop: "12px", fontSize: "14px", color: "#64748b" }}>{p.subtitle}</p>}
                          <div style={{ marginTop: "20px", display: "flex", gap: "8px", justifyContent: p.variant === "centered" ? "center" : "flex-start" }}>
                            {p.cta_primary?.text && <span style={{ padding: "8px 20px", background: "#2563eb", color: "white", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>{p.cta_primary.text}</span>}
                            {p.cta_secondary?.text && <span style={{ padding: "8px 20px", border: "2px solid #2563eb", color: "#2563eb", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>{p.cta_secondary.text}</span>}
                          </div>
                        </div>
                      )}

                      {section.type === "trust_bar" && (
                        <div style={{ display: "flex", justifyContent: "space-around", padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
                          {(p.items || []).map((item: any, i: number) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "18px", color: "#2563eb" }}>●</span>
                              <div>
                                <div style={{ fontSize: "12px", fontWeight: 600 }}>{item.title}</div>
                                {item.subtitle && <div style={{ fontSize: "10px", color: "#94a3b8" }}>{item.subtitle}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.type === "featured_products" && (
                        <div style={{ padding: "32px 24px" }}>
                          {p.title && <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: "8px" }}>{p.title}</div>}
                          {p.subtitle && <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>{p.subtitle}</div>}
                          <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.columns || 4}, 1fr)`, gap: "12px" }}>
                            {Array.from({ length: Math.min(Number(p.limit) || 4, 8) }).map((_, i) => (
                              <div key={i} style={{ aspectRatio: "1", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "collection_bubbles" && (
                        <div style={{ padding: "24px", textAlign: "center" }}>
                          {p.title && <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: "16px" }}>{p.title}</div>}
                          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div key={i} style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f1f5f9", border: "2px solid #e2e8f0" }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "ticker_marquee" && (
                        <div style={{ padding: "10px 0", background: p.background_color || "#1a1a2e", color: p.text_color || "white", textAlign: "center", fontSize: "12px", fontWeight: 500, letterSpacing: "2px", overflow: "hidden" }}>
                          {(p.items || []).map((item: any) => item.text).join("  •  ")}
                        </div>
                      )}

                      {section.type === "testimonials" && (
                        <div style={{ padding: "32px 24px" }}>
                          {p.title && <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "Georgia, serif", textAlign: "center", marginBottom: "16px" }}>{p.title}</div>}
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                            {((p.items || []).length > 0 ? p.items : [{}, {}, {}]).slice(0, 3).map((_: any, i: number) => (
                              <div key={i} style={{ padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#fafafa" }}>
                                <div style={{ color: "#f59e0b", fontSize: "12px" }}>★★★★★</div>
                                <div style={{ marginTop: "8px", fontSize: "11px", color: "#64748b", fontStyle: "italic" }}>"..."</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "image_with_text" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", padding: "32px 24px", alignItems: "center" }}>
                          <div style={{ width: "100%", aspectRatio: "4/3", background: p.image_url ? `url(${p.image_url}) center/cover` : "#f1f5f9", borderRadius: "16px", order: p.layout === "right" ? 1 : 0 }} />
                          <div style={{ order: p.layout === "right" ? 0 : 1 }}>
                            {p.tagline && <div style={{ fontSize: "10px", color: "#2563eb", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>{p.tagline}</div>}
                            {p.title && <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "Georgia, serif" }}>{p.title}</div>}
                            {p.cta?.text && <span style={{ display: "inline-block", marginTop: "12px", padding: "6px 16px", background: "#2563eb", color: "white", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>{p.cta.text}</span>}
                          </div>
                        </div>
                      )}

                      {section.type === "faq" && (
                        <div style={{ padding: "32px 24px", maxWidth: "600px", margin: "0 auto" }}>
                          {p.title && <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "Georgia, serif", textAlign: "center", marginBottom: "16px" }}>{p.title}</div>}
                          {(p.items || []).slice(0, 3).map((item: any, i: number) => (
                            <div key={i} style={{ padding: "12px 16px", border: "1px solid #f1f5f9", borderRadius: "10px", marginBottom: "6px" }}>
                              <div style={{ fontSize: "12px", fontWeight: 600 }}>{item.q || "Question..."}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.type === "newsletter" && (
                        <div style={{
                          padding: "40px 32px",
                          textAlign: "center",
                          color: p.background_style === "gradient" ? "white" : "#1e293b",
                          background: p.background_style === "gradient" ? "linear-gradient(135deg, #2563eb, #7c3aed)" : p.background_style === "light" ? "#f8fafc" : "white",
                          borderRadius: p.background_style !== "white" ? "0" : undefined,
                        }}>
                          {p.title && <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "Georgia, serif" }}>{p.title}</div>}
                          {p.subtitle && <div style={{ marginTop: "8px", fontSize: "13px", opacity: 0.8 }}>{p.subtitle}</div>}
                          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: "8px", maxWidth: "400px", margin: "16px auto 0" }}>
                            <div style={{ flex: 1, height: "40px", background: p.background_style === "gradient" ? "rgba(255,255,255,0.15)" : "#f1f5f9", borderRadius: "999px" }} />
                            <span style={{ padding: "8px 20px", background: p.background_style === "gradient" ? "white" : "#2563eb", color: p.background_style === "gradient" ? "#1e293b" : "white", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>{p.button_text || "S'inscrire"}</span>
                          </div>
                        </div>
                      )}

                      {section.type === "rich_text" && (
                        <div style={{ padding: "32px 24px", textAlign: (p.alignment || "center") as any }}>
                          <div style={{ maxWidth: p.max_width === "narrow" ? "500px" : p.max_width === "wide" ? "900px" : "700px", margin: "0 auto", fontSize: "13px", color: "#64748b" }} dangerouslySetInnerHTML={{ __html: p.content || "<p>Texte...</p>" }} />
                        </div>
                      )}

                      {section.type === "video" && (
                        <div style={{ padding: "32px 24px", textAlign: "center" }}>
                          {p.title && <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: "16px" }}>{p.title}</div>}
                          <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "48px", opacity: 0.5 }}>▶</span>
                          </div>
                          {p.url && <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "8px" }}>{p.url}</div>}
                        </div>
                      )}

                      {section.type === "promo_banner" && (
                        <div style={{ padding: "32px 24px", textAlign: "center", background: p.background_color || "#1a1a2e", color: p.text_color || "#fff" }}>
                          <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "Georgia, serif" }}>{p.title || "Promo"}</div>
                          {p.subtitle && <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "8px" }}>{p.subtitle}</div>}
                          {p.end_date && (
                            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
                              {["J", "H", "M", "S"].map(u => (
                                <div key={u} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.15)", borderRadius: "8px" }}>
                                  <div style={{ fontSize: "20px", fontWeight: 700, color: p.accent_color || "#f59e0b" }}>00</div>
                                  <div style={{ fontSize: "9px", textTransform: "uppercase" as any }}>{u}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {p.cta?.text && <span style={{ display: "inline-block", marginTop: "16px", padding: "8px 20px", background: p.accent_color || "#f59e0b", color: "#000", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>{p.cta.text}</span>}
                        </div>
                      )}

                      {section.type === "logo_cloud" && (
                        <div style={{ padding: "24px", textAlign: "center" }}>
                          {p.title && <div style={{ fontSize: "14px", fontWeight: 600, color: "#6b7280", marginBottom: "16px" }}>{p.title}</div>}
                          <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" as any, opacity: p.grayscale ? 0.5 : 1 }}>
                            {((p.items || []).length > 0 ? p.items : [{},{},{},{},{}]).slice(0, 6).map((_: any, i: number) => (
                              <div key={i} style={{ width: "80px", height: "40px", background: "#f1f5f9", borderRadius: "6px" }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "stats_counter" && (
                        <div style={{ padding: "32px 24px", textAlign: "center", background: p.background_color || "#f8fafc" }}>
                          {p.title && <div style={{ fontSize: "14px", fontWeight: 600, color: "#6b7280", marginBottom: "16px" }}>{p.title}</div>}
                          <div style={{ display: "flex", justifyContent: "center", gap: "40px" }}>
                            {(p.items || []).slice(0, 4).map((item: any, i: number) => (
                              <div key={i}>
                                <div style={{ fontSize: "28px", fontWeight: 700, color: "#2563eb" }}>{item.value}{item.suffix}</div>
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>{item.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.type === "cta_banner" && (
                        <div style={{
                          padding: "40px 32px",
                          textAlign: (p.alignment || "center") as any,
                          background: p.background_style === "gradient" ? "linear-gradient(135deg, #2563eb, #7c3aed)" : p.background_style === "light" ? "#f8fafc" : "#1a1a2e",
                          color: p.background_style === "light" ? "#1e293b" : "#fff",
                        }}>
                          <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "Georgia, serif" }}>{p.title}</div>
                          {p.subtitle && <div style={{ marginTop: "8px", fontSize: "14px", opacity: 0.8 }}>{p.subtitle}</div>}
                          {p.cta?.text && <span style={{ display: "inline-block", marginTop: "16px", padding: "10px 24px", background: p.background_style === "light" ? "#2563eb" : "white", color: p.background_style === "light" ? "white" : "#1e293b", borderRadius: "999px", fontSize: "13px", fontWeight: 600 }}>{p.cta.text}</span>}
                        </div>
                      )}

                      {section.type === "spacer" && (
                        <div style={{ height: p.height === "small" ? "24px" : p.height === "large" ? "80px" : p.height === "xlarge" ? "120px" : "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {p.show_line && <div style={{ width: p.line_width === "full" ? "100%" : p.line_width === "medium" ? "200px" : "60px", height: "1px", background: p.line_color || "#e2e8f0" }} />}
                        </div>
                      )}

                      {section.type === "custom_html" && (
                        <div style={{ padding: "16px 24px", background: "#fffbeb", border: "1px dashed #fde68a", margin: "0 16px" }}>
                          <div style={{ fontSize: "11px", color: "#92400e", fontWeight: 600, marginBottom: "4px" }}>🧩 HTML personnalisé</div>
                          <pre style={{ fontSize: "10px", color: "#78716c", whiteSpace: "pre-wrap" as any, maxHeight: "60px", overflow: "hidden" }}>{(p.html || "").substring(0, 200)}</pre>
                        </div>
                      )}

                      {section.type === "gallery" && (
                        <div style={{ padding: "24px" }}>
                          {p.title && <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "Georgia, serif", textAlign: "center", marginBottom: "16px" }}>{p.title}</div>}
                          <div style={{ display: "grid", gridTemplateColumns: `repeat(${p.layout === "grid_2" ? 2 : p.layout === "grid_4" ? 4 : 3}, 1fr)`, gap: p.gap === "none" ? "0" : p.gap === "large" ? "24px" : p.gap === "medium" ? "12px" : "4px" }}>
                            {((p.items || []).length > 0 ? p.items : [{},{},{},{},{},{}]).slice(0, 6).map((item: any, i: number) => (
                              <div key={i} style={{
                                aspectRatio: p.aspect_ratio === "landscape" ? "16/10" : p.aspect_ratio === "portrait" ? "3/4" : "1",
                                background: item?.image_url ? `url(${item.image_url}) center/cover` : "#f1f5f9",
                                borderRadius: "4px",
                              }} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallback for unknown/unhandled types */}
                      {!["hero", "trust_bar", "featured_products", "collection_bubbles", "ticker_marquee", "testimonials", "video_testimonials", "image_with_text", "faq", "newsletter", "rich_text", "video", "promo_banner", "logo_cloud", "stats_counter", "cta_banner", "spacer", "custom_html", "gallery"].includes(section.type) && (
                        <div style={{ padding: "24px", textAlign: "center", background: "#f8fafc" }}>
                          <SectionIcon type={section.type} className="w-6 h-6 text-gray-300 mx-auto" />
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>{schema?.label || section.type}</div>
                        </div>
                      )}

                      {/* Insert button between sections (Shopify-style) */}
                      <div className="group/insert relative h-0">
                        <div className="absolute left-0 right-0 top-0 -translate-y-1/2 z-20 flex items-center justify-center opacity-0 group-hover/insert:opacity-100 transition-opacity">
                          <div className="flex items-center w-full px-4">
                            <div className="flex-1 h-px bg-blue-400/50" />
                            <button
                              onClick={(e) => { e.stopPropagation(); setInsertIndex(idx + 1); setAddModalOpen(true) }}
                              className="mx-2 flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded-full shadow-md hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 5v14m-7-7h14" /></svg>
                            </button>
                            <div className="flex-1 h-px bg-blue-400/50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {sections.filter(s => s.visible !== false).length === 0 && (
                  <div style={{ padding: "80px 24px", textAlign: "center", color: "#94a3b8" }}>
                    <SectionIcon type="spacer" className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <div style={{ fontSize: "14px" }}>Page vide</div>
                    <div style={{ fontSize: "12px", marginTop: "4px" }}>Ajoutez des sections depuis le panneau de gauche</div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>

          {/* RIGHT: Properties panel (collapsible) */}
          <div style={{
            width: (selectedSection || showCode) ? "340px" : "0px",
            minWidth: (selectedSection || showCode) ? "340px" : "0px",
            borderLeft: (selectedSection || showCode) ? "1px solid #e5e7eb" : "none",
            overflowY: "auto",
            overflowX: "hidden",
            background: "white",
            flexShrink: 0,
            transition: "width 0.2s ease, min-width 0.2s ease",
          }}>
            {showCode ? (
              /* Code custom panel */
              <div style={{ padding: "16px" }}>
                <Text size="xsmall" weight="plus" className="text-gray-500 uppercase tracking-wider mb-3 block">Code personnalisé</Text>

                <div className="mb-4">
                  <Text size="xsmall" weight="plus" className="mb-1 block">CSS personnalisé</Text>
                  <textarea
                    value={customCss}
                    onChange={(e) => { setCustomCss(e.target.value); setHasChanges(true) }}
                    placeholder={`/* Vos styles CSS ici */\n.hero-title { color: red; }`}
                    rows={10}
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="mb-4">
                  <Text size="xsmall" weight="plus" className="mb-1 block">JavaScript (head)</Text>
                  <textarea
                    value={customJs}
                    onChange={(e) => { setCustomJs(e.target.value); setHasChanges(true) }}
                    placeholder={`// Votre JS ici (injecté dans <head>)`}
                    rows={6}
                    className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="mb-4">
                  <Text size="xsmall" weight="plus" className="mb-1 block">Données JSON brutes</Text>
                  <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-mono overflow-auto max-h-64 text-gray-600">
                    {JSON.stringify(sections, null, 2)}
                  </pre>
                </div>
              </div>
            ) : selectedSection ? (
              /* Properties form */
              <div style={{ padding: "0" }}>
                {/* Header with section name + actions */}
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", background: "#fafafa", position: "sticky" as any, top: 0, zIndex: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                      <SectionIcon type={selectedSection.type} className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-[13px] font-semibold text-gray-900 truncate">{getSchema(selectedSection.type)?.label || selectedSection.type}</span>
                    </div>
                    <div style={{ display: "flex", gap: "2px", shrink: 0 } as any}>
                      <button
                        onClick={() => updateSection(selectedSection.id, { visible: !selectedSection.visible })}
                        className={`p-1.5 rounded-md transition-colors ${selectedSection.visible ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" : "text-orange-500 bg-orange-50"}`}
                        title={selectedSection.visible ? "Masquer cette section" : "Afficher cette section"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          {selectedSection.visible
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          }
                        </svg>
                      </button>
                      <button
                        onClick={() => duplicateSection(selectedSection.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Dupliquer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteSection(selectedSection.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                      <div className="w-px h-5 bg-gray-200 mx-1 self-center" />
                      <button
                        onClick={() => setSelectedId(null)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Fermer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div style={{ padding: "16px" }}>
                  {getSchema(selectedSection.type)?.fields.map(field => (
                    <FieldRenderer
                      key={field.key}
                      field={field}
                      value={selectedSection.props[field.key]}
                      allValues={selectedSection.props}
                      onChange={(val) => updateProp(selectedSection.id, field.key, val)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Templates modal */}
      {templateOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-4"
          onClick={() => setTemplateOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <Heading level="h2" className="text-lg">Templates pré-configurés</Heading>
                <Text size="xsmall" className="text-gray-400">Remplace le contenu actuel par un template prêt à l'emploi</Text>
              </div>
              <button onClick={() => setTemplateOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-5 space-y-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.name}
                  onClick={() => applyTemplate(template)}
                  className="w-full flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="text-3xl shrink-0">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <Text size="small" weight="plus">{template.name}</Text>
                    <Text size="xsmall" className="text-gray-400 mt-0.5">{template.description}</Text>
                    <Text size="xsmall" className="text-gray-500 mt-1">{template.sections.length} sections</Text>
                  </div>
                  <span className="text-gray-400 text-sm shrink-0 self-center">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add section modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/30 flex items-center justify-center p-4"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <Heading level="h2" className="text-lg">Ajouter une section</Heading>
                <Text size="xsmall" className="text-gray-400">{catalog.length} types disponibles</Text>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-5 space-y-6">
              {Object.entries(groupedCatalog)
                .sort((a, b) => (categories[a[0]]?.order || 99) - (categories[b[0]]?.order || 99))
                .map(([cat, schemas]) => (
                  <div key={cat}>
                    <Text size="xsmall" weight="plus" className="text-gray-500 uppercase tracking-wider mb-2 block">
                      {categories[cat]?.label || cat}
                    </Text>
                    <div className="grid grid-cols-2 gap-2">
                      {schemas.map(schema => (
                        <button
                          key={schema.type}
                          onClick={() => addSection(schema)}
                          className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-left group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                            <SectionIcon type={schema.type} className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <Text size="small" weight="plus">{schema.label}</Text>
                            <Text size="xsmall" className="text-gray-400 mt-0.5 line-clamp-2">{schema.description}</Text>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const LayoutIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

export const config = defineRouteConfig({
  label: "Page Builder",
  icon: LayoutIcon,
})

export default PageBuilderPage
