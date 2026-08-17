import Link from "next/link";

import { AdminMapPlaceCategories } from "@/components/admin/admin-map-place-categories";
import { getAdminMapPlaceCategories, saveMapPlaceCategoryAction } from "@/features/admin/services/map-place-categories-admin-service";

export default async function AdminMapPlaceCategoriesPage() {
  const categories = await getAdminMapPlaceCategories();

  return (
    <section className="space-y-6">
      <header>
        <Link href="/panel/lugares" className="text-sm font-semibold text-[#741314] underline underline-offset-4">Volver a lugares</Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#741314]/58">Mapa de descubrimiento</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#381932]">Categorías de lugares</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#381932]/62">Gestiona el nombre, el icono Lucide y el orden que usarán automáticamente los puntos del mapa.</p>
      </header>
      <AdminMapPlaceCategories categories={categories} action={saveMapPlaceCategoryAction} />
    </section>
  );
}
