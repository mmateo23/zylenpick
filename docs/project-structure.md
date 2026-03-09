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

Rutas heredadas que siguen existiendo pero no forman parte del flujo principal:

- `/acceder`
- `/cuenta`
- `/favoritos`
- `/panel-comercio`
- `/pedidos`
- `/carrito`

### `src/components`

Componentes visuales reutilizables.

Subcarpetas mas relevantes:

- `branding`
  - logo y marca
- `layout`
  - shell y cabecera publica
- `home`
  - landing principal
- `venues`
  - exploracion por zona, cards y detalle de local
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

Subzonas:

- `supabase`
  - configuracion y clientes
- `utils`
  - helpers como formato de moneda

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

## Bloques funcionales

### Home

- `src/app/page.tsx`
- `src/components/home/home-landing.tsx`
- `src/features/cities/services/cities-service.ts`
- `src/features/venues/services/venues-service.ts`

### Cart

- `src/app/cart/page.tsx`
- `src/features/cart/components/cart-screen.tsx`
- `src/features/cart/hooks/use-cart.ts`
- `src/features/cart/services/cart-storage.ts`
- `src/components/cart/mobile-cart-bar.tsx`

### Orders

- `src/app/checkout/success/[orderId]/page.tsx`
- `src/app/checkout/success/[orderId]/ticket/page.tsx`
- `src/features/orders/services/order-storage.ts`
- `src/features/orders/components/order-ticket-screen.tsx`
- `src/features/orders/components/printable-order-ticket.tsx`
- `src/components/orders/active-order-widget.tsx`

### Localizacion

- `src/features/location/browser-location.ts`
- `src/features/location/city-preference.ts`
- `src/components/location/city-preference-sync.tsx`
- `src/features/venues/venue-meta.ts`

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
- `src/features/admin/services/admin-auth.ts`
- `src/features/admin/services/dashboard-service.ts`
- `src/features/admin/services/venues-admin-service.ts`
- `src/features/admin/services/menu-items-admin-service.ts`
- `src/features/admin/services/join-requests-admin-service.ts`
- `src/components/admin/*`

### Componentes compartidos

- `src/components/layout/*`
- `src/components/icons/*`
- `src/components/branding/logo.tsx`

### Estilos globales

- `src/app/globals.css`

Aqui viven:

- variables de color
- `hover-lift-card`
- `magnetic-button`
- `spotlight-panel`
- `dark-form-field`

## Observaciones practicas

- la estructura ya esta bastante orientada al MVP actual
- el panel admin crece por fases sin introducir panel de local
- los platos se administran desde cada local, no desde una vista global
- las solicitudes se guardan desde `/unete` y se revisan desde el panel
- conviven rutas y piezas heredadas del prototipo anterior
- todavia hay naming antiguo `fknfood` en algunas capas internas
