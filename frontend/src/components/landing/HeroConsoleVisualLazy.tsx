import { Suspense, lazy, type ComponentProps } from "react"
import { cn } from "@/lib/utils"
import type HeroConsoleVisualDefault from "./HeroConsoleVisual"

const HeroConsoleVisual = lazy(() => import("./HeroConsoleVisual"))

type HeroConsoleVisualProps = ComponentProps<typeof HeroConsoleVisualDefault>

/**
 * Code-split wrapper, same rationale as `ConsoleVUMeterLazy`: three.js +
 * @react-three/fiber only download once the hero actually mounts. The
 * fallback keeps the hero's amber glow so there's no visual pop once the
 * real scene takes over.
 */
export function HeroConsoleVisualLazy(props: HeroConsoleVisualProps) {
  return (
    <Suspense
      fallback={
        <div className={cn("flex items-center justify-center rounded-2xl bg-[#efe3ce]/5", props.className)}>
          <div className="h-2 w-2 rounded-full bg-brand-amber shadow-[0_0_10px_var(--brand-amber)]" />
        </div>
      }
    >
      <HeroConsoleVisual {...props} />
    </Suspense>
  )
}
