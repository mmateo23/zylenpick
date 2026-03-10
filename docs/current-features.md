# Funcionalidades actuales

## Panel admin

### Solicitudes

- listado con estado de solicitud
- indicacion visual de conversion a local si existe `linked_venue_id`
- enlace al local creado cuando la solicitud ya fue convertida
- detalle completo de la solicitud
- aprobacion y rechazo manual
- borrado manual de solicitudes no vinculadas

### Limitacion de borrado

- si una solicitud ya esta vinculada a un local, no se puede eliminar desde el panel

## Trazabilidad

- `join_requests.linked_venue_id` identifica las solicitudes ya convertidas en un local real
