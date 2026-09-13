# Revisión de contraste: zonas, locales y platos

## Cambios

- `/zonas`: panel de ciudades crema opaco; chips y llamadas sobre fotos en granate con texto crema. El chip de ciudad enlaza directamente a su listado. Se refuerza el velo del vídeo de cabecera.
- `/zonas/[citySlug]`: reutiliza `WeatherMapHero`, con textos propios, ancla al listado y la ilustración existente `talavera_tile_house.png` para Talavera. Consulta el servicio meteorológico existente con las coordenadas de un local de la ciudad. Cuando no hay datos, mantiene una escena neutra sin inventar temperatura.
- Tarjetas de zonas y locales: visibles por defecto, incluidas las preferencias de movimiento reducido. Las tarjetas grandes ocupan una columna en móvil y dos desde `sm`.
- `/platos`: filtros con una regla visual común, selección granate/crema, `aria-pressed` y altura mínima de 44 px. Velo inferior más oscuro y títulos móviles más legibles. Aviso de deslizamiento con fondo sólido.
- Menús de locales: etiquetas y destacado sobre fondos sólidos. El precio en modo `hidden` conserva su presentación «Contactar» con fondo crema opaco. No cambia la lógica de ninguno de los cuatro modos de precio.

## Comprobación

Navegación local en navegador: zonas, Talavera, filtros Burgers/Todas, apertura de Croquetas x6 y acceso a La Comida de los Dados. Revisión visual móvil (390 × 844) y cabecera de escritorio (1440 × 1000). Sin desbordamiento horizontal en las vistas comprobadas; las ocho tarjetas de locales tienen opacidad 1.

TypeScript y build completados. Lint sin errores, con avisos preexistentes en `demo-home` y Storybook. Los últimos ajustes posteriores al build fueron clases visuales del aviso de deslizamiento y del chip de precio oculto.

Capturas en `output/contrast-audit/`. La revisión cubre estas pantallas y componentes compartidos; no certifica accesibilidad de todo el sitio. No se han realizado migraciones ni despliegues.
