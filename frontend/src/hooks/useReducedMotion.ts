import { useEffect, useState } from "react"

/**
 * Tracks `prefers-reduced-motion: reduce` live (not just at mount) so any
 * animated component — the WebGL VU meters, CSS transitions, etc. — can
 * back off decorative motion the moment the OS setting changes, without a
 * page reload. Used by ConsoleVUMeter to skip the idle needle sweep and by
 * ProducerChatPanel to skip the typing-dots animation.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener("change", handleChange)
    return () => query.removeEventListener("change", handleChange)
  }, [])

  return reduced
}
