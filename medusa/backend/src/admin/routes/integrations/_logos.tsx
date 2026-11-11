/**
 * Inline brand SVG logos for the integrations grid + detail page.
 *
 * Approximations of the official wordmarks/icons using each provider's
 * brand colours. Bundled with the admin so no static-asset round-trip
 * is needed.
 */

import React from "react"

type Props = { size?: number }

const Stripe: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#635BFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.27 0 0 6.27 0 14s6.27 14 14 14 14-6.27 14-14S21.73 0 14 0Zm.8 19.4c-1.8 0-3.3-.6-4.3-1.3l.6-3.1c.9.5 2 1.1 3.5 1.1.9 0 1.5-.3 1.5-.9 0-.7-.7-1-1.9-1.4-1.8-.6-4-1.4-4-3.9 0-2.2 1.7-3.7 4.4-3.7 1.3 0 2.8.3 3.6.7l-.6 3c-.7-.3-1.7-.7-2.8-.7-.8 0-1.3.2-1.3.7 0 .6.6.9 1.7 1.3 2 .7 4.2 1.5 4.2 4.1 0 2.5-1.9 4.1-4.6 4.1Z" fill="#fff" />
    </svg>
  </div>
)

const Brevo: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#0B996E", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 7h11.5c4.5 0 7.4 2 7.4 5.4 0 2.4-1.5 3.9-3.2 4.5 2.4.5 4 2.4 4 4.9 0 3.7-3 5.7-7.6 5.7H5V7Zm4 4v5.5h5.6c1.8 0 3-.9 3-2.7 0-1.8-1.2-2.8-3-2.8H9Zm0 9V25h5.7c2 0 3.4-1 3.4-2.8 0-1.7-1.3-2.7-3.4-2.7H9Z" fill="#fff" />
    </svg>
  </div>
)

const GA4: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f1f5f9" }}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="4" width="6" height="24" rx="3" fill="#F9AB00" />
      <rect x="12" y="12" width="6" height="16" rx="3" fill="#E37400" />
      <rect x="4" y="20" width="6" height="8" rx="3" fill="#E37400" />
    </svg>
  </div>
)

const GTM: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f1f5f9" }}>
    <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3 3 16l13 13 4-4-9-9 9-9-4-4Z" fill="#8AB4F8" />
      <path d="M16 3l13 13-13 13-4-4 9-9-9-9 4-4Z" fill="#4285F4" />
      <circle cx="16" cy="16" r="2.6" fill="#fff" />
    </svg>
  </div>
)

const Clarity: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#FA571C", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 11.5c-.9-1.6-2.7-2.6-5-2.6-3.4 0-5.7 2.5-5.7 6.4 0 4 2.4 6.5 5.8 6.5 2.3 0 4-1 5-2.7l-2.8-1.6c-.4.9-1.2 1.4-2.3 1.4-1.7 0-2.8-1.4-2.8-3.6 0-2.2 1-3.5 2.7-3.5 1.1 0 1.8.4 2.3 1.4l2.8-1.7Z" fill="#fff" />
    </svg>
  </div>
)

const GoogleOAuth: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f1f5f9" }}>
    <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09a6.59 6.59 0 0 1 0-4.18V7.07H2.18a10.99 10.99 0 0 0 0 9.86l3.66-2.84Z" fill="#FBBC04" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
    </svg>
  </div>
)

const GitHub: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#24292F", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.58v-2.04c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.24-.13-.31-.54-1.54.11-3.2 0 0 1.01-.33 3.3 1.24a11.5 11.5 0 0 1 6.01 0c2.29-1.57 3.3-1.24 3.3-1.24.66 1.66.25 2.89.12 3.2.77.84 1.24 1.92 1.24 3.24 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.84.58A12 12 0 0 0 12 .3Z" fill="#fff" />
    </svg>
  </div>
)

const TikTok: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      {/* TikTok music-note silhouette with the brand's red + cyan offset effect */}
      <path d="M22 4h-4v17.5a3 3 0 1 1-3-3v-3.8a6.8 6.8 0 1 0 6.8 6.8V10.8a8.9 8.9 0 0 0 5.2 1.6V8.6c-2.7 0-5-2-5-4.6Z" fill="#FF0050" transform="translate(.7 .4)" />
      <path d="M22 4h-4v17.5a3 3 0 1 1-3-3v-3.8a6.8 6.8 0 1 0 6.8 6.8V10.8a8.9 8.9 0 0 0 5.2 1.6V8.6c-2.7 0-5-2-5-4.6Z" fill="#00F2EA" transform="translate(-.7 -.4)" />
      <path d="M22 4h-4v17.5a3 3 0 1 1-3-3v-3.8a6.8 6.8 0 1 0 6.8 6.8V10.8a8.9 8.9 0 0 0 5.2 1.6V8.6c-2.7 0-5-2-5-4.6Z" fill="#fff" />
    </svg>
  </div>
)

const TikTokShop: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#FE2C55", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6h14a2 2 0 0 1 2 2v3H7V8a2 2 0 0 1 2-2Zm-2 6h18v10a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4V12Zm6 4v6h2v-6h-2Zm6 0v6h2v-6h-2Z" fill="#fff" />
    </svg>
  </div>
)

const GoogleAds: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #f1f5f9" }}>
    <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 19.4c-.5.9-1.6 1.2-2.5.7-.9-.5-1.2-1.6-.7-2.5L10 4.6c.5-.9 1.6-1.2 2.5-.7.9.5 1.2 1.6.7 2.5L5.5 19.4Z" fill="#FBBC04" />
      <path d="M18.5 19.4c-.5.9-1.6 1.2-2.5.7-.9-.5-1.2-1.6-.7-2.5L23 4.6c.5-.9 1.6-1.2 2.5-.7.9.5 1.2 1.6.7 2.5l-7.7 13Z" transform="translate(-5)" fill="#4285F4" />
      <circle cx="5.5" cy="18" r="2.4" fill="#34A853" />
    </svg>
  </div>
)

const Effiliation: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#0066CC", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 6c-5.5 0-10 4.5-10 10s4.5 10 10 10c2.4 0 4.6-.8 6.3-2.2l-2.7-2.7c-1 .8-2.2 1.3-3.6 1.3-2.7 0-5-1.8-5.7-4.2H22c.1-.7.2-1.4.2-2.2 0-5.5-4.5-10-10.2-10Zm-5.7 8.2c.7-2.4 3-4.2 5.7-4.2s5 1.8 5.7 4.2H10.3Z" fill="#fff" />
    </svg>
  </div>
)

const MetaPixel: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#0866FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      {/* Meta wordmark (simplified infinity-style mark) */}
      <path d="M9 12.5c2.5-3.6 5.4-3.6 7.5-1.4l4 4.4 4-4.4c2.1-2.2 5-2.2 7.5 1.4 2.4 3.4 1 8.7-2.4 8.7-2.6 0-4-1.6-6.5-4.6l-2.6-3-2.6 3c-2.5 3-3.9 4.6-6.5 4.6C7.6 21.2 6.6 15.9 9 12.5Z" fill="#fff" />
    </svg>
  </div>
)

const Packlink: React.FC<Props> = ({ size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: "#1c3768", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      {/* Stylised parcel + chevron arrow (Packlink logomark cue) */}
      <path d="M16 4 5 9v14l11 5 11-5V9L16 4Zm0 2.4 8.3 3.7L16 13.8 7.7 10.1 16 6.4ZM7 11.8l8 3.6v10.4l-8-3.6V11.8Zm10 14V15.4l8-3.6v10.4l-8 3.6Z" fill="#fff" />
      <path d="M19 17.5 22 20l-3 2.5v-5Z" fill="#FF7A00" />
    </svg>
  </div>
)

const LOGOS: Record<string, React.FC<Props>> = {
  stripe: Stripe,
  brevo: Brevo,
  ga4: GA4,
  gtm: GTM,
  clarity: Clarity,
  google_oauth: GoogleOAuth,
  github_blog_rebuild: GitHub,
  google_ads: GoogleAds,
  tiktok_pixel: TikTok,
  tiktok_shop_feed: TikTokShop,
  effiliation: Effiliation,
  meta_pixel: MetaPixel,
  packlink: Packlink,
}

export function IntegrationLogo({ slug, size = 32 }: { slug: string; size?: number }) {
  const Component = LOGOS[slug]
  if (Component) return <Component size={size} />
  // Fallback to first-letter colored square if unknown slug
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: size * 0.45 }}>
      {slug.charAt(0).toUpperCase()}
    </div>
  )
}

export default LOGOS
