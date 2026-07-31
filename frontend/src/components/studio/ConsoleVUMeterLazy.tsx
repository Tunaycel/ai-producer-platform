import { Suspense, lazy, type ComponentProps } from "react"
import { cn } from "@/lib/utils"
import type ConsoleVUMeterDefault from "./ConsoleVUMeter"

const ConsoleVUMeter = lazy(() => import("./ConsoleVUMeter"))

type ConsoleVUMeterProps = ComponentProps<typeof ConsoleVUMeterDefault>

/**
 * Code-split wrapper: three.js + @react-three/fiber (~1MB uncompressed) only
 * download once a VU meter actually mounts, instead of sitting in the main
 * bundle for every page load. The fallback matches ConsoleVUMeter's own
 * WebGL-unavailable state, so there's no visual pop between "loading" and
 * "ready" — just a static amber dot until the real meter takes over.
 */
export function ConsoleVUMeterLazy(props: ConsoleVUMeterProps) {
  return (
    <Suspense
      fallback={
        <div className={cn("flex items-center justify-center rounded-full bg-[#efe3ce]/10", props.className)}>
          <div className="h-1.5 w-1.5 rounded-full bg-brand-amber shadow-[0_0_6px_var(--brand-amber)]" />
        </div>
      }
    >
      <ConsoleVUMeter {...props} />
    </Suspense>
  )
}
