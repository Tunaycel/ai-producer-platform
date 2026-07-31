import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PlanCardProps {
  name: string
  price: string
  features: string[]
  cta: string
  badge?: string
  highlighted?: boolean
  ctaDisabled?: boolean
  /** Landing page cards render slightly larger with more breathing room than the compact plans dialog. */
  size?: "default" | "lg"
}

/**
 * Shared pricing-tier card — used by both `PlansDialog` (the in-app modal)
 * and `PricingSection` (the landing page). Extracted so the two surfaces
 * can never visually drift apart; the copy itself already comes from one
 * source (`AppStrings["plans"]` in `i18n/en.ts`), this shares the markup too.
 */
export function PlanCard({ name, price, features, cta, badge, highlighted, ctaDisabled, size = "default" }: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border p-5",
        size === "lg" && "p-6",
        highlighted
          ? "border-primary bg-primary/5 shadow-[0_0_24px_-8px_var(--brand-amber)]"
          : "border-border bg-card/60",
      )}
    >
      {badge && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          {badge}
        </Badge>
      )}
      <div>
        <h4 className="font-heading text-sm font-semibold text-foreground">{name}</h4>
        <p className={cn("mt-1 font-heading font-bold text-foreground", size === "lg" ? "text-3xl" : "text-2xl")}>
          {price}
        </p>
      </div>
      <ul className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={highlighted ? "default" : "secondary"}
        disabled={ctaDisabled}
        title={ctaDisabled ? "Billing integration coming soon" : undefined}
        className="w-full"
      >
        {cta}
      </Button>
    </div>
  )
}
