import Link from "next/link";

import type {
  AdminCityOption,
  AdminVenueFormValues,
} from "@/features/admin/services/venues-admin-service";

type AdminVenueFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  action: (formData: FormData) => void;
  cities: AdminCityOption[];
  initialValues?: AdminVenueFormValues | null;
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
      description: "",
      address: "",
      email: "",
      pickupNotes: "",
      pickupEtaMin: "",
      coverUrl: "",
      isActive: true,
    }
  );
}

function fieldClassName() {
  return "dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]";
}

export function AdminVenueForm({
  title,
  description,
  submitLabel,
  action,
  cities,
  initialValues,
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

      <form action={action} className="mt-8 space-y-6">
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
              Email
            </span>
            <input
              name="email"
              type="email"
              defaultValue={values.email}
              className={fieldClassName()}
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
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Pickup notes
            </span>
            <textarea
              name="pickupNotes"
              rows={3}
              defaultValue={values.pickupNotes}
              className={`${fieldClassName()} resize-y`}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Pickup eta
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

          <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-4 md:col-span-2">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={values.isActive}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            <span className="text-sm text-[color:var(--muted-strong)]">
              Local activo
            </span>
          </label>
        </div>

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
