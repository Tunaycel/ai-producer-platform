import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError, fetchHealth, type HealthCheckResponse } from "@/lib/api"

export type HealthCheckStatus = "loading" | "online" | "offline"

export interface UseHealthCheckResult {
  status: HealthCheckStatus
  data: HealthCheckResponse | null
  error: string | null
  refresh: () => void
}

const POLL_INTERVAL_MS = 30_000

/**
 * Polls GET /api/v1/health on mount and every 30s so the header status pill
 * reflects real backend reachability instead of a hardcoded "online" dot.
 */
export function useHealthCheck(): UseHealthCheckResult {
  const [status, setStatus] = useState<HealthCheckStatus>("loading")
  const [data, setData] = useState<HealthCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const check = useCallback(() => {
    const requestId = ++requestIdRef.current
    setStatus((prev) => (prev === "online" ? prev : "loading"))

    const controller = new AbortController()
    fetchHealth(controller.signal)
      .then((result) => {
        if (requestIdRef.current !== requestId) return
        setData(result)
        setError(null)
        setStatus("online")
      })
      .catch((err: unknown) => {
        if (requestIdRef.current !== requestId) return
        if (err instanceof DOMException && err.name === "AbortError") return
        setError(err instanceof ApiError ? err.message : "Unexpected error reaching the backend.")
        setStatus("offline")
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const cancel = check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    return () => {
      cancel()
      clearInterval(interval)
    }
  }, [check])

  return { status, data, error, refresh: check }
}
