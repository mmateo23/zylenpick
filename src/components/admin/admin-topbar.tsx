import { ShieldCheck } from "lucide-react";

import { SignOutButton } from "@/features/auth/components/sign-out-button";

type AdminTopbarProps = {
  email: string | null;
};

export function AdminTopbar({ email }: AdminTopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[1.2rem] border border-[#741314]/12 bg-[#FFF7E8] px-4 py-3 shadow-[0_12px_36px_rgba(116,19,20,0.06)] sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#741314] text-[#FFF7E8]">
          <ShieldCheck aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#741314]">Panel de gestión</p>
          <p className="truncate text-xs text-[#741314]/55">
            {email ?? "Sesión activa"}
          </p>
        </div>
      </div>

      <SignOutButton variant="danger" />
    </header>
  );
}
