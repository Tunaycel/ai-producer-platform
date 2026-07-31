import { useState } from "react"
import { Crown, Loader2, RotateCw, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PlansDialog } from "@/components/layout/PlansDialog"
import { ConsoleVUMeterLazy as ConsoleVUMeter } from "@/components/studio/ConsoleVUMeterLazy"
import { useHealthCheck } from "@/hooks/useHealthCheck"
import { cn } from "@/lib/utils"
import type { AppStrings } from "@/i18n"

interface HeaderProps {
  strings: AppStrings
  /** Optional — when provided, the brand mark becomes a real button back to the landing page instead of a static label. */
  onBrandClick?: () => void
}

export function Header({ strings: t, onBrandClick }: HeaderProps) {
  const health = useHealthCheck()
  const [plansOpen, setPlansOpen] = useState(false)

  const brandMark = (
    <>
      <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-amber/30 bg-[#221c12] shadow-[0_0_18px_-4px_var(--brand-amber)]">
        <ConsoleVUMeter className="size-9" label={t.brand.vuMeterLabel} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-heading text-lg font-bold tracking-wide bg-gradient-to-r from-white to-brand-amber bg-clip-text text-transparent">
          {t.brand.name}
        </span>
        <span className="readout-chip text-[0.65rem] font-medium tracking-widest text-brand-green">{t.brand.badge}</span>
      </div>
    </>
  )

  return (
    <header className="sticky top-0 z-40 flex h-[70px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
      {onBrandClick ? (
        <button type="button" onClick={onBrandClick} className="flex cursor-pointer items-center gap-3 text-left">
          {brandMark}
        </button>
      ) : (
        <div className="flex items-center gap-3">{brandMark}</div>
      )}

      <div className="flex items-center gap-3">
        <HealthStatusPill strings={t.header} status={health.status} onRetry={health.refresh} />

        <div className="hidden items-center gap-1.5 rounded-full border border-brand-brass/40 bg-brand-brass/15 px-3 py-1.5 text-xs font-semibold text-brand-brass sm:flex">
          <Crown className="size-3.5" aria-hidden />
          {t.header.tierPro}
        </div>

        <Button
          onClick={() => setPlansOpen(true)}
          className="bg-gradient-to-br from-brand-amber to-brand-amber-strong text-[#1a1206] hover:opacity-90"
        >
          {t.header.upgradeCta}
        </Button>
      </div>

      <PlansDialog open={plansOpen} onOpenChange={setPlansOpen} strings={t.plans} />
    </header>
  )
}

function HealthStatusPill({
  strings: t,
  status,
  onRetry,
}: {
  strings: AppStrings["header"]
  status: "loading" | "online" | "offline"
  onRetry: () => void
}) {
  if (status === "loading") {
    return (
      <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        {t.statusConnecting}
      </span>
    )
  }

  if (status === "offline") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onRetry}
            className="hidden items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 md:flex"
            aria-live="polite"
          >
            <WifiOff className="size-3.5" aria-hidden />
            {t.statusOffline}
            <RotateCw className="size-3 opacity-70" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent>{t.statusRetry}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex" aria-live="polite">
      <span className={cn("h-2 w-2 rounded-full bg-success shadow-[0_0_8px_var(--success)]")} />
      {t.statusOnline}
    </span>
  )
}
