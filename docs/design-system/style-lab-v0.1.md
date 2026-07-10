# Pickyalo Style Lab v0.1

Storybook incluye stories ligeras para validar direccion visual sin tocar la web real:

- `Pickyalo Style Lab / Pickyalo Brand Base`
- `Pickyalo Style Lab / Pickyalo Brand Reverse`
- Archivo: `src/components/design-system/pickyalo-style-lab.stories.tsx`

## Para que sirve

Probar rapidamente logo, color, botones, badges, cards, assets reales y tono general antes de migrar paginas.

## Nueva base oficial

Los colores principales oficiales pasan a ser los del nuevo logo:

- Granate principal: `#741314`
- Blanco hueso principal: `#FDE3AD`

La base anterior crema + amarillo queda solo como referencia anterior / legacy visual, no como direccion principal.

Se anade `Brand Reverse` para comparar fondo granate vs fondo blanco hueso. No se ha migrado UI real.

Decision: `Brand Base` queda aprobada como direccion principal. `Brand Reverse` queda para uso puntual en hero, splash, campanas o piezas de impacto.

Siguiente paso: actualizar variables CSS y migrar Header/Home de forma controlada.

## Como arrancarlo

```powershell
npm.cmd run storybook
```

Abrir `http://localhost:6006` y entrar en `Pickyalo Style Lab`.

## Que mirar visualmente

- Si granate + blanco hueso se sienten propios de Pickyalo.
- Si el logo nuevo funciona sobre la base clara.
- Si el logo negativo funciona sobre fondo granate.
- Si los botones tienen jerarquia clara.
- Si Food Card y Venue Card se sienten calidas y premium accesible.
- Si el conjunto evita la capa dark legacy.

## Que no se migra todavia

No se migran paginas, header, admin, demos, storage keys, assets legacy ni logica de negocio.
