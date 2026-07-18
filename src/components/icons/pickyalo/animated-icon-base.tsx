import type { ReactNode } from "react";

import type { AnimatedIconProps } from "./animated-icon-types";

type AnimatedIconBaseProps = Omit<
  AnimatedIconProps,
  "animated" | "active" | "loop" | "triggerKey"
> & { children: ReactNode };

export function AnimatedIconBase({
  size = 24,
  strokeWidth = 2.2,
  title,
  children,
  ...props
}: AnimatedIconBaseProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
