import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

type AdminShellProps = {
  children: ReactNode;
  email: string | null;
};

export function AdminShell({ children, email }: AdminShellProps) {
  return (
    <div className="admin-shell public-light-theme min-h-screen overflow-x-hidden bg-[#F6EFE6] px-3 py-3 text-[#24110E] sm:px-5 sm:py-5 lg:px-6">
      <div className="mx-auto grid w-full min-w-0 max-w-[90rem] gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-5">
        <AdminSidebar />
        <div className="min-w-0 space-y-4">
          <AdminTopbar email={email} />
          <main className="pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
