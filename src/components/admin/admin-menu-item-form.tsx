"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
      isHomeFeatured: false,
      isPickupMonthHighlight: false,
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
  const [imageUrl, setImageUrl] = useState(values.imageUrl);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setImageUrl(values.imageUrl);
    setHasImageError(false);
  }, [values.imageUrl]);

  const trimmedImageUrl = imageUrl.trim();
  const hasPreview = Boolean(trimmedImageUrl) && !hasImageError;

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

          <div className="grid gap-4 md:col-span-2 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <label className="block">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Imagen
              </span>
              <input
                name="imageUrl"
                type="url"
                defaultValue={values.imageUrl}
                className={fieldClassName()}
                placeholder="https://..."
                onChange={(event) => {
                  setImageUrl(event.target.value);
                  setHasImageError(false);
                }}
              />
            </label>

            <div className="rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] p-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Vista previa
              </p>

              <div className="mt-3 overflow-hidden rounded-[1rem] border border-white/10 bg-white/5">
                {trimmedImageUrl ? (
                  hasPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={trimmedImageUrl}
                      alt="Vista previa de la imagen del plato"
                      className="h-52 w-full object-cover"
                      onError={() => setHasImageError(true)}
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center px-4 text-center text-sm leading-6 text-[color:var(--muted-strong)]">
                      No hemos podido cargar la imagen con esta URL.
                    </div>
                  )
                ) : (
                  <div className="flex h-52 items-center justify-center px-4 text-center text-sm leading-6 text-[color:var(--muted-strong)]">
                    Pega una URL para ver aquí la imagen del plato.
                  </div>
                )}
              </div>
            </div>
          </div>

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

          <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-4">
            <input
              name="isHomeFeatured"
              type="checkbox"
              defaultChecked={values.isHomeFeatured}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            <span className="text-sm text-[color:var(--muted-strong)]">
              Mostrar en destacados de la home
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-4">
            <input
              name="isPickupMonthHighlight"
              type="checkbox"
              defaultChecked={values.isPickupMonthHighlight}
              className="h-4 w-4 accent-[color:var(--accent)]"
            />
            <span className="text-sm text-[color:var(--muted-strong)]">
              Marcar como más recogido del mes
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
