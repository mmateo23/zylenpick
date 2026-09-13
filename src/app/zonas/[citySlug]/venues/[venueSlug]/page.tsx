import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock3, MapPin, Phone, Store, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PlatoHashViewTracker } from "@/components/analytics/plato-hash-view-tracker";
import { VenueViewTracker } from "@/components/analytics/venue-view-tracker";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import { CityPreferenceSync } from "@/components/location/city-preference-sync";
import { VenueLocalStructuredData } from "@/components/seo/local-seo-structured-data";
import { MenuItemGalleryCard } from "@/components/venues/menu-item-gallery-card";
import { VenueLocalInformation } from "@/components/venues/venue-local-information";
import { VenueOpeningHours } from "@/components/venues/venue-opening-hours";
import { VenueOpeningStatusBadge } from "@/components/venues/venue-opening-status-badge";
import { VerifiedVenueBadge } from "@/components/venues/verified-venue-badge";
import { VenueCartSummary } from "@/features/cart/components/venue-cart-summary";
import { getVenueOpeningStatus } from "@/features/venues/opening-hours";
import { getVenueDetails } from "@/features/venues/services/venues-service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBaseMetadata } from "@/lib/seo";

import styles from "@/components/venues/venue-profile.module.css";

export const revalidate = 1800;

type VenuePageProps = {
  params: {
    citySlug: string;
    venueSlug: string;
  };
};

export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const venue = await getVenueDetails(params.citySlug, params.venueSlug);
  if (!venue) {
    return getBaseMetadata({
      title: "Local cercano",
      description:
        "Descubre qué prepara este local, consulta cuándo abre y encuentra cómo llegar para recoger.",
      path: `/zonas/${params.citySlug}/venues/${params.venueSlug}`,
    });
  }

  return getBaseMetadata({
    title: `${venue.name} en ${venue.city.name}: qué probar y cómo recoger`,
    description: `Descubre qué prepara ${venue.name}, consulta su horario y encuentra cómo llegar para recoger en ${venue.city.name}.`,
    path: `/zonas/${venue.city.slug}/venues/${venue.slug}`,
    image: venue.coverUrl ?? venue.logoUrl ?? "/icons/pickyalo-app.svg?v=1",
  });
}

export default async function VenuePage({ params }: VenuePageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <div className={`public-light-theme ${styles.page}`}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
          <section className="rounded-[1.8rem] border border-dashed border-accent/45 bg-surface-muted p-8 shadow-[var(--soft-shadow)] ring-1 ring-accent-soft backdrop-blur-xl">
            <p className="text-lg font-semibold text-text-primary">
              Supabase no está configurado.
            </p>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Esta ruta necesita acceso a Supabase para mostrar el local y su
              menú.
            </p>
          </section>
        </main>
      </div>
    );
  }

  const venue = await getVenueDetails(params.citySlug, params.venueSlug);

  if (!venue) {
    notFound();
  }

  const openingStatus = getVenueOpeningStatus(venue.openingHours, venue.manualOpenStatus);

  const menuCategoryCounts = venue.menuItems.reduce<Record<string, number>>(
    (accumulator, item) => {
      const key = item.categoryName ?? "Otros";
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    },
    {},
  );
  const menuCategories = Object.entries(menuCategoryCounts);
  const totalMenuItems = venue.menuItems.length;

  const cartVenue = {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    citySlug: venue.city.slug,
    cityName: venue.city.name,
    address: venue.address,
    coverUrl: venue.coverUrl,
    email: venue.email,
    phone: venue.phone,
    pickupEtaMin: venue.pickupEtaMin,
    pricesVisible: venue.pricesVisible,
  };
  return (
    <div className={`public-light-theme ${styles.page}`}>
      <SiteHeader />
      <CityPreferenceSync
        city={{ slug: venue.city.slug, name: venue.city.name }}
      />
      <VenueLocalStructuredData venue={venue} />
      <VenueViewTracker
        citySlug={venue.city.slug}
        cityName={venue.city.name}
        venueId={venue.id}
        venueSlug={venue.slug}
        venueName={venue.name}
      />
      <PlatoHashViewTracker
        citySlug={venue.city.slug}
        venueId={venue.id}
        venueSlug={venue.slug}
        venueName={venue.name}
        pricesVisible={venue.pricesVisible}
        items={venue.menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          priceAmount: item.priceAmount,
          currency: item.currency,
          priceDisplayMode: item.priceDisplayMode,
          priceDisplayText: item.priceDisplayText,
          categoryName: item.categoryName,
        }))}
      />

      <main className={styles.shell}>
        <Link href={`/zonas/${venue.city.slug}`} className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" /> Locales de {venue.city.name}
        </Link>

        <section className={styles.hero} aria-labelledby="venue-name">
          <div className={styles.cover}>
            {venue.coverUrl || venue.menuItems[0]?.imageUrl ? <Image
              src={venue.coverUrl ?? venue.menuItems[0].imageUrl!}
              alt={venue.coverUrl ? venue.name : venue.menuItems[0].name}
              fill priority sizes="(max-width: 760px) 100vw, 590px"
            /> : <div className={styles.coverFallback}><Store size={64} aria-hidden="true" /></div>}
          </div>
          <div className={styles.identity}>
            <div className={styles.identityTop}>
              {venue.logoUrl ? <Image src={venue.logoUrl} alt={`Logo de ${venue.name}`} width={60} height={60} className={styles.logo} /> : null}
              <VenueOpeningStatusBadge openingHours={venue.openingHours} initialStatus={openingStatus} />
            </div>
            <p className={styles.eyebrow}>{venue.city.name}</p>
            <h1 id="venue-name">{venue.name}</h1>
            <div className={styles.meta}>
              <span><Utensils size={15} aria-hidden="true" /> Para recoger</span>
              {venue.pickupEtaMin ? <span><Clock3 size={15} aria-hidden="true" /> Unos {venue.pickupEtaMin} min</span> : null}
            </div>
            <div className="mt-4">
              <VerifiedVenueBadge isVerified={venue.isVerified} subscriptionActive={venue.subscriptionActive} withLabel />
            </div>
            <div className={styles.actions}>
              <a href="#seleccion" className={styles.primary}>Ver platos <ArrowRight size={17} aria-hidden="true" /></a>
              {venue.phone ? <a href={`tel:${venue.phone}`} className={styles.secondary}><Phone size={16} aria-hidden="true" /> Llamar</a> : null}
            </div>
            <a href="#informacion" className={styles.textLink}><MapPin size={15} aria-hidden="true" /> Cómo llegar y horarios</a>
          </div>
        </section>

        <div className={styles.layout}>
          <section id="seleccion" className={styles.menu} aria-labelledby="venue-selection-title">
            <div className={styles.sectionHeading}>
              <div><p className={styles.eyebrow}>Elige tu próximo bocado</p><h2 id="venue-selection-title">La carta.</h2></div>
              <p className={styles.count}>{totalMenuItems} {totalMenuItems === 1 ? "plato" : "platos"}</p>
            </div>
            {menuCategories.length > 1 ? <nav className={styles.categories} aria-label="Categorías de la carta">
              {menuCategories.map(([name, count]) => <a key={name} href={`#plato-${venue.menuItems.find(item => (item.categoryName ?? "Otros") === name)?.id}`}>
                {name} <small>{count}</small>
              </a>)}
            </nav> : null}
            {venue.menuItems.length ? <div className={styles.dishGrid}>
              {venue.menuItems.map(item => <MenuItemGalleryCard
                key={item.id} item={item} venue={cartVenue} anchorId={`plato-${item.id}`}
                variant="venueCompact" labels={{ viewDetail: "Detalles y alérgenos", addForPickup: "Añadir" }}
              />)}
            </div> : <p className={styles.empty}>Estamos preparando la carta de este local. Mientras tanto, puedes consultar su información y contactar directamente.</p>}
            {venue.pricesVisible ? <VenueCartSummary venueId={venue.id} /> : null}
          </section>

          <aside className={styles.sidebar} aria-label="Información del comercio">
            <VenueLocalInformation
              venueSlug={venue.slug} venueName={venue.name} cityName={venue.city.name}
              address={venue.address} phone={venue.phone} email={venue.email} website={venue.website}
              pickupNotes={venue.pickupNotes} pickupEtaMin={venue.pickupEtaMin}
              latitude={venue.latitude} longitude={venue.longitude}
            />
            <VenueOpeningHours openingHours={venue.openingHours} openingStatus={openingStatus} />
            {venue.description ? <section className={styles.about}>
              <p className={styles.eyebrow}>Detrás del mostrador</p>
              <h2>Conoce {venue.name}</h2>
              <p>{venue.description}</p>
            </section> : null}
          </aside>
        </div>
      </main>
      <ZylenPickFooter theme="light" />
    </div>
  );
}
