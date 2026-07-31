import { useMemo, useState } from "react"
import { Info, SlidersHorizontal, Wand2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ConsoleKnob } from "@/components/studio/ConsoleKnob"
import { VocalChainApplyDialog } from "@/components/studio/VocalChainApplyDialog"
import { cn } from "@/lib/utils"
import type { AppStrings } from "@/i18n"

interface MasteringConsolePanelProps {
  strings: AppStrings["mastering"]
  /** Whether the artist has a vocal take recorded this session — same shared recorder state ProducerChatPanel reads, used only to make the "Apply" dialog's copy honest about whether there's a take to (eventually) run the chain against. */
  hasVocal: boolean
  className?: string
}

export interface VocalChainSettings {
  presetId: PresetId
  presetName: string
  retuneSpeed: number
  humanize: number
  formant: number
  reverb: number
  hardTune: boolean
  deEsser: boolean
}

type PresetId = "rage" | "darkTrap" | "melodicDrill" | "boomBap"

interface PresetDefaults {
  retuneSpeed: number
  humanize: number
  formant: number
  reverb: number
  hardTune: boolean
  deEsser: boolean
}

/**
 * Preset defaults mirror GENRE_PRESETS["vocal_chain"] in
 * src/backend/services/producer_ai.py (rage / dark trap / melodic drill /
 * boom bap). There's no dedicated "list vocal chain presets" endpoint yet —
 * only the prompt-driven /producer/chat endpoint, which needs free-text and
 * returns one preset by keyword match, not a browsable list — so these are
 * a literal frontend copy rather than a fetched value. If producer_ai.py's
 * GENRE_PRESETS change, update this alongside it.
 */
const PRESET_DEFAULTS: Record<PresetId, PresetDefaults> = {
  rage: { retuneSpeed: 0, humanize: 5, formant: -1, reverb: 80, hardTune: true, deEsser: false },
  darkTrap: { retuneSpeed: 20, humanize: 25, formant: 0, reverb: 30, hardTune: true, deEsser: false },
  melodicDrill: { retuneSpeed: 15, humanize: 20, formant: -2, reverb: 55, hardTune: false, deEsser: false },
  boomBap: { retuneSpeed: 25, humanize: 55, formant: 0, reverb: 20, hardTune: false, deEsser: true },
}

const PRESET_IDS: PresetId[] = ["rage", "darkTrap", "melodicDrill", "boomBap"]

/**
 * The vocal effect / mastering control board (README.md module 1 "Smart
 * Vocal Processing" + module 3's mastering engine, surfaced as a UI).
 * Every knob/toggle here is real, local, controlled React state — dragging
 * a knob updates its live mono-font readout immediately. What's explicitly
 * NOT real: a live DSP pipeline behind "Apply to Vocal". ROADMAP.md's "Next
 * up" #2/#3 (Demucs → Pedalboard → Matchering mastering, RVC-based vocal
 * chain) haven't shipped, so Apply opens VocalChainApplyDialog and says so
 * plainly instead of simulating a processing/success state — see
 * RULES.md's ban on serving unprocessed audio as if it were mastered.
 */
export function MasteringConsolePanel({ strings: t, hasVocal, className }: MasteringConsolePanelProps) {
  const [presetId, setPresetId] = useState<PresetId>("darkTrap")
  const [retuneSpeed, setRetuneSpeed] = useState(PRESET_DEFAULTS.darkTrap.retuneSpeed)
  const [humanize, setHumanize] = useState(PRESET_DEFAULTS.darkTrap.humanize)
  const [formant, setFormant] = useState(PRESET_DEFAULTS.darkTrap.formant)
  const [reverb, setReverb] = useState(PRESET_DEFAULTS.darkTrap.reverb)
  const [hardTune, setHardTune] = useState(PRESET_DEFAULTS.darkTrap.hardTune)
  const [deEsser, setDeEsser] = useState(PRESET_DEFAULTS.darkTrap.deEsser)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handlePresetSelect = (id: PresetId) => {
    setPresetId(id)
    const defaults = PRESET_DEFAULTS[id]
    setRetuneSpeed(defaults.retuneSpeed)
    setHumanize(defaults.humanize)
    setFormant(defaults.formant)
    setReverb(defaults.reverb)
    setHardTune(defaults.hardTune)
    setDeEsser(defaults.deEsser)
  }

  const settings = useMemo<VocalChainSettings>(
    () => ({
      presetId,
      presetName: t.presets[presetId].name,
      retuneSpeed,
      humanize,
      formant,
      reverb,
      hardTune,
      deEsser,
    }),
    [presetId, t.presets, retuneSpeed, humanize, formant, reverb, hardTune, deEsser],
  )

  return (
    <Card className={cn("console-panel console-rivets border-border py-5", className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4 text-primary" aria-hidden />
            {t.cardTitle}
          </CardTitle>
          <span className="readout-chip hidden text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:inline">
            {t.channelLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t.cardSubtitle}</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Preset selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t.presetLabel}
          </span>
          <div role="radiogroup" aria-label={t.presetLabel} className="grid gap-2 sm:grid-cols-2">
            {PRESET_IDS.map((id) => {
              const preset = t.presets[id]
              const active = id === presetId
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handlePresetSelect(id)}
                  className={cn(
                    "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors",
                    active
                      ? "border-brand-amber/60 bg-primary/10 shadow-[0_0_0_1px_var(--brand-amber)_inset]"
                      : "border-border bg-secondary/40 hover:border-brand-amber/30 hover:bg-secondary/60",
                  )}
                >
                  <span
                    className={cn(
                      "font-heading text-sm font-semibold",
                      active ? "text-brand-amber" : "text-foreground",
                    )}
                  >
                    {preset.name}
                  </span>
                  <span className="text-[11px] leading-snug text-muted-foreground">{preset.tagline}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Knob bank */}
        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-4">
            <ConsoleKnob
              label={t.knobRetuneSpeed}
              value={retuneSpeed}
              min={0}
              max={50}
              step={1}
              defaultValue={PRESET_DEFAULTS[presetId].retuneSpeed}
              onChange={setRetuneSpeed}
              formatValue={(v) => `${v}ms`}
              accent="amber"
              className="mx-auto"
            />
            <ConsoleKnob
              label={t.knobHumanize}
              value={humanize}
              min={0}
              max={100}
              step={1}
              defaultValue={PRESET_DEFAULTS[presetId].humanize}
              onChange={setHumanize}
              formatValue={(v) => `${v}%`}
              accent="green"
              className="mx-auto"
            />
            <ConsoleKnob
              label={t.knobFormant}
              value={formant}
              min={-6}
              max={6}
              step={0.5}
              defaultValue={PRESET_DEFAULTS[presetId].formant}
              onChange={setFormant}
              formatValue={(v) => `${v > 0 ? "+" : ""}${v}st`}
              accent="brass"
              className="mx-auto"
            />
            <ConsoleKnob
              label={t.knobReverb}
              value={reverb}
              min={0}
              max={100}
              step={1}
              defaultValue={PRESET_DEFAULTS[presetId].reverb}
              onChange={setReverb}
              formatValue={(v) => `${v}%`}
              accent="amber"
              className="mx-auto"
            />
          </div>
          <p className="text-center text-[10px] text-muted-foreground/70">{t.knobHint}</p>
        </div>

        {/* Toggles */}
        <div className="grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
            <span className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{t.toggleHardTune}</span>
              <span className="text-[11px] text-muted-foreground">{t.toggleHardTuneHint}</span>
            </span>
            <Switch checked={hardTune} onCheckedChange={setHardTune} aria-label={t.toggleHardTune} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
            <span className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{t.toggleDeEsser}</span>
              <span className="text-[11px] text-muted-foreground">{t.toggleDeEsserHint}</span>
            </span>
            <Switch checked={deEsser} onCheckedChange={setDeEsser} aria-label={t.toggleDeEsser} />
          </label>
        </div>

        {/* Apply — honest about the pipeline not being live, before AND after the click. */}
        <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setDialogOpen(true)} className="min-w-48">
              <Wand2 /> {t.applyButton}
            </Button>
            {!hasVocal && <span className="text-xs text-muted-foreground">{t.noVocalHint}</span>}
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
            <Info className="size-3.5 shrink-0" aria-hidden />
            {t.notLiveNotice}
          </p>
        </div>
      </CardContent>

      <VocalChainApplyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        strings={t}
        hasVocal={hasVocal}
        settings={settings}
      />
    </Card>
  )
}

export default MasteringConsolePanel
