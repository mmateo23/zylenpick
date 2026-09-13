# Panel privado del comercio

Ruta: `/manage/[token]`. El comercio no inicia sesión. El enlace da acceso a un único comercio.

En `/panel/locales/[venueId]`, «La llave del comercio» permite ver, copiar y regenerar el enlace. La primera consulta crea el enlace si aún no existe. La regeneración pide confirmar que el anterior dejará de funcionar. En producción, estas acciones requieren un administrador de la lista existente `ADMIN_ALLOWED_EMAILS`. En desarrollo siguen el mismo bypass local que el resto del panel.

## Comportamiento

- Abrir/cerrar usa `venues.manual_open_status`: `true`, `false`, o `null` para volver al horario habitual. Es un cambio persistente; no altera horarios, publicación ni actividad del registro.
- Precios: reutiliza `price_amount` (céntimos), `price_display_mode` y `price_display_text`. `fixed` y `from` requieren cantidad; `variable` y `hidden` conservan la cantidad anterior sin exigir otra. Se admiten coma decimal y dos decimales.
- Se respeta `venues.prices_visible`; se avisa cuando el precio sigue oculto en la ficha.
- Disponibilidad: `menu_items.is_available`. Los agotados siguen editables aquí; el catálogo público conserva su filtro actual.
- Destacado: `menu_items.is_featured`. No modifica destacados de portada ni otras opciones de promoción.
- Las capturas `pending` quedan fuera del panel y de sus escrituras.
- La ficha pública solo se enlaza cuando el comercio y su ciudad están publicados/activos.

## Base de datos y seguridad

Migración: `supabase/migrations/20260911210333_venue_private_management.sql` (aplicada al proyecto existente).

Los tokens son 32 bytes criptográficos representados en 64 caracteres hexadecimales. Se guardan recuperables en `private.venue_manage_links` para poder volver a ver/copiar el mismo enlace. No están en `venues`, en consultas públicas ni en un esquema expuesto al Data API. La tabla tiene RLS sin políticas para clientes y carece de permisos para `anon` y `authenticated`. El aviso informativo «RLS sin políticas» en esta tabla es deliberado: deniega todo acceso de cliente.

Las tres RPC usan `SECURITY INVOKER`, `search_path` vacío y ejecución exclusiva de `service_role`. Solo los módulos de servidor usan esa clave. La lectura y cada escritura validan el token actual; el comercio se deriva del token, nunca de un `venueId` del navegador. La escritura comprueba además que el producto pertenece al comercio y limita los campos editables. Los bloqueos de la fila del enlace ordenan las operaciones concurrentes con una regeneración: cuando esta termina, el token anterior no autoriza nuevas lecturas ni escrituras.

La ruta es dinámica, sin caché, con `noindex`, `no-referrer` y protección contra iframes. Google Analytics, PostHog, atribución, campañas y avisos de instalación se excluyen. No se guardan tokens en almacenamiento del navegador. Al volver de otra pestaña se refrescan datos; cada cambio revalida el catálogo público. Como cualquier enlace con credenciales, quien lo recibe tiene acceso: regenerarlo permite retirarlo. Los operadores deben tratar las URL `/manage/*` como secretos también en los registros de acceso de infraestructura.

## Diseño y recurso

Paleta actual, Clash Grotesk, interruptor de dos posiciones con relieve, tarjetas de producto y editor de precio como hoja inferior móvil. Controles nativos accesibles, etiquetas de estado, foco de teclado y movimiento reducido.

El sticker procede de Drive: Recursos → Asset → Sticker → [Stiker_picky_pack](https://drive.google.com/file/d/1e_QPFG0JSLLD8sqQTXTS1d9Tw9QkniN-/view). Se conserva el PNG original en `public/manage/sticker-pack.png`; CSS encuadra el gesto de aprobación de la fila superior. No se generó una imagen nueva ni se cambió el archivo de Drive. No había referencias a este pack en el código revisado.

## Comprobaciones

```powershell
npx vitest run --config vitest.manage.config.mjs
npx tsc --noEmit
npm run lint
npm run build
```

`supabase/tests/venue_private_management.sql` comprueba aislamiento, permisos, token inválido, rotación, campos permitidos, capturas pendientes y los cuatro modos de precio. Sus datos de prueba se revierten en una transacción.

También se verifican cambios desde navegador con un comercio de prueba no publicado, lectura posterior en base de datos, denegación de las RPC con clave anónima, token revocado con la pestaña abierta y cabeceras HTTP. Las capturas visuales están en `output/playwright/manage-*.png`.

No se añaden servicios, dependencias, automatizaciones, QR, pagos ni mensajería. El código necesita el despliegue habitual de la aplicación para estar disponible en el dominio público.
