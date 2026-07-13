import Link from "next/link";

import { JoinForm } from "@/components/join/join-form";
import { SiteShell } from "@/components/layout/site-shell";

const promiseChips = [
  "Productos destacados",
  "Recogida local",
  "Alta acompañada",
];

export default function JoinPage() {
  return (
    <SiteShell
      wideContent
      showBasicFooter={false}
      className="bg-[#FFF7E8] text-[#24110E]"
    >
      <main className="min-h-[calc(100svh-5rem)] bg-[#FFF7E8] px-5 py-8 text-[#24110E] sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <section className="rounded-[2.2rem] border border-[#741314]/12 bg-[#FDE3AD] px-6 py-8 text-[#24110E] shadow-[var(--shadow-soft)] sm:px-8 sm:py-10 lg:sticky lg:top-28">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#741314]">
            Para locales
          </p>
          <h1 className="mt-5 max-w-[10ch] text-balance text-5xl font-semibold leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-[5.3rem]">
            Que tu selección entre por los ojos.
          </h1>
          <p className="mt-6 max-w-[34rem] text-base font-medium leading-8 text-[#24110E]/72 sm:text-lg">
            Pickyalo convierte tus productos y platos destacados en una ficha
            visual para que la gente los descubra, decida rápido y pase a
            recoger.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {promiseChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#741314]/14 bg-[#FFF7E8]/72 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#741314]"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#solicitud"
              className="inline-flex justify-center rounded-full border border-[#741314] bg-[#741314] px-6 py-3.5 text-sm font-bold text-[#FDE3AD] shadow-[0_16px_36px_rgba(116,19,20,0.16)] transition hover:bg-[#5F0F10]"
            >
              Empezar
            </Link>
            <Link
              href="/platos"
              className="inline-flex justify-center rounded-full border border-[#741314]/18 bg-[#FFF7E8]/72 px-6 py-3.5 text-sm font-bold text-[#741314] transition hover:bg-[#FFF7E8]"
            >
              Ver selección
            </Link>
          </div>
        </section>

        <section id="solicitud" className="scroll-mt-28">
          <JoinForm />
        </section>
        </div>
      </main>
    </SiteShell>
  );
}
