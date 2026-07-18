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
    "Local verificado por Pickyalo. Este local ha aportado la documentación solicitada para una revisión documental.";

  return (
    <span
      title={helpText}
      aria-label="Local verificado por Pickyalo"
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand)]/18 bg-[color:var(--brand)]/10 px-3 py-1.5 text-xs font-medium text-[color:var(--foreground)] shadow-[var(--card-shadow)]"
    >
      <PickyaloVerifiedIcon size={17} strokeWidth={2.35} animated />
      {withLabel ? <span>Verificado por Pickyalo</span> : null}
    </span>
  );
}
