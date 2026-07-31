import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface AudioVisualizerProps {
  /** Live analyser node while recording. Null renders the idle signal instead of silence. */
  analyser: AnalyserNode | null
  liveLabel: string
  idleLabel: string
  className?: string
}

/**
 * Canvas spectrum visualizer. Idle state draws a gentle animated sine wave
 * (signals "engine armed, no signal yet"); recording state reads real
 * frequency data off the AnalyserNode from useAudioRecorder — no synthetic
 * bars pretending to be audio. Frame chrome (scanline + corner brackets +
 * LIVE/IDLE tag) mirrors the "studio engine" aesthetic sourced from
 * 21st.dev's thegridcn/waveform component.
 */
export function AudioVisualizer({ analyser, liveLabel, idleLabel, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = parent.clientWidth * dpr
      canvas.height = parent.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)

    let dataArray: Uint8Array<ArrayBuffer> | null = null
    if (analyser) {
      dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
    }

    const drawFrame = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)

      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray)
        const barCount = dataArray.length
        const barWidth = (width / barCount) * 1.5
        let x = 0
        for (let i = 0; i < barCount; i++) {
          const barHeight = (dataArray[i] / 255) * height
          const gradient = ctx.createLinearGradient(0, height, 0, 0)
          gradient.addColorStop(0, "#8B5CF6")
          gradient.addColorStop(1, "#06B6D4")
          ctx.fillStyle = gradient
          ctx.fillRect(x, height - barHeight, Math.max(barWidth - 2, 1), barHeight)
          x += barWidth
        }
      } else {
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = "rgba(139, 92, 246, 0.45)"
        const midY = height / 2
        for (let x = 0; x < width; x++) {
          const y = midY + Math.sin(x * 0.02 + phaseRef.current) * 12 * Math.sin(x * 0.005)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        phaseRef.current += 0.04
      }

      rafRef.current = requestAnimationFrame(drawFrame)
    }
    rafRef.current = requestAnimationFrame(drawFrame)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      resizeObserver.disconnect()
    }
  }, [analyser])

  const isLive = analyser !== null

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-black/30", className)}>
      {/* Scanline overlay — studio/monitoring chrome, purely decorative */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 4px)",
        }}
      />

      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
        <span className={cn("h-1.5 w-1.5 rounded-full", isLive ? "bg-success animate-pulse" : "bg-muted-foreground/60")} />
        <span
          className={cn(
            "font-mono text-[10px] tracking-widest uppercase",
            isLive ? "text-success" : "text-muted-foreground/70",
          )}
        >
          {isLive ? liveLabel : idleLabel}
        </span>
      </div>

      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Corner brackets */}
      <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-primary/50" />
      <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-primary/50" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary/50" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary/50" />
    </div>
  )
}
