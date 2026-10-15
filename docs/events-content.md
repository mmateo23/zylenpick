# Eventos gestionados como contenido

La fuente pública es `public.events` en Supabase. La Home, `/eventos`, `/eventos/[slug]` y el sitemap leen esa tabla en el servidor, sin generar el catálogo durante la compilación. Una publicación, corrección o retirada aparece en la siguiente petición al servidor; una pestaña ya abierta puede necesitar recargarse.

## Gestión desde el chat

Usar el proyecto `pickyalo-production` mediante la conexión Supabase autorizada. Antes de insertar, buscar el slug y las fechas para evitar duplicados. Contrastar cartel y fuentes oficiales, indicar la fecha en `verified_on` y conservar los enlaces de información y entradas. Resolver `city_id` buscando la ciudad por slug; no copiar UUID de otro entorno.

- Crear con `status = 'draft'` y comprobar el registro guardado.
- Publicar pasando a `published` cuando Manu lo solicite.
- Para retirar, usar `cancelled` o `archived`; no borrar el historial.
- Los eventos pasados publicados conservan su ficha, pero desaparecen de las listas de próximos según la fecha de Madrid.
- Solo los eventos publicados y de ciudades activas son legibles para visitantes. Los usuarios autenticados corrientes tampoco pueden editar esta tabla. Las escrituras se realizan con la conexión de gestión autorizada; no añadir claves privilegiadas al cliente.

Campos esenciales: slug, ciudad, título, título corto, antetítulo, resumen, descripción, fechas inicial/final inclusivas, lugar, condiciones de acceso, organizador, fuente y fecha de revisión. `schedule` es un array JSON con `date`, `label`, `title` y, opcionalmente, `time`, `description` y `location`. No inventar horarios de mangas ni condiciones de acceso.

`tickets_url` activa «Comprar entradas». `directions_url` activa «Cómo llegar». Ambos aceptan enlaces web. No confundir el enlace de entradas con la web del organizador.

`image_url` y `home_image_url` admiten rutas locales o URL web públicas; preferir HTTPS y Supabase Storage para imágenes propias. Los carteles externos se cargan directamente en el navegador, de modo que añadir otro dominio de imágenes no exige cambiar la configuración de Next.js. Si una fuente cambia, actualizar la URL en Supabase. La conexión de base de datos no implica por sí sola poder subir archivos a Storage.

No se ha añadido un formulario de eventos al panel: este cambio habilita la gestión mediante el chat conectado a Supabase.

## Verificaciones de esta entrega

- TypeScript y compilación de producción.
- Pruebas de fechas y filtrado de eventos terminados.
- RLS real: borrador oculto, publicado visible, cancelado oculto, sin permisos de escritura para visitantes ni usuarios corrientes. Los cambios de estado de la prueba se revierten con `ROLLBACK`.
- La ficha histórica de autocross se conserva como contenido; el motocross se carga como borrador.
