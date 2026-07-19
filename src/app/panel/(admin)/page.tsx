import { ArrowRight, Building2, Inbox, Utensils } from "lucide-react";
import Link from "next/link";

import { getAdminDashboardSummary } from "@/features/admin/services/dashboard-service";

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();
  const stats = [
    {
      label: "Locales",
      value: summary.venuesCount,
      description: "Negocios gestionados",
      href: "/panel/locales",
      icon: Building2,
    },
    {
      label: "Productos",
      value: summary.menuItemsCount,
      description: "Productos y platos",
      href: "/panel/locales",
      icon: Utensils,
    },
    {
      label: "Solicitudes",
      value: summary.joinRequestsCount,
      description: "Altas recibidas",
      href: "/panel/solicitudes",
      icon: Inbox,
    },
  ];

  return (
    <section aria-labelledby="dashboard-title" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 px-1 py-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#741314]/55">
            Resumen
          </p>
          <h1 id="dashboard-title" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#24110E] sm:text-4xl">
            Todo bajo control.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#24110E]/60">
            Consulta el estado de Pickyalo y accede directamente a las tareas habituales.
          </p>
        </div>
        <Link
          href="/panel/locales/nuevo"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#741314] px-5 py-2.5 text-sm font-bold text-[#FFF7E8] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
        >
          Crear local
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-[1.2rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_14px_40px_rgba(116,19,20,0.06)] transition hover:-translate-y-0.5 hover:border-[#741314]/24 hover:shadow-[0_18px_44px_rgba(116,19,20,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2 motion-reduce:transform-none"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#741314]/[0.07] text-[#741314]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#741314]/35 transition group-hover:translate-x-0.5 group-hover:text-[#741314] motion-reduce:transform-none" />
              </div>
              <p className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#741314]">{stat.value}</p>
              <p className="mt-2 text-sm font-bold text-[#24110E]">{stat.label}</p>
              <p className="mt-1 text-xs text-[#24110E]/50">{stat.description}</p>
            </Link>
          );
        })}
      </div>

      <section aria-labelledby="quick-actions-title" className="rounded-[1.2rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-6">
        <h2 id="quick-actions-title" className="text-lg font-semibold text-[#24110E]">
          Acciones rápidas
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link href="/panel/locales" className="flex min-h-12 items-center justify-between rounded-[0.9rem] border border-[#741314]/10 px-4 py-3 text-sm font-semibold text-[#741314] transition hover:bg-[#741314]/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]">
            Gestionar locales <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link href="/panel/solicitudes" className="flex min-h-12 items-center justify-between rounded-[0.9rem] border border-[#741314]/10 px-4 py-3 text-sm font-semibold text-[#741314] transition hover:bg-[#741314]/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]">
            Revisar solicitudes <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </section>
  );
}
