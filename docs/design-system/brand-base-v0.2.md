# Brand Base v0.2

Fecha: 2026-07-10  
Estado: decision de marca aprobada, sin migracion masiva.

Nota: CSS tokens v0.2 expuestos en `src/app/globals.css`. Legacy tokens siguen presentes por compatibilidad.

Nota: Home real migrada a Brand Base v0.2. Logos publicos principales migrados a la nueva familia `LogoNuevo`. Assets legacy siguen presentes por compatibilidad.

## Decision Final

La direccion principal de Pickyalo pasa a ser `Brand Base`: fondo blanco hueso y granate como color principal de marca.

## Colores Oficiales

| Token | Valor | Uso |
| --- | --- | --- |
| `brand.primary` | `#741314` | Marca, CTA principal, enfasis y estados activos. |
| `brand.cream` | `#FDE3AD` | Fondo principal y texto sobre granate. |
| `text.primary` | `#24110E` | Texto principal sobre fondos claros. |
| `bg.pageAlt` | `#F6D99A` | Bandas alternas y fondos secundarios. |
| `bg.surface` | `rgba(255, 247, 232, 0.86)` | Cards, paneles y superficies calidas. |
| `bg.surfaceStrong` | `#FFF7E8` | Superficies solidas calidas. |
| `border.subtle` | `rgba(116, 19, 20, 0.16)` | Bordes base sobre blanco hueso. |
| `shadow.soft` | `0 18px 60px rgba(116, 19, 20, 0.12)` | Sombra suave oficial. |

## Uso Recomendado

- Usar `#FDE3AD` como fondo principal de marca.
- Usar `#741314` para CTAs, navegacion activa, badges destacados y elementos de identidad.
- Usar `rgba(255, 247, 232, 0.86)` y `#FFF7E8` para cards y superficies con lectura prolongada.
- Mantener comida real y assets reales como soporte visual principal.

## Version Inversa

`Brand Reverse` usa fondo granate y logo negativo. Queda reservada para hero, splash, campanas y piezas de impacto. No es la base por defecto de toda la UI.

## Legacy

- `#fed47d` queda como legacy visual; no usar en diseno nuevo.
- La base crema anterior `#f6f1e6` queda como referencia anterior, no como fondo principal.
- Assets y nombres legacy se mantienen por compatibilidad hasta su fase de limpieza.

## Orden De Migracion Recomendado

Nota: Home es la primera página completa migrada a Brand Base v0.2 junto con SiteHeader.

1. Actualizar CSS variables oficiales en `src/app/globals.css`.
2. Migrar `SiteHeader`.
3. Migrar Home con Brand Base.
4. Migrar cards de comida y locales.
5. Revisar cart/checkout visual.
6. Tokenizar UI secundaria.
7. Limpiar nombres legacy cuando ya no condicionen producto real.
