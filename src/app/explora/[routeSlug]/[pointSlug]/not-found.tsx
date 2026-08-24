import { MapPinOff } from "lucide-react";
import Link from "next/link";

export default function ExploreNotFound() {
  return (
    <main className="public-light-theme flex min-h-screen items-center justify-center bg-[#FFF7E8] px-5 py-12 text-[#24110E]">
      <section className="w-full max-w-lg border-y border-[#741314]/18 py-10 text-center">
        <MapPinOff aria-hidden="true" className="mx-auto h-8 w-8 text-[#741314]" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#741314]/60">Pickyalo Explora</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-[#741314]">Esta parada no está disponible.</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#24110E]/70">El código puede no ser válido o la experiencia puede estar temporalmente sin publicar.</p>
        <Link href="/mapa" className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]">Explorar el mapa</Link>
      </section>
    </main>
  );
}
