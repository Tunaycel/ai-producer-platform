/**
 * Shape of every locale's copy. Keep this the single source of truth for
 * which strings exist — adding Turkish later means creating `tr.ts` that
 * satisfies this same interface, no framework migration required.
 */
export interface AppStrings {
  brand: {
    name: string
    badge: string
    vuMeterLabel: string
  }
  header: {
    tierPro: string
    upgradeCta: string
    statusOnline: string
    statusConnecting: string
    statusOffline: string
    statusRetry: string
  }
  nav: {
    studioTab: string
    trendsTab: string
  }
  plans: {
    dialogTitle: string
    dialogSubtitle: string
    close: string
    billingNotice: string
    starter: {
      name: string
      price: string
      features: string[]
      cta: string
    }
    pro: {
      name: string
      price: string
      badge: string
      features: string[]
      cta: string
    }
    studio: {
      name: string
      price: string
      features: string[]
      cta: string
    }
  }
  recorder: {
    cardTitle: string
    engineLabel: string
    idleOverlayTitle: string
    idleOverlayHint: string
    recordStart: string
    recordStop: string
    listen: string
    discard: string
    liveLabel: string
    idleLabel: string
    permissionErrorTitle: string
    permissionErrorBody: string
    unsupportedErrorTitle: string
    unsupportedErrorBody: string
    retry: string
    recordedBadge: string
    durationLabel: string
    inputLevelLabel: string
    inputLevelLive: string
    inputLevelIdle: string
    signalChainLabel: string
    signalChainSteps: string[]
  }
  producerChat: {
    cardTitle: string
    channelLabel: string
    cardSubtitle: string
    emptyTitle: string
    emptyHint: string
    suggestions: string[]
    composerPlaceholder: string
    composerLabel: string
    sendLabel: string
    thinking: string
    errorTitleNetwork: string
    errorTitleValidation: string
    errorTitleServer: string
    retry: string
    briefTitle: string
    briefGenre: string
    briefBpm: string
    briefKey: string
    briefSubBass: string
    briefHiHat: string
    briefInstrumentation: string
    briefVocalChain: string
    briefMastering: string
    userLabel: string
    producerLabel: string
  }
  viralTrends: {
    cardTitle: string
    cardSubtitle: string
    channelLabel: string
    genreLabel: string
    genres: Array<{ id: string; label: string }>
    loadingLabel: string
    errorTitle: string
    retry: string
    emptyTitle: string
    emptyHint: string
    scoreLabel: string
    scoreUnit: string
    platformLabel: string
    styleMatchLabel: string
    bpmLabel: string
    keyLabel: string
    referenceLabel: string
    vocalChainLabel: string
    useThisBeat: string
    rankPrefix: string
    dialogTitle: string
    dialogBody: string
    dialogClose: string
  }
  landing: LandingCopy
  mastering: {
    cardTitle: string
    channelLabel: string
    cardSubtitle: string
    presetLabel: string
    presets: {
      rage: { name: string; tagline: string }
      darkTrap: { name: string; tagline: string }
      melodicDrill: { name: string; tagline: string }
      boomBap: { name: string; tagline: string }
    }
    knobRetuneSpeed: string
    knobHumanize: string
    knobFormant: string
    knobReverb: string
    knobHint: string
    toggleHardTune: string
    toggleHardTuneHint: string
    toggleDeEsser: string
    toggleDeEsserHint: string
    applyButton: string
    notLiveNotice: string
    noVocalHint: string
    dialogTitle: string
    dialogBodyIntro: string
    dialogBodyWithVocal: string
    dialogBodyWithoutVocal: string
    dialogSettingsTitle: string
    dialogClose: string
    settingPreset: string
    settingRetune: string
    settingHumanize: string
    settingFormant: string
    settingReverb: string
    settingHardTune: string
    settingDeEsser: string
    stateOn: string
    stateOff: string
  }
}

/**
 * Copy for the marketing landing page shown before the app shell (App.tsx
 * view switch). Kept as its own top-level namespace, same pattern as
 * `producerChat`/`viralTrends`, so a future `tr.ts` locale implements it
 * the same way as every other section.
 */
export interface LandingCopy {
  nav: {
    brandName: string
    brandBadge: string
    featuresLink: string
    pricingLink: string
    enterStudio: string
  }
  hero: {
    eyebrow: string
    headline: string
    headlineAccent: string
    subheadline: string
    ctaPrimary: string
    ctaSecondary: string
    proofPoints: string[]
    visualLabel: string
    visualChips: string[]
  }
  featuresIntro: {
    eyebrow: string
    title: string
    subtitle: string
    tryPromptsLabel: string
  }
  features: LandingFeature[]
  pipelineIntro: {
    eyebrow: string
    title: string
    subtitle: string
  }
  pipelineSteps: Array<{ label: string; description: string }>
  pricingIntro: {
    eyebrow: string
    title: string
    subtitle: string
  }
  finalCta: {
    title: string
    subtitle: string
    cta: string
  }
  footer: {
    tagline: string
    columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>
    legalNote: string
    copyright: string
  }
}

export interface LandingFeature {
  id: string
  kicker: string
  title: string
  description: string
  status: string
  specs: Array<{ label: string; value: string }>
  /** Optional illustrative example of the module's output, clearly labeled as an example (not a real transcript/stat) — currently only used on the emphasized Producer Chat card. */
  preview?: {
    label: string
    message: string
    tags: string[]
  }
}
