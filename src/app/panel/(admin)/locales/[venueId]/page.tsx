import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminOpeningHoursTable } from "@/components/admin/admin-opening-hours-table";
import { AdminVenueForm } from "@/components/admin/admin-venue-form";
import { AdminVenueManageLink } from "@/components/admin/admin-venue-manage-link";
import { SafeDeleteButton } from "@/components/admin/safe-delete-button";
import {
  deleteVenueAction,
  getAdminCities,
  getAdminVenuePublicHref,
  getAdminVenueById,
  updateVenueAction,
  updateVenueOpeningHoursAction,
} from "@/features/admin/services/venues-admin-service";

type AdminVenueEditPageProps = {
  searchParams?: { vista?: string; guardado?: string };
  params: {
    venueId: string;
  };
};

export default async function AdminVenueEditPage({
  params,
  searchParams,
}: AdminVenueEditPageProps) {
  const [cities, venue, previewHref] = await Promise.all([
    searchParams?.vista === "horarios" ? Promise.resolve([]) : getAdminCities(),
    getAdminVenueById(params.venueId),
    searchParams?.vista === "horarios" ? Promise.resolve(null) : getAdminVenuePublicHref(params.venueId),
  ]);

  if (!venue) {
    notFound();
  }

  if (searchParams?.vista === "horarios") {
    return <section className="space-y-5 rounded-2xl border border-[#741314]/15 bg-[#FFF7E8] p-5 sm:p-7">
      <Link href="/panel/locales?vista=horarios" className="inline-flex min-h-11 items-center font-semibold text-[#741314]">← Todos los horarios</Link>
      <h1 className="text-3xl font-bold text-[#741314]">{venue.name}</h1>
      <p className="text-sm text-[#694b3d]">Horario semanal. Uno o dos tramos por día.</p>
      {searchParams.guardado === "1" ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-emerald-900">Horario guardado.</p> : null}
      <form action={updateVenueOpeningHoursAction.bind(null, venue.id)} className="space-y-5">
        <AdminOpeningHoursTable initialValue={venue.openingHours} />
        <button className="min-h-12 rounded-full bg-[#741314] px-6 font-bold text-[#FFF7E8]">Guardar horario</button>
      </form>
    </section>;
  }

  const updateAction = updateVenueAction.bind(null, params.venueId);
  const deleteAction = deleteVenueAction.bind(null, params.venueId);

  return (
    <div className="space-y-6">
      <AdminVenueManageLink venueId={params.venueId} />
      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
              Menú del local
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
              Productos y destacados
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
              Accede al listado de platos de este local para crear, editar o destacar
              productos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/panel/locales/${params.venueId}?vista=horarios`} className="inline-flex min-h-11 items-center rounded-full border border-[#741314]/20 px-5 text-sm font-semibold text-[#741314]">Horarios</Link>

            <Link
              href={`/panel/locales/${params.venueId}/platos`}
              className="magnetic-button inline-flex min-h-11 items-center rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
            >
              Gestionar platos
            </Link>
          </div>
        </div>
      </section>

      <AdminVenueForm
        title="Editar local"
        description="Actualiza la información del local sin depender de un panel externo."
        submitLabel="Guardar cambios"
        action={updateAction}
        cities={cities}
        initialValues={venue}
        previewHref={previewHref}
      />
      <SafeDeleteButton
        action={deleteAction}
        entityLabel="este local"
        redirectTo="/panel/locales"
      />
    </div>
  );
}
