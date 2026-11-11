import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ThemeToggle } from "../components/theme-toggle"

// Renders a fixed-position sun/moon toggle. Registered on every common
// built-in list zone so the button is reachable from any built-in page.
// Custom routes that want it should import ThemeToggle directly (see
// admin/routes/integrations/page.tsx).
const ThemeToggleWidget = () => <ThemeToggle />

export const config = defineWidgetConfig({
  zone: [
    "product.list.before",
    "order.list.before",
    "customer.list.before",
    "customer_group.list.before",
    "inventory_item.list.before",
    "promotion.list.before",
    "campaign.list.before",
    "product_category.list.before",
    "product_collection.list.before",
    "tax.list.before",
    "sales_channel.list.before",
    "api_key.list.before",
    "user.list.before",
    "shipping_profile.list.before",
    "region.list.before",
    "location.list.before",
    "reservation.list.before",
    "workflow.list.before",
    "login.before",
  ],
})

export default ThemeToggleWidget
