"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

type AdminFormDisclosureProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AdminFormDisclosure({
  eyebrow = "Opcional",
  title,
  description,
  children,
  defaultOpen = false,
}: AdminFormDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details
      className="group rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
            {eyebrow}
          </span>
          <span className="mt-1 block text-lg font-semibold text-[#381932]">{title}</span>
          <span className="mt-1 block max-w-2xl text-sm leading-6 text-[#381932]/62">
            {description}
          </span>
        </span>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#741314]/15 bg-white text-[#741314]">
          <ChevronDown
            aria-hidden="true"
            className="h-5 w-5 transition group-open:rotate-180 motion-reduce:transition-none"
          />
        </span>
      </summary>
      <div className="mt-6 border-t border-[#741314]/10 pt-6">{children}</div>
    </details>
  );
}
