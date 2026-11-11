import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

// Medusa admin v2 stores the theme under this localStorage key
// and toggles a `.dark` class on <html>.
const THEME_KEY = "medusa_admin_theme"

function detectInitial(): "light" | "dark" {
  if (typeof document === "undefined") return "light"
  // 1. honor an explicit user choice if present
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === "dark" || stored === "light") return stored
  } catch {}
  // 2. fall back to whatever class Medusa already applied (OS-based)
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (theme === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
}

/**
 * Floating sun/moon button that flips the admin between light and dark mode.
 * Persists the choice in localStorage under the same key Medusa uses, so the
 * setting survives navigation and reload. Renders to document.body via Portal,
 * which means a single instance is enough per page.
 */
export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">(detectInitial)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    applyTheme(detectInitial())
  }, [])

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== THEME_KEY) return
      const v = e.newValue === "dark" ? "dark" : "light"
      setTheme(v)
      applyTheme(v)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    applyTheme(next)
    try {
      localStorage.setItem(THEME_KEY, next)
      window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY, newValue: next }))
    } catch {}
  }

  if (!mounted) return null

  const isDark = theme === "dark"

  return createPortal(
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 999,
        border: isDark ? "1px solid #2a2a2a" : "1px solid rgba(0,0,0,0.12)",
        background: isDark ? "#1e1e1e" : "#ffffff",
        color: isDark ? "#fafafa" : "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
        zIndex: 9999,
        padding: 0,
      }}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>,
    document.body
  )
}

export default ThemeToggle
