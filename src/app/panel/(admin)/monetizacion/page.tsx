import {
  getVenueMonetizationDashboard,
  updateVenueMonetizationAction,
  type VenueMonetizationAdminRow,
} from "@/features/admin/services/monetization-admin-service";
import { billingCycles, monetizationPlans } from "@/features/monetization/types";

const fieldClassName =
  "dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]";

function formatDateTimeForInput(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
        {value}
      </p>
    </article>
  );
}

function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "active" | "warning";
}) {
  const className =
    tone === "active"
      ? "border-[color:var(--brand)]/25 bg-[color:var(--brand-soft)] text-[color:var(--accent)]"
      : tone === "warning"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
        : "border-white/10 bg-white/[0.04] text-[color:var(--muted-strong)]";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function SubmitButton() {
  return (
    <button
      type="submit"
      className="magnetic-button inline-flex rounded-full bg-[color:var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--card-shadow)]"
    >
      Guardar monetizacion
    </button>
  );
}

function UsageList({ row }: { row: VenueMonetizationAdminRow }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
          QuickDecision
        </p>
        <div className="mt-3 space-y-1 text-sm text-[color:var(--foreground)]">
          {row.usage.quickDecisionItems.length > 0 ? (
            row.usage.quickDecisionItems.map((item) => (
              <p key={item.itemId}>{item.itemName}</p>
            ))
          ) : (
            <p className="text-[color:var(--muted-strong)]">Sin uso actual.</p>
          )}
        </div>
      </div>
      <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Featured
        </p>
        <p className="mt-3 text-sm text-[color:var(--foreground)]">
          {row.usage.featuredFeedItem?.itemName ?? "Sin uso actual."}
        </p>
      </div>
      <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Chips activos
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {row.usage.activeChips.length > 0 ? (
            row.usage.activeChips.map((chip) => (
              <Pill key={chip.chipId} tone={chip.isPaid ? "warning" : "default"}>
                {chip.chipName}
              </Pill>
            ))
          ) : (
            <p className="text-sm text-[color:var(--muted-strong)]">
              Sin uso actual.
            </p>
          )}
        </div>
      </div>
      <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Pedidos
        </p>
        <p className="mt-3 text-sm text-[color:var(--foreground)]">
          {row.usage.ordersCount}
        </p>
        <p className="mt-2 text-xs leading-5 text-[color:var(--muted-strong)]">
          Pendiente de pedidos persistidos en BD.
        </p>
      </div>
    </div>
  );
}

function MonetizationForm({ row }: { row: VenueMonetizationAdminRow }) {
  const action = updateVenueMonetizationAction.bind(null, row.venue.id);

  return (
    <form action={action} className="space-y-5">
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
          <input
            type="checkbox"
            name="isPaying"
            defaultChecked={row.settings.isPaying}
            className="h-4 w-4 accent-[color:var(--brand)]"
          />
          Local pagando
        </label>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Plan
          </span>
          <select name="plan" defaultValue={row.settings.plan} className={fieldClassName}>
            {monetizationPlans.map((plan) => (
              <option key={plan} value={plan}>
                {plan}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Ciclo
          </span>
          <select
            name="billingCycle"
            defaultValue={row.settings.billingCycle ?? ""}
            className={fieldClassName}
          >
            <option value="">Sin ciclo</option>
            {billingCycles.map((cycle) => (
              <option key={cycle} value={cycle}>
                {cycle === "monthly" ? "monthly" : "annual"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-[color:var(--foreground)]">
          Privilegios
        </legend>
        <div className="mt-3 flex flex-wrap gap-5">
          <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
            <input
              type="checkbox"
              name="quickDecision"
              defaultChecked={row.settings.privileges.quickDecision}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            QuickDecision
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
            <input
              type="checkbox"
              name="featuredFeed"
              defaultChecked={row.settings.privileges.featuredFeed}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            FeaturedFeed
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
            <input
              type="checkbox"
              name="promotionalChips"
              defaultChecked={row.settings.privileges.promotionalChips}
              className="h-4 w-4 accent-[color:var(--brand)]"
            />
            Chips promocionales
          </label>
        </div>
      </fieldset>

      <div className="grid gap-5 xl:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Fecha inicio
          </span>
          <input
            name="startsAt"
            type="datetime-local"
            defaultValue={formatDateTimeForInput(row.settings.startsAt)}
            className={fieldClassName}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[color:var(--foreground)]">
            Fecha fin
          </span>
          <input
            name="endsAt"
            type="datetime-local"
            defaultValue={formatDateTimeForInput(row.settings.endsAt)}
            className={fieldClassName}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-[color:var(--foreground)]">
          Notas internas
        </span>
        <textarea
          name="notes"
          defaultValue={row.settings.notes ?? ""}
          rows={4}
          className={fieldClassName}
        />
      </label>

      <SubmitButton />
    </form>
  );
}

export default async function AdminMonetizationPage() {
  const dashboard = await getVenueMonetizationDashboard();

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Panel admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
          Monetizacion
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
          Controla que locales pagan, que privilegios tienen y que visibilidad
          estan usando sin bloquear Funnel ni Chips.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <SummaryCard label="Pagando" value={dashboard.summary.payingVenues} />
        <SummaryCard label="Free" value={dashboard.summary.free} />
        <SummaryCard label="Basic" value={dashboard.summary.basic} />
        <SummaryCard label="Oro" value={dashboard.summary.oro} />
        <SummaryCard label="Titanio" value={dashboard.summary.titanio} />
        <SummaryCard
          label="Visibilidad"
          value={dashboard.summary.venuesWithActiveVisibility}
        />
        <SummaryCard label="Avisos" value={dashboard.summary.openWarnings} />
      </section>

      <section className="glass-panel overflow-hidden rounded-[1.8rem] border border-[color:var(--border)] shadow-[var(--soft-shadow)]">
        <div className="border-b border-white/10 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Listado
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Locales
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
              <tr>
                <th className="px-5 py-4 font-medium">Local</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Plan</th>
                <th className="px-5 py-4 font-medium">Ciclo</th>
                <th className="px-5 py-4 font-medium">Privilegios</th>
                <th className="px-5 py-4 font-medium">Uso visible</th>
                <th className="px-5 py-4 font-medium">Avisos</th>
                <th className="px-5 py-4 font-medium">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dashboard.rows.map((row) => (
                <tr key={row.venue.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[color:var(--foreground)]">
                      {row.venue.name}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      /{row.venue.slug}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Pill tone={row.settings.isPaying ? "active" : "default"}>
                      {row.settings.isPaying ? "Pagando" : "No paga"}
                    </Pill>
                  </td>
                  <td className="px-5 py-4 text-[color:var(--foreground)]">
                    {row.settings.plan}
                  </td>
                  <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                    {row.settings.billingCycle ?? "Sin ciclo"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {row.settings.privileges.quickDecision ? (
                        <Pill>Quick</Pill>
                      ) : null}
                      {row.settings.privileges.featuredFeed ? (
                        <Pill>Featured</Pill>
                      ) : null}
                      {row.settings.privileges.promotionalChips ? (
                        <Pill>Chips</Pill>
                      ) : null}
                      {!row.settings.privileges.quickDecision &&
                      !row.settings.privileges.featuredFeed &&
                      !row.settings.privileges.promotionalChips ? (
                        <span className="text-[color:var(--muted-strong)]">
                          Sin privilegios
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[color:var(--muted-strong)]">
                    QD {row.usage.quickDecisionItems.length} · Featured{" "}
                    {row.usage.featuredFeedItem ? "si" : "no"} · Chips{" "}
                    {row.usage.activeChips.length} · Pedidos{" "}
                    {row.usage.ordersCount}
                  </td>
                  <td className="px-5 py-4">
                    {row.warnings.length > 0 ? (
                      <Pill tone="warning">{row.warnings.length} avisos</Pill>
                    ) : (
                      <Pill>Sin avisos</Pill>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`#monetizacion-${row.venue.id}`}
                      className="text-sm font-semibold text-[color:var(--brand)]"
                    >
                      Editar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Detalle
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
            Editar monetizacion por local
          </h2>
        </div>

        {dashboard.rows.map((row) => (
          <details
            key={row.venue.id}
            id={`monetizacion-${row.venue.id}`}
            className="glass-panel rounded-[1.4rem] border border-[color:var(--border)] p-5 shadow-[var(--soft-shadow)]"
          >
            <summary className="cursor-pointer text-lg font-semibold text-[color:var(--foreground)]">
              {row.venue.name} · {row.settings.plan} ·{" "}
              {row.warnings.length > 0
                ? `${row.warnings.length} avisos`
                : "sin avisos"}
            </summary>

            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                  Uso actual
                </h3>
                <div className="mt-3">
                  <UsageList row={row} />
                </div>
              </section>

              <section>
                <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                  Advertencias
                </h3>
                {row.warnings.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {row.warnings.map((warning) => (
                      <li
                        key={warning.code}
                        className="rounded-[1rem] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100"
                      >
                        {warning.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-[color:var(--muted-strong)]">
                    No hay advertencias para este local.
                  </p>
                )}
              </section>

              <section>
                <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                  Configuracion
                </h3>
                <div className="mt-3 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-5">
                  <MonetizationForm row={row} />
                </div>
              </section>
            </div>
          </details>
        ))}
      </section>
    </section>
  );
}
