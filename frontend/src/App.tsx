import { TooltipProvider } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/Header"
import { VocalRecorderPanel } from "@/components/studio/VocalRecorderPanel"
import { ProducerChatPanel } from "@/components/producer/ProducerChatPanel"
import { ViralTrendPanel } from "@/components/trends/ViralTrendPanel"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { strings } from "@/i18n"

/**
 * Frontend rebuild (ROADMAP.md) — header/nav, the AI Producer Chat panel
 * (the product's flagship feature, README.md), the vocal recording & live
 * visualizer panel, and the Viral Trend Analyzer (README.md module 2), all
 * wired to real backend/browser APIs. The mastering console panel from the
 * legacy src/frontend/index.html is a follow-up PR — deliberately not
 * stubbed out here as an empty tab, since a half-built tab is worse than
 * not shipping it yet.
 *
 * The audio recorder hook lives here (not inside VocalRecorderPanel) so its
 * `state === "recorded"` can be forwarded to ProducerChatPanel as
 * `has_vocal` on every chat request — one source of truth instead of two
 * components independently tracking whether a take exists.
 *
 * Two top-level views (Producer Studio / Viral Trend Analyzer) share the
 * same shell via Tabs rather than separate routes — no routing library is
 * in the project yet and a single-page studio doesn't need deep-linkable
 * URLs for two views.
 */
function App() {
  const recorder = useAudioRecorder()

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
            <TabsContent
              value="studio"
              forceMount
              className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start"
            >
              <ProducerChatPanel strings={strings.producerChat} hasVocal={recorder.state === "recorded"} />
              <VocalRecorderPanel strings={strings.recorder} recorder={recorder} />
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
