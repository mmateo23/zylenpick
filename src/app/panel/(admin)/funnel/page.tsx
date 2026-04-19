import {
  getAdminSiteFunnelSettings,
  getFunnelDishOptions,
  updateFunnelPlatosAction,
  type FunnelDishOption,
} from "@/features/admin/services/funnel-admin-service";

const fieldClassName =
  "dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]";

function statusClassName(isEnabled: boolean) {
  return isEnabled
    ? "bg-[color:var(--brand-soft)] text-[color:var(--accent)]"
    : "bg-white/8 text-white/58";
}

function StatusPill({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusClassName(
        enabled,
      )}`}
    >
      {enabled ? "Activo" : "Inactivo"}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  active,
}: {
  label: string;
  value: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted)]">
          {label}
        </p>
        {typeof active === "boolean" ? <StatusPill enabled={active} /> : null}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted-strong)]">
        {detail}
      </p>
    </article>
  );
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

function DishLine({ dish }: { dish: FunnelDishOption }) {
  return (
    <li className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="font-semibold text-[color:var(--foreground)]">{dish.name}</p>
      <p className="mt-1 text-sm text-[color:var(--muted-strong)]">
        {dish.venueName} · {dish.cityName}
      </p>
    </li>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-6 text-[color:var(--muted-strong)]">
      {children}
    </div>
  );
}

export default async function AdminFunnelPage() {
  const [funnel, dishOptions] = await Promise.all([
    getAdminSiteFunnelSettings(),
    getFunnelDishOptions(),
  ]);
  const dishById = new Map(dishOptions.map((dish) => [dish.id, dish]));
  const quickDecisionDishes = funnel.platos.quickDecision.itemIds
    .map((itemId) => dishById.get(itemId))
    .filter((dish): dish is FunnelDishOption => Boolean(dish));
  const quickDecisionItemIds = new Set(funnel.platos.quickDecision.itemIds);
  const featuredDish = funnel.platos.featuredFeed.itemId
    ? dishById.get(funnel.platos.featuredFeed.itemId) ?? null
    : null;
  const quickDecisionMisconfigured =
    funnel.platos.quickDecision.enabled && quickDecisionDishes.length === 0;
  const featuredMisconfigured =
    funnel.platos.featuredFeed.enabled && !featuredDish;

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Panel admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            Funnel
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
            Mira rapido que platos empuja /platos y ajusta solo lo necesario.
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Para decidir"
          value={funnel.platos.quickDecision.enabled ? "Activo" : "Inactivo"}
          detail={
            quickDecisionMisconfigured
              ? "Activo, pero no se mostrara hasta elegir platos."
              : "Seccion superior de decision rapida."
          }
          active={funnel.platos.quickDecision.enabled}
        />
        <SummaryCard
          label="Platos"
          value={String(quickDecisionDishes.length)}
          detail="Seleccionados para decision rapida."
        />
        <SummaryCard
          label="Featured"
          value={funnel.platos.featuredFeed.enabled ? "Activo" : "Inactivo"}
          detail={
            featuredMisconfigured
              ? "Activo, pero no se mostrara sin plato."
              : "Card destacada dentro del feed."
          }
          active={funnel.platos.featuredFeed.enabled}
        />
        <SummaryCard
          label="Plato featured"
          value={featuredDish?.name ?? "Sin plato"}
          detail={featuredDish?.venueName ?? "No se mostrara en /platos."}
        />
        <SummaryCard
          label="Posicion"
          value={`Despues de ${funnel.platos.featuredFeed.insertAfter}`}
          detail={
            funnel.platos.featuredFeed.enabled && featuredDish
              ? "Lugar aproximado en el feed."
              : "No visible ahora mismo."
          }
        />
      </section>

      {(quickDecisionMisconfigured || featuredMisconfigured) ? (
        <section className="rounded-[1.4rem] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm leading-6 text-amber-100">
          {quickDecisionMisconfigured ? (
            <p>Para decidir esta activo, pero sin platos seleccionados. No se mostrara en /platos.</p>
          ) : null}
          {featuredMisconfigured ? (
            <p>Featured esta activo, pero sin plato seleccionado. No se mostrara la card destacada.</p>
          ) : null}
        </section>
      ) : null}

      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Estado actual
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
          Que estamos empujando
        </h2>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                Para decidir en segundos
              </h3>
              <StatusPill enabled={funnel.platos.quickDecision.enabled} />
            </div>
            {quickDecisionDishes.length > 0 ? (
              <ul className="space-y-2">
                {quickDecisionDishes.map((dish) => (
                  <DishLine key={dish.id} dish={dish} />
                ))}
              </ul>
            ) : funnel.platos.quickDecision.enabled ? (
              <EmptyState>
                Activo, pero sin platos seleccionados. No se mostrara en /platos.
              </EmptyState>
            ) : (
              <EmptyState>
                Inactivo. La seccion no se mostrara en /platos.
              </EmptyState>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                Featured feed
              </h3>
              <StatusPill enabled={funnel.platos.featuredFeed.enabled} />
            </div>
            {featuredDish ? (
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="font-semibold text-[color:var(--foreground)]">
                  {featuredDish.name}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted-strong)]">
                  {featuredDish.venueName} · {featuredDish.cityName}
                </p>
                <p className="mt-3 text-sm text-[color:var(--muted-strong)]">
                  Aparece despues de {funnel.platos.featuredFeed.insertAfter} platos.
                </p>
              </div>
            ) : funnel.platos.featuredFeed.enabled ? (
              <EmptyState>
                Activo, pero sin plato seleccionado. No se mostrara en /platos.
              </EmptyState>
            ) : (
              <EmptyState>
                Inactivo. No hay card destacada en el feed.
              </EmptyState>
            )}
          </section>
        </div>
      </section>

      <form
        action={updateFunnelPlatosAction}
        className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]"
      >
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Configuracion
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
          Ajustar empujes
        </h2>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="space-y-4 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
            <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
              <input
                type="checkbox"
                name="quickDecision.enabled"
                defaultChecked={funnel.platos.quickDecision.enabled}
                className="h-4 w-4 accent-[color:var(--brand)]"
              />
              Mostrar Para decidir en segundos
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Titulo de la seccion
              </span>
              <input
                name="quickDecision.title"
                defaultValue={funnel.platos.quickDecision.title}
                className={fieldClassName}
              />
            </label>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-[color:var(--foreground)]">
                Platos de decision rapida
              </legend>
              <div className="mt-3 max-h-96 space-y-2 overflow-y-auto rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] p-3">
                {dishOptions.map((dish) => (
                  <label
                    key={dish.id}
                    className="flex items-start gap-3 rounded-[0.9rem] px-3 py-2 text-sm transition hover:bg-white/[0.04]"
                  >
                    <input
                      type="checkbox"
                      name="quickDecision.itemIds"
                      value={dish.id}
                      defaultChecked={quickDecisionItemIds.has(dish.id)}
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
                Consejo: selecciona entre 3 y 5 platos. Si no seleccionas ninguno,
                la seccion no se mostrara.
              </p>
            </fieldset>
          </section>

          <section className="space-y-4 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
            <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
              <input
                type="checkbox"
                name="featuredFeed.enabled"
                defaultChecked={funnel.platos.featuredFeed.enabled}
                className="h-4 w-4 accent-[color:var(--brand)]"
              />
              Mostrar card destacada en el feed
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Plato featured
              </span>
              <select
                name="featuredFeed.itemId"
                defaultValue={funnel.platos.featuredFeed.itemId ?? ""}
                className={fieldClassName}
              >
                <option value="">Sin plato destacado</option>
                {dishOptions.map((dish) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name} - {dish.venueName} - {dish.cityName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Aparece despues de
              </span>
              <input
                name="featuredFeed.insertAfter"
                type="number"
                min={1}
                defaultValue={funnel.platos.featuredFeed.insertAfter}
                className={fieldClassName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                CTA de la card destacada
              </span>
              <input
                name="featuredFeed.ctaLabel"
                defaultValue={funnel.platos.featuredFeed.ctaLabel}
                className={fieldClassName}
              />
            </label>
            {quickDecisionItemIds.has(funnel.platos.featuredFeed.itemId ?? "") ? (
              <p className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-[color:var(--muted-strong)]">
                Este plato tambien esta seleccionado arriba. En /platos se
                mostrara una sola vez para evitar duplicados.
              </p>
            ) : null}
          </section>
        </div>

        <div className="mt-6">
          <SubmitButton>Guardar funnel</SubmitButton>
        </div>
      </form>
    </section>
  );
}
