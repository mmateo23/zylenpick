import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";

export const metadata: Metadata = {
  title: "Política de privacidad | Pickyalo",
  description:
    "Información básica sobre privacidad y analítica en Pickyalo.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFF7F8] text-[#381932]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-28 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C26157]">
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          Política de privacidad
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-[#381932]/78">
          <p>
            Pickyalo trata la información necesaria para que puedas explorar
            productos y platos destacados de locales cercanos y preparar una
            recogida en local.
          </p>
          <p>
            Para analítica interna usamos PostHog y Google Analytics únicamente
            si aceptas la analítica. La base jurídica de ese tratamiento es tu
            consentimiento.
          </p>
          <p>
            Los eventos propios configurados en PostHog son: local visto, plato
            o producto visto, añadido a cesta y pedido confirmado. Google
            Analytics se utiliza para medición agregada de navegación.
          </p>
          <p>
            No enviamos a PostHog ni a Google Analytics nombre, email,
            teléfono, dirección, notas, contenido de formularios, tokens ni
            datos de pago.
          </p>
          <p>
            Puedes rechazar o retirar tu consentimiento desde el banner o el
            botón de preferencias de cookies. Al retirar el consentimiento, se
            bloquean futuras capturas de PostHog y Google Analytics. Más detalle
            en la{" "}
            <Link
              href="/cookies"
              className="font-semibold text-[#C26157] underline-offset-4 hover:underline"
            >
              política de cookies
            </Link>
            .
          </p>
        </div>
      </main>
      <ZylenPickFooter />
    </div>
  );
}
