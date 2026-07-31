import { Component, type ReactNode, useMemo, useRef, type PointerEvent as ReactPointerEvent } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"

interface HeroConsoleVisualProps {
  className?: string
  label: string
}

const REST_ANGLE = -0.95
const HOT_ANGLE = 0.95
const TICK_COUNT = 9

/**
 * The hero's visual centerpiece — a real WebGL "console fascia" (three VU
 * meters + a row of idle-turning knobs + a chasing LED ladder), not a static
 * gradient blob. Same material/animation language as `ConsoleVUMeter`
 * (amber-lit needles, brushed-metal faces, damped motion) scaled up into one
 * bigger scene, plus a subtle pointer-parallax tilt on the whole fascia for
 * depth. There is no live audio signal on the landing page, so every needle
 * runs the same "warmed-up-but-idle" ambient sweep ConsoleVUMeter uses when
 * idle — never fabricated data, just idle-hardware motion.
 *
 * Respects prefers-reduced-motion: parallax and ambient sweeps are skipped,
 * frameloop drops to "demand" so no rAF budget is spent animating nothing.
 */
export function HeroConsoleVisual({ className, label }: HeroConsoleVisualProps) {
  const reducedMotion = useReducedMotion()
  const pointer = useRef({ x: 0, y: 0 })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    pointer.current = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
    }
  }
  const handlePointerLeave = () => {
    pointer.current = { x: 0, y: 0 }
  }

  return (
    <div
      className={cn("relative", className)}
      role="img"
      aria-label={label}
      onPointerMove={reducedMotion ? undefined : handlePointerMove}
      onPointerLeave={reducedMotion ? undefined : handlePointerLeave}
    >
      <VisualErrorBoundary>
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.2, 6.4], fov: 34 }}
          frameloop={reducedMotion ? "demand" : "always"}
        >
          <ambientLight intensity={0.55} />
          <pointLight position={[2.6, 2.4, 3.6]} intensity={1.7} color="#ffd9a0" />
          <pointLight position={[-2.8, -1.4, 2.8]} intensity={0.55} color="#39e28d" />
          <pointLight position={[0, -2.6, 2.2]} intensity={0.4} color="#d4af6a" />
          <ConsoleFascia reducedMotion={reducedMotion} pointer={pointer} />
        </Canvas>
      </VisualErrorBoundary>
    </div>
  )
}

function ConsoleFascia({
  reducedMotion,
  pointer,
}: {
  reducedMotion: boolean
  pointer: React.MutableRefObject<{ x: number; y: number }>
}) {
  const group = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    if (!group.current) return
    const idleSway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.35) * 0.05
    const targetX = (reducedMotion ? 0 : pointer.current.y * 0.14) + idleSway * 0.3
    const targetY = (reducedMotion ? 0 : pointer.current.x * 0.22) + idleSway
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4.5, delta)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4.5, delta)
  })

  return (
    <group ref={group}>
      <group position={[-1.85, 0.55, 0]} scale={0.82}>
        <MeterFace phase={0.4} reducedMotion={reducedMotion} />
      </group>
      <group position={[0, 0.75, 0.35]} scale={1.15}>
        <MeterFace phase={0} reducedMotion={reducedMotion} />
      </group>
      <group position={[1.85, 0.55, 0]} scale={0.82}>
        <MeterFace phase={1.1} reducedMotion={reducedMotion} />
      </group>

      <KnobRow reducedMotion={reducedMotion} />
      <LedLadder reducedMotion={reducedMotion} />
    </group>
  )
}

function MeterFace({ phase, reducedMotion }: { phase: number; reducedMotion: boolean }) {
  const needleRef = useRef<THREE.Group>(null!)
  const angleRef = useRef(REST_ANGLE)
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
    let target: number
    if (!reducedMotion) {
      const t = state.clock.elapsedTime + phase
      const sweep = (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.65
      target = REST_ANGLE + 0.1 + sweep
    } else {
      target = REST_ANGLE + 0.15
    }
    angleRef.current = THREE.MathUtils.damp(angleRef.current, target, 2.2, delta)
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

/** Row of decorative rotary knobs beneath the meters — same idea as ConsoleKnob (roadmap: mastering panel), stripped to a non-interactive hero prop. */
function KnobRow({ reducedMotion }: { reducedMotion: boolean }) {
  const knobs = useMemo(() => Array.from({ length: 5 }, (_, i) => (i - 2) * 0.78), [])
  return (
    <group position={[0, -0.75, 0.1]}>
      {knobs.map((x, i) => (
        <Knob key={i} x={x} phase={i * 0.6} reducedMotion={reducedMotion} />
      ))}
    </group>
  )
}

function Knob({ x, phase, reducedMotion }: { x: number; phase: number; reducedMotion: boolean }) {
  // The indicator sweeps around the cylinder's own axis (Y, before the group
  // is tilted to face the camera) so it reads as a pointer turning across
  // the knob face — not floating off the edge.
  const ref = useRef<THREE.Group>(null!)
  useFrame((state, delta) => {
    if (!ref.current) return
    const target = reducedMotion ? 0.3 : 0.3 + Math.sin(state.clock.elapsedTime * 0.5 + phase) * 0.55
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, target, 3, delta)
  })
  return (
    <group position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.22, 0.24, 0.16, 24]} />
        <meshStandardMaterial color="#1c1811" roughness={0.4} metalness={0.7} />
      </mesh>
      <group ref={ref}>
        <mesh position={[0.15, 0.081, 0]}>
          <boxGeometry args={[0.08, 0.02, 0.03]} />
          <meshStandardMaterial color="#e2892b" emissive="#e2892b" emissiveIntensity={0.55} />
        </mesh>
      </group>
    </group>
  )
}

/** A horizontal LED strip that "breathes" left-to-right — decorative motion only, not a data readout. */
function LedLadder({ reducedMotion }: { reducedMotion: boolean }) {
  const count = 14
  const refs = useRef<Array<THREE.Mesh | null>>([])

  useFrame((state) => {
    if (reducedMotion) return
    const t = state.clock.elapsedTime
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const wave = Math.sin(t * 1.4 - i * 0.45) * 0.5 + 0.5
      const material = mesh.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.15 + wave * 0.9
    })
  })

  return (
    <group position={[0, -1.35, 0.1]}>
      {Array.from({ length: count }).map((_, i) => {
        const isGreenZone = i < count * 0.6
        const color = isGreenZone ? "#39e28d" : i < count * 0.85 ? "#e2892b" : "#e4483f"
        return (
          <mesh key={i} position={[(i - (count - 1) / 2) * 0.24, 0, 0]} ref={(el) => (refs.current[i] = el)}>
            <boxGeometry args={[0.16, 0.07, 0.03]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
          </mesh>
        )
      })}
    </group>
  )
}

export default HeroConsoleVisual

/** WebGL can legitimately fail (old GPU, disabled hardware accel). Never take the whole landing hero down for a decorative scene. */
class VisualErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#efe3ce]/5">
          <div className="h-2 w-2 rounded-full bg-brand-amber shadow-[0_0_10px_var(--brand-amber)]" />
        </div>
      )
    }
    return this.props.children
  }
}
