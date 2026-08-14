"use client";

import { useEffect, useState } from "react";

import {
  getOpeningStatus,
  type OpeningHoursValue,
  type OpeningStatus,
} from "@/features/venues/opening-hours";

type VenueOpeningStatusBadgeProps = {
  openingHours: OpeningHoursValue;
  initialStatus?: OpeningStatus;
  className?: string;
  compact?: boolean;
};

const statusStyles: Record<OpeningStatus["state"], { badge: string; dot: string }> = {
  open: {
    badge: "border-emerald-700/30 bg-emerald-100 text-emerald-950",
    dot: "bg-emerald-600",
  },
  closed: {
    badge: "border-[#A43A42]/35 bg-[#FFE2E5] text-[#741314]",
    dot: "bg-[#A43A42]",
  },
  opening_soon: {
    badge: "border-amber-600/40 bg-amber-100 text-amber-950",
    dot: "bg-amber-600",
  },
  closing_soon: {
    badge: "border-amber-600/40 bg-amber-100 text-amber-950",
    dot: "bg-amber-600",
  },
};

export function VenueOpeningStatusBadge({
  openingHours,
  initialStatus,
  className = "",
  compact = false,
}: VenueOpeningStatusBadgeProps) {
  const [status, setStatus] = useState<OpeningStatus>(
    () => initialStatus ?? getOpeningStatus(openingHours),
  );

  useEffect(() => {
    const updateStatus = () => setStatus(getOpeningStatus(openingHours));
    updateStatus();
    const interval = window.setInterval(updateStatus, 30_000);
    document.addEventListener("visibilitychange", updateStatus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", updateStatus);
    };
  }, [openingHours]);

  const styles = statusStyles[status.state];

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border font-extrabold shadow-[0_8px_20px_rgba(56,25,50,0.1)] ${
        compact ? "px-3 py-1.5 text-[11px]" : "min-h-10 px-3.5 py-2 text-xs"
      } ${styles.badge} ${className}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} aria-hidden="true" />
      {status.label}
    </span>
  );
}
