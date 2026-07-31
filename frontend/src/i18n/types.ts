/**
 * Shape of every locale's copy. Keep this the single source of truth for
 * which strings exist — adding Turkish later means creating `tr.ts` that
 * satisfies this same interface, no framework migration required.
 */
export interface AppStrings {
  brand: {
    name: string
    badge: string
  }
  header: {
    tierPro: string
    upgradeCta: string
    statusOnline: string
    statusConnecting: string
    statusOffline: string
    statusRetry: string
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
  }
}
