import Link from "next/link";

import { AdminFormDisclosure } from "@/components/admin/admin-form-disclosure";
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
  return "mt-2.5 min-h-12 w-full rounded-xl border border-[#741314]/14 bg-white px-4 py-3 text-base text-[#381932] outline-none transition placeholder:text-[#381932]/38 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/12";
}

function readOnlyFieldClassName() {
  return "mt-2.5 min-h-12 w-full rounded-xl border border-[#741314]/10 bg-[#FFF7E8] px-4 py-3 text-sm text-[#381932]";
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
    <label className="group flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 py-4 transition has-[:checked]:border-emerald-600/30 has-[:checked]:bg-emerald-50">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-[#381932]/18 transition peer-checked:bg-emerald-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#741314] after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
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

      {values.captureStatus === "pending" ? (
        <aside className="mt-6 rounded-2xl border border-amber-300/70 bg-amber-50 px-5 py-4 text-[#381932]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            Captura Scout pendiente
          </p>
          <p className="mt-2 text-sm leading-6">
            Revisa la ubicación, la imagen y los datos mínimos antes de activar o publicar este local.
          </p>
          {values.observedHours ? (
            <p className="mt-3 text-sm"><strong>Horario observado:</strong> {values.observedHours}</p>
          ) : null}
          {values.scoutNote ? (
            <p className="mt-2 text-sm"><strong>Nota de calle:</strong> {values.scoutNote}</p>
          ) : null}
        </aside>
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

        <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#741314] text-sm font-bold text-[#FFF7E8]">
              1
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
                Información esencial
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#381932]">
                Identifica y presenta el local
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#381932]/62">
                Completa primero lo que necesita una persona para reconocerlo, encontrarlo y contactar.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Nombre del local
            </span>
            <input
              name="name"
              defaultValue={values.name}
              className={fieldClassName()}
              autoCapitalize="words"
              autoComplete="organization"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Dirección web
            </span>
            <input
              name="slug"
              defaultValue={values.slug}
              className={fieldClassName()}
              placeholder="nombre-del-local"
              spellCheck={false}
              required
            />
            <span className="mt-2 block text-xs leading-5 text-[#381932]/55">
              Usa minúsculas y guiones. Forma parte de la URL pública.
            </span>
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
              Categoría visual
            </span>
            <input
              name="discoveryCategory"
              defaultValue={values.discoveryCategory}
              className={fieldClassName()}
              placeholder="Bar, panadería, restaurante..."
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
              placeholder="Qué ofrece y por qué merece la pena descubrirlo."
            />
          </label>

          <label className="block md:col-span-2">
                <span className="text-sm font-medium text-[color:var(--foreground)]">
                  Dirección pública
                </span>
                <input
                  name="address"
                  defaultValue={values.address}
                  className={fieldClassName()}
                  autoComplete="street-address"
                  required
                />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Teléfono
            </span>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={values.phone}
              className={fieldClassName()}
              autoComplete="tel"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Imagen de portada
            </span>
            <input
              name="coverUrl"
              type="url"
              inputMode="url"
              defaultValue={values.coverUrl}
              className={fieldClassName()}
              placeholder="https://..."
            />
          </label>
          </div>
        </section>

        <AdminFormDisclosure
          eyebrow="Atención al cliente"
          title="Recogida y contacto"
          description="Añade instrucciones y tiempos solo cuando el local ya los haya confirmado."
          defaultOpen={Boolean(values.email || values.pickupNotes || values.pickupEtaMin)}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#381932]">Email</span>
              <input
                name="email"
                type="email"
                defaultValue={values.email}
                className={fieldClassName()}
                placeholder="Opcional"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#381932]">
                Tiempo estimado de recogida
              </span>
              <input
                name="pickupEtaMin"
                type="number"
                inputMode="numeric"
                min="0"
                defaultValue={values.pickupEtaMin}
                className={fieldClassName()}
                placeholder="Minutos"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-[#381932]">Notas de recogida</span>
              <textarea
                name="pickupNotes"
                rows={3}
                defaultValue={values.pickupNotes}
                className={`${fieldClassName()} resize-y`}
                placeholder="Recoge en barra, pregunta por tu nombre..."
              />
            </label>
          </div>
        </AdminFormDisclosure>

        <AdminFormDisclosure
          title="Ubicación precisa"
          description="Las coordenadas permiten calcular distancias. Si no están confirmadas, pueden completarse más adelante."
          defaultOpen={Boolean(values.latitude || values.longitude)}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#381932]">Latitud</span>
              <input
                name="latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                inputMode="decimal"
                defaultValue={values.latitude}
                className={fieldClassName()}
                placeholder="40.132..."
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#381932]">Longitud</span>
              <input
                name="longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                inputMode="decimal"
                defaultValue={values.longitude}
                className={fieldClassName()}
                placeholder="-4.834..."
              />
            </label>
          </div>
        </AdminFormDisclosure>

        <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#741314] text-sm font-bold text-[#FFF7E8]">
              2
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
                Publicación
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#381932]">
                Decide qué puede ver el público
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#381932]/62">
                Estos controles afectan directamente a la ficha y a la posibilidad de recoger pedidos.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
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

        <AdminFormDisclosure
          eyebrow="Configuración interna"
          title="Verificación, suscripción y orden"
          description="Opciones administrativas que no necesitas tocar en cada edición del local."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              name="isVerified"
              label="Local verificado por Pickyalo"
              description="La documentación aportada ha sido revisada. No sustituye a ninguna administración pública."
              defaultChecked={values.isVerified}
            />
            <ToggleField
              name="subscriptionActive"
              label="Suscripción activa"
              description="Habilita los beneficios del nivel interno y muestra el local como punto de recogida en el mapa público."
              defaultChecked={values.subscriptionActive}
            />
            <label className="block">
              <span className="text-sm font-medium text-[#381932]">Nivel de suscripción</span>
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
            <label className="block">
              <span className="text-sm font-medium text-[#381932]">Orden visual</span>
              <input
                name="sortOrder"
                type="number"
                inputMode="numeric"
                min="0"
                defaultValue={values.sortOrder}
                className={fieldClassName()}
                placeholder="0"
              />
            </label>
          </div>
        </AdminFormDisclosure>

        <AdminFormDisclosure
          eyebrow="Disponibilidad"
          title="Horario semanal"
          description="Activa únicamente los días de apertura y completa uno o dos tramos."
          defaultOpen={Object.values(values.openingHours).some((day) => day.isOpen)}
        >
          <AdminOpeningHoursTable initialValue={values.openingHours} />
        </AdminFormDisclosure>

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
