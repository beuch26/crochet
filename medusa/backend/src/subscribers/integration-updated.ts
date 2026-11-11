import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { invalidateCache } from "../lib/integration-config"

/**
 * Invalidate the in-process integration config cache whenever an
 * integration is updated/enabled/disabled. Other subscribers and route
 * handlers that called getIntegrationConfig() will pick up the new
 * values on their next call without needing a restart.
 *
 * Note: integrations marked `restart_required: true` (Stripe, Brevo,
 * Google OAuth) still need a manual pm2 restart for their SDK / SMTP
 * transporter to use the new credentials — the cache invalidation only
 * helps consumers that read the config lazily (GitHub PAT, GA IDs,
 * affiliate tracker URL, etc.).
 */
export default async function integrationUpdatedHandler({
  event,
}: SubscriberArgs<{ slug?: string; changed_fields?: string[] }>) {
  const slug = event?.data?.slug
  invalidateCache(slug)
}

export const config: SubscriberConfig = {
  event: "integration.updated",
}
