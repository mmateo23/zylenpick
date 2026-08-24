import { AdminExploreMediaField } from "@/components/admin/admin-explore-media-field";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  getAdminExploreSponsors,
  saveExploreSponsorAction,
} from "@/features/admin/services/explore-admin-service";

const fieldClassName = "mt-2 min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 py-3 text-sm text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10";

function SponsorFields({ id, name = "", logoUrl = "", shortMessage = "", linkUrl = "", startsAt = "", endsAt = "", isActive = true }: { id?: string; name?: string; logoUrl?: string; shortMessage?: string; linkUrl?: string; startsAt?: string; endsAt?: string; isActive?: boolean }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[#381932]">Nombre<input name="name" defaultValue={name} required className={fieldClassName} /></label>
        <label className="text-sm font-semibold text-[#381932]">Enlace<input name="linkUrl" type="url" inputMode="url" defaultValue={linkUrl} className={fieldClassName} /></label>
        <label className="text-sm font-semibold text-[#381932] sm:col-span-2">Mensaje corto<input name="shortMessage" defaultValue={shortMessage} maxLength={280} className={fieldClassName} /></label>
        <label className="text-sm font-semibold text-[#381932]">Desde<input name="startsAt" type="datetime-local" defaultValue={startsAt} className={fieldClassName} /></label>
        <label className="text-sm font-semibold text-[#381932]">Hasta<input name="endsAt" type="datetime-local" defaultValue={endsAt} className={fieldClassName} /></label>
      </div>
      <div className="mt-4"><AdminExploreMediaField name="logoUrl" label="Logotipo" description="PNG, JPEG o WebP. Se muestra discretamente al final del relato." kind="logo" scopeId={id ?? "draft-sponsor"} initialUrl={logoUrl} /></div>
      <label className="mt-4 flex min-h-11 items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 text-sm font-semibold text-[#381932]"><input name="isActive" type="checkbox" defaultChecked={isActive} className="h-5 w-5 accent-[#741314]" />Patrocinador activo</label>
    </>
  );
}

export default async function ExploreSponsorsPage() {
  const sponsors = await getAdminExploreSponsors();
  return (
    <section className="space-y-5">
      <AdminPageHeader eyebrow="Pickyalo Explora" title="Patrocinadores" description="Entidades opcionales que pueden acompañar una ruta o una parada durante un periodo concreto." />
      <details className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <summary className="cursor-pointer text-lg font-semibold text-[#381932]">Añadir patrocinador</summary>
        <form action={saveExploreSponsorAction.bind(null, null)} className="mt-5 border-t border-[#741314]/10 pt-5"><SponsorFields /><button className="mt-5 min-h-11 rounded-xl bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]">Guardar patrocinador</button></form>
      </details>
      <div className="space-y-3">
        {sponsors.map((sponsor) => (
          <details key={sponsor.id} className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
            <summary className="flex cursor-pointer items-center justify-between gap-4"><span className="font-semibold text-[#381932]">{sponsor.name}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${sponsor.isActive ? "bg-emerald-100 text-emerald-800" : "bg-[#741314]/[0.06] text-[#741314]/60"}`}>{sponsor.isActive ? "Activo" : "Inactivo"}</span></summary>
            <form action={saveExploreSponsorAction.bind(null, sponsor.id)} className="mt-5 border-t border-[#741314]/10 pt-5"><SponsorFields id={sponsor.id} name={sponsor.name} logoUrl={sponsor.logoUrl} shortMessage={sponsor.shortMessage} linkUrl={sponsor.linkUrl} startsAt={sponsor.startsAt} endsAt={sponsor.endsAt} isActive={sponsor.isActive} /><button className="mt-5 min-h-11 rounded-xl bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]">Guardar cambios</button></form>
          </details>
        ))}
      </div>
    </section>
  );
}
