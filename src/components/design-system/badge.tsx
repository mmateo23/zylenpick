import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "warning" | "danger" | "success";
export type BadgeSize = "sm" | "md";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: React.ReactNode;
  active?: boolean;
};

const toneClassNames: Record<BadgeTone, string> = {
  neutral:
    "border-border-subtle bg-surface text-text-secondary",
  accent:
    "border-accent bg-accent-soft text-text-primary",
  warning:
    "border-warning bg-surface text-text-primary",
  danger:
    "border-danger bg-surface text-danger",
  success:
    "border-border-strong bg-surface-strong text-text-primary",
};

const activeToneClassNames: Record<BadgeTone, string> = {
  neutral:
    "border-border-strong bg-surface-strong text-text-primary",
  accent:
    "border-accent bg-accent text-cta-text",
  warning:
    "border-warning bg-warning text-text-primary",
  danger:
    "border-danger bg-danger text-surface-strong",
  success:
    "border-accent bg-accent-soft text-text-primary",
};

const sizeClassNames: Record<BadgeSize, string> = {
  sm: "min-h-7 px-3 py-1 text-xs",
  md: "min-h-8 px-3.5 py-1.5 text-sm",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      tone = "neutral",
      size = "sm",
      icon,
      active = false,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex w-fit items-center justify-center gap-1.5 rounded-full border font-semibold leading-none",
        sizeClassNames[size],
        active ? activeToneClassNames[tone] : toneClassNames[tone],
        className,
      )}
      {...props}
    >
      {icon ? <span className="inline-flex shrink-0 items-center">{icon}</span> : null}
      <span>{children}</span>
    </span>
  ),
);

Badge.displayName = "Badge";
