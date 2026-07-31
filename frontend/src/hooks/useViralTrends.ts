import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError, fetchViralTrends, type ViralTrendRecommendation } from "@/lib/api"

export type ViralTrendsStatus = "loading" | "success" | "error"

export interface UseViralTrendsResult {
  genre: string
  setGenre: (genre: string) => void
  status: ViralTrendsStatus
  trends: ViralTrendRecommendation[]
  errorMessage: string | null
  /** Re-runs the current genre's request — used by the error state's Retry button. */
  refresh: () => void
}

/**
 * Owns the Viral Trend Analyzer's data — talks to
 * GET /api/v1/trends/viral-beats?genre=<style> (src/backend/main.py ->
 * ViralScannerService). No local/canned trend data anywhere: a failed
 * fetch surfaces as a real error state with retry, never a fallback list.
 * Re-fetches whenever `genre` changes, guarding against out-of-order
 * responses the same way useHealthCheck does (request-id check + abort).
 */
export function useViralTrends(initialGenre: string): UseViralTrendsResult {
  const [genre, setGenre] = useState(initialGenre)
  const [status, setStatus] = useState<ViralTrendsStatus>("loading")
  const [trends, setTrends] = useState<ViralTrendRecommendation[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback((forGenre: string) => {
    const requestId = ++requestIdRef.current
    setStatus("loading")
    setErrorMessage(null)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    fetchViralTrends(forGenre, controller.signal)
      .then((result) => {
        if (requestIdRef.current !== requestId) return
        setTrends(result.trends)
        setStatus("success")
      })
      .catch((err: unknown) => {
        if (requestIdRef.current !== requestId) return
        if (err instanceof DOMException && err.name === "AbortError") return
        setTrends([])
        setStatus("error")
        setErrorMessage(err instanceof ApiError ? err.message : "Unexpected error scanning viral trends.")
      })
  }, [])

  useEffect(() => {
    load(genre)
    return () => abortRef.current?.abort()
  }, [genre, load])

  const refresh = useCallback(() => load(genre), [genre, load])

  return { genre, setGenre, status, trends, errorMessage, refresh }
}
