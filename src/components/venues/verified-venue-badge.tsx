import { Logo } from "@/components/branding/logo";

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
    "Local verificado por ZylenPick. Este local ha sido revisado por ZylenPick y cumple estándares de calidad para recogida.";

  return (
    <span
      title={helpText}
      aria-label="Local verificado por ZylenPick"
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand)]/18 bg-[color:var(--brand)]/10 px-3 py-1.5 text-xs font-medium text-[color:var(--foreground)] shadow-[var(--card-shadow)]"
    >
      <Logo mode="icon" iconClassName="h-4 w-auto" />
      {withLabel ? <span>Verificado por ZylenPick</span> : null}
    </span>
  );
}
