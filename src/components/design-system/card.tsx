import * as React from "react";

import { cn } from "@/lib/utils";

export type CardVariant = "surface" | "media" | "ticket" | "admin";
export type CardPadding = "sm" | "md" | "lg";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
};

const variantClassNames: Record<CardVariant, string> = {
  surface:
    "rounded-[var(--radius-lg)] border-border-subtle bg-surface-strong",
  media:
    "overflow-hidden rounded-[var(--radius-xl)] border-border-subtle bg-surface-strong",
  ticket:
    "rounded-[var(--radius-lg)] border-border-subtle bg-surface",
  admin:
    "rounded-[var(--radius-lg)] border-border-subtle bg-surface-strong",
};

const paddingClassNames: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "surface",
      padding = "md",
      interactive = false,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "border text-text-primary",
        variantClassNames[variant],
        paddingClassNames[padding],
        (interactive || variant === "media") &&
          "shadow-[var(--shadow-soft)] transition-[border-color,box-shadow,transform] duration-200 hover:border-border-strong",
        interactive && "hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = "Card";

