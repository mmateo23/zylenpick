# Arquitectura de ZylenPick

## Vision general

ZylenPick es una web de pedidos locales para recoger construida con Next.js App Router. La aplicacion mezcla:

- renderizado en servidor para leer datos de Supabase
- componentes cliente para interaccion, `localStorage`, ubicacion y ticket

El proyecto sigue un enfoque MVP:

- experiencia visual fuerte
- flujo simple
- control centralizado desde panel admin
- sin panel para locales en esta fase

## Frontend

### Stack principal

- Next.js 14
- React 18
- Tailwind CSS
- TypeScript

### Organizacion

- `src/app`
  - rutas y pantallas
- `src/components`
  - UI reutilizable
- `src/features`
  - logica por dominio
- `src/lib`
  - utilidades transversales
- `src/types`
  - tipos globales de base de datos

### Que se resuelve en servidor

- Home con ciudades y seleccion simple de platos
- zonas y locales desde Supabase
- detalle del local y menu
- panel admin privado

### Que se resuelve en cliente

- carrito
- ubicacion del usuario
- ciudad seleccionada
- pedido activo
- ticket imprimible
- modal explicativo de la Home
- login del panel admin

## Backend y datos

### Base de datos

La base de datos principal es Supabase PostgreSQL.

Tablas relevantes del MVP:

- `cities`
- `venues`
- `menu_items`
- `join_requests`
- `profiles`
- `venue_memberships`

Observaciones:

- `profiles` y `venue_memberships` vienen del prototipo anterior y hoy no son la base del modelo de producto
- los pedidos finales del usuario todavia no viven en Supabase; siguen en `localStorage`
- `menu_items` ya incluye `is_featured` para destacado persistido en panel admin
- `join_requests` permite revisar desde panel las solicitudes enviadas desde `/unete`

### Acceso a Supabase

Clientes activos:

- `src/lib/supabase/server.ts`
- `src/lib/supabase/browser.ts`
- cliente simple con `@supabase/supabase-js` en `/api/join` para guardar solicitudes publicas

El catalogo publico y el panel admin leen datos desde Supabase usando el cliente servidor.

## Panel admin

### Objetivo actual

Gestion centralizada del MVP por parte del equipo interno.

No existe panel de local en esta fase.

### Acceso

El panel usa:

- Supabase Auth
- allowlist simple por email

Flujo actual:

1. `/panel/login`
2. login con Google o email
3. callback en `/panel/auth/callback`
4. comprobacion de sesion
5. comprobacion de `ADMIN_ALLOWED_EMAILS`

### Proteccion

Las rutas privadas viven bajo:

- `src/app/panel/(admin)`

El layout protegido:

- exige sesion
- comprueba allowlist
- muestra acceso no autorizado si el email no esta permitido

### Alcance implementado

- dashboard inicial
- gestion de locales
- gestion de platos ligada a cada local
- gestion de solicitudes de alta

Pendiente para fases posteriores:

- pedidos conectados a base de datos
- vista global de platos si hiciera falta
- automatizacion parcial del alta de locales

## Hosting y despliegue

### Estado confirmado

- el proyecto esta preparado para Vercel
- `.vercel` esta ignorado en git
- el despliegue actual del proyecto esta planteado para Vercel

### Estado pendiente de confirmar en codigo

- no hay `vercel.json`
- no hay infraestructura como codigo
- no hay pipeline CI/CD documentado en el repositorio

## DNS

No hay configuracion DNS documentada dentro del repositorio.

Estado:

- pendiente de confirmar

## Repositorio

### Estado observable

- repositorio local en `C:\Users\Manu\Documents\FknFood`
- nombre del paquete en `package.json`: `fknfood`

## Naming del proyecto

El naming definitivo del producto todavia no esta cerrado.

Estado actual:

- nombre tecnico heredado: `fknfood`
- nombre de marca visible en evaluacion: `ZylenPick`
- variante tambien en evaluacion: `ZyPick`

Decision actual:

- no renombrar todavia claves internas
- no renombrar todavia el paquete
- no renombrar todavia namespaces ni rutas internas

## Emails

### Uso actual

El envio de email activo hoy es:

- formulario `/unete`

Se envia a traves de Resend desde:

- `/api/join`

Observacion:

- las solicitudes de `/unete` ya se guardan tambien en `join_requests`
- los pedidos al local todavia no se envian por email

## Mapas y navegacion

### Estado actual

No hay SDK de mapas embebido.

Se usa una solucion simple basada en:

- coordenadas por `venueSlug` en `src/features/venues/venue-meta.ts`
- calculo local de distancia con Haversine
- apertura de Apple Maps o Google Maps mediante URL

### Que permite hoy

- distancia aproximada
- tiempo andando estimado
- pasos aproximados
- apertura de ruta externa

## Como se relacionan las piezas principales

### Descubrimiento

1. Home carga ciudades y platos destacados desde Supabase.
2. El usuario elige zona manualmente o por ubicacion.
3. La zona elegida se guarda en `localStorage`.

### Catalogo

1. `/cities/[citySlug]` carga locales.
2. `/cities/[citySlug]/venues/[venueSlug]` carga local y menu.
3. Si hay ubicacion, el frontend calcula cercania.

### Compra

1. El usuario anade productos al carrito.
2. El carrito se persiste en `localStorage`.
3. En `/cart` se completa checkout minimo.
4. Se crea un pedido local, todavia no persistido en backend.

### Captacion de locales

1. Un negocio envia el formulario en `/unete`.
2. `/api/join` guarda la solicitud en `join_requests`.
3. El mismo endpoint envia un email interno.
4. El equipo revisa la solicitud desde `/panel/solicitudes`.

### Operacion interna

1. El equipo accede a `/panel/login`.
2. Si el email esta autorizado, entra en `/panel`.
3. Desde ahi puede gestionar locales, platos y solicitudes.

## Observaciones abiertas

- no existe persistencia real de pedidos en backend
- no existe panel de local
- el telefono del local no esta modelado de forma consistente
- hay rutas heredadas del prototipo anterior todavia presentes
- hay textos con codificacion irregular en algunos archivos antiguos
