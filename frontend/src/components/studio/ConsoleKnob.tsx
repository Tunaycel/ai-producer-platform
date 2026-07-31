import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"
import { cn } from "@/lib/utils"

export interface ConsoleKnobProps {
  /** Accessible + visible label, e.g. "Retune Speed". */
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** Double-click resets to this value. Omit to disable reset-on-double-click. */
  defaultValue?: number
  onChange: (value: number) => void
  /** Formats the live readout, e.g. `(v) => \`${v}ms\`` */
  formatValue?: (value: number) => string
  accent?: "amber" | "green" | "brass"
  /** Diameter in px. */
  size?: number
  disabled?: boolean
  className?: string
}

const SWEEP_MIN_DEG = -132
const SWEEP_MAX_DEG = 132
const DRAG_RANGE_PX = 140
const FINE_DRAG_MULTIPLIER = 5

const ACCENT_VARS: Record<NonNullable<ConsoleKnobProps["accent"]>, string> = {
  amber: "var(--brand-amber)",
  green: "var(--brand-green)",
  brass: "var(--brand-brass)",
}

/**
 * A real draggable rotary knob — CSS transform rotation driven by pointer
 * position, not a static image or a disguised <input type="range">. Chosen
 * over a three.js knob (unlike ConsoleVUMeter, which has a specific reason
 * to be real WebGL: it visualizes a live AnalyserNode) because a
 * transform-based knob is lighter, keyboard/SR-accessible via a native
 * role="slider", and reads identically well in the Console brushed-metal
 * language without spinning up a second render pipeline for eight of these
 * on one panel.
 *
 * Drag physics: vertical drag distance maps to value linearly over
 * DRAG_RANGE_PX (hold Shift at drag-start for a 5x finer range — decided
 * once per drag so toggling Shift mid-drag can't cause a value jump).
 * Full keyboard support (arrow/page/home/end) and double-click-to-reset
 * make it usable without a mouse. Rotation transitions are skipped while
 * actively dragging so the needle never lags the pointer; global
 * prefers-reduced-motion handling in index.css collapses the keyframe/step
 * transitions elsewhere without any extra code here.
 */
export function ConsoleKnob({
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue,
  onChange,
  formatValue,
  accent = "amber",
  size = 60,
  disabled,
  className,
}: ConsoleKnobProps) {
  const [dragging, setDragging] = useState(false)
  const dragState = useRef<{ startY: number; startValue: number; fine: boolean } | null>(null)

  const clamp = useCallback((v: number) => Math.min(max, Math.max(min, v)), [min, max])
  const snap = useCallback(
    (v: number) => {
      const stepped = Math.round((v - min) / step) * step + min
      // Kill float noise (0.1 + 0.2 territory) before it reaches the readout.
      return clamp(Math.round(stepped * 1000) / 1000)
    },
    [min, step, clamp],
  )

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = { startY: event.clientY, startValue: value, fine: event.shiftKey }
    setDragging(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragState.current
    if (!drag) return
    const range = drag.fine ? DRAG_RANGE_PX * FINE_DRAG_MULTIPLIER : DRAG_RANGE_PX
    const deltaY = drag.startY - event.clientY
    const deltaValue = (deltaY / range) * (max - min)
    onChange(snap(drag.startValue + deltaValue))
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return
    dragState.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const bigStep = step * 10
    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        event.preventDefault()
        onChange(snap(value + step))
        break
      case "ArrowDown":
      case "ArrowLeft":
        event.preventDefault()
        onChange(snap(value - step))
        break
      case "PageUp":
        event.preventDefault()
        onChange(snap(value + bigStep))
        break
      case "PageDown":
        event.preventDefault()
        onChange(snap(value - bigStep))
        break
      case "Home":
        event.preventDefault()
        onChange(min)
        break
      case "End":
        event.preventDefault()
        onChange(max)
        break
      default:
        break
    }
  }

  const handleDoubleClick = () => {
    if (disabled || defaultValue === undefined) return
    onChange(clamp(defaultValue))
  }

  const fraction = max === min ? 0 : (value - min) / (max - min)
  const angle = SWEEP_MIN_DEG + fraction * (SWEEP_MAX_DEG - SWEEP_MIN_DEG)
  const display = formatValue ? formatValue(value) : `${value}`
  const accentColor = ACCENT_VARS[accent]

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={display}
        aria-disabled={disabled || undefined}
        aria-orientation="vertical"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClick}
        style={{ width: size, height: size, "--knob-accent": accentColor } as CSSProperties}
        className={cn(
          "relative touch-none rounded-full outline-none select-none",
          disabled ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {/* Bezel: brushed-metal body, glows with the accent color while dragging. */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 32% 26%, #3c3324 0%, #241f16 55%, #17140e 100%)",
            boxShadow: dragging
              ? "0 0 0 1px color-mix(in oklab, var(--knob-accent) 55%, transparent), 0 0 16px -2px var(--knob-accent), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6)"
              : "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 4px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.35)",
            transition: dragging ? "none" : "box-shadow 150ms ease-out",
          }}
        />
        {/* Decorative rim */}
        <div className="absolute inset-[3px] rounded-full border border-white/5" />
        {/* Indicator needle */}
        <div
          className="absolute top-[10%] left-1/2 h-[38%] w-[3px] -translate-x-1/2 rounded-full"
          style={{
            background: "var(--knob-accent)",
            boxShadow: "0 0 6px var(--knob-accent)",
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transition: dragging ? "none" : "transform 150ms ease-out",
          }}
        />
        {/* Center cap */}
        <div
          className="absolute inset-[27%] rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 28%, #4c4130, #221d15 72%)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.6)",
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="readout-chip text-xs text-foreground">{display}</span>
        <span className="text-center text-[9px] leading-tight uppercase tracking-[0.13em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  )
}

export default ConsoleKnob
