import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminVenueForm } from "@/components/admin/admin-venue-form";
import {
  getAdminCities,
  getAdminVenueById,
  updateVenueAction,
} from "@/features/admin/services/venues-admin-service";

type AdminVenueEditPageProps = {
  params: {
    venueId: string;
  };
};

export default async function AdminVenueEditPage({
  params,
}: AdminVenueEditPageProps) {
  const [cities, venue] = await Promise.all([
    getAdminCities(),
    getAdminVenueById(params.venueId),
  ]);

  if (!venue) {
    notFound();
  }

  const updateAction = updateVenueAction.bind(null, params.venueId);

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
              Menú del local
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
              Gestionar platos
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
              Accede al listado de platos de este local para crear, editar o destacar
              productos.
            </p>
          </div>

          <Link
            href={`/panel/locales/${params.venueId}/platos`}
            className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
          >
            Gestionar platos
          </Link>
        </div>
      </section>

      <AdminVenueForm
        title="Editar local"
        description="Actualiza la información del local sin depender de un panel externo."
        submitLabel="Guardar cambios"
        action={updateAction}
        cities={cities}
        initialValues={venue}
      />
    </div>
  );
}
