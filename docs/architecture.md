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

## Backend y datos

### Base de datos principal

Supabase PostgreSQL.

Tablas clave:

- `cities`
- `venues`
- `menu_items`
- `join_requests`

### Modelado actual de `venues`

`venues` concentra ahora datos publicos, editoriales y operativos del local:

- identidad basica
- contacto
- notas de recogida
- tiempo de recogida
- estado operativo
- estado de publicacion
- verificacion editorial
- suscripcion activa
- orden visual
- horarios por dia

### Verificacion y suscripcion

El distintivo de ZylenPick no depende de cuenta reclamada ni de email validado.

Depende de dos condiciones persistidas:

- `is_verified`
- `subscription_active`

La UI publica solo muestra el isotipo cuando ambas son `true`.

### Publicacion

`is_published` controla si el local puede verse en la web publica.

Esto permite:

- mantener locales en panel
- prepararlos editorialmente
- publicarlos despues sin borrarlos ni desactivarlos operativamente

### Horarios

Los horarios se guardan como JSON por dia de la semana en `opening_hours`.

Cada dia puede incluir:

- abierto o cerrado
- primer tramo
- segundo tramo opcional

El frontend interpreta esa estructura para:

- pintar la rejilla `L M X J V S D`
- marcar en rojo los dias cerrados
- calcular `Abierto ahora` o `Cerrado ahora`

## Panel admin

### Alcance actual

- dashboard
- gestion de locales
- gestion de platos por local
- gestion de solicitudes

### Flujo editorial de locales

1. un negocio puede entrar por `/unete`
2. la solicitud se guarda en `join_requests`
3. el admin la revisa
4. el local se crea o actualiza manualmente en `/panel/locales`
5. el admin decide:
   - si esta publicado
   - si esta verificado
   - si la suscripcion esta activa

## Observaciones abiertas

- no existe persistencia real de pedidos en backend
- no existe panel de local
- las politicas RLS de admin siguen siendo temporales de MVP
- el naming interno continua mezclando `fknfood` con la marca visible
