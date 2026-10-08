# Home editorial y pedidos en pausa

Dirección aprobada el 14 de septiembre de 2026: Lo local y Explora al mismo nivel, sin numeración. El iPost existente sigue siendo la pieza central. Cada ambiente incluye su propio contenido inferior; según la última aclaración, los eventos activos entran en la misma cabecera como tercer ambiente.

## Reutilización

- `PickyaloHome` compone en servidor los productos, comercios publicados, puntos de rutas publicadas y campaña existente. No se añaden tablas ni servicios.
- `HomeEditorial` sólo controla selección, teclado y gesto horizontal. El contenido llega como composición de servidor. Los paneles inactivos quedan ocultos también para tecnologías de asistencia. Se respeta movimiento reducido y desplazamiento vertical.
- `HomeEditorialPost` comparte el diseño del iPost con la previsualización del evento. Se reutilizan assets de comida, monumentos, cerámica y stickers.
- La navegación pública comparte `SiteHeader`; la portada no monta carrito, seguimiento de pedidos ni campaña flotante. Las tarjetas públicas conservan precios fixed/from/variable/hidden y acceso a la ficha/contacto.

## Congelación reversible

- `next.config.mjs`: redirecciones temporales 307 de `/cart`, `/carrito`, `/checkout` y `/pedidos`, incluyendo subrutas, hacia `/`.
- `/api/cart`: GET y POST responden 410 y `Cache-Control: no-store`. Los handlers anteriores se conservan sin importar en `src/features/cart/services/frozen-cart-route.ts`.
- Se conservan las páginas, componentes, almacenamiento local, servicios y tablas de pedidos. No se borran datos ni se migran esquemas.
- Para reactivar se deben retirar las redirecciones, restaurar los handlers y volver a conectar los controles públicos en una tarea explícita. No basta con volver a mostrar un botón.

## Panel

Fichas, Destacados, Horarios y Métricas son las cuatro entradas principales. Las herramientas privadas existentes siguen disponibles en sus rutas; no se destruyen.

Horarios reutiliza el editor semanal y autorización administrativa existentes. Su acción sólo actualiza `opening_hours` del comercio seleccionado y revalida las vistas públicas. El enlace privado de gestión y su aislamiento por token permanecen intactos.

Las métricas muestran recuentos reales del catálogo. Visitas y clics siguen en PostHog; no se crea un sistema de analítica paralelo. El evento reutiliza la configuración y subida de imágenes existentes; el procesador de imágenes se carga al seleccionar un archivo.

## Validación

`npx vitest run --config vitest.discovery.config.mjs` cubre la frontera pública de pedidos, publicación/fechas de eventos, autorización y alcance de actualización de horarios, y regresiones del panel privado por token. La compilación de producción ejecuta también TypeScript y ESLint. La comprobación visual se hace sobre móvil y escritorio, incluidos cambio de ambiente, selección inferior y navegación con teclado.

## Aclaración de escaparate y copy

La portada explica Pickyalo como el escaparate de Talavera. El titular «Tu ciudad. A primera vista.» combina tipografía grande y espacio con el iPost existente. En escritorio se ven juntos; en móvil se apilan. Lo local usa granate y crema; Explora, tonos verdes suaves; Eventos, ámbar. El cambio de ambiente conserva teclado, gesto horizontal, movimiento reducido y selección inferior coherente.

El explorador mantiene `/platos` para preservar enlaces, búsqueda, categorías, precios y analítica, pero la interfaz habla de productos, platos y packs. Sus filtros principales son generales; las selecciones gastronómicas antiguas siguen resolviendo enlaces existentes. Los productos y categorías se cargan de los registros actuales. No se inventan productos artesanales ni se crean otros modelos o procesos de compra.

La pose que saluda en Explora se encuadra con CSS desde la fila inferior central de `public/manage/sticker-pack.png`. Se sitúa a la derecha y con menor tamaño; Lo local conserva su sticker a la izquierda. No se modifica el recurso original.
