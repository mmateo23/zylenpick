import Link from "next/link";

type HomeHeaderProps = {
  favoritesCount: number;
  cartItemsCount: number;
};

export function HomeHeader({
  favoritesCount,
  cartItemsCount,
}: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--surface)]/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--foreground)] text-sm font-bold tracking-[0.16em] text-white">
            FK
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
              FknFood
            </p>
            <p className="text-xs text-[color:var(--muted)]">
              Descubre comida local
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/acceder"
            className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Acceso
          </Link>
          <Link
            href="/favoritos"
            className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
          >
            Favoritos
            <span className="ml-2 rounded-full bg-[color:var(--surface-strong)] px-2 py-1 text-xs text-[color:var(--muted)]">
              {favoritesCount}
            </span>
          </Link>
          <Link
            href="/carrito"
            className="rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
          >
            Carrito
            <span className="ml-2 rounded-full bg-white/14 px-2 py-1 text-xs text-white">
              {cartItemsCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
