# Arquitectura de ZylenPick

## Flujo de captacion de locales

El alta de locales queda separada en dos fases:

1. solicitud publica sencilla
2. alta completa manual desde panel admin

## Solicitud publica

`/unete` recoge solo la informacion minima necesaria para valorar el negocio.

El endpoint:

- valida campos obligatorios
- guarda la solicitud en `join_requests`
- envia email interno

## Revision admin

Desde `/panel/solicitudes` el equipo puede:

- revisar la solicitud
- aprobar o rechazar
- lanzar la creacion manual del local

## Alta manual del local

La alta final del local se hace en `/panel/locales/nuevo`.

Si viene desde una solicitud:

- recibe `requestId`
- precarga campos base del local
- muestra el resto de datos de la solicitud como contexto

## Relacion entre solicitud y local

La tabla `join_requests` usa:

- `linked_venue_id`

Esto permite trazabilidad sin automatizar todo el flujo.
