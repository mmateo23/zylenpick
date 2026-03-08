type HomeHeroProps = {
  activeLocation: string;
  activeCartVenueName: string;
  activeCartItemsCount: number;
};

export function HomeHero({
  activeLocation,
  activeCartVenueName,
  activeCartItemsCount,
}: HomeHeroProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
      <div className="overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-8 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
          Delivery premium para descubrir
        </p>
        <h1 className="mt-4 max-w-[12ch] text-4xl font-semibold leading-[1.02] text-[color:var(--foreground)] sm:text-5xl">
          Comida local que entra por los ojos
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
          Una home visual, moderna y comercial para explorar platos cercanos,
          comparar opciones y pedir sin friccion desde cualquier dispositivo.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-white">
            Recien hecho cerca de ti
          </span>
          <span className="rounded-full bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]">
            Tiempo estimado claro
          </span>
          <span className="rounded-full bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]">
            Un solo local por carrito
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-[2rem] bg-[color:var(--foreground)] p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
            Zona activa
          </p>
          <p className="mt-4 text-2xl font-semibold">{activeLocation}</p>
          <p className="mt-3 text-sm leading-6 text-white/72">
            Prioriza contenido visual y ofertas del area seleccionada para validar
            mejor el descubrimiento del MVP.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Carrito actual
          </p>
          <p className="mt-4 text-2xl font-semibold text-[color:var(--foreground)]">
            {activeCartVenueName}
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            {activeCartItemsCount} producto
            {activeCartItemsCount === 1 ? "" : "s"} listos para seguir comprando.
          </p>
        </div>
      </div>
    </section>
  );
}
