import { TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/Header"
import { VocalRecorderPanel } from "@/components/studio/VocalRecorderPanel"
import { MasteringConsolePanel } from "@/components/studio/MasteringConsolePanel"
import { ProducerChatPanel } from "@/components/producer/ProducerChatPanel"
import { ViralTrendPanel } from "@/components/trends/ViralTrendPanel"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { strings } from "@/i18n"

/**
 * Frontend rebuild (ROADMAP.md) — header/nav, the AI Producer Chat panel
 * (the product's flagship feature, README.md), the vocal recording & live
 * visualizer panel, the vocal chain / mastering control board, and the
 * Viral Trend Analyzer (README.md module 2), all wired to real
 * backend/browser APIs. The mastering board's knobs/sliders/toggles are
 * real local state — only the DSP pipeline behind its "Apply" action isn't
 * live yet (see MasteringConsolePanel, same honest-not-implemented pattern
 * as ViralTrendPanel's "Use This Beat").
 *
 * The audio recorder hook lives here (not inside VocalRecorderPanel) so its
 * `state === "recorded"` can be forwarded to ProducerChatPanel as
 * `has_vocal` on every chat request, and to MasteringConsolePanel for its
 * "Apply" dialog copy — one source of truth instead of multiple components
 * independently tracking whether a take exists.
 *
 * Two top-level views (Producer Studio / Viral Trend Analyzer) share the
 * same shell via Tabs rather than separate routes — no routing library is
 * in the project yet and a single-page studio doesn't need deep-linkable
 * URLs for two views. The mastering console lives inside the Studio tab
 * (not a third tab) since it's a direct extension of "prep this vocal take"
 * alongside the recorder, not an unrelated top-level destination.
 */
function App() {
  const recorder = useAudioRecorder()
  const hasVocal = recorder.state === "recorded"

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col">
        <Header strings={strings} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
          <Tabs defaultValue="studio">
            <TabsList className="mb-6">
              <TabsTrigger value="studio">{strings.nav.studioTab}</TabsTrigger>
              <TabsTrigger value="trends">{strings.nav.trendsTab}</TabsTrigger>
            </TabsList>

            {/* forceMount + the data-[state=inactive]:hidden rule baked into TabsContent keep both
                views mounted across tab switches — the producer chat transcript and any recorded
                take live in component state, so unmounting on tab-away would silently lose them. */}
            <TabsContent value="studio" forceMount className="flex flex-col gap-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
                <ProducerChatPanel strings={strings.producerChat} hasVocal={hasVocal} />
                <VocalRecorderPanel strings={strings.recorder} recorder={recorder} />
              </div>
              <MasteringConsolePanel strings={strings.mastering} hasVocal={hasVocal} />
            </TabsContent>

            <TabsContent value="trends" forceMount>
              <ViralTrendPanel strings={strings.viralTrends} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  )
}

export default App
