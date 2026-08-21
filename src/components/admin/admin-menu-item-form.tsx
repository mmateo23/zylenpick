"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Check, ShieldCheck } from "lucide-react";

import { AdminPreviewLink } from "@/components/admin/admin-preview-link";
import type {
  AdminMenuItemFormValues,
  AdminVenueContext,
} from "@/features/admin/services/menu-items-admin-service";
import type { MenuItemAllergen } from "@/features/venues/types";

type AdminMenuItemFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  action: (formData: FormData) => void;
  venue: AdminVenueContext;
  initialValues?: AdminMenuItemFormValues | null;
  previewHref?: string | null;
};

const allergenOptions: { value: MenuItemAllergen; label: string }[] = [
  { value: "gluten", label: "Gluten" },
  { value: "crustaceos", label: "Crustáceos" },
  { value: "huevo", label: "Huevo" },
  { value: "pescado", label: "Pescado" },
  { value: "cacahuetes", label: "Cacahuetes" },
  { value: "soja", label: "Soja" },
  { value: "leche", label: "Leche" },
  { value: "frutos_de_cascara", label: "Frutos de cáscara" },
  { value: "apio", label: "Apio" },
  { value: "mostaza", label: "Mostaza" },
  { value: "sesamo", label: "Sésamo" },
  { value: "sulfitos", label: "Sulfitos" },
  { value: "altramuces", label: "Altramuces" },
  { value: "moluscos", label: "Moluscos" },
];

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
      allergens: [],
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
  previewHref,
}: AdminMenuItemFormProps) {
  const values = buildInitialValues(venue.id, initialValues);
  const [imageUrl, setImageUrl] = useState(values.imageUrl);
  const [hasImageError, setHasImageError] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState<MenuItemAllergen[]>(
    values.allergens,
  );

  useEffect(() => {
    setImageUrl(values.imageUrl);
    setHasImageError(false);
  }, [values.imageUrl]);

  useEffect(() => {
    setSelectedAllergens(initialValues?.allergens ?? []);
  }, [initialValues]);

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

      {previewHref ? (
        <AdminPreviewLink
          href={previewHref}
          description="Este formulario modifica el plato dentro de la selección pública del local."
          label="Ver plato publicado"
        />
      ) : null}

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

          <fieldset className="rounded-[1.35rem] border border-white/10 bg-[color:var(--surface-strong)] p-4 md:col-span-2 sm:p-5">
            <legend className="px-1 text-sm font-semibold text-[color:var(--foreground)]">
              Información alimentaria
            </legend>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex max-w-2xl items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
                  <ShieldCheck aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    Alérgenos de declaración obligatoria
                  </p>
                  <p
                    id="allergens-help"
                    className="mt-1 text-xs leading-5 text-[color:var(--muted-strong)]"
                  >
                    Marca los posibles alérgenos o trazas advertidos por el local. Esta información se mostrará en la ficha pública antes de realizar el pedido.
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                  selectedAllergens.length > 0
                    ? "border-[color:var(--brand)]/30 bg-[color:var(--brand-soft)] text-[color:var(--foreground)]"
                    : "border-amber-300 bg-amber-50 text-amber-800"
                }`}
                role="status"
                aria-live="polite"
              >
                {selectedAllergens.length > 0 ? (
                  <Check aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                {selectedAllergens.length > 0
                  ? `${selectedAllergens.length} seleccionado${selectedAllergens.length === 1 ? "" : "s"}`
                  : "Pendiente de revisar"}
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allergenOptions.map((option) => (
                <label
                  key={option.value}
                  className={`group flex min-h-12 cursor-pointer items-center gap-3 rounded-[0.9rem] border px-3 py-2.5 text-sm font-medium transition ${
                    selectedAllergens.includes(option.value)
                      ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)] text-[color:var(--foreground)]"
                      : "border-white/10 bg-white/[0.04] text-[color:var(--muted-strong)] hover:border-white/20 hover:text-[color:var(--foreground)]"
                  }`}
                >
                  <input
                    name="allergens"
                    type="checkbox"
                    value={option.value}
                    checked={selectedAllergens.includes(option.value)}
                    aria-describedby="allergens-help"
                    className="peer sr-only"
                    onChange={(event) => {
                      setSelectedAllergens((current) =>
                        event.target.checked
                          ? [...current, option.value]
                          : current.filter((allergen) => allergen !== option.value),
                      );
                    }}
                  />
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[0.4rem] border transition ${
                      selectedAllergens.includes(option.value)
                        ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                        : "border-white/20 bg-white/5 text-transparent group-hover:border-white/35"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {option.label}
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="max-w-2xl text-xs leading-5 text-[color:var(--muted-strong)]">
                Si no se selecciona ninguno, Pickyalo mostrará “Alérgenos pendientes” para no confundir falta de información con ausencia de alérgenos o trazas.
              </p>
              {selectedAllergens.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSelectedAllergens([])}
                  className="text-xs font-semibold text-[color:var(--brand)] underline decoration-white/20 underline-offset-4 transition hover:decoration-[color:var(--brand)]"
                >
                  Limpiar selección
                </button>
              ) : null}
            </div>
          </fieldset>

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

        <div className="sticky bottom-3 z-30 flex flex-wrap gap-3 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8]/95 p-2 shadow-[0_16px_40px_rgba(56,25,50,0.12)] backdrop-blur-md">
          <button
            type="submit"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#741314] px-6 py-3 text-sm font-semibold text-[#FFF7E8] sm:flex-none"
          >
            {submitLabel}
          </button>
          <Link
            href={`/panel/locales/${venue.id}/platos`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[#741314]/18 bg-white px-6 py-3 text-sm font-semibold text-[#741314] sm:flex-none"
          >
            Volver a platos
          </Link>
        </div>
      </form>
    </section>
  );
}
