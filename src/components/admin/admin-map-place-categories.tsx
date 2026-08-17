"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import type { MapPlaceCategoryDefinition } from "@/features/map-places/categories";
import { MapPlaceIcon, mapPlaceIconOptions } from "@/features/map-places/icons";

type Props = {
  categories: MapPlaceCategoryDefinition[];
  action: (formData: FormData) => void;
};

const fieldClass = "mt-2 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 py-3 text-sm text-[#381932] outline-none focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function AdminMapPlaceCategories({ categories, action }: Props) {
  const [editing, setEditing] = useState<MapPlaceCategoryDefinition | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [iconName, setIconName] = useState("MapPin");
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(
    () => mapPlaceIconOptions.filter((icon) => icon.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  function openCategory(category?: MapPlaceCategoryDefinition) {
    setEditing(category ?? null);
    setCreating(!category);
    setName(category?.label ?? "");
    setSlug(category?.value ?? "");
    setIconName(category?.iconName ?? "MapPin");
    setSearch("");
  }

  const formOpen = creating || editing;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <section className="overflow-hidden rounded-2xl border border-[#741314]/12 bg-[#FFF7E8]">
        <div className="flex items-center justify-between gap-3 border-b border-[#741314]/10 p-4 sm:p-5">
          <div>
            <h2 className="font-semibold text-[#381932]">Categorías de lugares</h2>
            <p className="mt-1 text-xs text-[#381932]/58">El icono se aplica automáticamente a todos sus puntos.</p>
          </div>
          <button type="button" onClick={() => openCategory()} className="inline-flex items-center gap-2 rounded-full bg-[#741314] px-4 py-2.5 text-sm font-bold text-[#FFF7E8]">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nueva
          </button>
        </div>
        <div className="divide-y divide-[#741314]/10">
          {categories.map((category) => (
            <button key={category.value} type="button" onClick={() => openCategory(category)} className="grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 p-4 text-left transition hover:bg-white/70 sm:px-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#741314] text-[#FFF7E8]"><MapPlaceIcon name={category.iconName} className="h-5 w-5" /></span>
              <span className="min-w-0"><strong className="block truncate text-sm text-[#381932]">{category.label}</strong><span className="mt-1 block truncate text-xs text-[#381932]/55">{category.value} · {category.iconName} · orden {category.sortOrder}</span></span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${category.isActive ? "bg-emerald-100 text-emerald-800" : "bg-[#381932]/10 text-[#381932]/55"}`}>{category.isActive ? "Activa" : "Inactiva"}</span>
            </button>
          ))}
        </div>
      </section>

      {formOpen ? (
        <form action={action} className="h-fit rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 xl:sticky xl:top-5">
          <input type="hidden" name="originalSlug" value={editing?.value ?? ""} />
          <input type="hidden" name="iconName" value={iconName} />
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#741314] text-[#FFF7E8]"><MapPlaceIcon name={iconName} className="h-6 w-6" /></span><div><h2 className="font-semibold text-[#381932]">{editing ? "Editar categoría" : "Nueva categoría"}</h2><p className="text-xs text-[#381932]/55">Icono seleccionado: {iconName}</p></div></div>
          <label className="mt-5 block text-sm font-semibold text-[#381932]">Nombre<input name="name" value={name} onChange={(event) => { setName(event.target.value); if (!editing) setSlug(slugify(event.target.value)); }} required maxLength={80} className={fieldClass} /></label>
          <label className="mt-4 block text-sm font-semibold text-[#381932]">Slug<input name="slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} required className={fieldClass} /></label>
          <label className="mt-4 block text-sm font-semibold text-[#381932]">Orden<input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 100} className={fieldClass} /></label>
          <label className="mt-4 flex items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 py-3 text-sm font-semibold text-[#381932]"><input name="isActive" type="checkbox" defaultChecked={editing?.isActive ?? true} className="h-4 w-4 accent-[#741314]" /> Activa</label>
          <div className="mt-5 border-t border-[#741314]/10 pt-5">
            <label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#741314]/50" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar icono" className="w-full rounded-xl border border-[#741314]/16 bg-white py-3 pl-10 pr-3 text-sm text-[#381932] outline-none focus:border-[#741314]" /></label>
            <div className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto" aria-label="Iconos Lucide disponibles">
              {filteredIcons.map((icon) => <button key={icon} type="button" onClick={() => setIconName(icon)} title={icon} aria-pressed={iconName === icon} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-[10px] ${iconName === icon ? "border-[#741314] bg-[#741314] text-[#FFF7E8]" : "border-[#741314]/12 bg-white text-[#381932]"}`}><MapPlaceIcon name={icon} className="h-5 w-5" /><span className="w-full truncate text-center">{icon}</span></button>)}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => { setCreating(false); setEditing(null); }} className="rounded-full border border-[#741314]/18 px-4 py-3 text-sm font-bold text-[#741314]">Cancelar</button><button type="submit" className="rounded-full bg-[#741314] px-4 py-3 text-sm font-bold text-[#FFF7E8]">Guardar</button></div>
        </form>
      ) : <aside className="h-fit rounded-2xl border border-dashed border-[#741314]/20 bg-[#FFF7E8]/60 p-6 text-sm leading-6 text-[#381932]/58">Selecciona una categoría para editarla o crea una nueva.</aside>}
    </div>
  );
}
