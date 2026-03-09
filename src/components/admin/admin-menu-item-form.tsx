import Link from "next/link";

import type {
  AdminMenuItemFormValues,
  AdminVenueContext,
} from "@/features/admin/services/menu-items-admin-service";

type AdminMenuItemFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  action: (formData: FormData) => void;
  venue: AdminVenueContext;
  initialValues?: AdminMenuItemFormValues | null;
};

function buildInitialValues(
  venueId: string,
  initialValues?: AdminMenuItemFormValues | null,
): AdminMenuItemFormValues {
  return (
    initialValues ?? {
      id: "",
      venueId,
      name: "",
      description: "",
      price: "",
      categoryName: "",
      imageUrl: "",
      sortOrder: "0",
      isAvailable: true,
      isFeatured: false,
    }
  );
}

function fieldClassName() {
  return "dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]";
}

export function AdminMenuItemForm({
  title,
  description,
  submitLabel,
  action,
  venue,
  initialValues,
}: AdminMenuItemFormProps) {
  const values = buildInitialValues(venue.id, initialValues);

  return (
    <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Platos
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
          {description}
        </p>
        <div className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-[color:var(--muted-strong)]">
          Local: <span className="ml-2 text-[color:var(--foreground)]">{venue.name}</span>
        </div>
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
              Precio
            </span>
            <input
              name="price"
              type="text"
              inputMode="decimal"
              defaultValue={values.price}
              placeholder="10,50"
              className={fieldClassName()}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Categoría
            </span>
            <input
              name="categoryName"
              defaultValue={values.categoryName}
              className={fieldClassName()}
              placeholder="Burgers, Pizza, Sushi..."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Orden
            </span>
            <input
              name="sortOrder"
              type="number"
              min="0"
              defaultValue={values.sortOrder}
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
              Imagen
            </span>
            <input
              name="imageUrl"
              type="url"
              defaultValue={values.imageUrl}
              className={fieldClassName()}
              placeholder="https://..."
            />
          </label>

          <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-4">
            <input
              name="isAvailable"
              type="checkbox"
              defaultChecked={values.isAvailable}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            <span className="text-sm text-[color:var(--muted-strong)]">
              Plato disponible
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-4">
            <input
              name="isFeatured"
              type="checkbox"
              defaultChecked={values.isFeatured}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            <span className="text-sm text-[color:var(--muted-strong)]">
              Marcar como destacado
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
            href={`/panel/locales/${venue.id}/platos`}
            className="magnetic-button inline-flex rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Volver a platos
          </Link>
        </div>
      </form>
    </section>
  );
}
