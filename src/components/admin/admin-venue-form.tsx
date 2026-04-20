import Link from "next/link";

import {
  openingHourDayLabels,
  openingHourDayOrder,
} from "@/features/venues/opening-hours";
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
    <label className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-4">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 accent-[color:var(--brand)]"
      />
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

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Dirección
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

          <label className="block">
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
              El distintivo de ZylenPick solo aparece cuando el local ha sido
              revisado editorialmente y además mantiene una suscripción activa.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              name="isVerified"
              label="Local verificado por ZylenPick"
              description="El local ha sido revisado por ZylenPick y cumple estándares mínimos de calidad para recogida."
              defaultChecked={values.isVerified}
            />
            <ToggleField
              name="subscriptionActive"
              label="Suscripción activa"
              description="El local forma parte de la red activa de ZylenPick y puede mostrar el distintivo si también está verificado."
              defaultChecked={values.subscriptionActive}
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
              Edita un tramo principal y un segundo tramo opcional por día. Si el
              día está cerrado, se mostrará en rojo en la ficha pública.
            </p>
          </div>

          <div className="space-y-4">
            {openingHourDayOrder.map((dayKey) => {
              const dayValue = values.openingHours[dayKey];

              return (
                <div
                  key={dayKey}
                  className="grid gap-4 rounded-[1.4rem] border border-white/10 bg-[color:var(--surface-strong)] p-4 lg:grid-cols-[4.5rem_minmax(0,1fr)]"
                >
                  <div className="flex items-start">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-[color:var(--foreground)]">
                      {openingHourDayLabels[dayKey]}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    <label className="flex items-center gap-3">
                      <input
                        name={`openingHours.${dayKey}.isOpen`}
                        type="checkbox"
                        defaultChecked={dayValue.isOpen}
                        className="h-4 w-4 accent-[color:var(--brand)]"
                      />
                      <span className="text-sm text-[color:var(--foreground)]">
                        Abierto ese día
                      </span>
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                          Tramo principal
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            name={`openingHours.${dayKey}.firstOpen`}
                            type="time"
                            defaultValue={dayValue.firstOpen}
                            className={fieldClassName()}
                          />
                          <input
                            name={`openingHours.${dayKey}.firstClose`}
                            type="time"
                            defaultValue={dayValue.firstClose}
                            className={fieldClassName()}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                          Segundo tramo opcional
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            name={`openingHours.${dayKey}.secondOpen`}
                            type="time"
                            defaultValue={dayValue.secondOpen}
                            className={fieldClassName()}
                          />
                          <input
                            name={`openingHours.${dayKey}.secondClose`}
                            type="time"
                            defaultValue={dayValue.secondClose}
                            className={fieldClassName()}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
          >
            {submitLabel}
          </button>
          <Link
            href="/panel/locales"
            className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Volver al listado
          </Link>
        </div>
      </form>
    </section>
  );
}
