import { ArrowRight, CircleCheck, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroConsoleVisualLazy as HeroConsoleVisual } from "@/components/landing/HeroConsoleVisualLazy"
import type { LandingCopy } from "@/i18n"

interface HeroSectionProps {
  strings: LandingCopy["hero"]
  onEnterStudio: () => void
}

export function HeroSection({ strings: t, onEnterStudio }: HeroSectionProps) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pt-14 pb-10 sm:px-8 sm:pt-20 sm:pb-14">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10">
        <div className="flex flex-col items-start gap-6">
          <span className="readout-chip inline-flex items-center gap-1.5 rounded-full border border-brand-amber/40 bg-brand-amber/10 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-brand-amber">
            {t.eyebrow}
          </span>

          <h1 className="text-balance font-heading text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl lg:text-[3.4rem]">
            {t.headline}{" "}
            <span className="bg-gradient-to-r from-brand-amber to-brand-brass bg-clip-text text-transparent">
              {t.headlineAccent}
            </span>
          </h1>

          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.subheadline}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={onEnterStudio}
              className="h-12 gap-2 bg-gradient-to-br from-brand-amber to-brand-amber-strong px-6 text-base font-semibold text-[#1a1206] shadow-[0_0_28px_-8px_var(--brand-amber)] hover:opacity-90"
            >
              {t.ctaPrimary}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 gap-2 px-6 text-base">
              <a href="#features">
                <Compass className="size-4" aria-hidden />
                {t.ctaSecondary}
              </a>
            </Button>
          </div>

          <ul className="mt-4 flex w-full flex-col gap-2.5 border-t border-border/60 pt-5">
            {t.proofPoints.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand-green" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="console-panel console-rivets relative h-[22rem] overflow-hidden rounded-3xl border-border sm:h-[26rem] lg:h-[30rem]">
          <HeroConsoleVisual className="h-full w-full" label={t.visualLabel} />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-4">
            {t.visualChips.slice(0, 2).map((chip) => (
              <span
                key={chip}
                className="readout-chip rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[9px] font-medium tracking-[0.14em] text-muted-foreground backdrop-blur-sm"
              >
                {chip}
              </span>
            ))}
          </div>
          {t.visualChips[2] && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
              <span className="readout-chip flex items-center gap-1.5 rounded-full border border-brand-green/40 bg-background/70 px-2.5 py-1 text-[9px] font-medium tracking-[0.14em] text-brand-green backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-green shadow-[0_0_6px_var(--brand-green)]" />
                {t.visualChips[2]}
              </span>
            </div>
          )}

          {/* Corner brackets — echoes AudioVisualizer's rack-unit framing so the hero visual reads as the same instrument family. */}
          <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-primary/40" />
          <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-primary/40" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary/40" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-primary/40" />
        </div>
      </div>
    </section>
  )
}
