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

## Como funciona la autenticacion

El panel usa Supabase Auth.

Metodos activos:

- Google
- email por magic link

Flujo:

1. el usuario inicia sesion en `/panel/login`
2. Supabase devuelve al callback
3. el callback intercambia el codigo por sesion
4. el layout privado comprueba la sesion

## Allowlist de admins

Ademas de la sesion, el panel exige que el email del usuario este incluido en:

- `ADMIN_ALLOWED_EMAILS`

Formato:

- lista separada por comas

Ejemplo:

```env
ADMIN_ALLOWED_EMAILS=admin1@dominio.com,admin2@dominio.com
```

Si el usuario inicia sesion pero su email no esta permitido:

- no entra al panel
- ve un estado de acceso no autorizado

## Variables necesarias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_ALLOWED_EMAILS`

## Que incluye hoy el panel

### Dashboard

- numero de locales
- numero de platos
- numero de solicitudes
- bloques informativos para pedidos

### Locales

- listado
- creacion
- edicion
- acceso contextual a platos del local

Campos actuales:

- nombre
- slug
- ciudad
- descripcion
- direccion
- email
- pickup notes
- pickup eta
- imagen de portada
- activo / inactivo

### Platos por local

Los platos no se gestionan todavia desde una vista global.

Se administran desde el contexto de cada local:

- listado de platos del local
- creacion
- edicion
- activacion / desactivacion
- marcado como destacado

Campos actuales:

- nombre
- descripcion
- precio
- categoria
- imagen
- disponible / no disponible
- destacado / no destacado
- orden

### Solicitudes

Las solicitudes nacen en `/unete` y se guardan en `join_requests`.

El panel permite:

- listado de solicitudes
- detalle de cada solicitud
- aprobar
- rechazar

Campos visibles:

- local
- zona
- persona de contacto
- email y telefono de contacto
- estado
- fecha de creacion

En el detalle tambien se muestra:

- tipo de negocio
- direccion
- telefono y email del local
- web o Instagram
- tipo de servicio
- mensaje adicional

## Como anadir nuevos admins

1. el usuario debe poder iniciar sesion en Supabase
2. su email debe anadirse a `ADMIN_ALLOWED_EMAILS`
3. tras eso ya puede entrar al panel

## Observaciones

- la allowlist esta resuelta a nivel de aplicacion, no con roles avanzados
- la escritura de `venues` usa una politica temporal de MVP para usuarios autenticados
- la escritura de `menu_items` usa una politica temporal equivalente para usuarios autenticados
- `join_requests` acepta insercion publica y lectura/actualizacion autenticada para el panel
- aprobar una solicitud no crea automaticamente el local
- el panel sigue orientado a operacion interna, no a autoservicio de locales
- conviene endurecer permisos cuando exista un modelo de acceso mas solido
