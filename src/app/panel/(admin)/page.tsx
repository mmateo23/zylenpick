import {
  ArrowRight,
  Building2,
  Layers3,
  MapPinned,
  Camera,
  Settings2,
  Utensils,
} from "lucide-react";
import Link from "next/link";

import { AdminHubCard } from "@/components/admin/admin-hub-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminDashboardSummary } from "@/features/admin/services/dashboard-service";

function displayCount(value: number | null) {
  return value ?? "—";
}

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();
  const stats = [
    {
      label: "Locales",
      value: summary.venuesCount,
      description: `${displayCount(summary.publishedVenuesCount)} publicados`,
      href: "/panel/locales",
      icon: Building2,
    },
    {
      label: "Productos",
      value: summary.menuItemsCount,
      description: `${displayCount(summary.unavailableMenuItemsCount)} pausados`,
      href: "/panel/locales",
      icon: Utensils,
    },
    {
      label: "Capturas pendientes",
      value: summary.pendingScoutCount,
      description: "Scout por completar",
      href: "/panel/lugares?estado=pending",
      icon: Camera,
    },
  ];

  const workAreas = [
    {
      href: "/panel/locales",
      icon: Building2,
      title: "Locales y productos",
      description: "Edita fichas, horarios, recogida y selección de productos.",
    },
    {
      href: "/panel/lugares",
      icon: MapPinned,
      title: "Explorar la ciudad",
      description: "Añade y revisa monumentos, parques y puntos del mapa.",
    },
    {
      href: "/panel/contenido",
      icon: Layers3,
      title: "Contenido visible",
      description: "Decide qué destacar y qué imágenes o etiquetas aparecen.",
    },
    {
      href: "/panel/ajustes",
      icon: Settings2,
      title: "Ajustes globales",
      description: "Cambia textos, diseño y configuración comercial.",
    },
  ];

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="Inicio"
        title="Qué necesita atención."
        description="Consulta el estado de Pickyalo y entra directamente en la tarea que quieres resolver."
        action={
          <Link
            href="/panel/scout"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#741314] px-5 py-2.5 text-sm font-bold text-[#FFF7E8] transition hover:bg-[#5F0F10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
          >
            Abrir Scout
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-[1.2rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 shadow-[0_14px_40px_rgba(116,19,20,0.05)] transition hover:border-[#741314]/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314] focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[0.8rem] bg-[#741314]/[0.07] text-[#741314]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#741314]/35 transition group-hover:translate-x-0.5 group-hover:text-[#741314] motion-reduce:transform-none" />
              </div>
              <p className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#741314]">
                {displayCount(stat.value)}
              </p>
              <p className="mt-2 text-sm font-bold text-[#24110E]">{stat.label}</p>
              <p className="mt-1 text-xs text-[#24110E]/50">{stat.description}</p>
            </Link>
          );
        })}
      </div>

      <section className="rounded-[1.2rem] border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-6" aria-labelledby="status-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#741314]/50">Estado</p>
            <h2 id="status-title" className="mt-1 text-xl font-semibold text-[#24110E]">Pendientes principales</h2>
          </div>
          <AdminStatusBadge tone={((summary.pendingJoinRequestsCount ?? 0) + (summary.pendingScoutCount ?? 0)) > 0 ? "warning" : "success"}>
            {((summary.pendingJoinRequestsCount ?? 0) + (summary.pendingScoutCount ?? 0)) > 0 ? "Revisión necesaria" : "Al día"}
          </AdminStatusBadge>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <Link href="/panel/lugares?estado=pending" className="flex min-h-12 items-center justify-between rounded-[0.9rem] border border-[#741314]/10 px-4 py-3 text-sm font-semibold text-[#741314] transition hover:bg-[#741314]/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]">
            <span>{displayCount(summary.pendingScoutCount)} capturas por completar</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link href="/panel/solicitudes" className="flex min-h-12 items-center justify-between rounded-[0.9rem] border border-[#741314]/10 px-4 py-3 text-sm font-semibold text-[#741314] transition hover:bg-[#741314]/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]">
            <span>{displayCount(summary.pendingJoinRequestsCount)} solicitudes por revisar</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link href="/panel/locales" className="flex min-h-12 items-center justify-between rounded-[0.9rem] border border-[#741314]/10 px-4 py-3 text-sm font-semibold text-[#741314] transition hover:bg-[#741314]/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741314]">
            <span>{displayCount(summary.unavailableMenuItemsCount)} productos pausados</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="work-title" className="space-y-3">
        <div className="px-1">
          <h2 id="work-title" className="text-xl font-semibold text-[#24110E]">Gestionar Pickyalo</h2>
          <p className="mt-1 text-sm text-[#24110E]/55">Todo el panel, agrupado por el trabajo que quieres hacer.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workAreas.map((area) => (
            <AdminHubCard key={area.href} {...area} />
          ))}
        </div>
      </section>
    </section>
  );
}
