import Link from "next/link";

import { AdminOpeningHoursTable } from "@/components/admin/admin-opening-hours-table";
import { AdminPreviewLink } from "@/components/admin/admin-preview-link";
import type {
  AdminCityOption,
  AdminJoinRequestPrefill,
  AdminVenueFormValues,
} from "@/features/admin/services/venues-admin-service";

type AdminVenueFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  action: (formData: FormData) => void;
  cities: AdminCityOption[];
  initialValues?: AdminVenueFormValues | null;
  requestContext?: AdminJoinRequestPrefill | null;
  previewHref?: string | null;
};

function buildInitialValues(
  initialValues?: AdminVenueFormValues | null,
): AdminVenueFormValues {
  return (
    initialValues ?? {
      id: "",
      name: "",
      slug: "",
      cityId: "",
      discoveryCategory: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
      email: "",
      phone: "",
      pickupNotes: "",
      pickupEtaMin: "",
      coverUrl: "",
      isActive: true,
      isPublished: true,
      isVerified: false,
      pricesVisible: false,
      subscriptionActive: false,
      subscriptionTier: "basic",
      sortOrder: "",
      openingHours: {
        mon: { isOpen: false, firstOpen: "", firstClose: "", secondOpen: "", secondClose: "" },
        tue: { isOpen: false, firstOpen: "", firstClose: "", secondOpen: "", secondClose: "" },
        wed: { isOpen: false, firstOpen: "", firstClose: "", secondOpen: "", secondClose: "" },
        thu: { isOpen: false, firstOpen: "", firstClose: "", secondOpen: "", secondClose: "" },
        fri: { isOpen: false, firstOpen: "", firstClose: "", secondOpen: "", secondClose: "" },
        sat: { isOpen: false, firstOpen: "", firstClose: "", secondOpen: "", secondClose: "" },
        sun: { isOpen: false, firstOpen: "", firstClose: "", secondOpen: "", secondClose: "" },
      },
    }
  );
}

function fieldClassName() {
  return "dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]";
}

function readOnlyFieldClassName() {
  return "mt-3 w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-[color:var(--foreground)]";
}

function ToggleField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-4 transition has-[:checked]:border-emerald-400/30 has-[:checked]:bg-emerald-400/[0.06]">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-white/12 transition peer-checked:bg-emerald-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-300 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
      <span>
        <span className="block text-sm font-medium text-[color:var(--foreground)]">
          {label}
        </span>
        <span className="mt-1 block text-sm leading-6 text-[color:var(--muted-strong)]">
          {description}
        </span>
      </span>
    </label>
  );
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

const subscriptionTierOptions = [
  { value: "basic", label: "Basic" },
  { value: "oro", label: "Oro" },
  { value: "titanio", label: "Titanio" },
];

export function AdminVenueForm({
  title,
  description,
  submitLabel,
  action,
  cities,
  initialValues,
  requestContext,
  previewHref,
}: AdminVenueFormProps) {
  const values = buildInitialValues(initialValues);

  return (
    <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Locales
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
          {description}
        </p>
      </div>

      {previewHref ? (
        <AdminPreviewLink
          href={previewHref}
          description="Este formulario modifica la ficha pública del local: presentación, contacto, recogida, horarios y visibilidad."
          label="Ver ficha pública"
        />
      ) : null}

      <form action={action} className="mt-8 space-y-8">
        {requestContext ? (
          <section className="space-y-4">
            <input type="hidden" name="linkedRequestId" value={requestContext.id} />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
                Datos de la solicitud
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
                Esta alta parte de una solicitud previa. Los datos del local se
                rellenan donde encajan y el resto queda visible como contexto para
                completar manualmente el alta.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[color:var(--foreground)]">
                  Persona de contacto
                </span>
                <div className={readOnlyFieldClassName()}>
                  {requestContext.contactName ?? "No indicado"}
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[color:var(--foreground)]">
                  Teléfono de contacto
                </span>
                <div className={readOnlyFieldClassName()}>
                  {requestContext.contactPhone ?? "No indicado"}
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[color:var(--foreground)]">
                  Email de contacto
                </span>
                <div className={readOnlyFieldClassName()}>
                  {requestContext.contactEmail ?? "No indicado"}
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[color:var(--foreground)]">
                  Tipo de servicio
                </span>
                <div className={readOnlyFieldClassName()}>
                  {formatServiceType(requestContext.serviceType)}
                </div>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-[color:var(--foreground)]">
                  Mensaje adicional
                </span>
                <div className={`${readOnlyFieldClassName()} min-h-[96px] whitespace-pre-wrap`}>
                  {requestContext.message ?? "Sin mensaje adicional"}
                </div>
              </label>
            </div>
          </section>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Nombre
            </span>
            <input
              name="name"
              defaultValue={values.name}
              className={fieldClassName()}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Slug
            </span>
            <input
              name="slug"
              defaultValue={values.slug}
              className={fieldClassName()}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Ciudad
            </span>
            <select
              name="cityId"
              defaultValue={values.cityId}
              className={fieldClassName()}
              required
            >
              <option value="">Selecciona una ciudad</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Orden visual
            </span>
            <input
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={values.sortOrder}
              className={fieldClassName()}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Categoría visual
            </span>
            <input
              name="discoveryCategory"
              defaultValue={values.discoveryCategory}
              className={fieldClassName()}
              placeholder="Burgers, Pizza, Sushi..."
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Descripción
            </span>
            <textarea
              name="description"
              rows={4}
              defaultValue={values.description}
              className={`${fieldClassName()} resize-y`}
            />
          </label>

          <section className="md:col-span-2 rounded-[1.35rem] border border-emerald-400/18 bg-emerald-400/[0.035] p-4 sm:p-5">
            <div className="flex flex-col gap-2 border-b border-white/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Ubicación y recogida
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  Lo que necesita el cliente para llegar sin dudas
                </h2>
              </div>
              <p className="max-w-md text-xs leading-5 text-[color:var(--muted-strong)]">
                Dirección y coordenadas alimentan las distancias. El tiempo y las notas aparecen antes de confirmar la recogida.
              </p>
            </div>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-[color:var(--foreground)]">
                  Dirección pública
                </span>
                <input
                  name="address"
                  defaultValue={values.address}
                  className={fieldClassName()}
                  required
                />
              </label>

              <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Latitud
            </span>
            <input
              name="latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              inputMode="decimal"
              defaultValue={values.latitude}
              className={fieldClassName()}
              placeholder="Opcional"
            />
              </label>

              <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Longitud
            </span>
            <input
              name="longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              inputMode="decimal"
              defaultValue={values.longitude}
              className={fieldClassName()}
              placeholder="Opcional"
            />
              </label>

              <p className="-mt-2 text-xs leading-5 text-[color:var(--muted-strong)] md:col-span-2">
                Las coordenadas son internas: permiten ordenar por cercanía y calcular la distancia sin mostrar la ubicación del usuario en el panel.
              </p>

              <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Email
            </span>
            <input
              name="email"
              type="email"
              defaultValue={values.email}
              className={fieldClassName()}
              placeholder="Opcional"
            />
              </label>

              <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Teléfono
            </span>
            <input
              name="phone"
              type="tel"
              defaultValue={values.phone}
              className={fieldClassName()}
              required
            />
              </label>

              <label className="block md:col-span-2">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Notas de recogida
            </span>
            <textarea
              name="pickupNotes"
              rows={3}
              defaultValue={values.pickupNotes}
              className={`${fieldClassName()} resize-y`}
              placeholder="Recoge tu pedido en barra, pide por tu nombre..."
            />
              </label>

              <label className="block md:col-span-2 md:max-w-sm">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Tiempo estimado de recogida
            </span>
            <input
              name="pickupEtaMin"
              type="number"
              min="0"
              defaultValue={values.pickupEtaMin}
              className={fieldClassName()}
            />
              </label>
            </div>
          </section>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Imagen de portada
            </span>
            <input
              name="coverUrl"
              type="url"
              defaultValue={values.coverUrl}
              className={fieldClassName()}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Nivel de suscripción
            </span>
            <select
              name="subscriptionTier"
              defaultValue={values.subscriptionTier}
              className={fieldClassName()}
            >
              {subscriptionTierOptions.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
              Estado editorial
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
              El distintivo de Pickyalo solo aparece cuando el local ha sido
              revisado documentalmente y además mantiene una suscripción activa.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              name="isVerified"
              label="Local verificado por Pickyalo"
              description="Pickyalo ha revisado la documentación aportada. No certifica la calidad ni sustituye a ninguna administración pública."
              defaultChecked={values.isVerified}
            />
            <ToggleField
              name="subscriptionActive"
              label="Suscripción activa"
              description="El local forma parte de la red activa de Pickyalo y puede mostrar el distintivo si también está verificado."
              defaultChecked={values.subscriptionActive}
            />
            <ToggleField
              name="pricesVisible"
              label="Mostrar precios y permitir pedidos"
              description="Actívalo solo cuando el local haya confirmado sus precios. Mientras esté apagado, la web mostrará Precio pendiente y no permitirá añadir productos nuevos a la cesta."
              defaultChecked={values.pricesVisible}
            />
            <ToggleField
              name="isPublished"
              label="Visible en la web pública"
              description="Permite mantener el local en panel sin mostrarlo todavía en la web pública."
              defaultChecked={values.isPublished}
            />
            <ToggleField
              name="isActive"
              label="Local activo en operaciones"
              description="Control interno para mantener o retirar el local del catálogo administrado."
              defaultChecked={values.isActive}
            />
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
              Horarios
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
              Activa los días de apertura y completa uno o dos tramos. Los días
              cerrados se mostrarán como no disponibles en la ficha pública.
            </p>
          </div>

          <AdminOpeningHoursTable initialValue={values.openingHours} />
        </section>

        <div className="sticky bottom-3 z-30 flex flex-wrap gap-3 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8]/95 p-2 shadow-[0_16px_40px_rgba(56,25,50,0.12)] backdrop-blur-md">
          <button
            type="submit"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#741314] px-6 py-3 text-sm font-semibold text-[#FFF7E8] sm:flex-none"
          >
            {submitLabel}
          </button>
          <Link
            href="/panel/locales"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[#741314]/18 bg-white px-6 py-3 text-sm font-semibold text-[#741314] sm:flex-none"
          >
            Volver al listado
          </Link>
        </div>
      </form>
    </section>
  );
}
