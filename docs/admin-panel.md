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
- eliminar solicitudes no vinculadas

## Conversion a local

Una solicitud se considera convertida cuando:

- `linked_venue_id` tiene valor

En el panel:

- el listado muestra un estado visual de `Convertida en local`
- aparece un enlace directo al local creado
- el detalle tambien muestra el local vinculado

## Borrado de solicitudes

El borrado esta pensado para:

- solicitudes de prueba
- solicitudes que no interesa conservar

Comportamiento:

- el boton `Eliminar solicitud` solo borra si la solicitud no esta vinculada
- antes de borrar, pide confirmacion explicita
- el mensaje deja claro que la accion no se puede deshacer

### Limitacion actual

Si la solicitud ya tiene `linked_venue_id`:

- no se puede eliminar desde el panel
- se muestra una advertencia clara

Esto evita perder la trazabilidad entre la solicitud y el local real.
