import { ShieldCheck } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ConsoleVUMeterLazy as ConsoleVUMeter } from "@/components/studio/ConsoleVUMeterLazy"
import type { LandingCopy } from "@/i18n"

interface LandingFooterProps {
  strings: LandingCopy["footer"]
  brandName: string
  brandBadge: string
  vuMeterLabel: string
}

export function LandingFooter({ strings: t, brandName, brandBadge, vuMeterLabel }: LandingFooterProps) {
  return (
    <footer className="border-t border-border bg-background/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-amber/30 bg-[#221c12] shadow-[0_0_14px_-4px_var(--brand-amber)]">
                <ConsoleVUMeter className="size-7" label={vuMeterLabel} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading text-sm font-bold text-foreground">{brandName}</span>
                <span className="readout-chip text-[0.6rem] tracking-widest text-brand-green">{brandBadge}</span>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t.tagline}</p>
          </div>

          {t.columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground/80">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand-amber"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t.copyright}
          </p>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground sm:max-w-md sm:text-right">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-green" aria-hidden />
            {t.legalNote}
          </p>
        </div>
      </div>
    </footer>
  )
}
