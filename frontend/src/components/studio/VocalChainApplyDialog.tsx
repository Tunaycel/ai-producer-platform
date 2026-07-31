import { Wand2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { AppStrings } from "@/i18n"
import type { VocalChainSettings } from "./MasteringConsolePanel"

interface VocalChainApplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  strings: AppStrings["mastering"]
  hasVocal: boolean
  settings: VocalChainSettings
}

/**
 * Honest "not built yet" dialog for the mastering console's Apply action —
 * same pattern as PlansDialog's disabled billing CTAs: state plainly that
 * the DSP pipeline (Demucs/Pedalboard/Matchering/RVC, ROADMAP.md "Next up")
 * isn't wired to a live service, recap exactly what was dialed in so the
 * interaction still feels like it did something real, and never simulate a
 * processing/success state that didn't happen.
 */
export function VocalChainApplyDialog({
  open,
  onOpenChange,
  strings: t,
  hasVocal,
  settings,
}: VocalChainApplyDialogProps) {
  const rows: Array<[string, string]> = [
    [t.settingPreset, settings.presetName],
    [t.settingRetune, `${settings.retuneSpeed}ms`],
    [t.settingHumanize, `${settings.humanize}%`],
    [t.settingFormant, `${settings.formant > 0 ? "+" : ""}${settings.formant}st`],
    [t.settingReverb, `${settings.reverb}%`],
    [t.settingHardTune, settings.hardTune ? t.stateOn : t.stateOff],
    [t.settingDeEsser, settings.deEsser ? t.stateOn : t.stateOff],
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <Wand2 className="size-8 text-brand-amber" aria-hidden />
          <DialogTitle className="text-lg">{t.dialogTitle}</DialogTitle>
          <DialogDescription>{t.dialogBodyIntro}</DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {hasVocal ? t.dialogBodyWithVocal : t.dialogBodyWithoutVocal}
        </p>

        <div className="rounded-lg border border-border/60 bg-black/15 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-green">
            {t.dialogSettingsTitle}
          </p>
          <dl className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col overflow-hidden">
                <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</dt>
                <dd className="readout-chip truncate text-xs text-foreground" title={value}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            {t.dialogClose}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
