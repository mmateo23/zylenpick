# Estructura del proyecto

## Presentacion de marca

Archivos relevantes:

- `src/app/el-proyecto/page.tsx`
- `src/components/project/project-page.tsx`

Responsabilidades:

- landing independiente de presentacion del proyecto
- narrativa de marca y problema de producto
- pagina editorial centrada en vision, recogida local y flujo del producto

## Solicitudes admin

Archivos relevantes:

- `src/app/panel/(admin)/solicitudes/page.tsx`
- `src/app/panel/(admin)/solicitudes/[requestId]/page.tsx`
- `src/components/admin/delete-join-request-button.tsx`
- `src/features/admin/services/join-requests-admin-service.ts`

Responsabilidades:

- listado con estado y conversion a local
- detalle con acciones
- borrado seguro con confirmacion
- restriccion de borrado si existe `linked_venue_id`
