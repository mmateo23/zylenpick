# Estructura del proyecto

## Vision rapida

La estructura actual separa pantallas, componentes y logica de dominio de forma razonable para un MVP con panel admin centralizado.

## Carpetas principales

### `src/app`

Contiene las rutas de Next.js App Router.

Rutas activas principales:

- `/`
- `/cities`
- `/cities/[citySlug]`
- `/cities/[citySlug]/venues/[venueSlug]`
- `/cart`
- `/checkout/success/[orderId]`
- `/checkout/success/[orderId]/ticket`
- `/unete`
- `/panel/login`
- `/panel`
- `/panel/locales`
- `/panel/locales/nuevo`
- `/panel/locales/[venueId]`
- `/panel/locales/[venueId]/platos`
- `/panel/locales/[venueId]/platos/nuevo`
- `/panel/locales/[venueId]/platos/[menuItemId]`
- `/panel/solicitudes`
- `/panel/solicitudes/[requestId]`
- `/api/join`

### `src/components`

Componentes visuales reutilizables.

Subcarpetas mas relevantes:

- `branding`
  - logo e isotipo
- `layout`
  - shell y cabecera publica
- `home`
  - landing principal
- `venues`
  - exploracion por zona, cards, badge de verificacion y horarios del local
- `cart`
  - barra movil de carrito
- `orders`
  - widget de pedido activo
- `join`
  - formulario de captacion
- `admin`
  - shell, login y formularios del panel admin
- `icons`
  - iconos SVG propios

### `src/features`

Logica del dominio separada por area.

#### `features/cities`

- tipos de ciudad
- lectura de ciudades desde Supabase

#### `features/venues`

- lectura de locales y menu
- metadatos manuales de locales
- seleccion de platos para Home
- categorias y coordenadas por `slug`
- modelado de horarios

#### `features/cart`

- tipos del carrito
- persistencia en `localStorage`
- hook `useCart`
- pantalla de carrito y checkout

#### `features/orders`

- tipos de pedido
- persistencia local del pedido
- pedido activo
- ticket y ticket imprimible

#### `features/location`

- ubicacion del usuario
- ciudad seleccionada
- calculo de distancias

#### `features/admin`

- autenticacion del panel
- allowlist de admins
- dashboard admin
- lectura y escritura de locales desde el panel
- lectura y escritura de platos desde el contexto de cada local
- lectura y actualizacion de solicitudes desde el panel

### `src/lib`

Utilidades transversales.

### `src/types`

- tipos globales de base de datos (`database.ts`)

### `supabase/migrations`

Migraciones SQL del proyecto.

Incluyen:

- esquema inicial
- auth heredada
- ciudades y menu
- seed de locales
- politicas temporales para gestion admin de `venues`
- columna `is_featured` y politicas temporales para `menu_items`
- tabla `join_requests` y politicas temporales para solicitudes
- campos editoriales y operativos de `venues`:
  - telefono
  - horarios
  - verificacion
  - suscripcion
  - publicacion
  - orden visual

## Bloques funcionales

### Home

- `src/app/page.tsx`
- `src/components/home/home-landing.tsx`
- `src/features/cities/services/cities-service.ts`
- `src/features/venues/services/venues-service.ts`

### Locales y ficha publica

- `src/app/cities/[citySlug]/page.tsx`
- `src/app/cities/[citySlug]/venues/[venueSlug]/page.tsx`
- `src/components/venues/zone-venue-explorer.tsx`
- `src/components/venues/verified-venue-badge.tsx`
- `src/components/venues/venue-opening-hours.tsx`
- `src/features/venues/opening-hours.ts`

### Panel admin

- `src/app/panel/(auth)/login/page.tsx`
- `src/app/panel/auth/callback/route.ts`
- `src/app/panel/(admin)/layout.tsx`
- `src/app/panel/(admin)/page.tsx`
- `src/app/panel/(admin)/locales/page.tsx`
- `src/app/panel/(admin)/locales/nuevo/page.tsx`
- `src/app/panel/(admin)/locales/[venueId]/page.tsx`
- `src/app/panel/(admin)/locales/[venueId]/platos/page.tsx`
- `src/app/panel/(admin)/locales/[venueId]/platos/nuevo/page.tsx`
- `src/app/panel/(admin)/locales/[venueId]/platos/[menuItemId]/page.tsx`
- `src/app/panel/(admin)/solicitudes/page.tsx`
- `src/app/panel/(admin)/solicitudes/[requestId]/page.tsx`
- `src/features/admin/services/venues-admin-service.ts`
- `src/features/admin/services/menu-items-admin-service.ts`
- `src/features/admin/services/join-requests-admin-service.ts`
- `src/components/admin/*`

## Observaciones practicas

- el panel admin sigue siendo la unica fuente de gestion del contenido
- los locales pueden existir en panel sin estar publicados
- el distintivo de ZylenPick depende de verificacion editorial y suscripcion activa
- los horarios se guardan como JSON por dia con uno o dos tramos
