import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { THEME_MODULE } from "../../../modules/theme"

const PACKLINK_API = "https://api.packlink.com/v1"

// POST /admin/shipping-label
// body: { order_id: string, service_id?: string }
// Creates a shipment with Packlink and returns the label URL (PDF)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderService = req.scope.resolve(Modules.ORDER) as any
  const themeService = req.scope.resolve(THEME_MODULE) as any

  const { order_id, service_id } = req.body as { order_id: string; service_id?: string }

  if (!order_id) return res.status(400).json({ message: "order_id requis" })

  // Get Packlink config from theme
  const settings = await themeService.listThemeSettings({})
  const getVal = (key: string) => settings.find((s: any) => s.key === key)?.value || ""

  const apiKey = getVal("packlink_api_key")
  const fromCountry = getVal("packlink_warehouse_country") || "FR"
  const fromZip = getVal("packlink_warehouse_zip") || "75017"

  if (!apiKey) {
    return res.status(400).json({ message: "Clé API Packlink non configurée dans le thème" })
  }

  // Get order
  let order: any
  try {
    order = await orderService.retrieveOrder(order_id, { relations: ["items", "shipping_address"] })
  } catch {
    return res.status(404).json({ message: "Commande introuvable" })
  }

  const addr = order.shipping_address
  if (!addr) return res.status(400).json({ message: "Pas d'adresse de livraison" })

  // Calculate total weight (default 0.5kg per item)
  const totalWeight = (order.items || []).reduce((s: number, i: any) => s + (i.quantity || 1) * 0.5, 0) || 1

  try {
    // Step 1: Get available services if no service_id
    if (!service_id) {
      const servicesUrl = `${PACKLINK_API}/services?from[country]=${fromCountry}&from[zip]=${fromZip}&to[country]=${addr.country_code?.toUpperCase()}&to[zip]=${addr.postal_code}&packages[0][weight]=${totalWeight}&packages[0][height]=10&packages[0][length]=20&packages[0][width]=15`

      const servicesRes = await fetch(servicesUrl, {
        headers: { Authorization: apiKey, "Content-Type": "application/json" },
      })

      if (!servicesRes.ok) {
        const err = await servicesRes.text()
        return res.status(500).json({ message: "Erreur Packlink (services)", error: err })
      }

      const services = await servicesRes.json()
      return res.json({
        services: services.slice(0, 10).map((s: any) => ({
          id: s.id,
          name: s.name,
          carrier: s.carrier_name,
          logo: s.logo_url,
          price: Math.round((s.price?.total_price || 0) * 100),
          delivery_days: s.transit_time?.max_days,
        })),
      })
    }

    // Step 2: Create shipment with chosen service
    const shipmentBody = {
      service_id,
      content: order.items?.map((i: any) => i.title).join(", ").substring(0, 100) || "Magic Crochet Kit order",
      content_value: Math.round(Number(order.total) || 0),
      content_weight: totalWeight,
      from: {
        country: fromCountry,
        zip: fromZip,
        city: "Paris",
        street: "6 Rue d'Armaille",
        first_name: "Magic Crochet Kit",
        last_name: "TN GROUP",
        email: "contact@magic-crochet-kit.com",
        phone: "0951761711",
      },
      to: {
        country: addr.country_code?.toUpperCase(),
        zip: addr.postal_code,
        city: addr.city,
        street: addr.address_1,
        first_name: addr.first_name,
        last_name: addr.last_name,
        email: order.email,
        phone: addr.phone || "",
      },
      packages: [{
        weight: totalWeight,
        height: 10,
        length: 20,
        width: 15,
      }],
    }

    const shipmentRes = await fetch(`${PACKLINK_API}/shipments`, {
      method: "POST",
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(shipmentBody),
    })

    if (!shipmentRes.ok) {
      const err = await shipmentRes.text()
      return res.status(500).json({ message: "Erreur Packlink (shipment)", error: err })
    }

    const shipment = await shipmentRes.json()

    res.json({
      shipment_id: shipment.id || shipment.reference,
      tracking_number: shipment.tracking_number || null,
      tracking_url: shipment.tracking_url || null,
      label_url: shipment.labels?.[0] || shipment.label_url || null,
      carrier: shipment.carrier_name || null,
      message: "Etiquette generee avec succes",
    })
  } catch (e: any) {
    console.error("Shipping label error:", e)
    res.status(500).json({ message: "Erreur de generation", error: e.message })
  }
}
