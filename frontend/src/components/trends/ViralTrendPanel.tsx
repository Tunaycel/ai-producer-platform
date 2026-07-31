import { useState } from "react"
import {
  AlertTriangle,
  Disc3,
  Flame,
  Inbox,
  Play,
  RefreshCw,
  Radio,
  Rocket,
  ServerCrash,
  Target,
  Video,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useViralTrends } from "@/hooks/useViralTrends"
import { cn } from "@/lib/utils"
import type { ViralTrendRecommendation } from "@/lib/api"
import type { AppStrings } from "@/i18n"

interface ViralTrendPanelProps {
  strings: AppStrings["viralTrends"]
}

/**
 * "Put AI to Work / Viral Trend Analyzer" (README.md module 2, RULES.md #7).
 * Every card here is a live response from GET /api/v1/trends/viral-beats
 * (src/backend/services/viral_scanner.py) — no local/canned recommendations.
 * The service only ever returns parametric analysis (BPM, key, style match)
 * over an "inspired by" reference, never a copy of the original audio, per
 * RULES.md #7. "Use This Beat" is an honest not-yet-implemented affordance:
 * the DSP mastering pipeline (Demucs/Matchering/Pedalboard) that would
 * actually act on a selected beat isn't built yet (ROADMAP.md "Next up"),
 * so clicking it opens a dialog that says so instead of pretending to start
 * a mix, mirroring how PlansDialog honestly disables unbuilt checkout.
 */
export function ViralTrendPanel({ strings: t }: ViralTrendPanelProps) {
  const trendsQuery = useViralTrends(t.genres[0]?.id ?? "rap")
  const [selectedBeat, setSelectedBeat] = useState<ViralTrendRecommendation | null>(null)

  return (
    <Card className="console-panel console-rivets border-border py-5">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="size-4 text-primary" aria-hidden />
            {t.cardTitle}
          </CardTitle>
          <span className="readout-chip hidden text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:inline">
            {t.channelLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t.cardSubtitle}</p>

        <Tabs value={trendsQuery.genre} onValueChange={trendsQuery.setGenre} className="pt-1">
          <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {t.genreLabel}
          </span>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1.5 bg-transparent p-0">
            {t.genres.map((genre) => (
              <TabsTrigger
                key={genre.id}
                value={genre.id}
                className="h-8 flex-none rounded-full border border-border bg-secondary/50 px-3.5 data-[state=active]:border-transparent"
              >
                {genre.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {trendsQuery.status === "loading" && <TrendsLoadingState />}

        {trendsQuery.status === "error" && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <ServerCrash />
            <AlertTitle>{t.errorTitle}</AlertTitle>
            <AlertDescription>
              <p>{trendsQuery.errorMessage}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={trendsQuery.refresh}>
                <RefreshCw /> {t.retry}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {trendsQuery.status === "success" && trendsQuery.trends.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center" aria-live="polite">
            <Inbox className="size-6 text-muted-foreground/60" aria-hidden />
            <p className="text-sm font-medium text-foreground/90">{t.emptyTitle}</p>
            <p className="text-xs text-muted-foreground">{t.emptyHint}</p>
          </div>
        )}

        {trendsQuery.status === "success" && trendsQuery.trends.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            {trendsQuery.trends.map((trend, index) => (
              <TrendCard key={trend.id} trend={trend} rank={index + 1} strings={t} onUseBeat={setSelectedBeat} />
            ))}
          </div>
        )}
      </CardContent>

      <UseBeatDialog beat={selectedBeat} strings={t} onOpenChange={(open) => !open && setSelectedBeat(null)} />
    </Card>
  )
}

function TrendsLoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  )
}

function platformIcon(platform: string): LucideIcon {
  const p = platform.toLowerCase()
  if (p.includes("tiktok") || p.includes("reel") || p.includes("instagram")) return Video
  if (p.includes("spotify")) return Disc3
  if (p.includes("youtube")) return Play
  return Radio
}

function TrendCard({
  trend,
  rank,
  strings: t,
  onUseBeat,
}: {
  trend: ViralTrendRecommendation
  rank: number
  strings: AppStrings["viralTrends"]
  onUseBeat: (trend: ViralTrendRecommendation) => void
}) {
  const PlatformIcon = platformIcon(trend.platform)
  const isTopRank = rank === 1

  return (
    <Card className="flex flex-col gap-4 border-border bg-card/60 py-5">
      <CardHeader className="gap-3">
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "readout-chip flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
              isTopRank
                ? "border-brand-amber/50 bg-brand-amber/15 text-brand-amber shadow-[0_0_12px_-4px_var(--brand-amber)]"
                : "border-border bg-secondary/60 text-muted-foreground",
            )}
          >
            {t.rankPrefix}
            {rank}
          </span>
          <div className="flex min-w-0 flex-col">
            <CardTitle className="text-sm leading-snug">{trend.title}</CardTitle>
            <p className="mt-0.5 truncate text-xs text-muted-foreground" title={trend.original_reference}>
              {trend.original_reference}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[10px] font-medium text-foreground/80">
            <PlatformIcon className="size-3" aria-hidden />
            {trend.platform}
          </span>
          <Badge variant="outline" className="gap-1 border-brand-amber/40 text-brand-amber">
            <Target className="size-3" aria-hidden />
            {trend.style_match}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <ScoreReadout score={trend.viral_score} label={t.scoreLabel} unit={t.scoreUnit} />

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border/60 pt-3">
          <div className="flex flex-col overflow-hidden">
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">{t.bpmLabel}</dt>
            <dd className="readout-chip text-sm text-foreground">{trend.bpm}</dd>
          </div>
          <div className="flex flex-col overflow-hidden">
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">{t.keyLabel}</dt>
            <dd className="readout-chip truncate text-sm text-foreground" title={trend.key}>
              {trend.key}
            </dd>
          </div>
        </dl>

        <p className="text-xs leading-relaxed text-muted-foreground">{trend.description}</p>

        <div className="mt-auto flex flex-col gap-1 rounded-lg border border-border/60 bg-black/15 p-2.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-green">
            {t.vocalChainLabel}
          </span>
          <p className="text-xs text-foreground/80">{trend.vocal_recommendation}</p>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={() => onUseBeat(trend)} className="w-full">
          <Rocket aria-hidden /> {t.useThisBeat}
        </Button>
      </CardFooter>
    </Card>
  )
}

function ScoreReadout({ score, label, unit }: { score: number; label: string; unit: string }) {
  const clamped = Math.max(0, Math.min(100, score))
  const segments = 12
  const litSegments = Math.round((clamped / 100) * segments)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
        <span className="readout-chip text-2xl leading-none font-bold text-brand-green">
          {clamped.toFixed(1)}
          <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
        </span>
      </div>
      <div className="flex gap-0.5" role="img" aria-label={`${label}: ${clamped.toFixed(1)} out of 100`}>
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-[1px] transition-colors",
              i < litSegments ? "bg-brand-green shadow-[0_0_6px_-1px_var(--brand-green)]" : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  )
}

function UseBeatDialog({
  beat,
  strings: t,
  onOpenChange,
}: {
  beat: ViralTrendRecommendation | null
  strings: AppStrings["viralTrends"]
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={beat !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <AlertTriangle className="size-8 text-brand-amber" aria-hidden />
          <DialogTitle className="text-lg">{t.dialogTitle}</DialogTitle>
          {beat && (
            <p className="readout-chip text-xs text-muted-foreground">
              {beat.title} · {beat.bpm} BPM · {beat.key}
            </p>
          )}
          <DialogDescription>{t.dialogBody}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            {t.dialogClose}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
