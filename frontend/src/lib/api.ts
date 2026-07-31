/**
 * Thin typed client for the FastAPI backend (src/backend/main.py).
 * No framework magic — small enough that adding endpoints later (chat,
 * analyze-reference, viral-beats) is a one-function addition, not a rewrite.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export interface HealthCheckResponse {
  status: string
  engine: string
  quality: string
}

/**
 * GET /api/v1/health
 * Throws ApiError on network failure or non-2xx response — callers decide
 * how to surface that (see useHealthCheck).
 */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthCheckResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/health`, { signal })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause
    }
    throw new ApiError("Could not reach the AI Producer backend. Is it running?")
  }

  if (!response.ok) {
    throw new ApiError(`Backend health check failed (HTTP ${response.status}).`, response.status)
  }

  return (await response.json()) as HealthCheckResponse
}
