import {
  BookOpenText,
  ExternalLink,
  ImageIcon,
  LayoutGrid,
  MapPin,
  Megaphone,
  QrCode,
  Star,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminVenueQrImageEditor } from "@/components/admin/admin-venue-qr-image-editor";
import { AdminVenueQrPromotionImage } from "@/components/admin/admin-venue-qr-promotion-image";
import { AdminVenueQrStoryImages } from "@/components/admin/admin-venue-qr-story-images";
import {
  getAdminVenueQrSettings,
  updateVenueQrFavoritesCopyAction,
  updateVenueQrPromotionAction,
  updateVenueQrSettingsAction,
  updateVenueQrStoryAction,
} from "@/features/admin/services/venue-qr-admin-service";

type AdminVenueQrPageProps = {
  params: {
    venueId: string;
  };
};

type QrSectionStatus = "visible" | "conditional" | "scheduled" | "hidden";

const sectionStatusStyles: Record<
  QrSectionStatus,
  { label: string; className: string }
> = {
  visible: {
    label: "Visible",
    className: "bg-emerald-100 text-emerald-800",
  },
  conditional: {
    label: "Si hay datos",
    className: "bg-amber-100 text-amber-900",
  },
  scheduled: {
    label: "Programada",
    className: "bg-amber-100 text-amber-900",
  },
  hidden: {
    label: "Oculta",
    className: "bg-[#741314]/[0.07] text-[#741314]",
  },
};

function QrSectionGuideItem({
  index,
  title,
  description,
  status,
  href,
  icon: Icon,
}: {
  index: number;
  title: string;
  description: string;
  status: QrSectionStatus;
  href: string;
  icon: LucideIcon;
}) {
  const statusStyle = sectionStatusStyles[status];

  return (
    <Link
      href={href}
      className="group flex min-h-20 items-center gap-3 rounded-xl border border-[#741314]/12 bg-white px-3.5 py-3 text-left outline-none transition hover:border-[#741314]/28 hover:bg-[#FDE3AD]/25 focus-visible:ring-2 focus-visible:ring-[#741314]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#741314] text-[#FFF7E8]">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold tabular-nums text-[#741314]/52">
            {String(index).padStart(2, "0")}
          </span>
          <span className="text-sm font-bold text-[#24110E]">{title}</span>
          <span
            className={`inline-flex min-h-6 items-center rounded-full px-2 text-[10px] font-bold ${statusStyle.className}`}
          >
            {statusStyle.label}
          </span>
        </span>
        <span className="mt-1 block text-xs leading-5 text-[#24110E]/62">
          {description}
        </span>
      </span>
      <span className="shrink-0 text-xs font-bold text-[#741314] group-hover:underline">
        Editar
      </span>
    </Link>
  );
}

function QrToggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border border-[#741314]/12 bg-white px-4 py-4 transition has-[:checked]:border-emerald-600/30 has-[:checked]:bg-emerald-50">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-[#381932]/18 transition peer-checked:bg-emerald-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#741314] after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
      <span>
        <span className="block text-sm font-semibold text-[#381932]">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-[#381932]/65">
          {description}
        </span>
      </span>
    </label>
  );
}

function fieldClassName() {
  return "mt-2 min-h-11 w-full rounded-xl border border-[#741314]/16 bg-white px-3.5 py-2.5 text-sm text-[#381932] outline-none placeholder:text-[#381932]/38 focus:border-[#741314] focus:ring-2 focus:ring-[#741314]/10";
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
}

export default async function AdminVenueQrPage({
  params,
}: AdminVenueQrPageProps) {
  const settings = await getAdminVenueQrSettings(params.venueId);
  if (!settings) notFound();

  const updateAction = updateVenueQrSettingsAction.bind(
    null,
    params.venueId,
  );
  const updatePromotionAction = updateVenueQrPromotionAction.bind(
    null,
    params.venueId,
  );
  const updateFavoritesCopyAction = updateVenueQrFavoritesCopyAction.bind(
    null,
    params.venueId,
  );
  const updateStoryAction = updateVenueQrStoryAction.bind(
    null,
    params.venueId,
  );
  const qrHref = `/q/${settings.venueSlug}`;
  const heroImageSource = settings.qrHeroImageUrl
    ? "Foto personalizada para el QR"
    : settings.coverUrl
      ? "Portada actual del local"
      : settings.featuredItems[0]?.imageUrl
        ? "Imagen del primer plato"
        : "Falta una imagen de portada";
  const remainingItemsCount = Math.max(
    0,
    settings.menuItems.length - settings.featuredItems.length,
  );
  const now = Date.now();
  const promotionStartsAt = settings.promotion.startsAt
    ? new Date(settings.promotion.startsAt).getTime()
    : null;
  const promotionEndsAt = settings.promotion.endsAt
    ? new Date(settings.promotion.endsAt).getTime()
    : null;
  const promotionScheduled =
    settings.promotion.isEnabled &&
    promotionStartsAt !== null &&
    promotionStartsAt > now;
  const promotionLive =
    settings.qrEnabled &&
    settings.promotion.isEnabled &&
    !promotionScheduled &&
    (promotionEndsAt === null || promotionEndsAt >= now);
  const hiddenByQr = !settings.qrEnabled;

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[1.8rem] border border-[color:var(--border)] p-6 shadow-[var(--soft-shadow)]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#741314]">
              <QrCode aria-hidden="true" className="h-4 w-4" />
              Experiencia QR
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
              {settings.venueName}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
              Controla la pantalla que verá una persona al escanear el QR dentro
              del local. La información, el horario y los platos siguen usando
              los datos existentes del establecimiento.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {settings.qrEnabled ? (
              <Link
                href={qrHref}
                target="_blank"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#741314] px-5 text-sm font-bold text-[#FFF7E8]"
              >
                Ver experiencia QR
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-full border border-amber-500/30 bg-amber-50 px-5 text-sm font-bold text-amber-800">
                QR oculto
              </span>
            )}
            <Link
              href={`/panel/locales/${params.venueId}`}
              className="inline-flex min-h-11 items-center rounded-full border border-[#741314]/18 bg-[#FFF7E8] px-5 text-sm font-bold text-[#741314]"
            >
              Volver al local
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
              Orden de la pantalla
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#24110E]">
              Qué corresponde a cada caja
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#24110E]/68">
              Estas secciones aparecen en este mismo orden al abrir el QR. Pulsa
              cualquiera para ir directamente a su edición.
            </p>
          </div>
          <span
            className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-bold ${
              settings.qrEnabled
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {settings.qrEnabled ? "QR publicado" : "QR completo oculto"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <QrSectionGuideItem
            index={1}
            title="Portada"
            description={heroImageSource}
            status={
              hiddenByQr ||
              (!settings.qrHeroImageUrl &&
                !settings.coverUrl &&
                !settings.featuredItems[0]?.imageUrl)
                ? "hidden"
                : "visible"
            }
            href="#portada"
            icon={ImageIcon}
          />
          <QrSectionGuideItem
            index={2}
            title="Historia del local"
            description={
              settings.qrStory
                ? "Relato personalizado para el QR"
                : "Usa la descripción pública del local"
            }
            status={hiddenByQr ? "hidden" : "visible"}
            href="#historia"
            icon={BookOpenText}
          />
          <QrSectionGuideItem
            index={3}
            title="Los favoritos"
            description={`${settings.featuredItems.length} de 3 platos destacados`}
            status={
              hiddenByQr || settings.featuredItems.length === 0
                ? "hidden"
                : "visible"
            }
            href="#favoritos-copy"
            icon={Star}
          />
          <QrSectionGuideItem
            index={4}
            title="Banner promocional"
            description={
              settings.promotion.brandName
                ? `Colaboración con ${settings.promotion.brandName}`
                : "Sin colaboración configurada"
            }
            status={
              hiddenByQr
                ? "hidden"
                : promotionLive
                  ? "visible"
                  : promotionScheduled
                    ? "scheduled"
                    : "hidden"
            }
            href="#promocion"
            icon={Megaphone}
          />
          <QrSectionGuideItem
            index={5}
            title="Más de la carta"
            description={`${remainingItemsCount} platos después de los favoritos`}
            status={
              hiddenByQr || remainingItemsCount === 0 ? "hidden" : "visible"
            }
            href="#platos"
            icon={LayoutGrid}
          />
          <QrSectionGuideItem
            index={6}
            title="Cerca de aquí"
            description="Solo aparece cuando existen lugares próximos fiables"
            status={
              hiddenByQr || !settings.qrShowNearby ? "hidden" : "conditional"
            }
            href="#visibilidad"
            icon={MapPin}
          />
          <QrSectionGuideItem
            index={7}
            title="Información del local"
            description="Dirección, teléfono y enlace a la ficha completa"
            status={hiddenByQr ? "hidden" : "visible"}
            href={`/panel/locales/${params.venueId}`}
            icon={Store}
          />
        </div>
      </section>

      <form
        id="visibilidad"
        action={updateAction}
        className="scroll-mt-6 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-6"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
            Visibilidad
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#381932]">
            Qué se publica en el QR
          </h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <QrToggle
            name="qrEnabled"
            label="Experiencia QR activa"
            description="Al desactivarla, la dirección QR deja de estar disponible públicamente."
            defaultChecked={settings.qrEnabled}
          />
          <QrToggle
            name="qrShowNearby"
            label="Mostrar Cerca de aquí"
            description="Añade dos lugares o planes próximos cuando existen datos fiables."
            defaultChecked={settings.qrShowNearby}
          />
        </div>
        <button
          type="submit"
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#741314] px-6 text-sm font-bold text-[#FFF7E8]"
        >
          Guardar visibilidad
        </button>
      </form>

      <div id="portada" className="scroll-mt-6">
        <AdminVenueQrImageEditor
          venueId={settings.venueId}
          initialHeroUrl={settings.qrHeroImageUrl}
          coverUrl={settings.coverUrl}
          featuredFallbackUrl={settings.featuredItems[0]?.imageUrl ?? null}
        />
      </div>

      <section
        id="historia"
        className="scroll-mt-6 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-6"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
            Conoce la casa
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#381932]">
            Portada e historia del local
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#381932]/65">
            La frase aparece sobre la portada. Al pulsar “Conoce la casa” se
            abre el relato completo sin salir del QR.
          </p>
        </div>

        <form action={updateStoryAction} className="mt-5 grid gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">
              Frase principal de portada
            </span>
            <input
              name="heroTagline"
              maxLength={120}
              defaultValue={settings.qrHeroTagline}
              className={fieldClassName()}
              placeholder="Por ejemplo, cocina casera con esencia familiar"
            />
            <span className="mt-2 block text-xs leading-5 text-[#381932]/60">
              Si queda vacía, se mostrará la categoría del local.
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">
              Historia del local
            </span>
            <textarea
              name="story"
              maxLength={12000}
              rows={9}
              defaultValue={settings.qrStory}
              className={`${fieldClassName()} resize-y`}
              placeholder="Cuenta brevemente cómo nació el local, quién está detrás y qué lo hace especial."
            />
            <span className="mt-2 block text-xs leading-5 text-[#381932]/60">
              Si queda vacía, se utilizará la descripción pública actual.
            </span>
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[#741314] px-6 text-sm font-bold text-[#FFF7E8]"
          >
            Guardar historia
          </button>
        </form>

        <div className="mt-6">
          <AdminVenueQrStoryImages
            venueId={settings.venueId}
            initialUrls={settings.qrStoryImageUrls}
          />
        </div>
      </section>

      <section
        id="favoritos-copy"
        className="scroll-mt-6 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-6"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
            Introducción de favoritos
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#381932]">
            Primer bloque de la carta
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#381932]/65">
            Personaliza la caja crema que presenta los tres platos destacados.
            Los platos se siguen eligiendo desde su propia edición.
          </p>
        </div>

        <form action={updateFavoritesCopyAction} className="mt-5 grid gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">
              Texto superior
            </span>
            <input
              name="eyebrow"
              required
              maxLength={60}
              defaultValue={settings.qrFavorites.eyebrow}
              className={fieldClassName()}
              placeholder="Si dudas, empieza aquí"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">Título</span>
            <input
              name="title"
              required
              maxLength={80}
              defaultValue={settings.qrFavorites.title}
              className={fieldClassName()}
              placeholder="Los favoritos."
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">
              Descripción
            </span>
            <textarea
              name="description"
              required
              maxLength={180}
              rows={3}
              defaultValue={settings.qrFavorites.description}
              className={`${fieldClassName()} resize-y`}
              placeholder="Presenta los platos destacados en una frase breve."
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#381932]">
              Persona de referencia
            </span>
            <input
              name="hostName"
              maxLength={60}
              defaultValue={settings.qrHostName ?? ""}
              className={fieldClassName()}
              placeholder="Por ejemplo, Ana"
              autoCapitalize="words"
            />
            <span className="mt-2 block text-xs leading-5 text-[#381932]/60">
              Se mostrará como la persona a quien preguntar. Déjalo vacío para
              usar “el personal”.
            </span>
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[#741314] px-6 text-sm font-bold text-[#FFF7E8]"
          >
            Guardar bloque
          </button>
        </form>
      </section>

      <section
        id="promocion"
        className="scroll-mt-6 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
              Colaboración
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#381932]">
              Banner promocional
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#381932]/65">
              Una única colaboración integrada entre los favoritos y el resto
              de la carta. Si está desactivada, desaparece sin dejar hueco.
            </p>
          </div>
          <span
            className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-bold ${
              settings.promotion.isEnabled
                ? "bg-emerald-100 text-emerald-800"
                : "bg-[#741314]/[0.07] text-[#741314]"
            }`}
          >
            {settings.promotion.isEnabled ? "Promoción activa" : "Sin publicar"}
          </span>
        </div>

        <div className="mt-6">
          <AdminVenueQrPromotionImage
            venueId={settings.venueId}
            initialUrl={settings.promotion.imageUrl}
          />
        </div>

        <form action={updatePromotionAction} className="mt-5 space-y-5">
          <QrToggle
            name="isEnabled"
            label="Mostrar promoción"
            description="Actívala únicamente cuando la colaboración y sus materiales estén confirmados."
            defaultChecked={settings.promotion.isEnabled}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Marca</span>
              <input
                name="brandName"
                defaultValue={settings.promotion.brandName}
                className={fieldClassName()}
                placeholder="Nombre de la marca"
                autoCapitalize="words"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">Titular</span>
              <input
                name="headline"
                defaultValue={settings.promotion.headline}
                className={fieldClassName()}
                placeholder="El acompañamiento de la casa"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-[#381932]">Texto breve</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={settings.promotion.description}
                className={`${fieldClassName()} resize-y`}
                placeholder="Explica la colaboración en una frase clara."
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-[#381932]">
                Plato relacionado
              </span>
              <select
                name="relatedMenuItemId"
                defaultValue={settings.promotion.relatedMenuItemId ?? ""}
                className={fieldClassName()}
              >
                <option value="">Ninguno</option>
                {settings.menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">
                Empieza el
              </span>
              <input
                name="startsAt"
                type="datetime-local"
                defaultValue={toDateTimeLocal(settings.promotion.startsAt)}
                className={fieldClassName()}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[#381932]">
                Termina el
              </span>
              <input
                name="endsAt"
                type="datetime-local"
                defaultValue={toDateTimeLocal(settings.promotion.endsAt)}
                className={fieldClassName()}
              />
            </label>
          </div>

          <p className="text-xs leading-5 text-[#381932]/60">
            Marca, titular y texto son obligatorios solo al activar la promoción.
            Las fechas son opcionales.
          </p>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#741314] px-6 text-sm font-bold text-[#FFF7E8]"
          >
            Guardar promoción
          </button>
        </form>
      </section>

      <section
        id="platos"
        className="scroll-mt-6 rounded-2xl border border-[#741314]/12 bg-[#FFF7E8] p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#741314]/60">
              <UtensilsCrossed aria-hidden="true" className="h-4 w-4" />
              Selección gastronómica
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#381932]">
              Los tres platos que abre el QR
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#381932]/65">
              Se reutilizan los platos disponibles y sus marcas de destacado.
              No hay una carta duplicada para el QR.
            </p>
          </div>
          <Link
            href={`/panel/locales/${params.venueId}/platos`}
            className="inline-flex min-h-11 items-center rounded-full border border-[#741314]/18 bg-white px-5 text-sm font-bold text-[#741314]"
          >
            Gestionar platos
          </Link>
        </div>

        {settings.featuredItems.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {settings.featuredItems.map((item, index) => (
              <Link
                key={item.id}
                href={`/panel/locales/${params.venueId}/platos/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-[#741314]/12 bg-white outline-none focus-visible:ring-2 focus-visible:ring-[#741314]"
              >
                <span className="relative block aspect-[4/3] bg-[#F4E9D3]">
                  {item.imageUrl ? (
                    // Admin preview accepts legacy external URLs.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : null}
                  <span className="absolute left-3 top-3 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#741314] px-2 text-xs font-bold text-[#FFF7E8]">
                    {index + 1}
                  </span>
                </span>
                <span className="block p-4">
                  <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#741314]/55">
                    {item.categoryName ?? "Sin categoría"}
                  </span>
                  <span className="mt-1 block text-base font-semibold text-[#381932] group-hover:text-[#741314]">
                    {item.name}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
            Este local todavía no tiene platos disponibles. Añade al menos uno
            con fotografía antes de imprimir el QR.
          </div>
        )}
      </section>
    </div>
  );
}
