import { PickyaloVerifiedIcon } from "@/components/icons/pickyalo";

type VerifiedVenueBadgeProps = {
  isVerified: boolean;
  subscriptionActive: boolean;
  withLabel?: boolean;
};

export function VerifiedVenueBadge({
  isVerified,
  subscriptionActive,
  withLabel = false,
}: VerifiedVenueBadgeProps) {
  if (!isVerified || !subscriptionActive) {
    return null;
  }

  const helpText =
    "Documentación aportada por el local y revisada por Pickyalo. Esta revisión no sustituye a una administración pública.";

  return (
    <span
      title={helpText}
      aria-label="Local verificado por Pickyalo"
      className="inline-flex items-center gap-2 rounded-full border border-emerald-700/25 bg-emerald-50/95 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-[var(--card-shadow)] backdrop-blur-sm"
    >
      <PickyaloVerifiedIcon
        size={17}
        strokeWidth={2.35}
        animated
        className="text-emerald-700"
      />
      {withLabel ? (
        <span>
          Verificado por{" "}
          <span className="font-pickyalo-wordmark text-[1.04em] tracking-[-0.035em]">
            Pickyalo
          </span>
        </span>
      ) : null}
    </span>
  );
}
