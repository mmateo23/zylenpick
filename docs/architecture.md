# Arquitectura de ZylenPick

## Visión general

ZylenPick es una web de pedidos locales para recoger construida con Next.js App Router. El proyecto mezcla renderizado en servidor para leer datos de Supabase y componentes cliente para toda la interacción que depende del navegador, especialmente:

- carrito
- ubicación del usuario
- pedido activo
- ticket imprimible

La arquitectura actual está optimizada para un MVP visual y rápido de iterar. No hay backend propio separado ni paneles complejos. La mayor parte del estado persistente del usuario vive en `localStorage` y los datos de catálogo viven en Supabase.

## Frontend

### Stack principal

- Next.js 14 con App Router
- React 18
- Tailwind CSS
- TypeScript

### Patrón actual

- páginas en `src/app`
- lógica de dominio en `src/features`
- componentes de interfaz en `src/components`
- utilidades compartidas en `src/lib`

### Qué se renderiza en servidor

- Home con ciudades y selección de platos destacados/recientes
- listado de zonas
- listado de locales por zona
- página de local y menú

Estas páginas leen datos desde Supabase usando el cliente server-side.

### Qué se resuelve en cliente

- carrito en `localStorage`
- ubicación del usuario
- selección de zona persistida
- widget flotante de pedido activo
- creación de pedido MVP en navegador
- ticket imprimible con `window.print()`
- modal explicativo de la Home

## Backend y datos

### Base de datos

La base de datos principal es Supabase PostgreSQL.

Tablas relevantes para el MVP actual:

- `cities`
- `venues`
- `menu_items`
- `profiles` y `venue_memberships` existen por migraciones previas, pero no son núcleo del flujo actual

Tablas de pedidos persistidos en base de datos:

- no están activas todavía en el flujo real

Observación:

- el pedido actual del usuario no se guarda en Supabase; se guarda en `localStorage`
- esto es intencional en el estado actual del MVP

### Acceso a datos

Se usan dos clientes Supabase:

- `src/lib/supabase/server.ts`
- `src/lib/supabase/browser.ts`

En la práctica actual, la lectura de catálogo se hace sobre todo desde el cliente servidor de Next.

## Hosting y despliegue

### Estado confirmado

- el proyecto está preparado para desplegarse en Vercel
- `.vercel` está ignorado en git
- el usuario ha indicado que el proyecto ya está desplegado en Vercel

### Estado pendiente de confirmar en código

- no hay `vercel.json`
- no hay infraestructura como código para entornos
- no hay pipeline CI/CD documentado dentro del repositorio

## DNS

No hay configuración DNS documentada dentro del repositorio.

Estado:

- pendiente de confirmar

Esto implica que la relación entre dominio público, Vercel y posibles subdominios no está trazada todavía en código ni en documentación.

## Repositorio

### Estado observable

- repositorio Next.js local en `C:\Users\Manu\Documents\FknFood`
- nombre del paquete en `package.json`: `fknfood`

## Naming del proyecto

El naming definitivo del producto todavía no está cerrado.

Estado actual:

- el nombre técnico heredado del prototipo es `fknfood`
- el nombre de marca que se está usando hoy en interfaz es `ZylenPick`
- también se está evaluando la variante `ZyPick`
- el naming definitivo aún no está decidido

Decisión actual:

- no renombrar todavía claves internas
- no renombrar todavía el paquete en `package.json`
- no renombrar todavía namespaces ni rutas internas

Esto significa que, por ahora, la arquitectura convive con nombres heredados y nombres de marca en evaluación.

### Observación importante

Hay una incoherencia de naming entre:

- marca visible actual: `ZylenPick`
- variante de marca en evaluación: `ZyPick`
- nombre del paquete/repositorio local: `fknfood`
- algunas claves antiguas de `localStorage` del carrito siguen usando `fknfood`

Esto queda pendiente hasta cerrar el naming definitivo del producto.

## Emails

### Uso actual

El único envío de email activo en este momento es el formulario `/unete`.

### Flujo

- el formulario envía un `POST` a `/api/join`
- el endpoint compone email HTML y texto plano
- el envío se realiza contra la API HTTP de Resend

### Variables implicadas

- `RESEND_API_KEY`
- `JOIN_REQUEST_TO_EMAIL`
- `JOIN_REQUEST_FROM_EMAIL`

### Observación

Los pedidos al local todavía no se envían por correo. El email está implementado solo para captación de negocios.

## Mapas y navegación

### Estado actual

No hay SDK de mapas embebido ni routing avanzado.

Se usa una capa simple basada en:

- coordenadas por `venueSlug` en `src/features/venues/venue-meta.ts`
- cálculo local de distancia con Haversine
- apertura de Apple Maps o Google Maps mediante URL

### Qué permite hoy

- mostrar distancia aproximada
- mostrar tiempo andando estimado
- mostrar pasos aproximados
- abrir ruta externa en Apple Maps o Google Maps

### Observación

Las coordenadas están mantenidas manualmente en código. No proceden todavía de la base de datos.

## Cómo se relacionan las piezas principales

### Descubrimiento

1. Home carga ciudades y una selección simple de platos desde Supabase.
2. El usuario selecciona zona manualmente o por ubicación.
3. La zona elegida se guarda en `localStorage`.
4. La navegación y ciertas pantallas usan esa preferencia.

### Catálogo

1. `/cities/[citySlug]` carga locales de Supabase.
2. `/cities/[citySlug]/venues/[venueSlug]` carga detalle del local y menú.
3. Si hay ubicación guardada, el frontend calcula cercanía y reordena ciertas listas.

### Compra

1. El usuario añade productos al carrito.
2. El carrito se persiste en `localStorage`.
3. En `/cart` se completan datos mínimos.
4. Al confirmar, se crea un pedido local en `localStorage`.

### Seguimiento

1. Se marca un pedido activo por clave específica en `localStorage`.
2. El widget flotante lee ese pedido activo.
3. La pantalla de ticket permite cerrar o cancelar el pedido.
4. Al cerrarlo o cancelarlo, el pedido activo se limpia.

## Observaciones abiertas

- no existe persistencia real de pedidos en backend
- no existe panel de local
- no existe sistema de estados sincronizado con cocina o personal del local
- el teléfono del local no está modelado de forma consistente en base de datos
- hay textos con codificación heredada irregular en algunos archivos antiguos
