import { ArrowRight, Flame, Sparkles, Sliders, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LandingCopy, LandingFeature } from "@/i18n"

interface FeaturesSectionProps {
  intro: LandingCopy["featuresIntro"]
  features: LandingFeature[]
  pipelineIntro: LandingCopy["pipelineIntro"]
  pipelineSteps: LandingCopy["pipelineSteps"]
  /** Real example prompts from the AI Producer Chat empty state (i18n `producerChat.suggestions`) — reused here so the emphasized card shows concrete product behavior instead of sitting on dead space. */
  chatPromptExamples: string[]
}

const FEATURE_ICON: Record<string, LucideIcon> = {
  producer: Sparkles,
  trends: Flame,
  mastering: Sliders,
}

/**
 * The three README.md flagship modules as a real bento layout (sourced from
 * 21st.dev "Feature Section with Bento Grid" patterns before hand-building,
 * then rebuilt in the Console visual language — console-panel surfaces,
 * readout-chip spec grids, rivets — instead of installing a generically
 * styled component). AI Producer Chat gets double visual weight since it's
 * the flagship of the flagship modules (see App.tsx's own comment on it).
 */
export function FeaturesSection({
  intro,
  features,
  pipelineIntro,
  pipelineSteps,
  chatPromptExamples,
}: FeaturesSectionProps) {
  const [producer, trends, mastering] = features

  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="readout-chip inline-flex items-center gap-1.5 rounded-full border border-brand-green/40 bg-brand-green/10 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-brand-green">
          {intro.eyebrow}
        </span>
        <h2 className="text-balance font-heading text-3xl font-bold text-foreground sm:text-4xl">{intro.title}</h2>
        <p className="text-pretty text-sm text-muted-foreground sm:text-base">{intro.subtitle}</p>
      </div>

      {producer && (
        <div className="mt-12">
          <FeatureCard
            feature={producer}
            emphasized
            promptExamples={chatPromptExamples}
            promptExamplesLabel={intro.tryPromptsLabel}
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {trends && <FeatureCard feature={trends} />}
        {mastering && <FeatureCard feature={mastering} />}
      </div>

      <PipelineStrip intro={pipelineIntro} steps={pipelineSteps} />
    </section>
  )
}

function FeatureCard({
  feature,
  className,
  emphasized,
  promptExamples,
  promptExamplesLabel,
}: {
  feature: LandingFeature
  className?: string
  emphasized?: boolean
  promptExamples?: string[]
  promptExamplesLabel?: string
}) {
  const Icon = FEATURE_ICON[feature.id] ?? Sparkles
  const isLive = feature.status.toLowerCase() === "live"

  return (
    <article
      className={cn(
        "console-panel console-rivets flex flex-col gap-5 rounded-2xl border-border p-6 sm:p-7",
        emphasized && "sm:p-8",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-amber/30 bg-[#221c12] text-brand-amber shadow-[0_0_16px_-6px_var(--brand-amber)]">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="readout-chip text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
            {feature.kicker}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 gap-1 text-[10px]",
            isLive ? "border-brand-green/40 text-brand-green" : "border-brand-amber/40 text-brand-amber",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", isLive ? "bg-brand-green" : "bg-brand-amber")} />
          {feature.status}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className={cn("font-heading font-semibold text-foreground", emphasized ? "text-2xl" : "text-lg")}>
          {feature.title}
        </h3>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      </div>

      {promptExamples && promptExamples.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {promptExamplesLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {promptExamples.map((prompt) => (
              <span
                key={prompt}
                className="max-w-72 truncate rounded-full border border-border bg-black/20 px-3 py-1.5 text-xs text-foreground/75"
                title={prompt}
              >
                "{prompt}"
              </span>
            ))}
          </div>
        </div>
      )}

      {feature.preview && (
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-green">
            {feature.preview.label}
          </span>
          <div className="rounded-lg border-l-2 border-brand-amber bg-black/20 px-4 py-3">
            <p className="text-sm italic leading-relaxed text-foreground/85">{feature.preview.message}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {feature.preview.tags.map((tag) => (
                <span key={tag} className="readout-chip rounded-full bg-brand-amber/10 px-2 py-0.5 text-[10px] text-brand-amber">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <dl
        className={cn(
          "mt-auto grid gap-x-4 gap-y-3 border-t border-border/60 pt-4",
          emphasized ? "sm:grid-cols-3" : "grid-cols-1",
        )}
      >
        {feature.specs.map((spec) => (
          <div key={spec.label} className="flex flex-col overflow-hidden">
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{spec.label}</dt>
            <dd className="readout-chip mt-0.5 truncate text-xs text-foreground/90" title={spec.value}>
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

function PipelineStrip({
  intro,
  steps,
}: {
  intro: LandingCopy["pipelineIntro"]
  steps: LandingCopy["pipelineSteps"]
}) {
  return (
    <div className="console-panel mt-6 flex flex-col gap-6 rounded-2xl border-border p-6 sm:p-8">
      <div className="flex flex-col gap-1.5">
        <span className="readout-chip text-[10px] font-semibold tracking-[0.2em] text-brand-amber">
          {intro.eyebrow}
        </span>
        <h3 className="font-heading text-xl font-semibold text-foreground">{intro.title}</h3>
        <p className="text-sm text-muted-foreground">{intro.subtitle}</p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.label} className="flex items-start gap-3 rounded-xl border border-border/60 bg-black/15 p-4">
            <span className="readout-chip flex size-7 shrink-0 items-center justify-center rounded-full border border-brand-amber/40 bg-brand-amber/10 text-xs font-bold text-brand-amber">
              {index + 1}
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="ml-auto hidden size-4 shrink-0 self-center text-muted-foreground/40 lg:block" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
