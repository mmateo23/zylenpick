# Estructura del proyecto

## Vision rapida

La estructura actual separa pantallas, componentes y logica de dominio de forma razonable para un MVP con panel admin centralizado.

## Zonas relevantes para solicitudes

### `src/components/join`

- formulario publico `/unete`
- validacion cliente y envio al endpoint interno

### `src/app/api/join/route.ts`

- valida la solicitud en servidor
- guarda la fila en `join_requests`
- envia el email interno

### `src/features/admin/services/join-requests-admin-service.ts`

- lectura del listado de solicitudes
- lectura del detalle
- cambio de estado

### `src/app/panel/(admin)/solicitudes`

- listado de solicitudes
- detalle de solicitud

### `src/app/panel/(admin)/locales/nuevo/page.tsx`

- admite precarga desde `requestId`
- usa la solicitud como contexto para dar de alta manualmente el local

## Migraciones relacionadas

- `20260309193000_join_requests_admin.sql`
- `20260310113000_join_requests_linked_venue.sql`

## Observaciones practicas

- el formulario publico no da de alta el local
- la solicitud y el alta completa quedan separadas
- la vinculacion final entre solicitud y local se hace con `linked_venue_id`
