import * as React from "react"

import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/**
 * Hand-rolled two-state toggle (no radix Switch primitive pulled in — this
 * repo already has Dialog/Slot/Tooltip via `radix-ui`, but adding another
 * primitive just for a single on/off track isn't worth the dependency
 * surface). Native <button role="switch"> semantics, full keyboard support
 * (Space/Enter toggle via native button activation), amber glow when on to
 * match the Console identity's "lit" state language used elsewhere
 * (VU meter glow, active knob glow).
 */
function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary shadow-[0_0_10px_-1px_var(--brand-amber)]" : "bg-secondary",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 translate-x-0.5 rounded-full bg-[#f1e9dc] shadow transition-transform",
          checked && "translate-x-[21px]",
        )}
      />
    </button>
  )
}

export { Switch }
