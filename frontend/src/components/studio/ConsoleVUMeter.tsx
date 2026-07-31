import { Component, type ReactNode, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"

interface ConsoleVUMeterProps {
  /** Live analyser node while recording/monitoring — needle tracks real signal level. Null/undefined = idle. */
  analyser?: AnalyserNode | null
  /** Number of meter faces (twin VU meters vs. a single compact brand-mark meter). */
  channels?: 1 | 2
  className?: string
  /** Accessible label. The meter is decorative/supplementary — pass a label only when it's the sole status indicator. */
  label?: string
}

const REST_ANGLE = -0.95
const HOT_ANGLE = 0.95
const TICK_COUNT = 9

/**
 * A real WebGL analog VU meter (react-three-fiber), not a CSS imitation.
 * Needle angle is driven directly off AnalyserNode.getByteFrequencyData —
 * when idle it does a slow "standby breathing" sweep instead of sitting
 * dead still, matching how tube gear looks warmed-up-but-quiet. Respects
 * prefers-reduced-motion: idle sweep is skipped and the render loop drops
 * to "demand" (no animation frames burned) when there's no live signal to
 * track and the user asked for less motion.
 *
 * Used as the animated brand mark in the Header (channels=1, compact) and
 * as the live input-level readout in VocalRecorderPanel (channels=2, driven
 * by the recorder's real AnalyserNode).
 */
export function ConsoleVUMeter({ analyser, channels = 1, className, label }: ConsoleVUMeterProps) {
  const reducedMotion = useReducedMotion()
  const isLive = Boolean(analyser)
  // No live signal and the user wants less motion → render one static frame,
  // don't keep a rAF loop alive for a needle that isn't reflecting anything.
  const frameloop = !isLive && reducedMotion ? "demand" : "always"

  return (
    <div
      className={cn("relative", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <VUMeterErrorBoundary>
        <Canvas
          // The meter renders small (a 36-72px brand mark / compact readout), so a
          // higher dpr ceiling than the usual [1,2] is essentially free performance-wise
          // (still a tiny total pixel count) and meaningfully sharper on high-DPI/retina
          // displays, where the fine tick marks and needle were visibly soft at dpr=2.
          dpr={[1, 3]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          camera={{ position: [0, 0, 3.4], fov: 30 }}
          frameloop={frameloop}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[1.4, 1.6, 2.2]} intensity={1.3} color="#ffd9a0" />
          <pointLight position={[-1.6, -1.1, 1.6]} intensity={0.35} color="#39e28d" />
          {Array.from({ length: channels }).map((_, i) => (
            <group key={i} position={[channels === 2 ? (i === 0 ? -1.15 : 1.15) : 0, 0, 0]} scale={channels === 2 ? 0.92 : 1}>
              <MeterFace analyser={analyser ?? null} phase={i * 1.7} reducedMotion={reducedMotion} />
            </group>
          ))}
        </Canvas>
      </VUMeterErrorBoundary>
    </div>
  )
}

function MeterFace({
  analyser,
  phase,
  reducedMotion,
}: {
  analyser: AnalyserNode | null
  phase: number
  reducedMotion: boolean
}) {
  const needleRef = useRef<THREE.Group>(null!)
  const angleRef = useRef(REST_ANGLE)
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  const ticks = useMemo(
    () =>
      Array.from({ length: TICK_COUNT }, (_, i) => {
        const t = i / (TICK_COUNT - 1)
        const angle = REST_ANGLE + t * (HOT_ANGLE - REST_ANGLE)
        const radius = 0.92
        return {
          x: Math.sin(angle) * radius,
          y: Math.cos(angle) * radius,
          rot: -angle,
          hot: t > 0.78,
        }
      }),
    [],
  )

  useFrame((state, delta) => {
    let target = REST_ANGLE
    if (analyser) {
      if (!dataRef.current) dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
      analyser.getByteFrequencyData(dataRef.current)
      let sum = 0
      for (let i = 0; i < dataRef.current.length; i++) sum += dataRef.current[i]
      const level = sum / dataRef.current.length / 255
      target = REST_ANGLE + level * (HOT_ANGLE - REST_ANGLE)
    } else if (!reducedMotion) {
      const t = state.clock.elapsedTime + phase
      const sweep = (Math.sin(t * 0.85) * 0.5 + 0.5) * 0.22
      target = REST_ANGLE + 0.08 + sweep
    } else {
      target = REST_ANGLE + 0.08
    }
    const damp = analyser ? 9 : 2.4
    angleRef.current = THREE.MathUtils.damp(angleRef.current, target, damp, delta)
    if (needleRef.current) needleRef.current.rotation.z = angleRef.current
  })

  return (
    <group>
      <mesh position={[0, 0, -0.03]}>
        <ringGeometry args={[1.0, 1.16, 40]} />
        <meshStandardMaterial color="#2a251b" roughness={0.35} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[1.0, 40]} />
        <meshStandardMaterial color="#efe3ce" roughness={0.6} metalness={0.05} />
      </mesh>
      {ticks.map((tick, i) => (
        <mesh key={i} position={[tick.x, tick.y, 0]} rotation={[0, 0, tick.rot]}>
          <boxGeometry args={[0.02, tick.hot ? 0.13 : 0.08, 0.01]} />
          <meshStandardMaterial color={tick.hot ? "#e4483f" : "#2a251b"} />
        </mesh>
      ))}
      <group ref={needleRef} position={[0, 0, 0.02]}>
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.017, 0.82, 8]} />
          <meshStandardMaterial color="#1a1712" emissive="#e2892b" emissiveIntensity={0.4} roughness={0.45} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.055, 16]} />
          <meshStandardMaterial color="#e2892b" emissive="#e2892b" emissiveIntensity={0.7} />
        </mesh>
      </group>
    </group>
  )
}

export default ConsoleVUMeter

/** WebGL can legitimately fail (old GPU, disabled hardware accel, headless CI). Never take the whole studio shell down for a decorative meter. */
class VUMeterErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#efe3ce]/10">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-amber shadow-[0_0_6px_var(--brand-amber)]" />
        </div>
      )
    }
    return this.props.children
  }
}
