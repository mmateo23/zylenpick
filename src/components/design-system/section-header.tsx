import * as React from "react";

import { cn } from "@/lib/utils";

export type SectionHeaderAlign = "left" | "center";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: SectionHeaderAlign;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "flex gap-5",
        isCentered
          ? "mx-auto max-w-3xl flex-col items-center text-center"
          : "items-end justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0", isCentered ? "max-w-3xl" : "max-w-2xl")}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-base leading-7 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className={cn("shrink-0", isCentered ? "mt-1" : "mb-1")}>
          {action}
        </div>
      ) : null}
    </div>
  );
}

