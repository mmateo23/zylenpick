import { ArrowDown, ArrowUp, Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminExploreRouteForm } from "@/components/admin/admin-explore-route-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { ExploreQrCard } from "@/components/admin/explore-qr-card";
import {
  getAdminExploreCities,
  getAdminExplorePoints,
  getAdminExploreRouteById,
  getAdminExploreSponsors,
  moveExplorePointAction,
  saveExploreRouteAction,
} from "@/features/admin/services/explore-admin-service";

export default async function EditExploreRoutePage({ params }: { params: { routeId: string } }) {
  const [route, points, cities, sponsors] = await Promise.all([
    getAdminExploreRouteById(params.routeId),
    getAdminExplorePoints(params.routeId),
    getAdminExploreCities(),
    getAdminExploreSponsors(),
  ]);
  if (!route) notFound();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        eyebrow="Pickyalo Explora"
        title={route.name}
        description="Edita la ruta y gestiona el orden, publicación y QR de cada parada."
        action={<Link href={`/panel/explora/${route.id}/puntos/nuevo`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]"><Plus aria-hidden="true" className="h-4 w-4" />Añadir parada</Link>}
      />

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#741314]/58">Recorrido</p><h2 className="mt-2 text-xl font-semibold text-[#381932]">Paradas</h2></div>
          <p className="text-sm font-semibold text-[#381932]/58">{route.publishedPointCount}/{route.pointCount} publicadas</p>
        </div>
        <div className="mt-5 space-y-3">
          {points.length ? points.map((point, index) => {
            const publicPath = `/explora/${route.slug}/${point.slug}?unlock=${point.publicToken}`;
            return (
              <article key={point.id} className="rounded-2xl border border-[#741314]/12 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#741314]">{String(point.position).padStart(2, "0")}</span><AdminStatusBadge tone={point.isPublished && point.isActive ? "success" : "neutral"}>{point.isPublished && point.isActive ? "Publicada" : "Borrador"}</AdminStatusBadge></div>
                    <h3 className="mt-2 text-lg font-semibold text-[#381932]">{point.title}</h3>
                    <p className="mt-1 text-sm text-[#381932]/58">{point.placeName}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={moveExplorePointAction.bind(null, route.id, point.id, "up")}><button disabled={index === 0} title="Subir parada" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#741314]/14 text-[#741314] disabled:opacity-30"><ArrowUp aria-hidden="true" className="h-4 w-4" /></button></form>
                    <form action={moveExplorePointAction.bind(null, route.id, point.id, "down")}><button disabled={index === points.length - 1} title="Bajar parada" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#741314]/14 text-[#741314] disabled:opacity-30"><ArrowDown aria-hidden="true" className="h-4 w-4" /></button></form>
                    <Link href={`/panel/explora/${route.id}/puntos/${point.id}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8]"><Pencil aria-hidden="true" className="h-4 w-4" />Editar</Link>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <ExploreQrCard path={publicPath} fileName={`${route.slug}-${point.slug}`} />
                  <Link href={`/panel/explora/${route.id}/previsualizar/${point.id}`} target="_blank" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#741314]/16 px-4 text-sm font-bold text-[#741314]"><Eye aria-hidden="true" className="h-4 w-4" />Previsualizar</Link>
                </div>
              </article>
            );
          }) : <p className="rounded-xl border border-dashed border-[#741314]/20 p-6 text-center text-sm text-[#381932]/62">Añade el primer lugar para construir el recorrido.</p>}
        </div>
      </section>

      <AdminExploreRouteForm route={route} cities={cities} sponsors={sponsors} action={saveExploreRouteAction.bind(null, route.id)} />
    </section>
  );
}
