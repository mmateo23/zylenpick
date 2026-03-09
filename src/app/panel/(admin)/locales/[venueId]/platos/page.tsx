import Link from "next/link";

import {
  getAdminMenuItemsByVenueId,
  requireAdminVenueContext,
  toggleMenuItemAvailabilityAction,
} from "@/features/admin/services/menu-items-admin-service";
import { formatPrice } from "@/lib/utils/currency";

type AdminVenueMenuItemsPageProps = {
  params: {
    venueId: string;
  };
};

export default async function AdminVenueMenuItemsPage({
  params,
}: AdminVenueMenuItemsPageProps) {
  const [venue, menuItems] = await Promise.all([
    requireAdminVenueContext(params.venueId),
    getAdminMenuItemsByVenueId(params.venueId),
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Panel admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            Platos de {venue.name}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
            Gestiona el menú del local desde una única vista centralizada.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/panel/locales/${venue.id}`}
            className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Volver al local
          </Link>
          <Link
            href={`/panel/locales/${venue.id}/platos/nuevo`}
            className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
          >
            Crear plato
          </Link>
        </div>
      </div>

      <section className="glass-panel overflow-hidden rounded-[1.8rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]">
        {menuItems.length === 0 ? (
          <div className="px-6 py-10 text-sm text-[color:var(--muted-strong)]">
            Este local todavía no tiene platos creados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  <th className="px-5 py-4 font-medium">Plato</th>
                  <th className="px-5 py-4 font-medium">Categoría</th>
                  <th className="px-5 py-4 font-medium">Precio</th>
                  <th className="px-5 py-4 font-medium">Orden</th>
                  <th className="px-5 py-4 font-medium">Estado</th>
                  <th className="px-5 py-4 font-medium">Destacado</th>
                  <th className="px-5 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {menuItems.map((item) => {
                  const toggleAction = toggleMenuItemAvailabilityAction.bind(
                    null,
                    venue.id,
                    item.id,
                    !item.isAvailable,
                  );

                  return (
                    <tr
                      key={item.id}
                      className="text-sm text-[color:var(--foreground)]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-[1rem] border border-white/10 bg-white/5">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-xs text-[color:var(--muted-strong)]">
                              {item.imageUrl ? "Con imagen" : "Sin imagen"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                        {item.categoryName ?? "Sin categoría"}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {formatPrice(item.priceAmount, item.currency)}
                      </td>
                      <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                        {item.sortOrder}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            item.isAvailable
                              ? "bg-[color:var(--brand-soft)] text-[color:var(--accent)]"
                              : "bg-white/8 text-white/58"
                          }`}
                        >
                          {item.isAvailable ? "Disponible" : "Oculto"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            item.isFeatured
                              ? "bg-[color:var(--brand-soft)] text-[color:var(--accent)]"
                              : "bg-white/8 text-white/58"
                          }`}
                        >
                          {item.isFeatured ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/panel/locales/${venue.id}/platos/${item.id}`}
                            className="text-sm font-semibold text-[color:var(--brand)]"
                          >
                            Editar
                          </Link>
                          <form action={toggleAction}>
                            <button
                              type="submit"
                              className="text-sm font-semibold text-white/72"
                            >
                              {item.isAvailable ? "Desactivar" : "Activar"}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
