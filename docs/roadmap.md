# Roadmap de desarrollo

## Qué está hecho

### Base del producto

- repositorio Next.js operativo
- UI dark coherente con marca ZylenPick
- Home con hero, modal explicativo y selección de zona
- zonas y locales cargados desde Supabase
- menú de local con platos reales

### Exploración

- categorías visuales por tipo de comida
- destacados y recientes en Home
- local destacado por zona
- cercanía calculada si el usuario acepta ubicación

### Compra

- carrito cliente-side
- persistencia en navegador
- checkout mínimo
- creación de pedido local

### Seguimiento

- ticket visual
- widget de pedido activo
- cierre manual del pedido
- cancelación simple
- expiración automática
- ticket imprimible

### Negocio

- formulario `/unete`
- envío por email a través de Resend

## Qué está en curso

### Madurez de MVP

- consolidación del flujo desde Home hasta ticket
- mejora progresiva de UX móvil
- limpieza de inconsistencias heredadas del prototipo anterior

### Deuda visible

- naming antiguo `fknfood` en algunas claves y package name
- partes del proyecto social antiguo siguen presentes en el repo
- algunos textos antiguos tienen problemas de codificación
- teléfono del local no está resuelto como dato consistente

## Siguientes pasos lógicos

### Prioridad alta

1. Persistir pedidos en Supabase
2. Crear `orders` y `order_items` reales en base de datos
3. Enviar pedido al local por email
4. Dejar de depender solo de `localStorage` para el pedido

### Prioridad media

1. Añadir teléfono real del local al modelo de datos
2. Mover coordenadas de locales a base de datos
3. Limpiar rutas y carpetas heredadas del prototipo social
4. Unificar naming interno de `fknfood` a `zylenpick`

### Prioridad media-baja

1. Crear panel mínimo para locales o vista operativa de tickets
2. Añadir estados manuales del pedido desde local
3. Mejorar el flujo de contacto con el negocio

### Prioridad baja

1. Añadir geocodificación o cálculo de rutas más preciso
2. Añadir notificaciones adicionales como Telegram
3. Añadir analítica de conversión y uso

## Riesgos actuales

- el pedido activo depende del navegador y puede perderse al cambiar de dispositivo
- no hay backend de pedidos todavía
- el flujo operativo del local no está cubierto más allá del ticket local
- la infraestructura de dominio y DNS no está documentada

## Observaciones prácticas

- el MVP ya es navegable y demostrable
- el siguiente salto real no es más UI, sino cerrar persistencia y operativa del pedido
- antes de crecer en features conviene estabilizar:
  - datos de pedidos
  - naming interno
  - limpieza del prototipo heredado
