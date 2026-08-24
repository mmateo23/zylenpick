import { Compass, Handshake, Plus } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminExploreRoutes } from "@/features/admin/services/explore-admin-service";

export default async function AdminExplorePage() {
  const routes = await getAdminExploreRoutes();

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Experiencias culturales"
        title="Pickyalo Explora"
        description="Crea rutas, ordena paradas reales y publica experiencias accesibles mediante QR."
        action={
          <Link href="/panel/explora/nueva" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]">
            <Plus aria-hidden="true" className="h-4 w-4" /> Nueva ruta
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Link href="/panel/explora/patrocinadores" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#741314]/16 bg-[#FFF7E8] px-4 text-sm font-bold text-[#741314]">
          <Handshake aria-hidden="true" className="h-4 w-4" /> Patrocinadores
        </Link>
      </div>

      {routes.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {routes.map((route) => (
            <article key={route.id} className="grid overflow-hidden rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] sm:grid-cols-[9rem_minmax(0,1fr)]">
              <div className="min-h-36 bg-[#741314]/[0.06]">
                {route.coverImageUrl ? (
                  // Admin content may include legacy hosts outside next/image configuration.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={route.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : <span className="flex h-full items-center justify-center text-[#741314]/35"><Compass aria-hidden="true" className="h-8 w-8" /></span>}
              </div>
              <div className="flex min-w-0 flex-col p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge tone={route.status === "published" ? "success" : "neutral"}>{route.status === "published" ? "Publicada" : "Borrador"}</AdminStatusBadge>
                  <span className="text-xs font-semibold text-[#381932]/58">{route.cityName}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-[#381932]">{route.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#381932]/62">{route.description || "Descripción pendiente"}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#741314]/10 pt-4">
                  <p className="text-xs font-semibold text-[#381932]/58">{route.publishedPointCount}/{route.pointCount} paradas publicadas</p>
                  <Link href={`/panel/explora/${route.id}`} className="inline-flex min-h-11 items-center rounded-xl bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8]">Gestionar ruta</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#741314]/22 bg-[#FFF7E8] p-8 text-center">
          <Compass aria-hidden="true" className="mx-auto h-8 w-8 text-[#741314]" />
          <h2 className="mt-4 text-xl font-semibold text-[#381932]">Todavía no hay rutas.</h2>
          <p className="mt-2 text-sm text-[#381932]/62">Empieza con una ruta en borrador y añade lugares ya revisados.</p>
        </div>
      )}
    </section>
  );
}
