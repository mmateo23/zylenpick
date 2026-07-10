# Visual QA v0.1 - Storybook

Fecha: 2026-07-10  
Entorno: Storybook en `http://localhost:6006`  
Alcance: stories oficiales de `src/components/design-system/**/*.stories.tsx`  
Resultado: requiere ajustes previos antes de migrar `SiteHeader`.

## Capturas

Carpeta: `docs/design-system/screenshots/storybook-v0.1`

- [Design System / Overview](screenshots/storybook-v0.1/overview.png)
- [Button / Sizes](screenshots/storybook-v0.1/button-sizes.png)
- [Button / Primary](screenshots/storybook-v0.1/button-primary.png)
- [Badge / Sizes](screenshots/storybook-v0.1/badge-sizes.png)
- [Badge / ActiveFilter](screenshots/storybook-v0.1/badge-active-filter.png)
- [Card / PaddingVariants](screenshots/storybook-v0.1/card-padding-variants.png)
- [Card / Interactive](screenshots/storybook-v0.1/card-interactive.png)
- [SectionHeader / WithAction](screenshots/storybook-v0.1/section-header-with-action.png)

## Resumen Visual

Los componentes base ya leen como Pickyalo en las partes principales: fondo crema, superficies claras, texto oscuro, acento amarillo y bordes suaves. `Overview` es la story mas coherente: parece editorial, limpia y cercana al contrato visual definido.

El principal problema no esta en una pagina real, sino en el entorno Storybook: las stories centradas muestran un fondo exterior oscuro alrededor del canvas crema. Ese borde negro/verde oscuro recuerda a la capa legacy y contamina la lectura visual, especialmente en Button, Badge y Card.

## Componentes Coherentes Con Pickyalo

- `Button / Primary`: el amarillo funciona como CTA principal y el texto tiene buen contraste.
- `Button / Secondary`: no compite con Primary; se percibe como accion secundaria.
- `Badge / ActiveFilter`: el estado activo se entiende y el acento se lee bien.
- `Card / Interactive`: superficie, borde, radio y CTA son coherentes con el sistema.
- `SectionHeader / WithAction`: typography y hierarchy son limpias; eyebrow y CTA usan el acento de forma consistente.
- `Overview`: el bloque completo parece Pickyalo y no ZylenPick legacy cuando ocupa pantalla completa.

## Componentes Que Parecen Legacy O Poco Premium

- El fondo exterior oscuro de Storybook en stories centradas introduce una sensacion legacy/dark que no pertenece al sistema Pickyalo claro.
- `Button / Danger` en Overview es visualmente muy dominante. No parece branding coral, pero su presencia junto a Primary puede sentirse demasiado fuerte si se usa en contextos no destructivos.
- `Badge / Success` se ve neutro, no claramente success. Esto ya estaba previsto: no existe token verde oficial en v0.1.
- `Card / PaddingVariants` usa cards demasiado pequenas y vacias; sirve para comparar padding, pero no comunica premium por si sola.

## Contraste

- Primary CTA: contraste correcto.
- Secondary/Ghost: legibles sobre crema.
- Badge neutral: legible, aunque el texto pequeno puede quedar justo en tamanos densos.
- Danger: contraste correcto con texto claro.
- SectionHeader description: contraste correcto sobre crema.
- Problema de contraste ambiental: el fondo oscuro exterior del canvas distrae y reduce la percepcion clara/premium del sistema.

## Tamano

- Button sizes funcionan, pero `sm` y `md` estan muy cerca visualmente; conviene revisar si ambos son necesarios antes de migrar navegacion.
- Badge sizes son correctos, aunque `sm` puede ser pequeno para mobile o filtros tactiles.
- SectionHeader title tiene buen peso desktop.
- Card padding variants se ven demasiado aisladas; para QA futuro conviene probar con contenido realista.

## Spacing

- Overview tiene buen ritmo general entre secciones y cards.
- Button/Badge centered stories quedan dentro de un bloque crema pequeno rodeado de fondo oscuro; esto es mas un problema de story wrapper que de componente.
- SectionHeader / WithAction queda muy extendido horizontalmente, con mucho vacio entre texto y accion. Puede funcionar en desktop, pero antes de migrar SiteHeader conviene validar breakpoints y compacidad.

## Radius

- Buttons y badges con `rounded-full` funcionan bien.
- Cards con `radius-lg/xl` se ven consistentes con Pickyalo.
- No se detecta exceso de redondeo en Card, pero el CTA full pill puede sentirse demasiado blando si todo en la navegacion usa pills; validar en contexto de header.

## Sombra

- Card / Interactive usa sombra suave y borde correcto.
- Primary buttons tienen sombra suave, pero en algunos casos puede ser casi imperceptible sobre crema; no bloquea.
- No hay sombras duras legacy en estas stories.

## Recomendaciones Antes De Migrar SiteHeader

1. Ajustar el fondo global de Storybook/preview para que las stories centradas no muestren exterior oscuro. Debe verse crema de borde a borde o con un marco neutro claro.
2. Revisar Button `sm` vs `md` para asegurar una escala util en header y navegacion.
3. Validar estados focus de Button visualmente con teclado, no solo en captura estatica.
4. Definir si `Badge success` queda provisional neutro o se bloquea hasta crear token success real.
5. Crear una story especifica de `Header primitives` antes de tocar `SiteHeader`: icon button, nav pill, cart badge, city selector y mobile menu trigger.
6. Probar SectionHeader/Action en viewport estrecho para confirmar que no rompe layout.

## Decision Recomendada

Requiere ajustes previos antes de migrar `SiteHeader`.

Motivo: los componentes base son prometedores y coherentes en `Overview`, pero el entorno visual de Storybook aun arrastra fondo oscuro en stories centradas y falta validar primitives especificas de header. Migrar `SiteHeader` ahora podria mezclar decisiones no cerradas sobre tamaños, estados de navegacion y badges.

