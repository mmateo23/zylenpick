import { AdminScoutCapture } from "@/components/admin/admin-scout-capture";
import { getAdminMapPlaceCategories } from "@/features/admin/services/map-place-categories-admin-service";
import { getMapPlaceCities } from "@/features/admin/services/map-places-admin-service";
import {
  getScoutVenueOptions,
  type ScoutCaptureType,
} from "@/features/admin/services/scout-admin-service";

export const metadata = {
  title: "Scout | Panel Pickyalo",
};

type AdminScoutPageProps = {
  searchParams?: { tipo?: string; venueId?: string };
};

export default async function AdminScoutPage({ searchParams }: AdminScoutPageProps) {
  const [cities, allCategories, venues] = await Promise.all([
    getMapPlaceCities(),
    getAdminMapPlaceCategories(),
    getScoutVenueOptions(),
  ]);
  const categories = allCategories.filter((category) => category.isActive);
  const initialType: ScoutCaptureType =
    searchParams?.tipo === "venue" || searchParams?.tipo === "product"
      ? searchParams.tipo
      : "place";

  return (
    <section className="space-y-6">
      <header className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#741314]/58">Pickyalo Scout</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#381932]">Captura lo que encuentres.</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[#381932]/62">
          Captura un punto, un local o un producto. Siempre quedará pendiente hasta que revises su ficha.
        </p>
      </header>

      {cities.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">
          Activa al menos una ciudad antes de usar Scout.
        </div>
      ) : (
        <AdminScoutCapture
          cities={cities}
          categories={categories}
          venues={venues}
          initialType={initialType}
          initialVenueId={searchParams?.venueId ?? ""}
        />
      )}
    </section>
  );
}
