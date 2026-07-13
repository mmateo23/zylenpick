# Public Web Brand Base Pass

Fecha: 2026-07-12

## Rutas revisadas

- `/`
- `/unete`
- `/platos`
- `/zonas`
- `/zonas/[citySlug]`
- `/zonas/[citySlug]/venues/[venueSlug]`
- `/cart`
- `/privacidad`
- `/cookies`
- `/el-proyecto`

## Archivos tocados

- `src/app/unete/page.tsx`
- `src/app/cookies/page.tsx`
- `src/app/privacidad/page.tsx`
- `src/app/zonas/[citySlug]/venues/[venueSlug]/page.tsx`
- `src/components/demo/demo-site-header.tsx`
- `src/components/demo/demo-dishes-carousel.tsx`
- `src/components/demo/demo-zones-overview.tsx`
- `src/components/join/join-form.tsx`
- `src/components/join/join-visual-showcase.tsx`
- `src/components/layout/zylenpick-footer.tsx`
- `src/features/cart/components/cart-screen.tsx`
- `src/features/cart/components/add-to-cart-button.tsx`

## Cambios visuales principales

- `/unete` pasa de hero oscuro a overlay blanco hueso con texto oscuro/granate.
- Formulario de `/unete` pasa a superficies claras, borde granate suave y CTA granate.
- Showcase de `/unete` usa cards claras y chips blanco hueso/granate.
- `/zonas` en variante pública usa hero claro Brand Base.
- Detalle de local usa overlay crema/granate en lugar de azul/negro legacy.
- `/cart` reduce overlay oscuro del hero y usa panel claro.
- `/cookies` y `/privacidad` pasan a fondo blanco hueso y footer claro.
- Footer público queda claro por defecto.

## Logos

- `DemoSiteHeader` usa `LogoNuevo.svg` y `LogoNuevo_Negativo.svg`.
- Feed de `/platos` usa la familia `LogoNuevo`.
- Assets legacy siguen presentes por compatibilidad.

## Restos legacy

- `Demo*` sigue existiendo porque `/platos` y `/zonas` aún lo usan como web pública real.
- Algunos overlays oscuros siguen dentro de modales de imagen/video para legibilidad.
- `ZylenPickFooter` conserva el nombre técnico del componente.

## Riesgos

- La consola puede mostrar textos con mojibake aunque los archivos estén en UTF-8.
- Hay rutas admin con estilos legacy fuera de alcance.
- Conviene revisar visualmente móvil tras los cambios de contraste.

## Siguiente paso

- QA visual en `/unete`, `/zonas`, `/cart`, `/privacidad` y `/cookies`.
- Después, renombrar componentes públicos `Demo*` sin cambiar comportamiento.
