# Variables de entorno

## Resumen

El proyecto usa un conjunto pequeño de variables de entorno. No se documentan valores, solo nombres, uso y ubicación recomendada.

## Variables actuales

### `NEXT_PUBLIC_SUPABASE_URL`

#### Para qué sirve

URL pública del proyecto Supabase.

#### Dónde se usa

- `src/lib/supabase/config.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/browser.ts`

#### Dónde configurar

- local: `.env.local`
- producción: variables de entorno de Vercel

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Para qué sirve

Clave pública anónima para acceder a Supabase desde frontend y server components.

#### Dónde se usa

- `src/lib/supabase/config.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/browser.ts`

#### Dónde configurar

- local: `.env.local`
- producción: variables de entorno de Vercel

### `RESEND_API_KEY`

#### Para qué sirve

Clave privada para enviar emails mediante Resend.

#### Dónde se usa

- `src/app/api/join/route.ts`

#### Dónde configurar

- local: `.env.local`
- producción: variables de entorno de Vercel

### `JOIN_REQUEST_TO_EMAIL`

#### Para qué sirve

Email de destino que recibe las solicitudes de negocios desde `/unete`.

#### Dónde se usa

- `src/app/api/join/route.ts`

#### Dónde configurar

- local: `.env.local`
- producción: variables de entorno de Vercel

### `JOIN_REQUEST_FROM_EMAIL`

#### Para qué sirve

Remitente del correo enviado desde el endpoint de `/unete`.

#### Dónde se usa

- `src/app/api/join/route.ts`

#### Comportamiento actual

Es opcional. Si no existe, el endpoint usa:

- `ZylenPick <onboarding@resend.dev>`

#### Dónde configurar

- local: `.env.local`
- producción: variables de entorno de Vercel

## Ubicación de archivos

### Local

- `.env.local`

### Producción

- panel de variables de entorno de Vercel

## Seguridad

- `.env.local` está ignorado por git
- no se deben commitear valores reales
- `RESEND_API_KEY` no debe exponerse nunca al cliente

## Observaciones

- algunas claves internas y nombres técnicos del proyecto siguen usando el naming heredado `fknfood`
- esto es intencional por ahora, porque la marca definitiva sigue en evaluación entre `ZylenPick` y `ZyPick`
- hoy no existen variables específicas para mapas
- hoy no existen variables para un backend propio
- si más adelante se añade Telegram, convendrá documentar nuevas variables aquí
