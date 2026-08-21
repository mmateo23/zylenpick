"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Check, ShieldCheck } from "lucide-react";

import { AdminFormDisclosure } from "@/components/admin/admin-form-disclosure";
import { AdminPreviewLink } from "@/components/admin/admin-preview-link";
import type {
  AdminMenuItemFormValues,
  AdminVenueContext,
} from "@/features/admin/services/menu-items-admin-service";
import { menuItemAllergenOptions } from "@/features/venues/allergens";
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
  return "mt-2.5 min-h-12 w-full rounded-xl border border-[#741314]/14 bg-white px-4 py-3 text-base text-[#381932] outline-none transition placeholder:text-[#381932]/38 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/12";
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
        <div className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[#741314]/12 bg-[#FFF7E8] px-4 py-2 text-xs font-medium text-[#381932]/62">
          Local: <span className="ml-2 font-semibold text-[#381932]">{venue.name}</span>
        </div>
      </div>

      {previewHref ? (
        <AdminPreviewLink
          href={previewHref}
          description="Este formulario modifica el plato dentro de la selección pública del local."
          label="Ver plato publicado"
        />
      ) : null}

      {values.captureStatus === "pending" ? (
        <aside className="mt-6 rounded-2xl border border-amber-300/70 bg-amber-50 px-5 py-4 text-[#381932]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
            Captura Scout pendiente
          </p>
          <p className="mt-2 text-sm leading-6">
            Confirma nombre, precio, descripción y alérgenos antes de dejar el producto disponible.
          </p>
          {values.scoutNote ? (
            <p className="mt-3 text-sm"><strong>Nota de captura:</strong> {values.scoutNote}</p>
          ) : null}
        </aside>
      ) : null}

      <form action={action} className="mt-8 space-y-6">
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
                Haz que el producto se entienda de un vistazo
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#381932]/62">
                Nombre, precio, descripción e imagen son lo primero que verá el cliente.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Nombre del producto
            </span>
            <input
              name="name"
              defaultValue={values.name}
              className={fieldClassName()}
              autoCapitalize="sentences"
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

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-[color:var(--foreground)]">
              Descripción
            </span>
            <textarea
              name="description"
              rows={4}
              defaultValue={values.description}
              className={`${fieldClassName()} resize-y`}
              placeholder="Qué es, cómo se prepara y qué lo hace especial."
            />
          </label>
          </div>
        </section>

        <AdminFormDisclosure
          eyebrow="Revisión obligatoria"
          title="Alérgenos y posibles trazas"
          description="Revísalos antes de publicar. Si faltan datos, la ficha lo indicará claramente."
          defaultOpen={selectedAllergens.length === 0}
        >
          <fieldset className="rounded-xl border border-[#741314]/10 bg-white p-4 sm:p-5">
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
              {menuItemAllergenOptions.map((option) => (
                <label
                  key={option.value}
                  className={`group flex min-h-12 cursor-pointer items-center gap-3 rounded-[0.9rem] border px-3 py-2.5 text-sm font-medium transition ${
                    selectedAllergens.includes(option.value)
                      ? "border-[#741314] bg-[#FFE9EC] text-[#381932]"
                      : "border-[#741314]/12 bg-[#FFF7E8] text-[#381932]/72 hover:border-[#741314]/30"
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
                        : "border-[#741314]/22 bg-white text-transparent group-hover:border-[#741314]/40"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {option.label}
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#741314]/10 pt-4">
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
        </AdminFormDisclosure>

        <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
              Imagen pública
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#381932]">Comprueba cómo se verá</h2>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <label className="block">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Imagen
              </span>
              <input
                name="imageUrl"
                type="url"
                inputMode="url"
                defaultValue={values.imageUrl}
                className={fieldClassName()}
                placeholder="https://..."
                onChange={(event) => {
                  setImageUrl(event.target.value);
                  setHasImageError(false);
                }}
              />
            </label>

            <div className="rounded-xl border border-[#741314]/12 bg-white p-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Vista previa
              </p>

              <div className="mt-3 overflow-hidden rounded-lg border border-[#741314]/10 bg-[#FFF7E8]">
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
        </section>

        <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#741314] text-sm font-bold text-[#FFF7E8]">
              2
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">Disponibilidad</p>
              <h2 className="mt-1 text-xl font-semibold text-[#381932]">Controla si puede elegirse</h2>
            </div>
          </div>
          <label className="mt-6 flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 py-4 has-[:checked]:border-emerald-600/30 has-[:checked]:bg-emerald-50">
            <input
              name="isAvailable"
              type="checkbox"
              defaultChecked={values.isAvailable}
              className="h-5 w-5 accent-emerald-600"
            />
            <span>
              <span className="block text-sm font-semibold text-[#381932]">Producto disponible</span>
              <span className="mt-1 block text-xs leading-5 text-[#381932]/60">Desactívalo temporalmente sin borrar su ficha.</span>
            </span>
          </label>
        </section>

        <AdminFormDisclosure
          eyebrow="Promoción y orden"
          title="Ajustes editoriales"
          description="Úsalos solo cuando quieras cambiar la posición o destacar este producto."
        >
          <div className="grid gap-4 md:grid-cols-2">
          <label className="flex min-h-14 items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 py-4">
            <input
              name="isFeatured"
              type="checkbox"
              defaultChecked={values.isFeatured}
              className="h-5 w-5 accent-[#741314]"
            />
            <span className="text-sm text-[color:var(--muted-strong)]">
              Marcar como destacado
            </span>
          </label>

          <label className="flex min-h-14 items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 py-4">
            <input
              name="isHomeFeatured"
              type="checkbox"
              defaultChecked={values.isHomeFeatured}
              className="h-5 w-5 accent-[#741314]"
            />
            <span className="text-sm text-[color:var(--muted-strong)]">
              Mostrar en destacados de la home
            </span>
          </label>

          <label className="flex min-h-14 items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 py-4">
            <input
              name="isPickupMonthHighlight"
              type="checkbox"
              defaultChecked={values.isPickupMonthHighlight}
              className="h-5 w-5 accent-[#741314]"
            />
            <span className="text-sm text-[color:var(--muted-strong)]">
              Marcar como más recogido del mes
            </span>
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
