import { useState } from "react"
import { Crown, Disc3, Loader2, RotateCw, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PlansDialog } from "@/components/layout/PlansDialog"
import { useHealthCheck } from "@/hooks/useHealthCheck"
import { cn } from "@/lib/utils"
import type { AppStrings } from "@/i18n"

interface HeaderProps {
  strings: AppStrings
}

export function Header({ strings: t }: HeaderProps) {
  const health = useHealthCheck()
  const [plansOpen, setPlansOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex h-[70px] items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-brand-purple to-brand-cyan shadow-[0_0_15px_-2px_var(--brand-purple)]">
          <Disc3 className="size-5 text-white" aria-hidden />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-lg font-extrabold tracking-wide bg-gradient-to-r from-white to-brand-purple bg-clip-text text-transparent">
            {t.brand.name}
          </span>
          <span className="text-[0.65rem] font-semibold tracking-wide text-brand-cyan">{t.brand.badge}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <HealthStatusPill strings={t.header} status={health.status} onRetry={health.refresh} />

        <div className="hidden items-center gap-1.5 rounded-full border border-brand-gold/40 bg-brand-gold/15 px-3 py-1.5 text-xs font-semibold text-brand-gold sm:flex">
          <Crown className="size-3.5" aria-hidden />
          {t.header.tierPro}
        </div>

        <Button
          onClick={() => setPlansOpen(true)}
          className="bg-gradient-to-br from-brand-purple to-brand-purple-strong text-white hover:opacity-90"
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
