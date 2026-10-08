"use client";

import { useEffect, useState } from "react";

import {
  getOpeningStatus,
  hasOpeningHoursData,
  type OpeningHoursValue,
  type OpeningStatus,
} from "@/features/venues/opening-hours";

import styles from "./venue-opening-status-badge.module.css";

type VenueOpeningStatusBadgeProps = {
  openingHours: OpeningHoursValue;
  initialStatus?: OpeningStatus;
  className?: string;
  compact?: boolean;
};

const statusStyles: Record<OpeningStatus["state"], { badge: string; dot: string }> = {
  open: {
    badge: styles.open,
    dot: styles.openDot,
  },
  closed: {
    badge: styles.closed,
    dot: styles.closedDot,
  },
  opening_soon: {
    badge: styles.soon,
    dot: styles.soonDot,
  },
  closing_soon: {
    badge: styles.soon,
    dot: styles.soonDot,
  },
};

export function VenueOpeningStatusBadge({
  openingHours,
  initialStatus,
  className = "",
  compact = false,
}: VenueOpeningStatusBadgeProps) {
  const hasKnownStatus =
    initialStatus?.source === "manual" || hasOpeningHoursData(openingHours);
  const [status, setStatus] = useState<OpeningStatus>(
    () => initialStatus ?? getOpeningStatus(openingHours),
  );

  useEffect(() => {
    if (initialStatus?.source === "manual") {
      setStatus(initialStatus);
      return;
    }
    const updateStatus = () => setStatus(getOpeningStatus(openingHours));
    updateStatus();
    const interval = window.setInterval(updateStatus, 30_000);
    document.addEventListener("visibilitychange", updateStatus);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", updateStatus);
    };
  }, [openingHours, initialStatus]);

  const statusStyle = hasKnownStatus
    ? statusStyles[status.state]
    : { badge: styles.unknown, dot: styles.unknownDot };
  const label = hasKnownStatus ? status.label : "Horario por confirmar";

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border font-extrabold shadow-[0_8px_20px_rgba(56,25,50,0.1)] ${
        compact ? "px-3 py-1.5 text-[11px]" : "min-h-10 px-3.5 py-2 text-xs"
      } ${statusStyle.badge} ${className}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusStyle.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
