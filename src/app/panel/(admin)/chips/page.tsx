import {
  type ChipDishOption,
  createSiteChipAction,
  getAdminSiteChips,
  getChipDishOptions,
  updateSiteChipAction,
} from "@/features/admin/services/chips-admin-service";
import type { SiteChip } from "@/features/chips/types";
import { siteChipTypes, weekdayOptions } from "@/features/chips/types";

const fieldClassName =
  "dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]";

function statusClassName(isEnabled: boolean) {
  return isEnabled
    ? "bg-[color:var(--brand-soft)] text-[color:var(--accent)]"
    : "bg-white/8 text-white/58";
}

function SubmitButton({ children }: { children: string }) {
  return (
    <button
      type="submit"
      className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
    >
      {children}
    </button>
  );
}

function formatDateTimeForInput(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

function ChipSummary({ chip }: { chip: SiteChip }) {
  return (
    <article className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[color:var(--foreground)]">{chip.name}</p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">/{chip.slug}</p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
            chip.isActive,
          )}`}
        >
          {chip.isActive ? "Activo" : "Inactivo"}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[color:var(--muted-strong)]">
          {chip.type}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[color:var(--muted-strong)]">
          {chip.itemIds.length} platos
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[color:var(--muted-strong)]">
          Orden {chip.sortOrder}
        </span>
        {chip.isPaid ? (
          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-amber-100">
            Paid
          </span>
        ) : null}
      </div>
    </article>
  );
}

function DishCheckboxList({
  dishOptions,
  selectedItemIds,
}: {
  dishOptions: ChipDishOption[];
  selectedItemIds: string[];
}) {
  const selected = new Set(selectedItemIds);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-[color:var(--foreground)]">
        Platos asignados
      </legend>
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] p-3">
        {dishOptions.map((dish) => (
          <label
            key={dish.id}
            className="flex items-start gap-3 rounded-[0.9rem] px-3 py-2 text-sm transition hover:bg-white/[0.04]"
          >
            <input
              type="checkbox"
              name="itemIds"
              value={dish.id}
              defaultChecked={selected.has(dish.id)}
              className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--brand)]"
            />
            <span>
              <span className="block font-semibold text-[color:var(--foreground)]">
                {dish.name}
              </span>
              <span className="mt-1 block text-xs text-[color:var(--muted-strong)]">
                {dish.venueName} · {dish.cityName}
              </span>
            </span>
          </label>
        ))}
      </div>
      <p className="text-xs leading-5 text-[color:var(--muted-strong)]">
        Si no asignas platos, el chip no se mostrara en /platos.
      </p>
    </fieldset>
  );
}

function ChipForm({
  chip,
  dishOptions,
}: {
  chip?: SiteChip;
  dishOptions: ChipDishOption[];
}) {
  const action = chip
    ? updateSiteChipAction.bind(null, chip.id)
    : createSiteChipAction;

  return (
    <form
      action={action}
      className="space-y-5 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Nombre visible
          </span>
          <input name="name" defaultValue={chip?.name ?? ""} required className={fieldClassName} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Slug
          </span>
          <input name="slug" defaultValue={chip?.slug ?? ""} required className={fieldClassName} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Orden
          </span>
          <input name="sortOrder" type="number" defaultValue={chip?.sortOrder ?? 100} className={fieldClassName} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Tipo
          </span>
          <select name="type" defaultValue={chip?.type ?? "editorial"} className={fieldClassName}>
            {siteChipTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
          <input type="checkbox" name="isActive" defaultChecked={chip?.isActive ?? true} className="h-4 w-4 accent-[color:var(--brand)]" />
          Activo
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
          <input type="checkbox" name="isPaid" defaultChecked={chip?.isPaid ?? false} className="h-4 w-4 accent-[color:var(--brand)]" />
          isPaid
        </label>
      </div>

      <DishCheckboxList dishOptions={dishOptions} selectedItemIds={chip?.itemIds ?? []} />

      <div className="grid gap-5 xl:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Fecha inicio opcional
          </span>
          <input name="startsAt" type="datetime-local" defaultValue={formatDateTimeForInput(chip?.startsAt ?? null)} className={fieldClassName} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Fecha fin opcional
          </span>
          <input name="endsAt" type="datetime-local" defaultValue={formatDateTimeForInput(chip?.endsAt ?? null)} className={fieldClassName} />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-[color:var(--foreground)]">
          Dias de semana opcionales
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {weekdayOptions.map((day) => (
            <label
              key={day.value}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-[color:var(--muted-strong)]"
            >
              <input
                type="checkbox"
                name="weekdays"
                value={day.value}
                defaultChecked={chip?.weekdays.includes(day.value) ?? false}
                className="h-3.5 w-3.5 accent-[color:var(--brand)]"
              />
              {day.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 xl:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Hora inicio opcional
          </span>
          <input name="startTime" type="time" defaultValue={chip?.startTime?.slice(0, 5) ?? ""} className={fieldClassName} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Hora fin opcional
          </span>
          <input name="endTime" type="time" defaultValue={chip?.endTime?.slice(0, 5) ?? ""} className={fieldClassName} />
        </label>
      </div>

      <SubmitButton>{chip ? "Guardar chip" : "Crear chip"}</SubmitButton>
    </form>
  );
}

export default async function AdminChipsPage() {
  const [chips, dishOptions] = await Promise.all([
    getAdminSiteChips(),
    getChipDishOptions(),
  ]);
  const activeChips = chips.filter((chip) => chip.isActive);
  const inactiveChips = chips.filter((chip) => !chip.isActive);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Panel admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            Chips
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
            Controla etiquetas visibles de /platos sin tocar Funnel,
            Monetizacion ni datos operativos.
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Activos</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">{activeChips.length}</p>
        </article>
        <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Inactivos</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">{inactiveChips.length}</p>
        </article>
        <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Paid</p>
          <p className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            {chips.filter((chip) => chip.isPaid).length}
          </p>
        </article>
      </section>

      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Crear
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
          Nuevo chip
        </h2>
        <div className="mt-6">
          <ChipForm dishOptions={dishOptions} />
        </div>
      </section>

      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Listado
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
          Chips activos
        </h2>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {activeChips.length > 0 ? (
            activeChips.map((chip) => <ChipSummary key={chip.id} chip={chip} />)
          ) : (
            <p className="text-sm text-[color:var(--muted-strong)]">No hay chips activos.</p>
          )}
        </div>

        <h2 className="mt-8 text-2xl font-semibold text-[color:var(--foreground)]">
          Chips inactivos
        </h2>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {inactiveChips.length > 0 ? (
            inactiveChips.map((chip) => <ChipSummary key={chip.id} chip={chip} />)
          ) : (
            <p className="text-sm text-[color:var(--muted-strong)]">No hay chips inactivos.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Editar
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Ajustar chips existentes
          </h2>
        </div>
        {chips.map((chip) => (
          <details
            key={chip.id}
            className="glass-panel rounded-[1.4rem] border border-[color:var(--border)] p-5 shadow-[var(--soft-shadow)]"
          >
            <summary className="cursor-pointer text-lg font-semibold text-[color:var(--foreground)]">
              {chip.name}
            </summary>
            <div className="mt-5">
              <ChipForm chip={chip} dishOptions={dishOptions} />
            </div>
          </details>
        ))}
      </section>
    </section>
  );
}
