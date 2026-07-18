import Link from "next/link";

import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminJoinRequests } from "@/features/admin/services/join-requests-admin-service";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: "pending" | "approved" | "rejected") {
  if (status === "approved") {
    return "Aprobada";
  }

  if (status === "rejected") {
    return "Rechazada";
  }

  return "Pendiente";
}

export default async function AdminJoinRequestsPage() {
  const requests = await getAdminJoinRequests();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Panel admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
          Solicitudes
        </h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
          Revisa las solicitudes enviadas desde “Únete a Pickyalo” y distingue
          rápidamente las pendientes, revisadas y ya convertidas en local real.
        </p>
      </div>

      <section className="glass-panel overflow-hidden rounded-[1.8rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]">
        {requests.length === 0 ? (
          <div className="px-6 py-10 text-sm text-[color:var(--muted-strong)]">
            Todavía no hay solicitudes registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  <th className="px-5 py-4 font-medium">Local</th>
                  <th className="px-5 py-4 font-medium">Zona</th>
                  <th className="px-5 py-4 font-medium">Contacto</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Teléfono</th>
                  <th className="px-5 py-4 font-medium">Estado</th>
                  <th className="px-5 py-4 font-medium">Conversión</th>
                  <th className="px-5 py-4 font-medium">Creada</th>
                  <th className="px-5 py-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {requests.map((request) => (
                  <tr key={request.id} className="text-sm text-[color:var(--foreground)]">
                    <td className="px-5 py-4 font-semibold">{request.venueName}</td>
                    <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                      {request.area ?? "Sin zona"}
                    </td>
                    <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                      {request.contactName ?? "Sin contacto"}
                    </td>
                    <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                      {request.contactEmail ?? "Sin email"}
                    </td>
                    <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                      {request.contactPhone ?? "Sin teléfono"}
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge
                        tone={
                          request.status === "approved"
                            ? "success"
                            : request.status === "rejected"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {statusLabel(request.status)}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-5 py-4">
                      {request.linkedVenueId ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <AdminStatusBadge tone="success">
                            Convertida en local
                          </AdminStatusBadge>
                          <Link
                            href={`/panel/locales/${request.linkedVenueId}`}
                            className="text-xs font-semibold text-[color:var(--brand)]"
                          >
                            Ver local
                          </Link>
                        </div>
                      ) : (
                        <AdminStatusBadge tone="neutral">
                          Sin convertir
                        </AdminStatusBadge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/panel/solicitudes/${request.id}`}
                        className="text-sm font-semibold text-[color:var(--brand)]"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
