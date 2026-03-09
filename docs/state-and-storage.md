# Estado y almacenamiento local

## Resumen

El MVP actual depende bastante de `localStorage`. Esto permite iterar rápido, pero también significa que parte del comportamiento del producto depende del navegador y del dispositivo concretos del usuario.

Nota de naming:

- algunas claves internas todavía usan el naming heredado `fknfood`
- otras ya usan `zylenpick`
- esta mezcla es temporal y no debe renombrarse todavía hasta cerrar la marca final entre `ZylenPick` y `ZyPick`

## Claves actuales en `localStorage`

### `fknfood.cart`

#### Para qué sirve

Guarda el carrito actual.

#### Qué contiene

- local asociado
- productos
- cantidades

#### Dónde se usa

- `src/features/cart/constants.ts`
- `src/features/cart/services/cart-storage.ts`
- `src/features/cart/hooks/use-cart.ts`

#### Cómo se limpia

- al vaciar carrito manualmente
- tras confirmar pedido en checkout
- al dejar el carrito sin items

#### Observación

La clave conserva el naming antiguo `fknfood`. Esto se mantiene de momento a propósito hasta decidir el naming definitivo.

### `zylenpick.selected-city`

#### Para qué sirve

Guarda la zona seleccionada por el usuario.

#### Qué contiene

- `slug`
- `name`

#### Dónde se usa

- `src/features/location/city-preference.ts`
- `src/components/layout/site-header.tsx`
- `src/components/location/city-preference-sync.tsx`
- Home y páginas de zona

#### Cómo se actualiza

- al elegir zona en Home
- al resolver zona por ubicación
- al entrar en páginas que sincronizan la ciudad actual

### `zylenpick.user-location`

#### Para qué sirve

Guarda la ubicación aceptada por el usuario.

#### Qué contiene

- `latitude`
- `longitude`

#### Dónde se usa

- `src/features/location/browser-location.ts`
- Home
- exploración de locales
- página de local
- ticket y pedido confirmado

#### Cómo se limpia

No hay todavía un flujo específico para borrarla desde la interfaz.

### `zylenpick.orders`

#### Para qué sirve

Guarda los pedidos creados en el navegador.

#### Qué contiene

Cada pedido guarda:

- id
- fecha de creación
- hora estimada de recogida
- nombre
- teléfono
- notas
- local
- items
- total
- estado de resolución

#### Dónde se usa

- `src/features/orders/services/order-storage.ts`
- ticket
- ticket imprimible
- widget de pedido activo

### `zylenpick.active-order-id`

#### Para qué sirve

Marca qué pedido sigue activo para el widget flotante y el seguimiento rápido.

#### Dónde se usa

- `src/features/orders/services/order-storage.ts`
- `src/components/orders/active-order-widget.tsx`

#### Cómo se limpia

- al marcar `Pedido recogido`
- al pulsar `Cancelar pedido`
- automáticamente si el pedido ya expiró

## Cómo funciona el carrito

### Lectura

`useCart()` empieza vacío y luego sincroniza desde `localStorage`.

### Escritura

Cada cambio emite el evento:

- `fknfood:cart-updated`

### Regla importante

Solo se permite un local por carrito. Si el usuario intenta mezclar locales, el sistema devuelve conflicto y mantiene el carrito original.

## Cómo funciona el pedido activo

### Creación

Al confirmar el checkout:

1. se crea un pedido en `zylenpick.orders`
2. se escribe su id en `zylenpick.active-order-id`

### Lectura

El widget y la pantalla del pedido activo leen el pedido por ese id.

### Cierre

- `Pedido recogido` marca el pedido como `completed`
- `Cancelar pedido` marca el pedido como `cancelled`
- en ambos casos se borra la clave de pedido activo

## Cómo cambia el estado del pedido

El estado operativo visible al usuario se calcula con tiempo, no con backend:

- `Pedido recibido`
- `En preparación`
- `Listo para recoger`

La transición depende de:

- `createdAt`
- `pickupAt`

Además existe un estado interno de resolución:

- `active`
- `completed`
- `cancelled`

## Cómo expira el pedido activo

### Regla actual

El pedido activo expira automáticamente 3 horas después de `pickupAt`.

### Qué pasa al expirar

- se limpia `zylenpick.active-order-id`
- el widget flotante deja de mostrarse
- el pedido sigue existiendo dentro de `zylenpick.orders`

### Motivo

Evitar pedidos zombis o widgets atascados en el navegador.

## Observaciones

- conviven claves con naming `fknfood` y `zylenpick`
- esa mezcla es conocida y temporal
- no hay session storage relevante en el flujo activo, aunque existe una clave antigua de compatibilidad
- no hay sincronización entre navegadores o dispositivos
- si el usuario cambia de navegador, no verá su carrito ni su pedido activo
