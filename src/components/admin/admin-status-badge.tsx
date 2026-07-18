import type { ReactNode } from "react";

type AdminStatusTone = "success" | "warning" | "danger" | "neutral" | "info";

type AdminStatusBadgeProps = {
  children: ReactNode;
  tone?: AdminStatusTone;
  className?: string;
};

const toneClassNames: Record<AdminStatusTone, string> = {
  success: "border-emerald-400/25 bg-emerald-400/12 text-emerald-200",
  warning: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  danger: "border-rose-400/25 bg-rose-400/10 text-rose-200",
  neutral: "border-white/10 bg-white/[0.05] text-white/58",
  info: "border-sky-400/25 bg-sky-400/10 text-sky-200",
};

export function AdminStatusBadge({
  children,
  tone = "neutral",
  className = "",
}: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${toneClassNames[tone]} ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

