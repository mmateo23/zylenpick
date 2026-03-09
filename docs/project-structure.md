# Estructura del proyecto

## Visión rápida

La estructura actual separa pantallas, componentes y lógica de dominio de forma razonablemente clara para un MVP.

## Carpetas principales

### `src/app`

Contiene las rutas de Next.js App Router.

Rutas activas más importantes:

- `/`
- `/cities`
- `/cities/[citySlug]`
- `/cities/[citySlug]/venues/[venueSlug]`
- `/cart`
- `/checkout/success/[orderId]`
- `/checkout/success/[orderId]/ticket`
- `/unete`
- `/api/join`

También mantiene rutas heredadas del prototipo anterior que ya no forman parte del flujo principal:

- `/acceder`
- `/cuenta`
- `/favoritos`
- `/panel-comercio`
- `/pedidos`
- `/carrito`

### `src/components`

Componentes visuales reutilizables.

Subzonas relevantes:

- `branding`
  - logo y marca visual
- `layout`
  - `site-shell`, `site-header`, estructura global
- `home`
  - landing principal de la Home
- `venues`
  - cards, exploración por zona, llegada al local, visor de ruta
- `cart`
  - barra móvil del carrito
- `orders`
  - widget de pedido activo
- `join`
  - formulario de captación de locales
- `icons`
  - iconos SVG internos

### `src/features`

Lógica del dominio separada por área.

#### `features/cities`

- tipos y lectura de ciudades desde Supabase

#### `features/venues`

- lectura de locales y menú
- metadatos manuales de locales
- selección para Home
- categorías y coordenadas por `slug`

#### `features/cart`

- tipos del carrito
- persistencia en `localStorage`
- hook `useCart`
- pantalla principal del carrito y checkout

#### `features/orders`

- tipos de pedido
- persistencia local del pedido
- pedido activo
- ticket y ticket imprimible

#### `features/location`

- ubicación del usuario
- ciudad seleccionada
- cálculo de distancias

### `src/lib`

Utilidades transversales.

Subzonas relevantes:

- `supabase`
  - configuración y clientes de Supabase
- `utils`
  - helpers como formato de moneda

### `src/types`

- tipos globales de base de datos (`database.ts`)

### `supabase/migrations`

Migraciones SQL del proyecto.

Incluyen:

- esquema inicial
- ajustes de auth heredados
- ciudades y menú
- seed del local real principal
- seed adicional de locales de Talavera

## Qué partes corresponden a cada bloque funcional

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

### Localización

- `src/features/location/browser-location.ts`
- `src/features/location/city-preference.ts`
- `src/components/location/city-preference-sync.tsx`
- `src/features/venues/venue-meta.ts`

### Componentes compartidos

- `src/components/layout/*`
- `src/components/icons/*`
- `src/components/branding/logo.tsx`

### Estilos globales

- `src/app/globals.css`

Aquí viven:

- variables de color
- utilidades como `hover-lift-card`
- `magnetic-button`
- `spotlight-panel`
- `dark-form-field`

## Observaciones prácticas

- la estructura actual ya está bastante orientada al MVP nuevo
- aún conviven carpetas y rutas del prototipo anterior
- no están eliminadas del repositorio, solo apartadas del flujo principal
- hay piezas de UI y storage que todavía arrastran el naming antiguo `fknfood`
