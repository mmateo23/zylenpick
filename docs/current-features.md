# Funcionalidades actuales

## Estado general

La app ya permite descubrir locales, explorar platos, añadir productos al carrito y completar un pedido local de forma enteramente cliente-side. También existe seguimiento básico del pedido activo y ticket imprimible.

## Home

### Qué hace hoy

- muestra un hero principal con selector de zona
- permite elegir zona manualmente
- permite usar ubicación del navegador
- abre un modal explicativo con `¿Qué es ZylenPick?`
- muestra platos en:
  - `Destacados cerca de ti`
  - `Lo último cerca de ti`

### Estado

- funcionalidad activa de MVP
- la selección de platos es simple, no personalizada

## Exploración

### Qué hace hoy

- listado de zonas disponibles
- listado de locales por zona
- filtros visuales por categoría
- local destacado dentro de la zona
- ordenación por cercanía cuando existe ubicación
- métricas de cercanía en Home y cards de locales:
  - tiempo andando
  - distancia
  - tiempo de recogida

### Estado

- funcionalidad activa de MVP
- la cercanía se calcula en frontend usando coordenadas manuales

## Página de local

### Qué hace hoy

- muestra hero del local
- muestra información del local
- muestra menú agrupado por categoría
- permite añadir platos al carrito
- muestra resumen del carrito del local
- permite abrir experiencia de llegada al local

### Estado

- funcionalidad activa de MVP

## Carrito y checkout

### Qué hace hoy

- carrito persistido en navegador
- regla de un solo local por pedido
- edición de cantidades
- eliminación de productos
- total del pedido
- formulario mínimo de checkout:
  - nombre
  - teléfono
  - hora estimada de recogida
  - notas opcionales

### Estado

- funcionalidad activa de MVP
- el pedido se crea localmente, no en base de datos

## Pedido activo

### Qué hace hoy

- al confirmar el pedido se crea un pedido local
- se marca un pedido activo
- aparece un widget flotante si existe pedido activo
- el widget cambia a `Pedido listo para recoger` cuando la cuenta atrás llega a cero
- el pedido activo puede:
  - completarse
  - cancelarse
  - expirar automáticamente tras un margen

### Estado

- MVP funcional
- completamente cliente-side

## Ticket

### Qué hace hoy

- pantalla de pedido confirmado
- muestra:
  - estado
  - recogida
  - cuenta atrás
  - resumen del pedido
  - total
  - datos del cliente
  - dirección del local
- incluye ticket imprimible
- permite imprimir o guardar como PDF con `window.print()`

### Estado

- funcionalidad activa
- ticket no sincronizado con backend

## Mapas y navegación

### Qué hace hoy

- cálculo de distancia en frontend
- tiempo andando estimado
- pasos aproximados
- apertura de ruta externa en:
  - Apple Maps en dispositivos Apple
  - Google Maps en Android y escritorio

### Estado

- MVP funcional
- sin SDK de mapas ni rutas reales paso a paso

## Contacto con el local

### Qué hace hoy

- botón `Cómo llegar`
- botón `Enviar email` cuando hay email disponible
- botón `Llamar` existe en la pantalla final, pero hoy suele aparecer como no disponible porque el teléfono del local no está modelado de forma consistente

### Estado

- parcial / provisional

## Captación de negocios

### Qué hace hoy

- ruta `/unete`
- formulario visual para negocios interesados
- envío por email a través de Resend

### Estado

- funcionalidad activa
- el formulario está en modo prueba y permite validar el envío aunque falten datos

## Lo que todavía no existe

- persistencia real de pedidos en Supabase
- envío de pedido al local por email
- panel de local
- auth del usuario final integrada en el flujo principal
- estados de pedido sincronizados con cocina o staff
