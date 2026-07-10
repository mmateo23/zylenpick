import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-cta text-cta-text shadow-[var(--shadow-soft)] hover:bg-cta-hover",
  secondary:
    "border-border-subtle bg-surface-strong text-text-primary hover:border-border-strong hover:bg-surface",
  ghost:
    "border-transparent bg-transparent text-text-primary hover:bg-accent-soft",
  danger:
    "border-transparent bg-danger text-surface-strong shadow-[var(--shadow-soft)] hover:brightness-95",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-2 text-sm",
  md: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-12 px-6 py-3.5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-[background-color,border-color,box-shadow,filter,opacity] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-page",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClassNames[variant],
          sizeClassNames[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading ? rightIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";
