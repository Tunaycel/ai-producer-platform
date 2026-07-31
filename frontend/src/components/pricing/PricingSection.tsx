import { Layers } from "lucide-react"
import { PlanCard } from "@/components/pricing/PlanCard"
import type { AppStrings, LandingCopy } from "@/i18n"

interface PricingSectionProps {
  intro: LandingCopy["pricingIntro"]
  plans: AppStrings["plans"]
}

/**
 * Landing-page pricing section. Renders the exact same tier data/copy as
 * the in-app `PlansDialog` (both read `AppStrings["plans"]`, and both use
 * the shared `PlanCard`) — the product owner's tiers only ever get edited
 * in one place (`i18n/en.ts`), so the modal and the landing page can never
 * quietly drift apart.
 */
export function PricingSection({ intro, plans: t }: PricingSectionProps) {
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="readout-chip inline-flex items-center gap-1.5 rounded-full border border-brand-brass/40 bg-brand-brass/10 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-brand-brass">
          <Layers className="size-3" aria-hidden />
          {intro.eyebrow}
        </span>
        <h2 className="text-balance font-heading text-3xl font-bold text-foreground sm:text-4xl">{intro.title}</h2>
        <p className="text-pretty text-sm text-muted-foreground sm:text-base">{intro.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        <PlanCard
          size="lg"
          name={t.starter.name}
          price={t.starter.price}
          features={t.starter.features}
          cta={t.starter.cta}
          ctaDisabled
        />
        <PlanCard
          size="lg"
          name={t.pro.name}
          price={t.pro.price}
          badge={t.pro.badge}
          features={t.pro.features}
          cta={t.pro.cta}
          highlighted
          ctaDisabled
        />
        <PlanCard
          size="lg"
          name={t.studio.name}
          price={t.studio.price}
          features={t.studio.features}
          cta={t.studio.cta}
          ctaDisabled
        />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">{t.billingNotice}</p>
    </section>
  )
}
