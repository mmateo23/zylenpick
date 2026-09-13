import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Map, MapPin } from "lucide-react";

import { HomeCampaignCta } from "@/components/home/home-campaign-cta";
import { FoodMarquee } from "@/components/home/food-marquee";
import { HotPlateIcon } from "@/components/icons/pickyalo";
import { SiteHeader } from "@/components/layout/site-header";
import { ZylenPickFooter } from "@/components/layout/zylenpick-footer";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/magicui/scroll-based-velocity";
import type { City } from "@/features/cities/types";
import type { SiteChip } from "@/features/chips/types";
import { curationOptions, getFilteredItems } from "@/features/chips/dish-curation";
import type { SiteDesignConfig } from "@/features/design/site-design-config";
import type { PublicExploreMapEntry } from "@/features/explore/types";
import { getPricePresentation } from "@/features/pricing/price-display";
import type { HomeShowcaseItem } from "@/features/venues/types";

import styles from "./pickyalo-home.module.css";

type PickyaloHomeProps = {
  cities: City[];
  heroImageUrl: string;
  mapFeatureImageUrl?: string;
  exploreFeature?: PublicExploreMapEntry | null;
  design?: SiteDesignConfig;
  featuredItems: HomeShowcaseItem[];
  latestItems: HomeShowcaseItem[];
  chips?: SiteChip[];
};

function getProductHref(item: HomeShowcaseItem) {
  return `/platos?post=${encodeURIComponent(item.id)}`;
}

function getPriceLabel(item: HomeShowcaseItem) {
  return getPricePresentation({
    priceAmount: item.priceAmount,
    currency: item.currency,
    priceDisplayMode: item.priceDisplayMode,
    priceDisplayText: item.priceDisplayText,
    pricesVisible: item.venue.pricesVisible,
  }).label;
}

function getUniqueVisualItems(
  featuredItems: HomeShowcaseItem[],
  latestItems: HomeShowcaseItem[],
) {
  return [...featuredItems, ...latestItems].filter((item, index, items) => {
    return (
      Boolean(item.imageUrl) &&
      items.findIndex((candidate) => candidate.id === item.id) === index
    );
  });
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function ProductPost({
  item,
  index,
}: {
  item: HomeShowcaseItem;
  index: number;
}) {
  return (
    <Link
      href={getProductHref(item)}
      className={`${styles.productPost} ${styles.marqueePost}`}
      aria-label={`Ver ${item.name} de ${item.venue.name}`}
    >
      <span className={styles.productMedia}>
        <Image
          src={item.imageUrl ?? ""}
          alt={item.name}
          fill
          sizes="(max-width: 699px) 46vw, (max-width: 1199px) 28vw, 330px"
          className={styles.productImage}
        />
      </span>
      <span className={styles.productInfo}>
        <span>
          <small>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.categoryName ?? "Selección local"}
          </small>
          <strong>{item.name}</strong>
          <span>{item.venue.name}</span>
        </span>
        <span className={styles.productPrice}>{getPriceLabel(item)}</span>
      </span>
    </Link>
  );
}

export function PickyaloHome({
  cities,
  heroImageUrl,
  mapFeatureImageUrl = "/home/zonas/badges/talavera_tile_mural.png",
  exploreFeature = null,
  design,
  featuredItems,
  latestItems,
  chips = [],
}: PickyaloHomeProps) {
  const visualItems = getUniqueVisualItems(featuredItems, latestItems);
  const availableItemIds = new Set(visualItems.map((item) => item.id));
  const editorialChips = curationOptions
    .filter((option) => ["raciones", "tapas", "quienNoApolla", "mojarPan", "bocatas", "recommended"].includes(option.id))
    .filter((option) => getFilteredItems(visualItems, option.id, "all", null, "").length > 0)
    .map((option) => ({
      id: `editorial-${option.id}`,
      name: option.label,
      href: `/platos?${new URLSearchParams({ filter: option.id })}#platos-feed`,
    }));
  const homeChips = [
    ...chips
      .filter((chip) => chip.itemIds.some((id) => availableItemIds.has(id)))
      .map((chip) => ({
        id: chip.id,
        name: chip.name,
        href: `/platos?${new URLSearchParams({ chip: chip.slug })}#platos-feed`,
      })),
    ...editorialChips,
  ].slice(0, 6);
  const heroDish =
    visualItems.find((item) => {
      const itemName = normalizeSearchText(item.name);
      const venueName = normalizeSearchText(item.venue.name);

      return itemName.includes("croqueta") && venueName.includes("dados");
    }) ??
    visualItems.find((item) =>
      normalizeSearchText(item.name).includes("croqueta"),
    ) ??
    visualItems.find((item) => item.isHomeFeatured || item.isFeatured) ??
    visualItems[0] ??
    null;
  const selectionItems = visualItems
    .filter((item) => item.id !== heroDish?.id)
    .slice(0, 9);
  const talavera =
    cities.find((city) => city.slug === "talavera-de-la-reina") ?? cities[0] ?? null;
  const zoneHref = talavera ? `/zonas/${talavera.slug}` : "/zonas";
  const storyHref = exploreFeature
    ? `/explora/${exploreFeature.routeSlug}/${exploreFeature.pointSlug}?unlock=${exploreFeature.publicToken}`
    : "/mapa?localizar=1";
  const cityImage = exploreFeature?.imageUrl ?? mapFeatureImageUrl;
  const cityTitle = exploreFeature?.pointTitle ?? "Talavera, más cerca";

  return (
    <div className={styles.page}>
      <SiteHeader />

      <main>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroHeading}>
            <p>Pickyalo · Talavera de la Reina</p>
            <h1 id="home-title">Pide con los ojos.</h1>
          </div>

          <div className={styles.postScene}>
            <Image
              src="/home/hero/croquetas_hover_burst_transparent.png"
              alt=""
              width={560}
              height={560}
              sizes="(max-width: 699px) 190px, 320px"
              className={`${styles.foodAsset} ${styles.croquetasAsset}`}
              aria-hidden="true"
            />
            <Image
              src="/home/hero/jamon_iberico_hover_burst_transparent.png"
              alt=""
              width={340}
              height={340}
              sizes="(max-width: 699px) 130px, 220px"
              className={`${styles.foodAsset} ${styles.jamonAsset}`}
              aria-hidden="true"
            />
            <Image
              src="/home/hero/boletus_hover_burst_transparent.png"
              alt=""
              width={300}
              height={300}
              sizes="(max-width: 699px) 120px, 190px"
              className={`${styles.foodAsset} ${styles.boletusAsset}`}
              aria-hidden="true"
            />

            {heroDish ? (
              <Link
                href={getProductHref(heroDish)}
                className={styles.heroPost}
                aria-label={`Ver ${heroDish.name} de ${heroDish.venue.name}`}
              >
                <span className={styles.postHeader}>
                  <span className={styles.venueAvatar}>
                    {heroDish.venue.logoUrl ? (
                      <Image
                        src={heroDish.venue.logoUrl}
                        alt=""
                        fill
                        sizes="44px"
                        className={styles.venueLogo}
                      />
                    ) : (
                      <span>{heroDish.venue.name.trim().slice(0, 1)}</span>
                    )}
                  </span>
                  <span className={styles.venueIdentity}>
                    <strong>{heroDish.venue.name}</strong>
                    <small>{heroDish.venue.cityName}</small>
                  </span>
                  <ArrowRight size={20} aria-hidden="true" />
                </span>

                <span className={styles.postMedia}>
                  <Image
                    src={heroDish.imageUrl ?? heroImageUrl}
                    alt={heroDish.name}
                    fill
                    priority
                    sizes="(max-width: 699px) 340px, 390px"
                    className={styles.postImage}
                  />
                </span>

                <span className={styles.postBody}>
                  <small>{heroDish.categoryName ?? "Selección local"}</small>
                  <span className={styles.postTitleRow}>
                    <strong>{heroDish.name}</strong>
                    <span>{getPriceLabel(heroDish)}</span>
                  </span>
                  <span className={styles.postPickup}>
                    {heroDish.pickupEtaMin
                      ? `Listo en ${heroDish.pickupEtaMin} min`
                      : "Para recoger cerca"}
                  </span>
                </span>
              </Link>
            ) : (
              <Link href="/platos" className={styles.heroFallback}>
                <Image
                  src={heroImageUrl}
                  alt="Selección gastronómica de Pickyalo"
                  fill
                  priority
                  sizes="(max-width: 699px) 340px, 390px"
                />
                <span>Ver platos</span>
              </Link>
            )}

            <Image
              src="/home/hero/pickyalo-sticker.png"
              alt=""
              width={1024}
              height={1535}
              sizes="(max-width: 699px) 80px, 118px"
              className={styles.postSticker}
              aria-hidden="true"
            />
          </div>

          <div className={styles.heroActions} aria-label="Empieza a descubrir">
            <Link href="/platos" className={styles.foodAction}>
              <HotPlateIcon size={21} strokeWidth={2.2} aria-hidden="true" />
              <span>Ver platos</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <Link href="/mapa?localizar=1" className={styles.mapAction}>
              <Compass
                size={32}
                strokeWidth={1.8}
                className={styles.mapActionAsset}
                aria-hidden="true"
              />
              <span>Explorar la ciudad</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {design?.texts.homeCampaign.enabled ? (
          <section className={styles.campaign} aria-label="Evento destacado">
            <HomeCampaignCta
              campaign={design.texts.homeCampaign}
              feature
              featureAssetUrl={
                design.texts.homeCampaign.featureImageEnabled
                  ? design.texts.homeCampaign.featureImageUrl
                  : undefined
              }
            />
          </section>
        ) : null}

        {selectionItems.length ? (
          <section className={styles.selection} aria-labelledby="selection-title">
            <header className={styles.sectionHeader}>
              <div>
                <p>Ahora mismo</p>
                <h2 id="selection-title">Para elegir con los ojos.</h2>
              </div>
              <Link href="/platos">
                Ver todos <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </header>

            {homeChips.length > 0 ? (
              <nav className={styles.selectionChips} aria-label="Selecciones de platos">
                {homeChips.map((chip) => (
                  <Link
                    key={chip.id}
                    href={chip.href}
                    className={styles.selectionChip}
                    prefetch={false}
                  >
                    <span>{chip.name}</span>
                  </Link>
                ))}
              </nav>
            ) : null}

            <FoodMarquee>
              {selectionItems.map((item, index) => (
                <ProductPost key={item.id} item={item} index={index} />
              ))}
            </FoodMarquee>
          </section>
        ) : null}

        <section
          className={styles.velocityDivider}
          aria-label="De los platos a la ciudad"
        >
          <ScrollVelocityContainer className={styles.velocityTrack}>
            <ScrollVelocityRow baseVelocity={0.6} direction={1}>
              Platos reales · Locales de cerca ·
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={0.5} direction={-1}>
              Mira · Elige · Recoge · Explora ·
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
          <span className={styles.velocityFadeLeft} aria-hidden="true" />
          <span className={styles.velocityFadeRight} aria-hidden="true" />
        </section>

        <section className={styles.cityStory} aria-labelledby="city-story-title">
          <div className={styles.cityStoryMasthead}>
            <span>Pickyalo explora</span>
            {talavera ? (
              <span><MapPin size={15} aria-hidden="true" />{talavera.name}</span>
            ) : null}
          </div>
          <Link href={storyHref} className={styles.cityStoryMedia}>
            <span className={styles.cityStoryPhoto}>
              <Image
                src={cityImage}
                alt={cityTitle}
                fill
                sizes="(max-width: 899px) 94vw, (max-width: 1250px) 52vw, 630px"
                className={styles.cityStoryImage}
              />
            </span>
            <span className={styles.cityStoryLabel}>
              <small>{exploreFeature?.routeName ?? "Una historia de Talavera"}</small>
              <strong>{cityTitle}</strong>
              <span className={styles.storyLink}>
                {exploreFeature ? "Ver historia" : "Explorar"}
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </span>
          </Link>

          <div className={styles.cityStoryCopy}>
            <p>Lo bueno sigue al salir</p>
            <h2 id="city-story-title">
              <span>Un bocado.</span>
              <em>Y una historia.</em>
            </h2>
            <div className={styles.cityStoryDescription}>
              Murales, calles y lugares con algo que contar. Elige una parada y conoce lo que hay detrás.
            </div>
            <nav className={styles.cityStoryActions} aria-label="Descubrir desde este lugar">
              {exploreFeature ? (
                <Link href={storyHref} className={styles.cityAction}>
                  <span className={styles.cityActionIcon}><BookOpen size={24} strokeWidth={1.75} aria-hidden="true" /></span>
                  <span>Ver historia</span>
                </Link>
              ) : null}
              <Link href="/mapa?localizar=1" className={`${styles.cityAction} ${styles.cityActionPrimary}`}>
                <span className={styles.cityActionIcon}><Map size={24} strokeWidth={1.75} aria-hidden="true" /></span>
                <span>Abrir mapa</span>
              </Link>
              <Link href={zoneHref} className={styles.cityAction}>
                <span className={styles.cityActionIcon}><MapPin size={24} strokeWidth={1.75} aria-hidden="true" /></span>
                <span>Ver la zona</span>
              </Link>
            </nav>
          </div>
        </section>

        <section className={styles.localCallout} aria-labelledby="join-local-title">
          <div className={styles.localCalloutHeading}>
            <p className={styles.localCalloutEyebrow}>Para quienes dan sabor al barrio</p>
            <h2 id="join-local-title">Tú pones lo bueno.
              <span className={styles.localCalloutSignature}>
                <em>Que se vea.</em>
                <span className={styles.localCalloutComposition} aria-hidden="true">
                  <Image
                    src="/home/zonas/talavera-elements/talavera_medallon_barca_transparent.png"
                    alt=""
                    fill
                    sizes="(max-width: 699px) 190px, 260px"
                    className={styles.localCalloutCeramic}
                  />
                <Image
                  src="/home/assets/asset_jamon_iberico_transparent.png"
                  alt=""
                  width={160}
                  height={160}
                  sizes="(max-width: 699px) 190px, 260px"
                  className={styles.localCalloutAsset}
                />
                </span>
              </span>
            </h2>
          </div>
          <div className={styles.localCalloutDetails}>
            <p>Tu cocina, tu mostrador, tus especialidades. Te ayudamos a enseñarlas a quienes buscan qué comer cerca.</p>
            <Link href="/unete">
              Quiero sumar mi local <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <span>Puedes empezar gratis.</span>
          </div>
        </section>
      </main>

      <ZylenPickFooter theme="light" />
    </div>
  );
}
