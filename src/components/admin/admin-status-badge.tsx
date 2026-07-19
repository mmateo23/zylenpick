import type { ReactNode } from "react";

type AdminStatusTone = "success" | "warning" | "danger" | "neutral" | "info";

type AdminStatusBadgeProps = {
  children: ReactNode;
  tone?: AdminStatusTone;
  className?: string;
};

const toneClassNames: Record<AdminStatusTone, string> = {
  success: "border-emerald-700/20 bg-emerald-100 text-emerald-800",
  warning: "border-amber-700/20 bg-amber-100 text-amber-900",
  danger: "border-rose-700/20 bg-rose-100 text-rose-800",
  neutral: "border-[#741314]/12 bg-[#741314]/[0.05] text-[#741314]/65",
  info: "border-sky-700/20 bg-sky-100 text-sky-800",
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
