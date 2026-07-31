import { en } from "./en"
import type { AppStrings } from "./types"

export type { AppStrings } from "./types"

// Locale registry. Add `tr.ts` (implementing AppStrings) and register it
// here when Turkish ships — no other call site needs to change since
// everything consumes `strings`/`useStrings()`, never the raw locale module.
const locales = {
  en,
} satisfies Record<string, AppStrings>

export type Locale = keyof typeof locales

const DEFAULT_LOCALE: Locale = "en"

export function useStrings(locale: Locale = DEFAULT_LOCALE): AppStrings {
  return locales[locale]
}

export const strings = locales[DEFAULT_LOCALE]
