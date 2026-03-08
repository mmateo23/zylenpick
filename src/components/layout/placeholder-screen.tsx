import { SiteShell } from "@/components/layout/site-shell";

type PlaceholderScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderScreen({
  eyebrow,
  title,
  description,
}: PlaceholderScreenProps) {
  return (
    <SiteShell>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_20rem]">
        <div className="rounded-[2rem] border border-[color:var(--border)] bg-white/88 p-8 shadow-[var(--soft-shadow)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[color:var(--brand)]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-[14ch] text-4xl font-semibold leading-tight text-[color:var(--foreground)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-base leading-7 text-[color:var(--muted)]">
            {description}
          </p>
        </div>

        <div className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            Pantalla preparada
          </p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            Base visual lista para conectar datos reales en la siguiente fase.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
