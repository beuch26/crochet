import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getIntegrationConfig } from "../../../lib/integration-config"

const PACKLINK_LIVE_API = "https://api.packlink.com/v1"

/**
 * POST /store/shipping  { to_zip, to_country, weight?, items? }
 * Renvoie les tarifs de livraison en direct depuis Packlink pour la destination.
 *
 * Config = module Intégrations → Packlink (source unique). La clé a longtemps
 * été cherchée dans `theme_setting`, où elle n'a jamais existé : la route
 * répondait 400 et le tunnel affichait « Aucun transporteur disponible pour
 * cette destination » quelle que soit l'adresse.
 *
 * Les prix sont renvoyés en EUROS, comme le reste de Medusa : le storefront les
 * formate tels quels et les compare au seuil de franco, lui aussi en euros.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const cfg = await getIntegrationConfig<{
    api_key?: string
    warehouse_country?: string
    warehouse_zip?: string
  }>(req.scope, "packlink")

  const apiKey = cfg.api_key
  if (!apiKey) {
    return res.status(400).json({ message: "Packlink non configuré (Intégrations → Packlink)." })
  }

  const warehouseCountry = (cfg.warehouse_country || "FR").toUpperCase()
  const warehouseZip = cfg.warehouse_zip || "75017"

  const { to_zip, to_country, weight, items } = req.body as {
    to_zip: string
    to_country: string
    weight?: number
    items?: { quantity: number; weight?: number }[]
  }

  if (!to_zip || !to_country) {
    return res.status(400).json({ message: "Destination zip and country required" })
  }

  // Calculate total weight (default 0.5kg per item)
  let totalWeight = weight || 0
  if (!totalWeight && items) {
    totalWeight = items.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0)
  }
  if (!totalWeight) totalWeight = 1 // Default 1kg

  try {
    // Un seul appel : le `GET /services` sans paramètres qui servait de test de
    // connexion répondait `Bad Request` (Packlink exige origine, destination et
    // colis) et faisait sortir la route en 500 avant d'interroger les tarifs.
    const url =
      `${PACKLINK_LIVE_API}/services?from[country]=${warehouseCountry}&from[zip]=${warehouseZip}` +
      `&to[country]=${to_country.toUpperCase()}&to[zip]=${to_zip}` +
      `&packages[0][weight]=${totalWeight}&packages[0][height]=10&packages[0][length]=20&packages[0][width]=15`

    const shipmentRes = await fetch(url, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
    })

    if (!shipmentRes.ok) {
      const err = await shipmentRes.text()
      console.error("Packlink services error:", err)
      return res.status(502).json({ message: "Erreur lors du calcul des tarifs", error: err.slice(0, 300) })
    }

    const services = await shipmentRes.json()

    // Format response — only return relevant info
    const options = (Array.isArray(services) ? services : [])
      .filter((s: any) => s.price?.total_price != null)
      .map((s: any) => {
        // Packlink expose `transit_hours` ("72") et `transit_time` sous forme de
        // chaîne ("3 DAYS") — pas un objet {min_days, max_days}. L'ancien mapping
        // lisait s.transit_time.min_days, toujours undefined, d'où un
        // « Délai estimé à la commande » sur chaque ligne du sélecteur.
        const hours = Number(s.transit_hours)
        const days = Number.isFinite(hours) && hours > 0 ? Math.ceil(hours / 24) : null

        return {
          id: s.id,
          name: s.name,
          carrier: s.carrier_name,
          // Packlink ne renvoie pas d'URL de logo, seulement un slug
          // ("chronopost-s2s"), et son CDN répond 403 en hotlink : le
          // storefront sert ses propres fichiers depuis /carriers/.
          logo_id: s.logo_id || "",
          price: Number(s.price.total_price), // en euros, comme les prix Medusa
          currency: s.price.currency || "EUR",
          delivery_days: days,
          delivery_label: days
            ? `${days} jour${days > 1 ? "s" : ""} ouvré${days > 1 ? "s" : ""}`
            : "Délai estimé à la commande",
          type: s.category, // "standard", "express", etc.
        }
      })
      .sort((a: any, b: any) => a.price - b.price)
      .slice(0, 8) // Max 8 options

    res.json({ shipping_options: options })
  } catch (e: any) {
    console.error("Packlink fetch error:", e)
    res.status(500).json({ message: "Erreur de connexion à Packlink", error: e.message })
  }
}
