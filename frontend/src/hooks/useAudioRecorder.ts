import { useCallback, useEffect, useRef, useState } from "react"

export type RecorderState = "idle" | "requesting" | "recording" | "recorded" | "error"
export type RecorderErrorKind = "permission-denied" | "unsupported" | "no-device" | "unknown"

export interface UseAudioRecorderResult {
  state: RecorderState
  errorKind: RecorderErrorKind | null
  elapsedSeconds: number
  audioUrl: string | null
  /** Live analyser node while recording — read by the visualizer via rAF. Null when idle/recorded/error. */
  analyser: AnalyserNode | null
  start: () => Promise<void>
  stop: () => void
  reset: () => void
}

/**
 * Owns the real audio capture pipeline (getUserMedia + MediaRecorder +
 * AnalyserNode) so components stay presentation-only. Ported from the
 * original vanilla toggleRecording()/visualizeAudioLive() logic in
 * src/frontend/app.js, with explicit error states instead of alert().
 */
export function useAudioRecorder(): UseAudioRecorderResult {
  const [state, setState] = useState<RecorderState>("idle")
  const [errorKind, setErrorKind] = useState<RecorderErrorKind | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const teardownStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close()
    }
    audioContextRef.current = null
    setAnalyser(null)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => teardownStream, [teardownStream])

  const start = useCallback(async () => {
    if (state === "requesting" || state === "recording") return

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("error")
      setErrorKind("unsupported")
      return
    }

    setState("requesting")
    setErrorKind(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext
      const audioContext = new AudioContextCtor()
      audioContextRef.current = audioContext
      const analyserNode = audioContext.createAnalyser()
      analyserNode.fftSize = 128
      audioContext.createMediaStreamSource(stream).connect(analyserNode)
      setAnalyser(analyserNode)

      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(blob)
        })
        setState("recorded")
        teardownStream()
      }
      mediaRecorderRef.current = recorder
      recorder.start()

      setElapsedSeconds(0)
      timerRef.current = setInterval(() => setElapsedSeconds((t) => t + 1), 1000)
      setState("recording")
    } catch (err) {
      teardownStream()
      setState("error")
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError")) {
        setErrorKind("permission-denied")
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setErrorKind("no-device")
      } else {
        setErrorKind("unknown")
      }
    }
  }, [state, teardownStream])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const reset = useCallback(() => {
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setElapsedSeconds(0)
    setErrorKind(null)
    setState("idle")
  }, [])

  return { state, errorKind, elapsedSeconds, audioUrl, analyser, start, stop, reset }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
