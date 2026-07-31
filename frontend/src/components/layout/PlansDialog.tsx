import { Check, Crown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AppStrings } from "@/i18n"

interface PlansDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strings: AppStrings["plans"]
}

/**
 * Pricing content ported 1:1 from the legacy subscription modal
 * (src/frontend/index.html), translated to English. Billing isn't wired to
 * a real backend yet (ROADMAP.md "Auth + subscription tiers" is still
 * pending), so the paid-tier CTAs are honestly disabled with a "coming
 * soon" notice instead of pretending to start a checkout flow.
 */
export function PlansDialog({ open, onOpenChange, strings: t }: PlansDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="items-center text-center">
          <Crown className="size-8 text-brand-gold" aria-hidden />
          <DialogTitle className="text-xl">{t.dialogTitle}</DialogTitle>
          <DialogDescription>{t.dialogSubtitle}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <PlanCard
            name={t.starter.name}
            price={t.starter.price}
            features={t.starter.features}
            cta={t.starter.cta}
            ctaDisabled
          />
          <PlanCard
            name={t.pro.name}
            price={t.pro.price}
            badge={t.pro.badge}
            features={t.pro.features}
            cta={t.pro.cta}
            highlighted
            ctaDisabled
          />
          <PlanCard
            name={t.studio.name}
            price={t.studio.price}
            features={t.studio.features}
            cta={t.studio.cta}
            ctaDisabled
          />
        </div>

        <p className="text-center text-xs text-muted-foreground">{t.billingNotice}</p>
      </DialogContent>
    </Dialog>
  )
}

interface PlanCardProps {
  name: string
  price: string
  features: string[]
  cta: string
  badge?: string
  highlighted?: boolean
  ctaDisabled?: boolean
}

function PlanCard({ name, price, features, cta, badge, highlighted, ctaDisabled }: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border p-5",
        highlighted ? "border-primary bg-primary/5 shadow-[0_0_24px_-8px_var(--brand-purple)]" : "border-border bg-card/60",
      )}
    >
      {badge && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          {badge}
        </Badge>
      )}
      <div>
        <h4 className="font-heading text-sm font-semibold text-foreground">{name}</h4>
        <p className="mt-1 font-heading text-2xl font-bold text-foreground">{price}</p>
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
