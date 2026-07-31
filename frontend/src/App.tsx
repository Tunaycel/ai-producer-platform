import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from "@/components/layout/Header"
import { VocalRecorderPanel } from "@/components/studio/VocalRecorderPanel"
import { strings } from "@/i18n"

/**
 * First slice of the React migration (ROADMAP.md "Frontend rebuild").
 * Scope for this pass: header/nav + the vocal recording & live visualizer
 * panel, both wired to real backend/browser APIs. The AI producer chat,
 * viral trend scanner, and mastering console panels from the legacy
 * src/frontend/index.html are follow-up PRs — deliberately not stubbed out
 * here as empty tabs, since a half-built tab is worse than not shipping it
 * yet.
 */
function App() {
  return (
    <TooltipProvider>
      <div className="flex min-h-dvh flex-col">
        <Header strings={strings} />

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
          <VocalRecorderPanel strings={strings.recorder} />
        </main>
      </div>
    </TooltipProvider>
  )
}

export default App
