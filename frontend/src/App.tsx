import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from "@/components/layout/Header"
import { VocalRecorderPanel } from "@/components/studio/VocalRecorderPanel"
import { ProducerChatPanel } from "@/components/producer/ProducerChatPanel"
import { useAudioRecorder } from "@/hooks/useAudioRecorder"
import { strings } from "@/i18n"

/**
 * Frontend rebuild (ROADMAP.md) — header/nav, the AI Producer Chat panel
 * (the product's flagship feature, README.md), and the vocal recording &
 * live visualizer panel, all wired to real backend/browser APIs. The viral
 * trend scanner and mastering console panels from the legacy
 * src/frontend/index.html are follow-up PRs — deliberately not stubbed out
 * here as empty tabs, since a half-built tab is worse than not shipping it
 * yet.
 *
 * The audio recorder hook lives here (not inside VocalRecorderPanel) so its
 * `state === "recorded"` can be forwarded to ProducerChatPanel as
 * `has_vocal` on every chat request — one source of truth instead of two
 * components independently tracking whether a take exists.
 */
function App() {
  const recorder = useAudioRecorder()

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col">
        <Header strings={strings} />

        <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <ProducerChatPanel strings={strings.producerChat} hasVocal={recorder.state === "recorded"} />
          <VocalRecorderPanel strings={strings.recorder} recorder={recorder} />
        </main>
      </div>
    </TooltipProvider>
  )
}

export default App
