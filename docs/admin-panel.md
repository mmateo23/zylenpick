# Panel admin

## Solicitudes

### Rutas

- `/panel/solicitudes`
- `/panel/solicitudes/[requestId]`

### Que puede hacer hoy el admin

- ver listado de solicitudes
- revisar detalle completo
- aprobar
- rechazar
- crear local desde una solicitud

## Crear local desde solicitud

El flujo es manual y deliberadamente simple:

1. el admin abre una solicitud
2. pulsa `Crear local desde esta solicitud`
3. entra en `/panel/locales/nuevo?requestId=...`
4. el formulario del local llega con datos base precargados
5. el admin completa el alta del local

### Datos que se precargan en el formulario de local

- nombre del local
- slug sugerido
- ciudad si coincide con una ciudad existente
- direccion
- telefono del local si existe
- email del local si existe

### Datos que se muestran como contexto de la solicitud

- persona de contacto
- telefono de contacto
- email de contacto
- tipo de servicio
- mensaje adicional

## Trazabilidad

La tabla `join_requests` incluye:

- `linked_venue_id`

Sirve para:

- saber si una solicitud ya ha terminado en un local real
- enlazar desde la solicitud al local creado

## Observaciones

- aprobar una solicitud no crea automaticamente el local
- el panel sigue orientado a operacion interna
- no hay panel para locales externos
