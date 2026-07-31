import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError, postProducerChat, type BeatParameters } from "@/lib/api"

export interface ChatMessage {
  id: string
  role: "user" | "producer"
  content: string
  timestamp: number
  /** Only present on producer replies — the structured production brief behind the message. */
  brief?: {
    genre: string
    beatParameters: BeatParameters
    recommendedVocalChain: string
    masteringTarget: string
  }
}

export type ProducerChatStatus = "idle" | "sending" | "error"
/** "validation" = empty message (client-side or backend's 400); "network" = fetch never reached the backend; "server" = backend reached but returned an error. Drives which icon/copy the panel shows. */
export type ProducerChatErrorKind = "validation" | "network" | "server"

export interface UseProducerChatResult {
  messages: ChatMessage[]
  status: ProducerChatStatus
  /** Set when the last send attempt failed — cleared on the next successful send or dismissError(). */
  errorMessage: string | null
  errorKind: ProducerChatErrorKind | null
  send: (rawMessage: string, hasVocal: boolean) => Promise<void>
  dismissError: () => void
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Owns the AI Producer Chat conversation state and talks to
 * POST /api/v1/producer/chat (src/backend/main.py -> ProducerAIService).
 * No canned/local responses anywhere — every producer message in the
 * transcript came back from that endpoint. A failed request never loses the
 * artist's typed message: it stays in the transcript as their turn, and the
 * error surfaces as a dismissible/retryable state rather than silently
 * disappearing.
 */
export function useProducerChat(): UseProducerChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ProducerChatStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<ProducerChatErrorKind | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const send = useCallback(async (rawMessage: string, hasVocal: boolean) => {
    const trimmed = rawMessage.trim()
    if (!trimmed) {
      setStatus("error")
      setErrorKind("validation")
      setErrorMessage("Type a message before sending — the producer needs something to work with.")
      return
    }

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setStatus("sending")
    setErrorMessage(null)
    setErrorKind(null)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await postProducerChat({ message: trimmed, hasVocal }, controller.signal)
      const producerMessage: ChatMessage = {
        id: makeId(),
        role: "producer",
        content: result.producer_message,
        timestamp: Date.now(),
        brief: {
          genre: result.genre,
          beatParameters: result.beat_parameters,
          recommendedVocalChain: result.recommended_vocal_chain,
          masteringTarget: result.mastering_target,
        },
      }
      setMessages((prev) => [...prev, producerMessage])
      setStatus("idle")
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      setStatus("error")
      if (err instanceof ApiError) {
        setErrorMessage(err.message)
        setErrorKind(err.status === undefined ? "network" : err.status === 400 ? "validation" : "server")
      } else {
        setErrorMessage("Unexpected error talking to the AI producer.")
        setErrorKind("server")
      }
    }
  }, [])

  const dismissError = useCallback(() => {
    setStatus("idle")
    setErrorMessage(null)
    setErrorKind(null)
  }, [])

  return { messages, status, errorMessage, errorKind, send, dismissError }
}
