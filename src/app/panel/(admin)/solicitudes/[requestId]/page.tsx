import Link from "next/link";

import { DeleteJoinRequestButton } from "@/components/admin/delete-join-request-button";
import {
  deleteJoinRequestAction,
  requireAdminJoinRequest,
  updateJoinRequestStatusAction,
} from "@/features/admin/services/join-requests-admin-service";

type AdminJoinRequestDetailPageProps = {
  params: {
    requestId: string;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatServiceType(value: string | null) {
  if (value === "pickup") {
    return "Recogida";
  }
  if (value === "delivery") {
    return "Domicilio";
  }
  if (value === "both") {
    return "Ambos";
  }

  return value ?? "No indicado";
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

function statusClassName(status: "pending" | "approved" | "rejected") {
  if (status === "approved") {
    return "bg-[color:var(--brand-soft)] text-[color:var(--accent)]";
  }
  if (status === "rejected") {
    return "bg-[#E5484D]/12 text-[#FFB4B4]";
  }

  return "bg-white/8 text-white/72";
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-2 rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="text-sm leading-7 text-[color:var(--foreground)]">{value}</p>
    </div>
  );
}

export default async function AdminJoinRequestDetailPage({
  params,
}: AdminJoinRequestDetailPageProps) {
  const joinRequest = await requireAdminJoinRequest(params.requestId);
  const approveAction = updateJoinRequestStatusAction.bind(
    null,
    params.requestId,
    "approved",
  );
  const rejectAction = updateJoinRequestStatusAction.bind(
    null,
    params.requestId,
    "rejected",
  );
  const deleteAction = deleteJoinRequestAction.bind(null, params.requestId);
  const isLinked = Boolean(joinRequest.linkedVenueId);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Solicitud
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            {joinRequest.venueName}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
            Revisa la información enviada y decide si continúas con la creación
            manual del local desde el panel de locales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${statusClassName(
              joinRequest.status,
            )}`}
          >
            {statusLabel(joinRequest.status)}
          </span>
          {isLinked ? (
            <span className="inline-flex rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-xs font-semibold text-[color:var(--accent)]">
              Convertida en local
            </span>
          ) : null}
          <Link
            href="/panel/solicitudes"
            className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Volver al listado
          </Link>
        </div>
      </div>

      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <div className="grid gap-4 md:grid-cols-2">
          <DetailRow label="Nombre del local" value={joinRequest.venueName} />
          <DetailRow
            label="Tipo de negocio"
            value={joinRequest.businessType ?? "No indicado"}
          />
          <DetailRow label="Ciudad o zona" value={joinRequest.area ?? "No indicado"} />
          <DetailRow label="Dirección" value={joinRequest.address ?? "No indicada"} />
          <DetailRow
            label="Teléfono del local"
            value={joinRequest.venuePhone ?? "No facilitado"}
          />
          <DetailRow
            label="Email del local"
            value={joinRequest.venueEmail ?? "No facilitado"}
          />
          <DetailRow
            label="Web o Instagram"
            value={joinRequest.website ?? "No facilitado"}
          />
          <DetailRow
            label="Persona de contacto"
            value={joinRequest.contactName ?? "No indicado"}
          />
          <DetailRow
            label="Teléfono de contacto"
            value={joinRequest.contactPhone ?? "No indicado"}
          />
          <DetailRow
            label="Email de contacto"
            value={joinRequest.contactEmail ?? "No indicado"}
          />
          <DetailRow
            label="Tipo de servicio"
            value={formatServiceType(joinRequest.serviceType)}
          />
          <DetailRow
            label="Fecha de creación"
            value={formatDate(joinRequest.createdAt)}
          />
          <div className="md:col-span-2">
            <DetailRow
              label="Mensaje adicional"
              value={joinRequest.message ?? "Sin mensaje adicional"}
            />
          </div>
          <DetailRow
            label="Privacidad aceptada"
            value={joinRequest.privacyAccepted ? "Sí" : "No"}
          />
          <DetailRow
            label="Local vinculado"
            value={joinRequest.linkedVenueId ?? "Aún no vinculado"}
          />
        </div>
      </section>

      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Acciones
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-[color:var(--foreground)]">
          Revisar solicitud
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
          Aprobar o rechazar esta solicitud no crea el local automáticamente. Si
          decides continuar, el siguiente paso es crear el local manualmente en el
          panel de locales con esta solicitud como contexto.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={approveAction}>
            <button
              type="submit"
              className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
            >
              Aprobar solicitud
            </button>
          </form>
          <form action={rejectAction}>
            <button
              type="submit"
              className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)]"
            >
              Rechazar solicitud
            </button>
          </form>
          <Link
            href={`/panel/locales/nuevo?requestId=${joinRequest.id}`}
            className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Crear local desde esta solicitud
          </Link>
          {joinRequest.linkedVenueId ? (
            <Link
              href={`/panel/locales/${joinRequest.linkedVenueId}`}
              className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)]"
            >
              Ver local vinculado
            </Link>
          ) : null}
          <DeleteJoinRequestButton action={deleteAction} disabled={isLinked} />
        </div>

        {isLinked ? (
          <p className="mt-4 rounded-[1rem] border border-[#E5484D]/25 bg-[#E5484D]/8 px-4 py-3 text-sm leading-6 text-[#FFB4B4]">
            Esta solicitud ya está vinculada a un local real. Para evitar perder la
            trazabilidad del alta, no se puede eliminar desde el panel.
          </p>
        ) : (
          <p className="mt-4 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[color:var(--muted-strong)]">
            Esta acción no se puede deshacer.
          </p>
        )}
      </section>
    </section>
  );
}
