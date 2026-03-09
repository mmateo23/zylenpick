# Funcionalidades actuales

## Estado general

La app ya permite descubrir locales, explorar platos, anadir productos al carrito y completar un pedido local enteramente cliente-side. Tambien existe seguimiento basico del pedido activo, ticket imprimible y una tercera fase del panel admin orientada a locales, platos y solicitudes.

## Home

### Que hace hoy

- hero principal con selector de zona
- seleccion manual de zona
- deteccion por ubicacion
- modal explicativo `¿Que es ZylenPick?`
- muestra 3 platos destacados bajo el hero

### Estado

- funcionalidad activa de MVP

## Exploracion

### Que hace hoy

- listado de zonas
- listado de locales por zona
- filtros visuales por categoria
- local destacado en la zona
- ordenacion por cercania cuando existe ubicacion
- metricas de cercania en Home y locales:
  - tiempo andando
  - distancia
  - tiempo de recogida

### Estado

- funcionalidad activa de MVP
- la cercania se calcula en frontend con coordenadas manuales

## Pagina de local

### Que hace hoy

- hero del local
- informacion del local
- menu agrupado por categoria
- anadir al carrito
- resumen del carrito del local
- experiencia simple de llegada al local

### Estado

- funcionalidad activa de MVP

## Carrito y checkout

### Que hace hoy

- carrito persistido en navegador
- regla de un solo local por pedido
- edicion de cantidades
- checkout minimo con:
  - nombre
  - telefono
  - hora estimada de recogida
  - notas opcionales

### Estado

- funcionalidad activa de MVP
- el pedido se crea en local, no en base de datos

## Pedido activo

### Que hace hoy

- creacion de pedido local
- pedido activo con widget flotante
- cambio automatico a `Pedido listo para recoger`
- cierre manual del pedido
- cancelacion simple
- expiracion automatica

### Estado

- MVP funcional
- completamente cliente-side

## Ticket

### Que hace hoy

- pantalla de pedido confirmado
- ticket visual
- descarga o impresion PDF con `window.print()`
- boton de como llegar
- acciones para cerrar o cancelar pedido

### Estado

- funcionalidad activa
- no sincronizada todavia con backend real

## Mapas y navegacion

### Que hace hoy

- calculo local de distancia
- tiempo andando estimado
- pasos aproximados
- apertura de Apple Maps o Google Maps

### Estado

- MVP funcional
- sin SDK de mapas

## Contacto con el local

### Que hace hoy

- boton `Como llegar`
- boton `Enviar email` cuando hay email
- boton `Llamar` previsto, pero normalmente sin dato real consistente

### Estado

- parcial / provisional

## Captacion de negocios

### Que hace hoy

- ruta `/unete`
- formulario visual para locales
- guardado persistente en `join_requests`
- envio por email con Resend

### Estado

- funcionalidad activa
- aprobacion manual desde panel admin

## Panel admin

### Que hace hoy

- login privado en `/panel/login`
- acceso con Google
- acceso con email mediante magic link
- callback en `/panel/auth/callback`
- proteccion de rutas privadas
- allowlist simple por email admin
- dashboard inicial
- gestion centralizada de locales:
  - listado
  - crear local
  - editar local
- gestion centralizada de platos desde cada local:
  - ver platos del local
  - crear plato
  - editar plato
  - activar o desactivar
  - marcar como destacado
- gestion centralizada de solicitudes:
  - listado
  - detalle
  - aprobar
  - rechazar

### Que puede gestionar hoy

- datos de `venues`
- datos de `menu_items` ligados a cada `venue`
- datos de `join_requests`

### Estado

- tercera fase activa
- sin panel para locales
- sin roles complejos
- dashboard simple, sin analytics avanzadas

## Lo que todavia no existe

- persistencia real de pedidos en Supabase
- envio del pedido al local por email
- panel de local
- vista global `/panel/platos`
- gestion admin real de pedidos
- automatizacion de alta de local al aprobar una solicitud
- estados sincronizados con cocina o staff
