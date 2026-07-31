import { useEffect, useRef, useState } from "react"
import { Activity, AlertTriangle, Loader2, Mic, Pause, Play, RotateCcw, Square } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AudioVisualizer } from "@/components/studio/AudioVisualizer"
import { ConsoleVUMeterLazy as ConsoleVUMeter } from "@/components/studio/ConsoleVUMeterLazy"
import type { UseAudioRecorderResult } from "@/hooks/useAudioRecorder"
import { formatDuration } from "@/lib/format"
import type { AppStrings } from "@/i18n"

interface VocalRecorderPanelProps {
  strings: AppStrings["recorder"]
  /**
   * Owned by App so the ProducerChatPanel can read whether a take exists
   * (`recorder.state === "recorded"`) and pass that along as `has_vocal` on
   * every producer chat request — a single source of truth for "does this
   * artist have a vocal recorded" instead of two components guessing.
   */
  recorder: UseAudioRecorderResult
}

export function VocalRecorderPanel({ strings: t, recorder }: VocalRecorderPanelProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    setIsPlaying(false)
  }, [recorder.audioUrl])

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      void audio.play()
    }
  }

  const isBusy = recorder.state === "requesting"

  return (
    <Card className="console-panel console-rivets border-border py-5">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-primary" aria-hidden />
            {t.cardTitle}
          </CardTitle>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_var(--success)]" />
            {t.engineLabel}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3 border-t border-border/60 pt-3">
          <ConsoleVUMeter
            analyser={recorder.state === "recording" ? recorder.analyser : null}
            channels={2}
            className="h-14 w-32 shrink-0"
            label={recorder.state === "recording" ? t.inputLevelLive : t.inputLevelIdle}
          />
          <span className="readout-chip text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {t.inputLevelLabel}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="relative aspect-video w-full">
          <AudioVisualizer
            analyser={recorder.state === "recording" ? recorder.analyser : null}
            liveLabel={t.liveLabel}
            idleLabel={t.idleLabel}
            className="h-full w-full"
          />

          {recorder.state === "idle" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <Mic className="size-6 text-muted-foreground/70" aria-hidden />
              <p className="text-sm font-medium text-foreground/90">{t.idleOverlayTitle}</p>
              <p className="text-xs text-muted-foreground">{t.idleOverlayHint}</p>
            </div>
          )}
        </div>

        {recorder.state === "error" && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertTriangle />
            <AlertTitle>
              {recorder.errorKind === "permission-denied" ? t.permissionErrorTitle : t.unsupportedErrorTitle}
            </AlertTitle>
            <AlertDescription>
              <p>
                {recorder.errorKind === "permission-denied" ? t.permissionErrorBody : t.unsupportedErrorBody}
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => void recorder.start()}>
                <RotateCcw /> {t.retry}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {recorder.state === "recording" ? (
            <Button
              variant="destructive"
              onClick={recorder.stop}
              className="min-w-40 bg-destructive text-white hover:bg-destructive/90"
            >
              <Square className="fill-current" /> {t.recordStop}
              <span className="ml-1 font-mono tabular-nums">{formatDuration(recorder.elapsedSeconds)}</span>
            </Button>
          ) : (
            <Button onClick={() => void recorder.start()} disabled={isBusy} className="min-w-40">
              {isBusy ? <Loader2 className="animate-spin" /> : <Mic />}
              {t.recordStart}
            </Button>
          )}

          {recorder.state === "recorded" && recorder.audioUrl && (
            <>
              <Button variant="secondary" onClick={togglePlayback}>
                {isPlaying ? <Pause /> : <Play />} {t.listen}
              </Button>
              <Button variant="ghost" onClick={recorder.reset}>
                <RotateCcw /> {t.discard}
              </Button>
              <audio
                ref={audioRef}
                src={recorder.audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </>
          )}
        </div>

        {recorder.state === "recorded" && (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {t.recordedBadge} · {t.durationLabel} {formatDuration(recorder.elapsedSeconds)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
