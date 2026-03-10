# Funcionalidades actuales

## Presentacion del proyecto

- existe una landing independiente en `/el-proyecto`
- presenta la vision del producto sin usar testimonios ni prueba social inventada
- usa una estructura visual de marketing con tres bloques: problema, idea y como funciona
- integra animacion ambiental sutil en hero y un bloque narrativo de pasos en como funciona
- no forma parte del menu principal

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
