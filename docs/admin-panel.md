# Panel admin

## Objetivo

El panel admin existe para gestionar ZylenPick de forma centralizada durante el MVP.

No existe panel para locales en esta fase.

## Acceso al panel

### Rutas publicas

- `/panel/login`
- `/panel/auth/callback`

### Rutas privadas actuales

- `/panel`
- `/panel/locales`
- `/panel/locales/nuevo`
- `/panel/locales/[venueId]`
- `/panel/locales/[venueId]/platos`
- `/panel/locales/[venueId]/platos/nuevo`
- `/panel/locales/[venueId]/platos/[menuItemId]`
- `/panel/solicitudes`
- `/panel/solicitudes/[requestId]`

## Gestion de locales

Campos operativos y editoriales actuales:

- nombre
- slug
- ciudad
- descripcion
- direccion
- email
- telefono
- notas de recogida
- tiempo estimado de recogida
- imagen de portada
- local activo
- visible en la web publica
- local verificado por ZylenPick
- suscripcion activa
- orden visual
- horarios por dia

## Criterio de verificacion

Un local verificado no significa email validado ni cuenta reclamada.

Significa que:

- ha sido revisado por ZylenPick
- cumple estandares minimos de calidad para recogida
- esta preparado para una experiencia correcta de recogida
- forma parte de la red de locales asociados
- mantiene una suscripcion activa

El distintivo solo aparece cuando:

- `is_verified = true`
- `subscription_active = true`

## Publicacion

El panel distingue dos conceptos:

- `is_active`
  - control operativo interno
- `is_published`
  - visibilidad publica del local

Un local puede existir en el panel sin mostrarse todavia en la web publica.

## Horarios

Los horarios se guardan por dia con esta estructura logica:

- abierto o cerrado
- tramo principal
- segundo tramo opcional

Dias mostrados:

- `L M X J V S D`

En la web publica:

- los dias cerrados se muestran en rojo
- si encaja con la hora actual, se muestra `Abierto ahora` o `Cerrado ahora`

## Gestion de solicitudes

Las solicitudes nacen en `/unete` y se guardan en `join_requests`.

El panel permite:

- listado de solicitudes
- detalle de cada solicitud
- aprobar
- rechazar

Aprobar una solicitud no crea automaticamente el local.

## Observaciones

- el panel sigue orientado a operacion interna
- no hay panel de local
- no hay roles complejos
- las politicas de escritura siguen siendo temporales de MVP y convendra endurecerlas despues
