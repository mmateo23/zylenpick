# Design Lock v0.1

Fecha: 2026-07-10  
Base: `docs/design-system/design-audit-v0.md`  
Estado: contrato visual cerrado, sin migracion de paginas.

## Update v0.2 — Brand Base

Decision: `Brand Base` queda aprobada como direccion principal de Pickyalo.

- `#741314` sustituye al amarillo `#fed47d` como color principal de marca.
- `#FDE3AD` sustituye al crema anterior como fondo principal.
- `#fed47d` queda como legacy visual; no usar en diseno nuevo.
- La version inversa con fondo granate y logo negativo queda reservada para hero, splash, campanas o piezas de impacto, no para toda la UI.
- `src/app/globals.css` aun no se modifica en esta fase; la migracion de variables CSS debe hacerse de forma controlada.

Referencia de decision: `docs/design-system/brand-base-v0.2.md`.

## Direccion Visual Oficial

Pickyalo debe sentirse editorial, calido, limpio y premium accesible. La UI principal debe partir de comida real, recogida local y claridad operativa: fondo blanco hueso, texto oscuro, superficies claras calidas, bordes granate sutiles, sombras suaves y granate como acento principal de marca.

La direccion por defecto es clara. Las experiencias oscuras existentes quedan toleradas solo como legacy o como overlays sobre imagen hasta que se migren. No se crean nuevas pantallas dark-first.

## Fuente De Verdad

- Contrato visual humano: `docs/design-system/design-lock-v0.1.md`.
- Contrato tecnico de tokens: `docs/design-system/tokens-v1.md`.
- Tokens CSS actuales: `src/app/globals.css`.
- Tokens TS inertes: `src/lib/design-system/tokens.ts`.

`src/app/globals.css` ya contiene los tokens oficiales necesarios. No se modifica en esta fase para evitar cambios visuales indirectos: el `body` y muchas pantallas siguen usando aliases legacy.

## Tokens Oficiales

### Color

| Token | Valor | CSS actual |
| --- | --- | --- |
| `bg.page` | `#FDE3AD` | `--bg-page` pendiente de actualizar |
| `bg.pageAlt` | `#FFF7E8` | `--bg-page-alt` pendiente de actualizar |
| `bg.surface` | `#FFF7E8` | `--bg-surface` pendiente de actualizar |
| `bg.surfaceStrong` | `#ffffff` | `--bg-surface-strong` |
| `text.primary` | `#24110E` | `--text-primary` pendiente de actualizar |
| `text.secondary` | `rgba(36,17,14,0.68)` | `--text-secondary` pendiente de actualizar |
| `text.muted` | `rgba(36,17,14,0.46)` | `--text-muted` pendiente de actualizar |
| `brand.primary` | `#741314` | `--brand-primary` pendiente |
| `brand.cream` | `#FDE3AD` | `--brand-cream` pendiente |
| `brand.primarySoft` | `rgba(116,19,20,0.08)` | `--brand-primary-soft` pendiente |
| `border.subtle` | `rgba(116,19,20,0.16)` | `--border-subtle` pendiente de actualizar |
| `border.strong` | `rgba(116,19,20,0.28)` | `--border-strong` pendiente de actualizar |
| `status.danger` | `#e5484d` | `--status-danger` |
| `status.warning` | `#d6a648` | `--status-warning` |

### Radius

| Token | Valor | CSS actual |
| --- | --- | --- |
| `radius.sm` | `12px` | `--radius-sm` |
| `radius.md` | `18px` | `--radius-md` |
| `radius.lg` | `24px` | `--radius-lg` |
| `radius.xl` | `32px` | `--radius-xl` |
| `radius.full` | `999px` | `--radius-full` |

### Shadow

| Token | Valor | CSS actual |
| --- | --- | --- |
| `shadow.soft` | `0 18px 60px rgba(116, 19, 20, 0.12)` | `--shadow-soft` pendiente de actualizar |

### Spacing

| Token | Valor | CSS actual |
| --- | --- | --- |
| `space.2` | `8px` | `--space-2` |
| `space.3` | `12px` | `--space-3` |
| `space.4` | `16px` | `--space-4` |
| `space.5` | `20px` | `--space-5` |
| `space.6` | `24px` | `--space-6` |
| `space.8` | `32px` | `--space-8` |
| `space.10` | `40px` | `--space-10` |
| `space.12` | `48px` | `--space-12` |
| `space.16` | `64px` | `--space-16` |

## Tokens Legacy / Deprecated

Mantener, no eliminar, no usar en codigo nuevo:

- `--background`
- `--foreground`
- `--surface`
- `--surface-strong`
- `--surface-dark`
- `--border`
- `--zylen`
- `--zylen-soft`
- `--brand`
- `--accent`
- `--muted`
- `--muted-strong`
- `--shadow`
- `--soft-shadow`
- `--card-shadow`
- `.glass-panel`
- `.magnetic-button`
- `.spotlight-panel`
- `.zylen-visual-skin`

Tambien existen otros aliases legacy relacionados (`--zylen-strong`, `--zylen-accent`, `--brand-strong`, `--brand-soft`, `--surface-dark-soft`). Quedan tolerados solo por compatibilidad.

## Colores Prohibidos En Codigo Nuevo

No introducir nuevos hardcodes visuales:

- `#FED47D` o `#fed47d`: legacy visual, no usar en diseno nuevo.
- `#FFE7A8` o `#ffe7a8`: legacy visual, no usar en diseno nuevo.
- `#181816`: legacy visual, usar `text.primary`.
- `#f6f1e6`: legacy visual, usar `bg.page`.
- `#E5484D`: usar `status.danger`.
- `#d6a648`: usar `status.warning`.
- `#381932`, `#A9402A`, `#C26157`, `#050816`, `#111111`, `#160f0c`, `#fffdf5`: no usar salvo que se formalicen en un token posterior.
- Nuevos `rgba(254,212,125,...)` arbitrarios: legacy visual, no usar en diseno nuevo.
- Nuevas sombras `rgba(0,0,0,...)` arbitrarias: usar `shadow.soft` o crear token antes.

## Reglas De Uso

- Las paginas nuevas deben usar fondo claro `bg.page` por defecto.
- El texto principal debe usar `text.primary`; metadata y ayuda deben usar `text.secondary` o `text.muted`.
- El granate Pickyalo se reserva para CTA principal, estado activo, precio destacado o senal editorial puntual.
- Las cards deben usar `bg.surface` o `bg.surfaceStrong`, `border.subtle` y `shadow.soft`.
- Los bordes visibles deben empezar en `border.subtle`; `border.strong` queda para hover/active.
- No mezclar tokens legacy (`--foreground`, `--surface`, `--brand`) con tokens oficiales en componentes nuevos.
- `style={{ backgroundImage }}` solo debe conservarse cuando la URL sea dinamica. Los colores/gradientes del overlay deben moverse a tokens o helpers.
- Los assets legacy y demos no se eliminan en esta fase.
- Admin puede seguir visualmente distinto hasta la fase `Admin UI tokenization`.

## Componentes A Crear Despues

No se crean en esta tarea. La siguiente fase debe definir:

- `Button`: `primary`, `secondary`, `ghost`, `danger`, `icon`, `fullWidth`.
- `Badge` / `Chip`: `neutral`, `accent`, `active`, `verified`, `warning`, `danger`.
- `Card`: `surface`, `media`, `ticket`, `adminPanel`.
- `SectionHeader`: eyebrow, title, description, action.
- `MediaOverlay`: presets para imagen de comida/local.
- `AppHeader`: reemplazo progresivo de `SiteHeader` y `DemoSiteHeader`.
- `MobileNavigation`: menu movil, bottom nav y cart bar compartidos.
- `FormField`: inputs/select/textarea para admin y auth.

## Migration Queue

1. SiteHeader
2. MenuItemGalleryCard
3. ZoneVenueExplorer
4. CartScreen
5. VenueCartSummary
6. Admin UI tokenization
7. Cookies/PWA/Toasts
8. Home/Unete/Proyecto
9. Demo components
10. Legacy ZylenPick naming cleanup

## No Tocar Todavia

- `src/components/demo/**`
- `src/app/demo/**`
- Storage keys `zylenpick.*`
- Assets legacy de `public/logo`
- Email templates
- Admin visual profundo

## Carpetas Congeladas Temporalmente

Estas carpetas pueden recibir fixes funcionales, pero no migraciones visuales hasta que les toque en la cola:

- `src/components/demo/**`
- `src/app/demo/**`
- `src/components/project/**`
- `public/logo`
- `src/features/emailing/**`

## Decisiones De v0.1

- `globals.css` queda sin cambios porque ya contiene los tokens oficiales y tocarlo puede alterar pantallas legacy.
- El contrato oficial se limita a color, radius, shadow y spacing. Tipografia, motion y overlays quedan fuera de v0.1.
- `src/lib/design-system/tokens.ts` se crea como espejo tipado, no como dependencia runtime de UI.
- Los aliases ZylenPick/Zylen quedan deprecated, no eliminados.
- La migracion empieza por producto real antes que demos.

## Riesgos

- Mientras `body` siga usando `--background` y `--foreground`, el producto puede seguir viendose dark aunque existan tokens claros.
- Tailwind ya expone algunos aliases oficiales, pero radius no tiene alias extendido; usar `rounded-[var(--radius-*)]` o clases existentes hasta formalizar.
- El archivo TS puede divergir de CSS si se editan tokens en un solo lugar. Hasta automatizar, todo cambio debe actualizar ambos contratos.
- Demos concentran muchos hardcodes; si se usan como referencia visual activa, contaminaran futuras migraciones.

## Criterio De Salida

Design Lock v0.1 queda cerrado cuando:

- `design-lock-v0.1.md` existe y lista direccion, tokens, legacy, reglas y cola de migracion.
- `tokens-v1.md` lista CSS actual, equivalencias Tailwind y usos prohibidos.
- `src/lib/design-system/tokens.ts` exporta los tokens oficiales sin conectarse a paginas.
- No hay cambios visuales en UI.
