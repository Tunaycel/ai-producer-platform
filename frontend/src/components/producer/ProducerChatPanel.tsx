import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { AlertTriangle, Loader2, Music2, Send, Sparkles, User, WifiOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useProducerChat, type ChatMessage } from "@/hooks/useProducerChat"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"
import type { AppStrings } from "@/i18n"

interface ProducerChatPanelProps {
  strings: AppStrings["producerChat"]
  /** Whether the artist has a vocal take recorded this session (from VocalRecorderPanel's shared recorder state) — forwarded as `has_vocal` on every request. */
  hasVocal: boolean
}

/**
 * The flagship "AI Producer Chat" surface (README.md) — natural language in,
 * real beat parameters out. Every producer turn in the transcript is a live
 * response from POST /api/v1/producer/chat (see useProducerChat); there is
 * no canned/local fallback copy anywhere in this component.
 */
export function ProducerChatPanel({ strings: t, hasVocal }: ProducerChatPanelProps) {
  const chat = useProducerChat()
  const [draft, setDraft] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSending = chat.status === "sending"

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" })
  }, [chat.messages.length, isSending])

  const handleSend = () => {
    if (!draft.trim() || isSending) return
    const message = draft
    setDraft("")
    void chat.send(message, hasVocal)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (prompt: string) => {
    setDraft(prompt)
    textareaRef.current?.focus()
  }

  const errorTitle =
    chat.errorKind === "network"
      ? t.errorTitleNetwork
      : chat.errorKind === "validation"
        ? t.errorTitleValidation
        : t.errorTitleServer

  return (
    <Card className="console-panel console-rivets flex h-[36rem] flex-col border-border py-5">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" aria-hidden />
            {t.cardTitle}
          </CardTitle>
          <span className="readout-chip hidden text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:inline">
            {t.channelLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t.cardSubtitle}</p>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div
          ref={listRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-border/60 bg-black/15 p-3"
        >
          {chat.messages.length === 0 && !isSending ? (
            <EmptyState strings={t} onSuggestion={handleSuggestion} />
          ) : (
            <div className="flex flex-col gap-3" aria-live="polite">
              {chat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} strings={t} />
              ))}
              {isSending && <ThinkingBubble label={t.thinking} />}
            </div>
          )}
        </div>

        {chat.status === "error" && chat.errorMessage && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            {chat.errorKind === "network" ? <WifiOff /> : <AlertTriangle />}
            <AlertTitle>{errorTitle}</AlertTitle>
            <AlertDescription>
              <p>{chat.errorMessage}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.composerPlaceholder}
            aria-label={t.composerLabel}
            disabled={isSending}
            rows={2}
            className="max-h-32"
          />
          <Button
            onClick={handleSend}
            disabled={isSending || !draft.trim()}
            size="icon-lg"
            aria-label={t.sendLabel}
            className="shrink-0"
          >
            {isSending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  strings: t,
  onSuggestion,
}: {
  strings: AppStrings["producerChat"]
  onSuggestion: (prompt: string) => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-6 text-center">
      <Music2 className="size-6 text-muted-foreground/60" aria-hidden />
      <p className="text-sm font-medium text-foreground/90">{t.emptyTitle}</p>
      <p className="text-xs text-muted-foreground">{t.emptyHint}</p>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        {t.suggestions.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSuggestion(prompt)}
            className="max-w-64 truncate rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-brand-amber/50 hover:text-foreground"
            title={prompt}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ message, strings: t }: { message: ChatMessage; strings: AppStrings["producerChat"] }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex items-start gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar role={message.role} strings={t} />
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "border-l-2 border-brand-amber bg-card/80 text-foreground",
        )}
      >
        <FormattedMessageText content={message.content} />
        {message.brief && <ProductionBrief brief={message.brief} strings={t} />}
      </div>
    </div>
  )
}

/**
 * The backend's ProducerAIService writes `**word**` emphasis into
 * producer_message (see src/backend/services/producer_ai.py) but returns
 * plain text, not HTML/markdown — rendering it verbatim would show the
 * literal asterisks. This does the minimal, safe thing: split on the
 * `**...**` pattern and render matches as <strong>, everything else as
 * plain text. No markdown/HTML parser, no dangerouslySetInnerHTML.
 */
function FormattedMessageText({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return (
    <p className="whitespace-pre-wrap leading-relaxed">
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index} className="font-semibold text-brand-amber">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  )
}

function ProductionBrief({
  brief,
  strings: t,
}: {
  brief: NonNullable<ChatMessage["brief"]>
  strings: AppStrings["producerChat"]
}) {
  const rows: Array<[string, string]> = [
    [t.briefGenre, brief.genre],
    [t.briefBpm, `${brief.beatParameters.bpm}`],
    [t.briefKey, brief.beatParameters.key],
    [t.briefSubBass, brief.beatParameters.sub_bass_type],
    [t.briefHiHat, brief.beatParameters.hihat_groove],
    [t.briefInstrumentation, brief.beatParameters.instrumentation],
    [t.briefVocalChain, brief.recommendedVocalChain],
    [t.briefMastering, brief.masteringTarget],
  ]

  return (
    <div className="mt-3 border-t border-border/60 pt-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-green">{t.briefTitle}</p>
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
  )
}

function ThinkingBubble({ label }: { label: string }) {
  const reducedMotion = useReducedMotion()
  return (
    <div className="flex items-start gap-2">
      <Avatar role="producer" pulsing />
      <div className="flex items-center gap-1.5 rounded-lg border-l-2 border-brand-amber bg-card/80 px-3 py-2.5">
        <span className="sr-only" role="status">
          {label}
        </span>
        {reducedMotion ? (
          <span className="readout-chip text-xs text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <span className="flex gap-1" aria-hidden>
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-amber [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-amber [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-amber" />
          </span>
        )}
      </div>
    </div>
  )
}

function Avatar({
  role,
  pulsing,
  strings: t,
}: {
  role: ChatMessage["role"]
  pulsing?: boolean
  strings?: AppStrings["producerChat"]
}) {
  const isProducer = role === "producer"
  return (
    <div
      className={cn(
        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
        isProducer ? "border-brand-amber/40 bg-[#221c12]" : "border-border bg-secondary",
        pulsing && "animate-pulse",
      )}
      aria-label={isProducer ? t?.producerLabel : t?.userLabel}
      role={t ? "img" : undefined}
    >
      {isProducer ? (
        <Sparkles className="size-3.5 text-brand-amber" aria-hidden />
      ) : (
        <User className="size-3.5 text-muted-foreground" aria-hidden />
      )}
    </div>
  )
}
