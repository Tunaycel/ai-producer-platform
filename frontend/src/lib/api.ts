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

/** Mirrors ProducerAIService.process_artist_request's `beat_parameters` shape (src/backend/services/producer_ai.py). */
export interface BeatParameters {
  bpm: number
  key: string
  sub_bass_type: string
  hihat_groove: string
  instrumentation: string
}

/** Mirrors the JSON body returned by POST /api/v1/producer/chat. */
export interface ProducerChatResponse {
  producer_message: string
  genre: string
  beat_parameters: BeatParameters
  recommended_vocal_chain: string
  mastering_target: string
}

export interface ProducerChatRequest {
  message: string
  /** Whether the artist already has a vocal take recorded this session — lets the producer tailor its reply. */
  hasVocal?: boolean
  /** BPM/key metadata from a previously analyzed reference track, if any (POST /api/v1/audio/analyze-reference). */
  referenceMeta?: Record<string, unknown> | null
}

/**
 * POST /api/v1/producer/chat
 * Throws ApiError on network failure or non-2xx response (including the
 * backend's 400 "Message prompt cannot be empty") — callers decide how to
 * surface that (see useProducerChat).
 */
export async function postProducerChat(
  request: ProducerChatRequest,
  signal?: AbortSignal,
): Promise<ProducerChatResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/producer/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: request.message,
        has_vocal: request.hasVocal ?? false,
        reference_meta: request.referenceMeta ?? null,
      }),
      signal,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause
    }
    throw new ApiError("Could not reach the AI Producer backend. Is it running?")
  }

  if (!response.ok) {
    // The backend returns {"detail": "..."} for its validation errors (e.g. empty message).
    // Fall back to a generic status message if the error body isn't JSON.
    let detail: string | undefined
    try {
      const body = (await response.json()) as { detail?: string }
      detail = body.detail
    } catch (parseError) {
      console.warn("Producer chat error response was not valid JSON.", parseError)
    }
    throw new ApiError(detail ?? `Producer chat request failed (HTTP ${response.status}).`, response.status)
  }

  return (await response.json()) as ProducerChatResponse
}

/** Mirrors one item in ViralScannerService.get_viral_recommendations (src/backend/services/viral_scanner.py). */
export interface ViralTrendRecommendation {
  id: string
  title: string
  original_reference: string
  viral_score: number
  platform: string
  bpm: number
  key: string
  style_match: string
  description: string
  vocal_recommendation: string
  demo_audio_url: string
}

/** Mirrors the JSON body returned by GET /api/v1/trends/viral-beats. */
export interface ViralTrendsResponse {
  trends: ViralTrendRecommendation[]
}

/**
 * GET /api/v1/trends/viral-beats?genre=<style>
 * Throws ApiError on network failure or non-2xx response — callers decide
 * how to surface that (see useViralTrends).
 */
export async function fetchViralTrends(genre: string, signal?: AbortSignal): Promise<ViralTrendsResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/trends/viral-beats?genre=${encodeURIComponent(genre)}`, {
      signal,
    })
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") {
      throw cause
    }
    throw new ApiError("Could not reach the AI Producer backend. Is it running?")
  }

  if (!response.ok) {
    let detail: string | undefined
    try {
      const body = (await response.json()) as { detail?: string }
      detail = body.detail
    } catch (parseError) {
      console.warn("Viral trends error response was not valid JSON.", parseError)
    }
    throw new ApiError(detail ?? `Viral trends request failed (HTTP ${response.status}).`, response.status)
  }

  return (await response.json()) as ViralTrendsResponse
}
