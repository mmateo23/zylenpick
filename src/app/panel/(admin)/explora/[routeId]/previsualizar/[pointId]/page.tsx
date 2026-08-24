import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

import { ExplorePointExperience } from "@/components/explore/explore-point-experience";
import { getAdminExplorePreviewExperience } from "@/features/admin/services/explore-admin-service";

export default async function ExplorePointPreviewPage({
  params,
}: {
  params: { routeId: string; pointId: string };
}) {
  const result = await getAdminExplorePreviewExperience(params.routeId, params.pointId);

  if (!result.experience) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-[#741314]/14 bg-[#FFF7E8] p-6 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
          Previsualización pendiente
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[#381932]">
          Completa el contenido esencial.
        </h1>
        <p className="mt-3 text-base leading-7 text-[#381932]/68">
          La experiencia utiliza el contenido real guardado. Faltan estos campos para poder
          representarla con fidelidad:
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-[#381932]">
          {result.missingFields.map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href={`/panel/explora/${params.routeId}/puntos/${params.pointId}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" /> Editar parada
          </Link>
          <Link
            href={`/panel/explora/${params.routeId}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#741314]/16 px-5 text-sm font-bold text-[#741314]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Volver a la ruta
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#741314]/14 bg-[#FFF7E8]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#741314]/14 bg-[#FDE3AD] px-4 py-3 sm:px-6">
        <p className="text-sm font-bold text-[#381932]">Vista previa privada · no genera analítica</p>
        <Link
          href={`/panel/explora/${params.routeId}/puntos/${params.pointId}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8]"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" /> Editar
        </Link>
      </div>
      <ExplorePointExperience experience={result.experience} preview />
    </div>
  );
}
