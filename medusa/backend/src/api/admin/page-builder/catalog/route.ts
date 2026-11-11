import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SECTION_CATALOG, CATEGORY_META, getSchemaByType } from "../../../../page-builder/catalog"

/**
 * GET /admin/page-builder/catalog
 *
 * Returns the list of all available section schemas + category metadata.
 * Used by the visual editor to:
 *   - Display the "Add section" picker (grouped by category)
 *   - Auto-generate the property edit form
 *   - Provide default props when adding a new section
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const type = req.query.type as string | undefined

  // Single section lookup
  if (type) {
    const schema = getSchemaByType(type)
    if (!schema) {
      return res.status(404).json({ message: `Section type '${type}' introuvable` })
    }
    return res.json({ schema })
  }

  // Full catalog
  res.json({
    sections: SECTION_CATALOG,
    categories: CATEGORY_META,
    count: SECTION_CATALOG.length,
  })
}
