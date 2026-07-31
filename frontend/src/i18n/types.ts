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
}
