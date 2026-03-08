import { JoinForm } from "@/components/join/join-form";
import { SiteShell } from "@/components/layout/site-shell";

const benefits = [
  "Recibe pedidos con una experiencia clara y centrada en recogida local.",
  "Mejora tu presencia online con una ficha visual y una carta limpia.",
  "Capta clientes de tu zona sin depender de un panel complejo desde el primer día.",
];

export default function JoinPage() {
  return (
    <SiteShell>
      <section className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <section
            className="editorial-card overflow-hidden rounded-[2.4rem] border border-white/10 px-7 py-8 text-white shadow-[var(--shadow)] sm:px-8 sm:py-10"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(10, 13, 12, 0.28), rgba(10, 13, 12, 0.84)), url('https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/64">
              Únete a ZylenPick
            </p>
            <h1 className="mt-5 max-w-[12ch] text-balance text-5xl font-semibold leading-[0.92] sm:text-6xl">
              Lleva tu local a una experiencia más simple y visual.
            </h1>
            <p className="mt-6 max-w-[42ch] text-lg leading-8 text-white/80">
              Una propuesta pensada para negocios que quieren recibir pedidos de
              forma clara, moderna y alineada con su marca.
            </p>
          </section>

          <section className="glass-panel rounded-[2rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)] sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--brand)]">
              Por qué unirte
            </p>
            <div className="mt-6 grid gap-4">
              {benefits.map((benefit, index) => (
                <article
                  key={benefit}
                  className="rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-soft)] text-sm font-semibold text-[color:var(--accent)]">
                      0{index + 1}
                    </span>
                    <p className="text-sm leading-7 text-[color:var(--muted-strong)]">
                      {benefit}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <JoinForm />
      </section>
    </SiteShell>
  );
}
