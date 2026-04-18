# Service Showcase Template

Esta carpeta concentra la plantilla reutilizable de las dos pantallas:

- `service-showcase-home-template.tsx`: plantilla para la home/demo.
- `service-showcase-dishes-template.tsx`: plantilla para la vista de platos.
- `service-showcase-template.ts`: copy, branding y rutas del servicio.

Para adaptar el modelo a otro servicio:

1. Duplica `service-showcase-template.ts` con un nuevo nombre.
2. Cambia logo, textos y rutas base.
3. Crea wrappers equivalentes si necesitas otra variante.
4. Conecta las nuevas rutas de `app/` a esos wrappers.

La idea es reutilizar el layout y el comportamiento visual, cambiando solo configuracion.
