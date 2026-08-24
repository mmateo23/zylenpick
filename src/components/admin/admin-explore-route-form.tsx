"use client";

import { Save } from "lucide-react";
import { useState } from "react";

import { AdminExploreMediaField } from "@/components/admin/admin-explore-media-field";
import type {
  AdminExploreRoute,
  AdminExploreSponsor,
  ExploreCityOption,
} from "@/features/admin/services/explore-admin-service";

type Props = {
  route: AdminExploreRoute | null;
  cities: ExploreCityOption[];
  sponsors: AdminExploreSponsor[];
  action: (formData: FormData) => void;
};

const fieldClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 py-3 text-sm text-[#381932] outline-none placeholder:text-[#381932]/38 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10";

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminExploreRouteForm({ route, cities, sponsors, action }: Props) {
  const [name, setName] = useState(route?.name ?? "");
  const [slug, setSlug] = useState(route?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(route?.slug));

  return (
    <form action={action} className="space-y-5 pb-24">
      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#741314]/58">Ruta</p>
        <h2 className="mt-2 text-xl font-semibold text-[#381932]">Identidad y publicación</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#381932]">
            Nombre
            <input
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (!slugTouched) setSlug(toSlug(event.target.value));
              }}
              autoCapitalize="words"
              required
              className={fieldClassName}
            />
          </label>
          <label className="text-sm font-semibold text-[#381932]">
            Slug
            <input
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(toSlug(event.target.value));
              }}
              required
              className={fieldClassName}
            />
          </label>
          <label className="text-sm font-semibold text-[#381932]">
            Ciudad
            <select name="cityId" defaultValue={route?.cityId ?? cities[0]?.id} required className={fieldClassName}>
              {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-[#381932]">
            Estado
            <select name="status" defaultValue={route?.status ?? "draft"} className={fieldClassName}>
              <option value="draft">Borrador</option>
              <option value="published">Publicada</option>
            </select>
            <span className="mt-2 block text-xs font-normal leading-5 text-[#381932]/58">Para publicar necesita portada, descripción, revisión y al menos una parada publicada.</span>
          </label>
          <label className="text-sm font-semibold text-[#381932] sm:col-span-2">
            Descripción
            <textarea name="description" defaultValue={route?.description} rows={4} className={fieldClassName} />
          </label>
        </div>
      </section>

      <AdminExploreMediaField
        name="coverImageUrl"
        label="Imagen de portada"
        description="Fotografía editorial que identifica la ruta. Se convierte a WebP antes de subirla."
        kind="photo"
        scopeId={route?.id ?? "draft-route"}
        initialUrl={route?.coverImageUrl}
      />

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-[#381932]">Contexto y créditos</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#381932]">
            Idiomas disponibles
            <input name="availableLanguages" defaultValue={route?.availableLanguages ?? "es"} required className={fieldClassName} />
            <span className="mt-2 block text-xs font-normal text-[#381932]/58">Códigos separados por coma: es, en.</span>
          </label>
          <label className="text-sm font-semibold text-[#381932]">
            Orden
            <input name="sortOrder" type="number" inputMode="numeric" min="0" defaultValue={route?.sortOrder ?? "100"} className={fieldClassName} />
          </label>
          <label className="text-sm font-semibold text-[#381932] sm:col-span-2">
            Patrocinador de la ruta
            <select name="sponsorId" defaultValue={route?.sponsorId ?? ""} className={fieldClassName}>
              <option value="">Sin patrocinador</option>
              {sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name}{sponsor.isActive ? "" : " · inactivo"}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-[#381932] sm:col-span-2">
            Créditos
            <textarea name="credits" defaultValue={route?.credits} rows={3} className={fieldClassName} placeholder="Fuentes, archivo fotográfico, colaboración..." />
          </label>
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-[#741314]/16 bg-[#FFF7E8]/95 p-3 shadow-[0_18px_55px_rgba(36,17,14,0.18)] backdrop-blur sm:inset-x-auto sm:right-6">
        <p className="hidden text-xs font-medium text-[#381932]/62 sm:block">Los cambios públicos respetan el estado de publicación.</p>
        <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8] sm:w-auto">
          <Save aria-hidden="true" className="h-4 w-4" /> Guardar ruta
        </button>
      </div>
    </form>
  );
}
