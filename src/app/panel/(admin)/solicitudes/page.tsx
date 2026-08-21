import Link from "next/link";

import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminJoinRequests } from "@/features/admin/services/join-requests-admin-service";
import { getJoinInterestLabel } from "@/features/join/join-interest";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function statusLabel(status: "pending" | "approved" | "rejected") {
  if (status === "approved") return "Aprobada";
  if (status === "rejected") return "Rechazada";
  return "Pendiente";
}

function statusTone(status: "pending" | "approved" | "rejected") {
  if (status === "approved") return "success" as const;
  if (status === "rejected") return "danger" as const;
  return "warning" as const;
}

type AdminJoinRequestsPageProps = {
  searchParams?: { q?: string; estado?: string; pagina?: string };
};

export default async function AdminJoinRequestsPage({ searchParams }: AdminJoinRequestsPageProps) {
  const query = searchParams?.q?.trim() ?? "";
  const status = searchParams?.estado ?? "";
  const requestedPage = Number(searchParams?.pagina ?? "1");
  const result = await getAdminJoinRequests({
    query,
    status,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });

  return (
    <section className="space-y-5">
      <AdminPageHeader
        eyebrow="Solicitudes"
        title="Locales interesados"
        description="Prioriza las solicitudes pendientes y abre cada caso para continuar su alta."
      />

      <AdminListToolbar
        initialQuery={query}
        placeholder="Buscar por nombre del local"
        filters={[
          {
            label: "Estado",
            param: "estado",
            value: status,
            options: [
              { label: "Todas", value: "" },
              { label: "Pendientes", value: "pending" },
              { label: "Aprobadas", value: "approved" },
              { label: "Rechazadas", value: "rejected" },
            ],
          },
        ]}
      />

      <p className="px-1 text-sm font-medium text-[#381932]/65">
        {result.total} {result.total === 1 ? "solicitud" : "solicitudes"}
      </p>

      {result.items.length === 0 ? (
        <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] px-6 py-10 text-center">
          <p className="font-semibold text-[#381932]">No hay solicitudes con estos filtros.</p>
        </section>
      ) : (
        <>
          <div className="grid gap-3 lg:hidden">
            {result.items.map((request) => (
              <article key={request.id} className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-[#381932]">{request.venueName}</h2>
                    <p className="mt-1 text-sm text-[#381932]/65">{request.area ?? "Zona pendiente"}</p>
                  </div>
                  <AdminStatusBadge tone={statusTone(request.status)}>{statusLabel(request.status)}</AdminStatusBadge>
                </div>
                <dl className="mt-4 grid gap-2 text-sm text-[#381932]/75">
                  <div><dt className="font-semibold text-[#381932]">Contacto</dt><dd>{request.contactName ?? "Sin contacto"}</dd></div>
                  <div><dt className="font-semibold text-[#381932]">Interés</dt><dd>{getJoinInterestLabel(request.interest)}</dd></div>
                  <div><dt className="font-semibold text-[#381932]">Recibida</dt><dd>{formatDate(request.createdAt)}</dd></div>
                </dl>
                <Link href={`/panel/solicitudes/${request.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#741314] px-4 text-sm font-bold text-[#FFF7E8]">
                  Ver solicitud
                </Link>
              </article>
            ))}
          </div>

          <section className="hidden overflow-hidden rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] lg:block">
            <table className="min-w-full divide-y divide-[#741314]/10">
              <thead className="bg-[#741314]/[0.035]">
                <tr className="text-left text-xs font-bold uppercase tracking-[0.12em] text-[#381932]/60">
                  <th className="px-5 py-4">Local</th>
                  <th className="px-5 py-4">Contacto</th>
                  <th className="px-5 py-4">Interés</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Creada</th>
                  <th className="px-5 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#741314]/10">
                {result.items.map((request) => (
                  <tr key={request.id} className="text-sm text-[#381932]">
                    <td className="px-5 py-4"><p className="font-semibold">{request.venueName}</p><p className="mt-1 text-xs text-[#381932]/55">{request.area ?? "Sin zona"}</p></td>
                    <td className="px-5 py-4"><p>{request.contactName ?? "Sin contacto"}</p><p className="mt-1 max-w-52 truncate text-xs text-[#381932]/55">{request.contactEmail ?? request.contactPhone ?? "Sin datos"}</p></td>
                    <td className="px-5 py-4">{getJoinInterestLabel(request.interest)}</td>
                    <td className="px-5 py-4"><AdminStatusBadge tone={statusTone(request.status)}>{statusLabel(request.status)}</AdminStatusBadge></td>
                    <td className="px-5 py-4 text-[#381932]/65">{formatDate(request.createdAt)}</td>
                    <td className="px-5 py-4 text-right"><Link href={`/panel/solicitudes/${request.id}`} className="inline-flex min-h-11 items-center rounded-xl border border-[#741314]/18 bg-white px-4 font-bold text-[#741314]">Ver detalle</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      <AdminPagination page={result.page} total={result.total} pageSize={result.pageSize} searchParams={searchParams} />
    </section>
  );
}
