import {
  getAdminSiteDesignConfig,
  updateDesignMediaAction,
  updateDesignTextsAction,
  updateDesignZonesAction,
} from "@/features/admin/services/design-admin-service";

const fieldClassName =
  "dark-form-field mt-3 w-full rounded-[1.2rem] border border-white/10 bg-[color:var(--surface-strong)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--brand)]";

function TextField({
  label,
  name,
  value,
  multiline = false,
}: {
  label: string;
  name: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[color:var(--foreground)]">
        {label}
      </span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={value}
          rows={3}
          className={`${fieldClassName} resize-y`}
        />
      ) : (
        <input name={name} defaultValue={value} className={fieldClassName} />
      )}
    </label>
  );
}

function UrlField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[color:var(--foreground)]">
        {label}
      </span>
      <input
        name={name}
        type="text"
        defaultValue={value}
        placeholder="/logo/icon.png o https://..."
        className={fieldClassName}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: "image" | "video";
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[color:var(--foreground)]">
        {label}
      </span>
      <select name={name} defaultValue={value} className={fieldClassName}>
        <option value="image">Imagen</option>
        <option value="video">Video</option>
      </select>
    </label>
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

export default async function AdminDesignPage() {
  const design = await getAdminSiteDesignConfig();

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            Panel admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
            Diseño
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted-strong)]">
            Primera versión para editar textos y media de presentación sin tocar
            datos operativos de locales, platos, pedidos o carrito.
          </p>
        </div>
      </div>

      <form
        action={updateDesignTextsAction}
        className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]"
      >
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Diseño &gt; Textos
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
          Labels y copy del funnel
        </h2>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
              Labels globales
            </h3>
            <TextField
              label="Ver carta"
              name="globalLabels.viewMenu"
              value={design.texts.globalLabels.viewMenu}
            />
            <TextField
              label="Ver detalle"
              name="globalLabels.viewDetail"
              value={design.texts.globalLabels.viewDetail}
            />
            <TextField
              label="Añadir para recoger"
              name="globalLabels.addForPickup"
              value={design.texts.globalLabels.addForPickup}
            />
            <TextField
              label="Preparar para recoger"
              name="globalLabels.prepareForPickup"
              value={design.texts.globalLabels.prepareForPickup}
            />
            <TextField
              label="Cómo llegar"
              name="globalLabels.directions"
              value={design.texts.globalLabels.directions}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
              Home
            </h3>
            <TextField
              label="Hero title"
              name="home.heroTitle"
              value={design.texts.home.heroTitle}
            />
            <TextField
              label="Hero subtitle"
              name="home.heroSubtitle"
              value={design.texts.home.heroSubtitle}
              multiline
            />
          </section>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
              Cart
            </h3>
            <TextField
              label="Título vacío"
              name="cart.emptyTitle"
              value={design.texts.cart.emptyTitle}
            />
            <TextField
              label="Subtítulo vacío"
              name="cart.emptySubtitle"
              value={design.texts.cart.emptySubtitle}
              multiline
            />
            <TextField
              label="CTA vacío"
              name="cart.emptyCta"
              value={design.texts.cart.emptyCta}
            />
            <TextField
              label="Título con productos"
              name="cart.filledTitle"
              value={design.texts.cart.filledTitle}
            />
            <TextField
              label="Subtítulo con productos"
              name="cart.filledSubtitle"
              value={design.texts.cart.filledSubtitle}
              multiline
            />
            <TextField
              label="Microcopy cerca del CTA"
              name="cart.ctaMicrocopy"
              value={design.texts.cart.ctaMicrocopy}
              multiline
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
              Success
            </h3>
            <TextField
              label="Título principal"
              name="success.heroTitle"
              value={design.texts.success.heroTitle}
            />
            <TextField
              label="Subtítulo principal"
              name="success.heroSubtitle"
              value={design.texts.success.heroSubtitle}
              multiline
            />
            <TextField
              label="Título del bloque Siguiente paso"
              name="success.nextStepTitle"
              value={design.texts.success.nextStepTitle}
            />
            <TextField
              label="Microcopy del bloque"
              name="success.nextStepMicrocopy"
              value={design.texts.success.nextStepMicrocopy}
              multiline
            />
            <TextField
              label="CTA principal"
              name="success.primaryCta"
              value={design.texts.success.primaryCta}
            />
          </section>
        </div>

        <div className="mt-6">
          <SubmitButton>Guardar textos</SubmitButton>
        </div>
      </form>

      <form
        action={updateDesignMediaAction}
        className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]"
      >
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Diseño &gt; Media
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
          Fondos principales
        </h2>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
              Home hero
            </h3>
            <SelectField
              label="Tipo"
              name="homeHeroMediaType"
              value={design.media.homeHeroMediaType}
            />
            <UrlField
              label="URL"
              name="homeHeroMediaUrl"
              value={design.media.homeHeroMediaUrl}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
              Hero general de /zonas
            </h3>
            <SelectField
              label="Tipo"
              name="zonesHeroMediaType"
              value={design.media.zonesHeroMediaType}
            />
            <UrlField
              label="URL"
              name="zonesHeroMediaUrl"
              value={design.media.zonesHeroMediaUrl}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
              Carrito vacío
            </h3>
            <UrlField
              label="Imagen fallback"
              name="cartEmptyImageUrl"
              value={design.media.cartEmptyImageUrl}
            />
          </section>
        </div>

        <div className="mt-6">
          <SubmitButton>Guardar media</SubmitButton>
        </div>
      </form>

      <form
        action={updateDesignZonesAction}
        className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]"
      >
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Diseño &gt; Zonas
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--foreground)]">
          Copy general de zonas
        </h2>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <TextField
            label="Título de /zonas"
            name="title"
            value={design.zones.title}
          />
          <TextField
            label="Título de la sección de zonas"
            name="sectionTitle"
            value={design.zones.sectionTitle}
          />
          <TextField
            label="Subtítulo de /zonas"
            name="subtitle"
            value={design.zones.subtitle}
            multiline
          />
          <TextField
            label="Microcopy general de cards"
            name="cardMicrocopy"
            value={design.zones.cardMicrocopy}
            multiline
          />
          <TextField
            label="CTA textual de card"
            name="cardCtaLabel"
            value={design.zones.cardCtaLabel}
          />
        </div>

        <div className="mt-6">
          <SubmitButton>Guardar zonas</SubmitButton>
        </div>
      </form>
    </section>
  );
}
