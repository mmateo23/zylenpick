import Link from "next/link";

import { getAdminJoinRequests } from "@/features/admin/services/join-requests-admin-service";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClassName(status: "pending" | "approved" | "rejected") {
  if (status === "approved") {
    return "bg-[color:var(--brand-soft)] text-[color:var(--accent)]";
  }

  if (status === "rejected") {
    return "bg-[#E5484D]/12 text-[#FFB4B4]";
  }

  return "bg-white/8 text-white/72";
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
          Revisa las solicitudes enviadas desde “Únete a ZylenPick” y decide si
          continúan a la creación manual del local.
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
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
                          request.status,
                        )}`}
                      >
                        {statusLabel(request.status)}
                      </span>
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
