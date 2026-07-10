# Tokens v1

Estado: Design Lock v0.1  
Fecha: 2026-07-10  
Fuente CSS actual: `src/app/globals.css`  
Fuente TS nueva, aun no conectada a UI: `src/lib/design-system/tokens.ts`

Este documento es el contrato tecnico de tokens de Pickyalo. Define que nombres se consideran oficiales para codigo nuevo, que variables CSS existentes los representan y que aliases quedan en legacy/deprecated.

## Update v0.2 - Brand Base

`Brand Base` queda como base oficial tras validacion en Style Lab. CSS tokens v0.2 ya estan expuestos en `src/app/globals.css`; legacy tokens siguen presentes por compatibilidad.

| Token semantico | Valor v0.2 | CSS actual previsto | Tailwind actual | Uso |
| --- | --- | --- | --- | --- |
| `brand.primary` | `#741314` | `--brand-primary` | pendiente | Marca, CTA principal y estados activos. |
| `brand.cream` | `#FDE3AD` | `--brand-cream` | pendiente | Fondo principal y texto sobre granate. |
| `bg.page` | `#FDE3AD` | `--bg-page` | `bg-page` | Fondo principal Brand Base. |
| `bg.pageAlt` | `#F6D99A` | `--bg-page-alt` | `bg-page-alt` | Bandas alternas y fondos secundarios. |
| `text.primary` | `#24110E` | `--text-primary` | `text-text-primary` | Texto principal sobre fondos claros. |
| `bg.surface` | `rgba(255, 247, 232, 0.86)` | `--bg-surface` | `bg-surface` | Cards y paneles calidos. |
| `bg.surfaceStrong` | `#FFF7E8` | `--bg-surface-strong` | `bg-surface-strong` | Superficies solidas calidas. |
| `border.subtle` | `rgba(116, 19, 20, 0.16)` | `--border-subtle` | `border-border-subtle` | Bordes base con tinte granate. |
| `cta.primary.bg` | `#741314` | `--cta-primary-bg` | `bg-cta` | CTA principal. |
| `cta.primary.text` | `#FDE3AD` | `--cta-primary-text` | `text-cta-text` | Texto sobre CTA principal. |
| `shadow.soft` | `0 18px 60px rgba(116, 19, 20, 0.12)` | `--shadow-soft` | `shadow-[var(--shadow-soft)]` | Sombra suave oficial. |

`#fed47d` y la base crema anterior quedan como legacy visual. No usarlos en diseno nuevo salvo comparativas o migracion controlada.

## Reglas de uso

- En codigo nuevo usar tokens oficiales, no valores hardcodeados.
- Preferir clases Tailwind tokenizadas cuando existan: `bg-page`, `text-text-primary`, `border-border-subtle`, `bg-cta`.
- Si Tailwind no tiene equivalencia, usar `var(--token-css)` directamente.
- No crear nuevos `bg-[#...]`, `text-[#...]`, `border-[#...]`, `shadow-[#...]` ni gradientes arbitrarios sin documentarlos primero.
- No usar tokens legacy en codigo nuevo aunque sigan existiendo para compatibilidad.
- No importar `src/lib/design-system/tokens.ts` en paginas hasta que empiece la migracion visual.

## Color Tokens Oficiales

| Token semantico | Valor | CSS actual | Tailwind actual | Uso |
| --- | --- | --- | --- | --- |
| `bg.page` | `#FDE3AD` | `--bg-page` | `bg-page` | Fondo principal Brand Base. |
| `bg.pageAlt` | `#F6D99A` | `--bg-page-alt` | `bg-page-alt` | Bandas alternas y fondos secundarios. |
| `bg.surface` | `rgba(255, 247, 232, 0.86)` | `--bg-surface` | `bg-surface` | Superficie clara sobre blanco hueso. |
| `bg.surfaceStrong` | `#FFF7E8` | `--bg-surface-strong` | `bg-surface-strong` | Cards, inputs y paneles solidos. |
| `text.primary` | `#24110E` | `--text-primary` | `text-text-primary` | Texto principal. |
| `text.secondary` | `rgba(36,17,14,0.68)` | `--text-secondary` | `text-text-secondary` | Texto secundario. |
| `text.muted` | `rgba(36,17,14,0.46)` | `--text-muted` | `text-text-muted` | Texto auxiliar, hints, metadata. |
| `brand.primary` | `#741314` | `--brand-primary` | pendiente | Marca y CTA principal. |
| `brand.cream` | `#FDE3AD` | `--brand-cream` | pendiente | Fondo principal y texto sobre granate. |
| `brand.primarySoft` | `rgba(116,19,20,0.10)` | `--brand-primary-soft` | pendiente | Fondos suaves de chips o llamadas. |
| `border.subtle` | `rgba(116,19,20,0.16)` | `--border-subtle` | `border-border-subtle` | Borde por defecto. |
| `border.strong` | `rgba(116,19,20,0.28)` | `--border-strong` | `border-border-strong` | Borde enfatizado o hover. |
| `status.danger` | `#e5484d` | `--status-danger` | `bg-danger`, `text-danger`, `border-danger` | Estados destructivos o error. |
| `status.warning` | `#d6a648` | `--status-warning` | `bg-warning`, `text-warning`, `border-warning` | Estados destacados/advertencia. |

## Aliases Oficiales Permitidos

Estos aliases existen y se pueden usar cuando la semantica sea exacta. No sustituyen al contrato principal.

| Alias | Valor | CSS actual | Tailwind actual | Uso |
| --- | --- | --- | --- | --- |
| `cta.primaryBg` | `#741314` | `--cta-primary-bg` | `bg-cta` | CTA principal. |
| `cta.primaryHover` | `#5F0F10` | `--cta-primary-hover` | `hover:bg-cta-hover` | Hover del CTA principal. |
| `cta.primaryText` | `#FDE3AD` | `--cta-primary-text` | `text-cta-text` | Texto sobre CTA granate. |
| `focus.ring` | `#741314` | `--focus-ring` | `ring-focus-ring` | Focus rings si Tailwind lo permite. |
| `price.highlight` | `var(--brand-accent-strong)` | `--price-highlight` | `text-price-highlight` | Precio o valor comercial destacado. |
| `icon.highlight` | `var(--brand-accent-strong)` | `--icon-highlight` | `text-icon-highlight` | Iconos de enfasis. |

## Radius Tokens Oficiales

| Token semantico | Valor | CSS actual | Tailwind actual | Uso |
| --- | --- | --- | --- | --- |
| `radius.sm` | `12px` | `--radius-sm` | sin alias directo | Badges, chips, elementos pequenos. |
| `radius.md` | `18px` | `--radius-md` | sin alias directo | Botones, inputs, mini cards. |
| `radius.lg` | `24px` | `--radius-lg` | sin alias directo | Cards principales. |
| `radius.xl` | `32px` | `--radius-xl` | sin alias directo | Paneles grandes y secciones. |
| `radius.full` | `999px` | `--radius-full` | `rounded-full` | Pills y botones redondeados. |

## Shadow Tokens Oficiales

| Token semantico | Valor | CSS actual | Tailwind actual | Uso |
| --- | --- | --- | --- | --- |
| `shadow.soft` | `0 18px 60px rgba(116, 19, 20, 0.12)` | `--shadow-soft` | `shadow-[var(--shadow-soft)]` | Sombra suave oficial. |

## Spacing Tokens Oficiales

| Token semantico | Valor | CSS actual | Tailwind equivalente | Uso |
| --- | --- | --- | --- | --- |
| `space.2` | `8px` | `--space-2` | `2` | Separacion pequena. |
| `space.3` | `12px` | `--space-3` | `3` | Gap pequeno/medio. |
| `space.4` | `16px` | `--space-4` | `4` | Padding base. |
| `space.5` | `20px` | `--space-5` | `5` | Separacion media. |
| `space.6` | `24px` | `--space-6` | `6` | Padding comodo. |
| `space.8` | `32px` | `--space-8` | `8` | Separacion entre grupos. |
| `space.10` | `40px` | `--space-10` | `10` | Separacion grande. |
| `space.12` | `48px` | `--space-12` | `12` | Secciones compactas. |
| `space.16` | `64px` | `--space-16` | `16` | Secciones amplias. |

## Tokens Existentes No Oficiales

Estos tokens existen en `globals.css`, pero Design Lock v0.1 no los declara como parte del contrato base para codigo nuevo. Pueden seguir vivos mientras se migran pantallas.

| Token | CSS actual | Motivo |
| --- | --- | --- |
| `bg.surfaceMuted` | `--bg-surface-muted` | Util hasta formalizar estados/superficies secundarias. |
| `text.inverse` | `--text-inverse` | Necesario para overlays, pendiente de reglas de contraste. |
| `overlay.heroFrom` | `--overlay-hero-from` | Overlay existente, pendiente de normalizar con `MediaOverlay`. |
| `overlay.heroTo` | `--overlay-hero-to` | Overlay existente, pendiente de normalizar con `MediaOverlay`. |
| `overlay.cardFrom` | `--overlay-card-from` | Overlay existente, pendiente de normalizar con `MediaOverlay`. |
| `overlay.cardMid` | `--overlay-card-mid` | Overlay existente, pendiente de normalizar con `MediaOverlay`. |
| `overlay.cardTo` | `--overlay-card-to` | Overlay existente, pendiente de normalizar con `MediaOverlay`. |
| `brand.accentStrong` | `--brand-accent-strong` | Duplica `brand.accent` en v0.1. Mantener solo por compatibilidad. |
| `brand.accentBorder` | `--brand-accent-border` | Util, pero no esta en el set cerrado v0.1. |
| `brand.accentShadow` | `--brand-accent-shadow` | Util, pero no esta en el set cerrado v0.1. |
| `selection.bg` | `--selection-bg` | Alias funcional, no token visual principal. |

## Legacy / Deprecated - No Usar En Codigo Nuevo

Estos nombres se mantienen porque paginas existentes dependen de ellos. No eliminarlos ni renombrarlos todavia.

| Tipo | Nombre | CSS actual / clase | Estado |
| --- | --- | --- | --- |
| Color | `legacy.background` | `--background` | Deprecated |
| Color | `legacy.foreground` | `--foreground` | Deprecated |
| Color | `legacy.surface` | `--surface` | Deprecated |
| Color | `legacy.surfaceStrong` | `--surface-strong` | Deprecated |
| Color | `legacy.surfaceDark` | `--surface-dark` | Deprecated |
| Color | `legacy.border` | `--border` | Deprecated |
| Color | `legacy.zylen` | `--zylen` | Deprecated |
| Color | `legacy.zylenSoft` | `--zylen-soft` | Deprecated |
| Color | `legacy.brand` | `--brand` | Deprecated |
| Color | `legacy.accent` | `--accent` | Deprecated |
| Color | `legacy.muted` | `--muted` | Deprecated |
| Color | `legacy.mutedStrong` | `--muted-strong` | Deprecated |
| Shadow | `legacy.shadow` | `--shadow` | Deprecated |
| Shadow | `legacy.softShadow` | `--soft-shadow` | Deprecated |
| Shadow | `legacy.cardShadow` | `--card-shadow` | Deprecated |
| Utility | `glass-panel` | `.glass-panel` | Deprecated |
| Utility | `magnetic-button` | `.magnetic-button` | Deprecated |
| Utility | `spotlight-panel` | `.spotlight-panel` | Deprecated |
| Utility | `zylen-visual-skin` | `.zylen-visual-skin` | Deprecated |

## Prohibido En Codigo Nuevo

- Hex directos para color visual: `#FED47D`, `#fed47d`, `#FFE7A8`, `#181816`, `#f6f1e6`, `#381932`, `#A9402A`, `#C26157`, `#050816`, `#111111`, `#fffdf5`, etc.
- Clases Tailwind arbitrarias visuales: `bg-[#...]`, `text-[#...]`, `border-[#...]`, `shadow-[#...]`, `ring-[#...]`, `from-[#...]`, `via-[#...]`, `to-[#...]`.
- Gradientes inline o `bg-[linear-gradient(...)]` nuevos sin token o componente de overlay.
- Nuevas dependencias de `--background`, `--foreground`, `--surface`, `--brand`, `--accent`, `--muted` y `--zylen*`.

## Pendiente De Formalizar

- Escala tipografica y line heights.
- Estados de focus/hover/active por componente.
- Overlays para imagenes reales de comida/locales.
- Tokens de motion.
- Sistema de icon buttons.
- Variantes visuales para Admin UI.
