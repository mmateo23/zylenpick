import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";

export const metadata: Metadata = {
  title: "Política de cookies | Pickyalo",
  description:
    "Información sobre cookies y analítica en Pickyalo.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#FFF7F8] text-[#381932]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-28 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C26157]">
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          Política de cookies
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-[#381932]/78">
          <p>
            Pickyalo utiliza herramientas de analítica solo si aceptas
            expresamente las cookies de analítica. Hasta ese momento no se
            carga Google Analytics y PostHog no se inicializa ni captura
            eventos.
          </p>
          <p>
            Las herramientas utilizadas son PostHog y Google Analytics. La
            finalidad es analítica interna y mejora de producto: entender el uso
            general de la web, locales vistos, productos o platos vistos,
            añadidos a cesta y pedidos confirmados.
          </p>
          <p>
            La base jurídica es tu consentimiento. Puedes rechazar la analítica
            o cambiar tus preferencias desde el botón “Cambiar preferencias de
            cookies” visible en la web.
          </p>
          <p>
            PostHog está configurado con autocaptura desactivada, grabación de
            sesión desactivada, heatmaps desactivados y enmascarado de textos y
            atributos. Google Analytics solo se carga tras aceptar analítica.
          </p>
          <p>
            No enviamos nombre, email, teléfono, dirección, notas, contenido de
            formularios, tokens ni datos de pago a estas herramientas.
          </p>
          <p>
            Para más información sobre el tratamiento de datos, consulta la{" "}
            <Link
              href="/privacidad"
              className="font-semibold text-[#C26157] underline-offset-4 hover:underline"
            >
              política de privacidad
            </Link>
            .
          </p>
        </div>
      </main>
      <ZylenPickFooter />
    </div>
  );
}
