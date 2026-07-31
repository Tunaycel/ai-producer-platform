import { Crown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PlanCard } from "@/components/pricing/PlanCard"
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
          <Crown className="size-8 text-brand-brass" aria-hidden />
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
