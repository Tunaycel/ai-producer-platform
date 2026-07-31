import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConsoleVUMeterLazy as ConsoleVUMeter } from "@/components/studio/ConsoleVUMeterLazy"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { PricingSection } from "@/components/pricing/PricingSection"
import type { AppStrings } from "@/i18n"

interface LandingPageProps {
  strings: AppStrings
  onEnterStudio: () => void
}

/**
 * The marketing page shown before the app shell (App.tsx owns the
 * landing/studio view switch — no router needed for two states). Composed
 * from Console-identity sections rather than installed 21st.dev components
 * verbatim: 21st.dev's bento-grid/hero/pricing *patterns* were consulted for
 * structure (see FeaturesSection/PricingSection doc comments), then rebuilt
 * against this project's existing console-panel/readout-chip vocabulary so
 * the landing page reads as the same product as the studio, not a bolted-on
 * generic SaaS front door.
 */
export function LandingPage({ strings: t, onEnterStudio }: LandingPageProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingNav strings={t} onEnterStudio={onEnterStudio} />

      <main className="flex-1">
        <HeroSection strings={t.landing.hero} onEnterStudio={onEnterStudio} />
        <FeaturesSection
          intro={t.landing.featuresIntro}
          features={t.landing.features}
          pipelineIntro={t.landing.pipelineIntro}
          pipelineSteps={t.landing.pipelineSteps}
          chatPromptExamples={t.producerChat.suggestions}
        />
        <PricingSection intro={t.landing.pricingIntro} plans={t.plans} />
        <FinalCtaSection strings={t.landing.finalCta} onEnterStudio={onEnterStudio} />
      </main>

      <LandingFooter
        strings={t.landing.footer}
        brandName={t.landing.nav.brandName}
        brandBadge={t.landing.nav.brandBadge}
        vuMeterLabel={t.brand.vuMeterLabel}
      />
    </div>
  )
}

function LandingNav({ strings: t, onEnterStudio }: { strings: AppStrings; onEnterStudio: () => void }) {
  const nav = t.landing.nav
  return (
    <header className="sticky top-0 z-40 flex h-[70px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-amber/30 bg-[#221c12] shadow-[0_0_18px_-4px_var(--brand-amber)]">
          <ConsoleVUMeter className="size-9" label={t.brand.vuMeterLabel} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-lg font-bold tracking-wide bg-gradient-to-r from-white to-brand-amber bg-clip-text text-transparent">
            {nav.brandName}
          </span>
          <span className="readout-chip text-[0.65rem] font-medium tracking-widest text-brand-green">
            {nav.brandBadge}
          </span>
        </div>
      </div>

      <nav className="hidden items-center gap-6 md:flex" aria-label="Landing page">
        <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          {nav.featuresLink}
        </a>
        <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          {nav.pricingLink}
        </a>
      </nav>

      <Button
        onClick={onEnterStudio}
        className="bg-gradient-to-br from-brand-amber to-brand-amber-strong text-[#1a1206] hover:opacity-90"
      >
        {nav.enterStudio}
      </Button>
    </header>
  )
}

function FinalCtaSection({
  strings: t,
  onEnterStudio,
}: {
  strings: AppStrings["landing"]["finalCta"]
  onEnterStudio: () => void
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
      <div className="console-panel console-rivets relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl border-border px-6 py-14 text-center sm:px-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(at 50% 0%, color-mix(in oklab, var(--brand-amber) 16%, transparent) 0px, transparent 60%)",
          }}
        />
        <h2 className="relative text-balance font-heading text-3xl font-bold text-foreground sm:text-4xl">
          {t.title}
        </h2>
        <p className="relative max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">{t.subtitle}</p>
        <Button
          size="lg"
          onClick={onEnterStudio}
          className="relative h-12 gap-2 bg-gradient-to-br from-brand-amber to-brand-amber-strong px-7 text-base font-semibold text-[#1a1206] shadow-[0_0_28px_-8px_var(--brand-amber)] hover:opacity-90"
        >
          {t.cta}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </section>
  )
}
