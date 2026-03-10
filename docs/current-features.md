# Funcionalidades actuales

## Estado general

La app ya permite descubrir locales, explorar platos, anadir productos al carrito y completar un pedido local enteramente cliente-side. Tambien existe un panel admin centralizado para gestionar locales, platos y solicitudes.

## Captacion de negocios

### Que hace hoy

- ruta `/unete`
- formulario publico simplificado
- validacion real de campos obligatorios
- guardado persistente en `join_requests`
- envio por email con Resend
- revision manual posterior desde el panel admin

### Campos obligatorios

- nombre del local
- tipo de negocio
- ciudad o zona
- direccion
- persona de contacto
- telefono de contacto
- email de contacto
- tipo de servicio
- aceptacion de privacidad

### Campos opcionales

- telefono del local
- email del local
- web o Instagram
- mensaje adicional

### Estado

- funcionalidad activa
- sin alta automatica del local

## Panel admin

### Que hace hoy

- login privado en `/panel/login`
- allowlist simple por email admin
- dashboard inicial
- gestion centralizada de locales
- gestion centralizada de platos desde cada local
- gestion centralizada de solicitudes

### Flujo de solicitudes

1. el negocio envia `/unete`
2. la solicitud se guarda en `join_requests`
3. el admin la revisa en `/panel/solicitudes`
4. puede aprobar o rechazar
5. puede iniciar `Crear local desde esta solicitud`
6. el alta del local se completa manualmente en `/panel/locales/nuevo`

### Trazabilidad

- `join_requests.linked_venue_id` permite saber si una solicitud ya se convirtio en un local real

## Lo que todavia no existe

- alta automatica completa del local al aprobar una solicitud
- panel de local
- persistencia real de pedidos en Supabase
- gestion admin real de pedidos
