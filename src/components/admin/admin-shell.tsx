import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

type AdminShellProps = {
  children: ReactNode;
  email: string | null;
};

export function AdminShell({ children, email }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[color:var(--background)] px-5 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <AdminSidebar />
        <div className="space-y-5">
          <AdminTopbar email={email} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
