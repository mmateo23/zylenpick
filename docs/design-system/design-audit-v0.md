# Auditoría de diseño v0

Fecha: 2026-07-10  
Alcance: `src/app`, `src/components`, `src/features`, `src/lib` y `public`.

## Resumen del problema

Pickyalo ya tiene una base de tokens en `src/app/globals.css` y `tailwind.config.ts` que coincide parcialmente con la dirección visual provisional: fondo crema, texto oscuro, acento `#fed47d`, bordes sutiles y sombra suave. El problema es que la UI activa sigue consumiendo dos capas visuales a la vez:

- Una capa legacy oscura basada en `--background`, `--surface`, `--foreground`, `--brand`, `--zylen` y clases como `glass-panel`, `magnetic-button`, `spotlight-panel`, `zylen-visual-skin`.
- Una capa nueva más clara basada en `--bg-page`, `--text-primary`, `--brand-accent`, `--border-subtle`, `--shadow-soft` y aliases Tailwind como `bg-page`, `text-text-primary`, `bg-cta`.

Además, hay mucho estilo inline o arbitrario por componente. La mayor concentración está en demos, home, carrito, admin, cookies/PWA y cards de platos/locales. Esto impide que el producto se sienta como un sistema visual único y hace difícil migrar sin romper pantallas.

No se ha modificado UI, comportamiento ni assets. Este documento es solo inventario y propuesta.

## Archivos afectados principales

### Concentración de hardcodes visuales

| Archivo | Hallazgos aproximados | Observación |
| --- | ---: | --- |
| `src/components/demo/demo-dishes-carousel.tsx` | 307 | Mayor mezcla de paletas, gradientes, badges, cards y layouts de plato. |
| `src/components/demo/demo-home.tsx` | 241 | Hero, assets de comida, overlays oscuros, chips, cards y fondos muy expresivos. |
| `src/app/globals.css` | 126 | Tokens correctos mezclados con aliases legacy `zylen`, skin oscura, utilidades globales y estilos de proyecto. |
| `src/features/cart/components/cart-screen.tsx` | 100 | Ticket/cart visual con paleta propia, fondos hero e imágenes remotas. |
| `src/app/demo/cities/[citySlug]/platos/page.tsx` | 80 | Vista demo de platos con tokens propios y badge destacado distinto. |
| `src/app/panel/(admin)/imagenes/page.tsx` | 78 | Formularios/cards admin con estilos repetidos. |
| `src/app/panel/(admin)/destacados/page.tsx` | 76 | Badges, cards y estados destacados con hardcodes. |
| `src/components/home/home-landing.tsx` | 63 | Landing con spotlight/gold cards, gradientes e identidad ZylenLabs. |
| `src/components/join/join-form.tsx` | 63 | Formulario comercial con clases visuales propias. |
| `src/components/map-art/map-art-studio.tsx` | 61 | Herramienta visual con paleta independiente. |
| `src/app/panel/(admin)/monetizacion/page.tsx` | 60 | Formularios, pills, tablas y botones duplicados. |
| `src/app/panel/(admin)/chips/page.tsx` | 59 | Chips admin y formularios duplican patrones. |
| `src/components/project/project-scroll-slider.tsx` | 54 | Estilos inline y assets específicos de la página de proyecto. |
| `src/components/demo/demo-site-header.tsx` | 52 | Duplicado directo de `SiteHeader` con variantes light/dark. |
| `src/components/cookies/cookie-consent-banner.tsx` | 52 | Paleta ticket/coral propia. |
| `src/components/admin/admin-venue-form.tsx` | 49 | Campos, botones y paneles admin repetidos. |
| `src/components/venues/zone-venue-explorer.tsx` | 46 | Cards de locales y hero destacados con gradientes inline. |
| `src/components/demo/demo-zones-overview.tsx` | 45 | Cards de zonas y chips con estilos demo. |
| `src/app/panel/(admin)/funnel/page.tsx` | 45 | Summary cards y botones locales. |
| `src/components/demo/demo-bento-gallery.tsx` | 45 | Cards de zona y chips duplicados. |
| `src/app/unete/page.tsx` | 43 | Hero/form visual con imagen y overlays inline. |
| `src/components/admin/admin-menu-item-form.tsx` | 43 | Campos y panels admin repetidos. |
| `src/app/panel/(admin)/diseno/page.tsx` | 31 | Ya opera sobre tokens, pero usa la misma UI admin duplicada. |
| `src/components/layout/site-header.tsx` | 31 | Header actual con hardcodes de acento, fondo y badge. |
| `src/components/venues-map/venues-map.tsx` | 31 | Mapa con colores inline para marcadores y paneles oscuros. |
| `src/components/venues/menu-item-gallery-card.tsx` | 30 | Card de plato más cercana a tokens nuevos, pero con estilos propios. |
| `src/components/join/join-visual-showcase.tsx` | 30 | Showcase comercial con paleta propia. |
| `src/features/feed/components/feed-card.tsx` | 23 | Card feed legacy distinta a `MenuItemGalleryCard`. |
| `src/features/feed/components/food-card.tsx` | 14 | Card comida legacy distinta a feed y venue menu. |

## Colores encontrados

### Tokens actuales relevantes

En `src/app/globals.css` existen tokens que ya encajan con el contexto provisional:

| Token | Valor |
| --- | --- |
| `--bg-page` | `#f6f1e6` |
| `--bg-page-alt` | `#e8e1d2` |
| `--text-primary` | `#181816` |
| `--text-secondary` | `rgba(24, 24, 22, 0.62)` |
| `--border-subtle` | `rgba(0, 0, 0, 0.1)` |
| `--shadow-soft` | `0 18px 60px rgba(5, 8, 22, 0.1)` |
| `--brand-accent` | `#fed47d` |
| `--brand-accent-bright` | `#FFE7A8` |
| `--brand-accent-soft` | `rgba(254, 212, 125, 0.14)` |
| `--cta-primary-bg` | `var(--brand-accent)` |
| `--cta-primary-text` | `#2a120d` |

También existen aliases legacy que mantienen el producto en modo oscuro:

| Token legacy | Valor |
| --- | --- |
| `--background` | `#0d1312` |
| `--foreground` | `#f3efe8` |
| `--surface` | `#151c1a` |
| `--surface-strong` | `#1d2724` |
| `--surface-dark` | `#0b100f` |
| `--border` | `rgba(255, 255, 255, 0.08)` |
| `--zylen` | `#FED47D` |
| `--zylen-soft` | `#3A2119` |
| `--brand` | `var(--zylen)` |
| `--accent` | `var(--zylen-accent)` |
| `--muted` | `#9faaa5` |
| `--muted-strong` | `#cfd6d1` |
| `--shadow` | `0 28px 70px rgba(0, 0, 0, 0.36)` |
| `--soft-shadow` | `0 18px 38px rgba(0, 0, 0, 0.28)` |
| `--card-shadow` | `0 10px 24px rgba(0, 0, 0, 0.24)` |

### Clases arbitrarias Tailwind más repetidas

| Clase | Repeticiones | Lectura |
| --- | ---: | --- |
| `text-[color:var(--foreground)]` | 268 | Consumo masivo del sistema legacy. |
| `text-[color:var(--muted-strong)]` | 123 | Texto secundario legacy oscuro. |
| `border-[color:var(--border)]` | 92 | Borde legacy con blanco translúcido. |
| `text-[color:var(--muted)]` | 85 | Texto apagado legacy. |
| `text-[color:var(--brand)]` | 75 | Acento legacy. |
| `bg-[color:var(--surface-strong)]` | 69 | Superficie legacy. |
| `bg-[#FED47D]` | 57 | Acento hardcodeado, debería ser token. |
| `shadow-[var(--soft-shadow)]` | 54 | Sombra legacy oscura. |
| `border-[#FED47D]` | 44 | Borde acento hardcodeado. |
| `text-[#FED47D]` | 41 | Texto acento hardcodeado. |
| `shadow-[var(--card-shadow)]` | 41 | Sombra legacy oscura. |
| `bg-[color:var(--brand)]` | 35 | Botones/chips legacy. |
| `bg-[color:var(--surface)]` | 32 | Superficie legacy. |
| `border-[color:var(--brand)]` | 31 | Borde acento legacy. |
| `text-[color:var(--accent)]` | 23 | Alias legacy/acento. |
| `text-[#2A120D]` | 20 | Texto CTA hardcodeado. |
| `text-[#181816]` | 18 | Texto nuevo hardcodeado en lugar de token. |
| `text-[#381932]` | 17 | Morado/coral de cookies/PWA/proyecto. |
| `bg-[#FFE7A8]` | 9 | Acento claro hardcodeado. |
| `bg-[#A9402A]` | 9 | Coral/terracota secundario no normalizado. |
| `bg-[#E5484D]` | 7 | Danger hardcodeado, existe `--status-danger`. |
| `text-[#C26157]` | 7 | Coral de cookies/PWA sin token. |
| `text-[#d6a648]` | 6 | Warning/dorado duplicado, existe `--status-warning`. |
| `bg-[#fffdf5]` | 6 | Superficie ticket/cookie sin token. |

### Valores hex/RGBA más presentes

| Valor | Repeticiones | Archivos habituales |
| --- | ---: | --- |
| `#fed47d` / `#FED47D` | 159+ | `globals.css`, `demo-*`, `site-header`, `home-landing`, `project-scroll-slider`, `venues-map`. |
| `#381932` | 31 | `cookies`, `privacidad`, `layout`, `manifest`, `pwa/install-prompt`, `pickyalo-toaster`. |
| `#2a120d` | 21 | `globals.css`, `demo-home`, `demo-site-header`, `site-header`. |
| `#111111` | 20 | `demo-*`, `zylenpick-footer`. |
| `#181816` | 19 | `globals.css`, `demo-bento-gallery`, `demo-site-header`, `demo-zones-overview`. |
| `rgba(254,212,125,0.16)` | 18 | Demos, destacados, `home-landing`, `layout/footer`. |
| `#A9402A` | 16 | `demo-home`, `demo-dishes-carousel`. |
| `#C26157` | 13 | Cookies, privacidad, PWA. |
| `#FFE7A8` | 12 | `globals.css`, demos. |
| `#050816` | 11 | `globals.css`, demos, `cart-screen`. |
| `#E5484D` | 11 | Danger badges/botones en admin/header/join. |
| `#fffdf5` | 10 | Cookies/toasts. |
| `rgba(254,212,125,0.12/0.14/0.18/0.22/0.26)` | muchas variantes | Acento usado con opacidades arbitrarias. |
| `rgba(0,0,0,0.08/0.12/0.16/0.18/0.22/0.24/0.34/0.36)` | muchas variantes | Sombras y overlays no normalizados. |

### Patrones CSS/inline detectados

- `style={{ backgroundImage: ... }}` en `home-landing`, `zone-venue-explorer`, `menu-item-gallery-card`, `cart-screen`, `unete`, `story-card-swap`, `project-scroll-slider`, `venues-map`.
- Marcadores Mapbox con estilos directos en `src/components/venues-map/venues-map.tsx`: `#160f0c`, `#FED47D`, `0 12px 28px rgba(0, 0, 0, 0.32)`.
- Email HTML con paletas propias en `src/features/emailing/template.ts`: naranja, verde y dark (`#d96b33`, `#3d7a57`, `#63c7ef`, etc.). Conviene tratarlo como sub-sistema email, no mezclarlo con UI web.
- `dark-form-field` fuerza `#18181b`, `#ffffff`, `#a1a1aa` en `globals.css`; se repite en admin.
- Hay muchas clases arbitrarias de tamaño (`text-[10px]`, `text-[11px]`, `rounded-[...]`) que no son color, pero sí afectan consistencia visual.

## Componentes visuales duplicados

### Botones

No hay un componente `Button` único para UI de producto/admin. Se repiten variantes por archivo:

- CTA primario: `bg-[color:var(--brand)] text-white`, `bg-[#FED47D] text-[#2A120D]`, `bg-cta text-cta-text`, `bg-[color:var(--foreground)] text-white`, `bg-black text-white`.
- CTA secundario: `border white/10 bg-white/5`, `border-border-subtle bg-surface-strong`, `bg-[color:var(--surface-strong)]`, `border-[#381932]/18 bg-[#fffdf5]`.
- Botones de icono: `SiteHeader`, `DemoSiteHeader`, modales de plato, cookies/PWA y admin usan clases distintas.
- Casos concretos:
  - `src/features/cart/components/add-to-cart-button.tsx` acepta `buttonClassName`, por lo que cada consumidor redefine el botón.
  - `src/features/auth/components/sign-out-button.tsx`, `src/app/panel/(admin)/chips/page.tsx`, `src/app/panel/(admin)/funnel/page.tsx`, `src/app/panel/(admin)/diseno/page.tsx`, `src/app/panel/(admin)/monetizacion/page.tsx` declaran variantes locales.

### Badges, chips y pills

Hay múltiples estilos visualmente equivalentes:

- Chips de filtros/categorías en `zone-venue-explorer`, `feed-experience`, `demo-dishes-carousel`, `demo-bento-gallery`, `demo-zones-overview`.
- Badges de carrito/contador duplicados en `SiteHeader` y `DemoSiteHeader`.
- Badges de destacado:
  - `FeaturedBadgeIcon` + `featured-badge-animated` en `home-landing`, `menu-item-gallery-card`, `demo/cities/[citySlug]/platos`.
  - `VerifiedVenueBadge` tiene componente propio, pero su envoltorio visual convive con chips locales.
- Pills admin en `monetizacion`, `chips`, `solicitudes`, `locales`, `destacados` con clases repetidas.

### Cards de comida/plato

Hay al menos cuatro familias:

- `src/features/feed/components/food-card.tsx`: card legacy con `FeedMedia`, overlay y CTA integrado.
- `src/features/feed/components/feed-card.tsx`: card feed interactiva con gestos, badges y acciones en grid.
- `src/components/venues/menu-item-gallery-card.tsx`: card de menú de local + visor modal + `AddToCartButton`.
- `src/features/cart/components/cart-screen.tsx`: cards de items del carrito y ticket con estilo propio.
- En demos: `demo-dishes-carousel`, `demo-home` y `app/demo/cities/[citySlug]/platos/page.tsx` implementan variantes adicionales.

La normalización debería partir de `MenuItemGalleryCard` para producto real y decidir si `FeedCard/FoodCard` siguen vivos o pasan a legacy/demo.

### Cards de locales

- `src/features/feed/components/venue-card.tsx`: card simple blanca, estilo feed inicial.
- `src/components/venues/zone-venue-explorer.tsx`: card editorial con imagen, spotlight, oro y hover 3D.
- `src/components/demo/demo-bento-gallery.tsx` y `demo-zones-overview.tsx`: cards de zona/local con chips y overlays propios.
- `src/features/cart/components/venue-cart-summary.tsx`: resumen de local con tokens nuevos.

### Headers, heros y secciones

- `src/components/layout/site-header.tsx` y `src/components/demo/demo-site-header.tsx` son duplicados directos con lógica y clases similares.
- `src/features/feed/components/home-header.tsx` es otro header legacy de feed.
- `src/features/feed/components/home-hero.tsx`, `src/components/home/home-landing.tsx`, `src/components/demo/demo-home.tsx`, `src/components/project/project-scroll-slider.tsx`, `src/app/unete/page.tsx` implementan heros con criterios distintos.
- `SectionHeading` existe en `src/features/feed/components/section-heading.tsx`, pero admin/demos/home siguen declarando encabezados locales.

### Navegación móvil

- `src/components/layout/site-header.tsx`: menú móvil desplegable.
- `src/components/demo/demo-site-header.tsx`: menú móvil casi duplicado.
- `src/components/navigation/bottom-navigation.tsx`: bottom nav de `AppShell`, con tokens distintos.
- `src/components/cart/mobile-cart-bar.tsx`: barra móvil flotante para carrito.

Estas piezas no comparten un patrón de navegación ni superficie móvil.

## Assets usados actualmente

### Logos e iconos Pickyalo

Usados:

- `/logo/Pickyalo_Logo_Vanilla.svg`: `SiteHeader`, `DemoSiteHeader`, `demo-home`, `demo-dishes-carousel`.
- `/logo/Pickyalo_Logo_Coral.svg`: metadata SEO/layout, footer, fallback de venue/city, demo platos.
- `/logo/Pickyalo_Logo_Black.svg`: `DemoSiteHeader` light y `demo-home`.
- `/logo/Pickyalo_isotipo_Coral.svg`: `components/branding/logo.tsx`, `pwa/install-prompt.tsx`.
- `/logo/Pickyalo_isotipo_Vanilla_APP.svg`: icons metadata en `src/app/layout.tsx`.
- `/icons/apple-touch-icon.png`, `/icons/pickyalo-icon-192.png`, `/icons/pickyalo-icon-512.png`: PWA/manifest.

Legacy presente en `public/logo`:

- `ZylenPick_LOGO.svg`
- `ZylenPick_LOGO.png`
- `ZyelnpickLOGO_orange.svg`
- `ZyelnpickLOGO_green.png`
- `ZyelnpickLOGO_greeb.svg`
- `ZyelnpickLOGO_BLANCO.svg`
- `ZyelnpickLOGO_282828.svg`

No se deben borrar todavía, pero deben pasar a inventario legacy o migrarse fuera de la ruta pública si ya no se usan.

### Hero, comida y proyecto

Locales:

- `/home/hero/croquetas_hover_burst_transparent.png`
- `/home/hero/jamon_iberico_hover_burst_transparent.png`
- `/home/hero/boletus_hover_burst_transparent.png`
- `/home/hero/croquetas_pollo_hover_burst_transparent.png`
- `/home/hero/hero_dish_stack_transparent.png`
- `/home/assets/asset_tacos_transparent.png`
- `/home/assets/asset_jamon_iberico_transparent.png`
- `/home/assets/asset_burger_transparent.png`
- `/home/assets/asset_albondigas_transparent.png`
- `/home/assets/asset_bocadillo_calamares_transparent.png`
- `/home/assets/asset_sushi_transparent.png`
- `/home/assets/asset_pizza_transparent.png`
- `/home/assets/asset_pollo_katsu_explosion_transparent.png`
- `/home/assets/asset_arroz_katsu_explosion_transparent.png`
- `/home/assets/asset_salsa_katsu_explosion_transparent.png`
- `/home/project/project_post_pickyalo.png`
- `/home/zonas/talavera-poster.webp`
- `/hero/platos/Hero_Chopitos.png`

Mock/demo:

- `/mock-media/taco-birria-feed-v2.svg`
- `/mock-media/taco-birria-vertical.svg`
- `/mock-media/burger-poster-vertical.svg`
- `/mock-media/fries-vertical.svg`
- `/mock-media/ramen-vertical.svg`
- `/mock-media/croissant-poster-vertical.svg`
- `/mock-media/cinnamon-roll-vertical.svg`

Zonas:

- `/zones/talavera/talavera_de_la_reina_emerald.svg` pesa aproximadamente 16 MB y se usa como fallback/demo de zona.

Remotos:

- `src/features/site-media/site-media.ts` define imágenes Unsplash para hero/join/cart/zones.
- `src/features/venues/menu-item-media.ts` define fallbacks Unsplash/Pexels para platos.
- `src/features/feed/data/mock-feed-items.ts` usa vídeos Pexels y mock SVG locales.
- Demos y proyecto incluyen múltiples URLs Unsplash inline.

## Restos legacy de ZylenPick/Zylen

### Código y rutas

- `src/components/layout/zylenpick-footer.tsx`: componente aún exportado como `ZylenPickFooter`.
- Importado en `cart`, `cookies`, `privacidad`, `el-proyecto`, `zonas/[citySlug]/venues/[venueSlug]` y demos.
- `src/app/globals.css`: tokens `--zylen`, `--zylen-strong`, `--zylen-soft`, `--zylen-accent`, clase `.zylen-visual-skin`.
- `src/components/demo/demo-home.tsx` y `src/components/demo/demo-dishes-carousel.tsx`: uso de `zylen-visual-skin`.
- `src/components/home/home-landing.tsx` y `src/components/layout/site-shell.tsx`: texto visible `by ZylenLabs`.
- `src/lib/seo.ts`: `https://zylenpick.com`.
- `src/features/emailing/template.ts`: CTA default `https://zylenpick.com`.
- `src/features/venues/services/venues-map-service.ts` y `src/app/api/map-art/route.ts`: user-agent/contact con `studio@zylenpick.com`.
- Storage/event keys:
  - `zylenpick.orders`
  - `zylenpick.active-order-id`
  - `zylenpick:selected-city-updated`
  - `zylenpick.user-location`
  - `zylenpick_landing_path`, `zylenpick_utm_source`, `zylenpick_utm_campaign`, `zylenpick_referrer`

### Documentación

- `docs/architecture.md`: título `Arquitectura de ZylenPick`.
- `docs/roadmap.md`: UI dark coherente con ZylenPick.
- `docs/state-and-storage.md`: documenta mezcla `fknfood`/`zylenpick`.
- `docs/environment.md`: `ZylenPick <onboarding@resend.dev>`.
- `docs/design-system/tokens-v1.md`: reconoce aliases legacy `zylen`.

Estas claves pueden ser intencionadas por compatibilidad de storage/analytics. Deben documentarse como deuda de naming antes de renombrar.

## Propuesta de normalización

### 1. Definir contrato de tokens Pickyalo

Usar como fuente canónica los tokens ya existentes, pero renombrar semánticamente para producto:

- `color.canvas.default` -> `#f6f1e6`
- `color.canvas.alt` -> `#e8e1d2`
- `color.surface.default` -> blanco cálido/transparente controlado.
- `color.text.primary` -> `#181816`
- `color.text.secondary` -> `rgba(24,24,22,0.62)`
- `color.accent.default` -> `#fed47d`
- `color.accent.soft` -> `#ffe7a8` o rgba normalizados.
- `color.border.subtle` -> `rgba(0,0,0,0.10)`
- `shadow.soft` -> `0 18px 60px rgba(5, 8, 22, 0.10)`

Mantener aliases legacy solo como compatibilidad temporal, no como API nueva.

### 2. Separar producto, admin, demo y marketing

- Producto real: `/platos`, `/zonas`, local detail, carrito, pedidos, cuenta.
- Admin: `/panel/**`, con componentes propios pero tokenizados.
- Demo/prototipos: `src/components/demo/**`, `src/app/demo/**`, probablemente congelados o migrados al final.
- Marketing/proyecto: `home-landing`, `project-scroll-slider`, `unete`.

La auditoría sugiere no migrar demos primero: tienen más hardcodes, pero menor valor para un sistema estable si no son pantallas principales.

### 3. Crear componentes base antes de tocar pantallas

Componentes mínimos recomendados:

- `Button`: `primary`, `secondary`, `ghost`, `danger`, `icon`, `fullWidth`.
- `Badge`/`Chip`: `neutral`, `accent`, `success/verified`, `warning`, `danger`, `filter-active`.
- `Card`: `surface`, `media`, `ticket`, `admin-panel`.
- `SectionHeader`: eyebrow, title, description, action.
- `MediaOverlay`: presets para overlays de imagen.
- `AppHeader`: sustituir `SiteHeader`/`DemoSiteHeader` con variantes controladas.
- `MobileNavigation`: menú desplegable y bottom/cart bars con tokens compartidos.

### 4. Migrar estilos inline a helpers

- Crear helpers de overlay o clases CSS para `backgroundImage` cuando solo cambia la URL.
- Mantener `style={{ backgroundImage: url(...) }}` solo para URLs dinámicas, pero mover colores/gradientes a clases/token CSS.
- Sustituir opacidades arbitrarias de `#FED47D` por una escala: `accent.soft`, `accent.subtle`, `accent.border`, `accent.glow`.

### 5. Centralizar assets

- Crear un índice de assets en `src/features/site-media` o `src/lib/assets` para logos, hero food, mock media y fallbacks.
- Separar `public/logo/legacy` conceptualmente en documentación antes de mover archivos.
- Documentar qué assets son producto, demo, PWA, SEO y legacy.
- Revisar peso de `/zones/talavera/talavera_de_la_reina_emerald.svg` antes de usarlo en producción.

## Orden recomendado de migración

1. Congelar tokens: cerrar `tokens-v1.md` como contrato Pickyalo y marcar `--zylen*`, `--brand`, `--foreground`, `--surface` como legacy.
2. Crear componentes base sin cambiar pantallas: `Button`, `Badge/Chip`, `Card`, `SectionHeader`.
3. Migrar `SiteHeader` y eliminar duplicación con `DemoSiteHeader` solo si demo sigue siendo necesaria.
4. Migrar cards de producto real:
   - `MenuItemGalleryCard`
   - `ZoneVenueExplorer`
   - `VenueCartSummary`
   - `CartScreen`
5. Migrar admin a componentes internos tokenizados: formularios, summary cards, pills, tablas.
6. Migrar cookies/PWA/toasts a tokens Pickyalo, eliminando paleta morada/coral aislada salvo que se formalice.
7. Revisar home/unete/proyecto como capa editorial final.
8. Dejar `src/components/demo/**` y `src/app/demo/**` para el final: o se archivan como prototipo o se migran tras cerrar producto real.
9. Hacer limpieza legacy de naming ZylenPick en una tarea separada, cuidando storage/analytics/SEO para no romper usuarios existentes.
10. Crear una regla de lint o script de auditoría que falle si aparecen nuevos `bg-[#...]`, `text-[#...]`, `border-[#...]`, `shadow-[#...]` o `style` visual sin justificación.

## Siguientes pasos claros

1. Validar si la UI principal debe ser clara/editorial por defecto y si queda alguna pantalla intencionalmente dark.
2. Aprobar el set de tokens Pickyalo y decidir qué aliases legacy quedan temporalmente.
3. Diseñar la API de `Button`, `Badge/Chip`, `Card` y `SectionHeader`.
4. Migrar primero `SiteHeader`, `MenuItemGalleryCard`, `ZoneVenueExplorer` y `CartScreen`.
5. Crear un inventario formal de assets y marcar legacy ZylenPick sin borrar archivos.
