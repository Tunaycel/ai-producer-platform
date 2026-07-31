import type { AppStrings } from "./types"

export const en: AppStrings = {
  brand: {
    name: "AI PRODUCER",
    badge: "STUDIO PRO v1.0",
  },
  header: {
    tierPro: "Pro Artist",
    upgradeCta: "View Plans",
    statusOnline: "Engine Online",
    statusConnecting: "Connecting to engine…",
    statusOffline: "Engine Offline",
    statusRetry: "Retry",
  },
  plans: {
    dialogTitle: "AI Producer SaaS Plans",
    dialogSubtitle: "Make music production limitless.",
    close: "Close",
    billingNotice: "Billing is not live yet — this plan will become available once Stripe checkout ships.",
    starter: {
      name: "Starter",
      price: "$0/mo",
      features: ["2 beat generations", "Standard vocal mix", "MP3 export"],
      cta: "Current Plan",
    },
    pro: {
      name: "Pro Artist",
      price: "$29/mo",
      badge: "MOST POPULAR",
      features: [
        "Unlimited AI producer chat",
        "Viral trend recommendations",
        "Travis Scott autotune FX chain",
        "Studio-grade WAV export",
      ],
      cta: "Start Subscription",
    },
    studio: {
      name: "Studio Unlimited",
      price: "$59/mo",
      features: [
        "Everything in Pro Artist",
        "Full isolated stem downloads",
        "Custom vocal model training (RVC)",
        "24/7 VIP support",
      ],
      cta: "Go Studio VIP",
    },
  },
  recorder: {
    cardTitle: "Live Signal & Spectrum Visualizer",
    engineLabel: "48kHz / 24-bit Studio Engine",
    idleOverlayTitle: "Press record to start",
    idleOverlayHint: "Your vocal take feeds straight into the autotune chain.",
    recordStart: "Record Vocal",
    recordStop: "Stop Recording",
    listen: "Play Take",
    discard: "Discard",
    liveLabel: "LIVE",
    idleLabel: "IDLE",
    permissionErrorTitle: "Microphone access denied",
    permissionErrorBody:
      "Allow microphone access in your browser's site settings, then retry — no audio is captured until you do.",
    unsupportedErrorTitle: "Microphone not available",
    unsupportedErrorBody: "This browser or device doesn't expose an audio input. Try a different browser or device.",
    retry: "Try Again",
    recordedBadge: "Take recorded",
    durationLabel: "Duration",
  },
}
