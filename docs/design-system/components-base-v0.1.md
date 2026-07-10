# Components Base v0.1

Fecha: 2026-07-10  
Estado: componentes inertes, sin migracion de pantallas.  
Base: `design-lock-v0.1.md`, `tokens-v1.md`, `src/lib/design-system/tokens.ts`.

## Objetivo

Crear las primeras piezas oficiales del sistema visual de Pickyalo para preparar Storybook y futuras migraciones. Estos componentes no sustituyen todavia ninguna pantalla existente y no deben importarse en rutas actuales hasta que empiece la cola de migracion.

## Componentes Creados

- `Button`: `src/components/design-system/button.tsx`
- `Badge`: `src/components/design-system/badge.tsx`
- `Card`: `src/components/design-system/card.tsx`
- `SectionHeader`: `src/components/design-system/section-header.tsx`
- Barrel export: `src/components/design-system/index.ts`

## Button

API:

```ts
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};
```

Reglas:

- `primary` usa `bg-cta` y `text-cta-text`.
- `secondary` usa superficie clara y `border-border-subtle`.
- `ghost` queda transparente con hover suave.
- `danger` usa `bg-danger`.
- Siempre usa `rounded-full`.
- Incluye `focus-visible` con `ring-focus-ring`.
- `loading` bloquea el boton con `aria-busy` y spinner visual.

Reemplazara en futuras migraciones:

- CTAs de `SiteHeader`, `MenuItemGalleryCard`, `CartScreen`, `ZoneVenueExplorer`.
- Botones repetidos en Admin UI, Cookies/PWA/Toasts y formularios.

## Badge / Chip

API:

```ts
type BadgeProps = {
  tone?: "neutral" | "accent" | "warning" | "danger" | "success";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
};
```

Reglas:

- Sirve como badge, chip de filtro y pill de estado.
- Siempre usa `rounded-full`.
- `active` intensifica el tono sin crear una variante nueva.
- No usa colores hardcodeados.

Reemplazara en futuras migraciones:

- Chips de categoria/filtro en `ZoneVenueExplorer`, `FeedExperience`, demos.
- Badges de destacado/verificado cuando no requieran logica especifica.
- Pills de estado en Admin UI.

## Card

API:

```ts
type CardProps = {
  variant?: "surface" | "media" | "ticket" | "admin";
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
};
```

Reglas:

- `surface` es la card base clara.
- `media` prepara cards con imagen o contenido visual.
- `ticket` prepara resumenes tipo pedido/recogida.
- `admin` prepara paneles de backoffice.
- Usa `border-border-subtle`, superficies oficiales y radios `lg/xl`.
- `interactive` activa sombra oficial, hover de borde y leve elevacion.

Reemplazara en futuras migraciones:

- Cards de plato/local en producto real.
- Resumenes de carrito y `VenueCartSummary`.
- Paneles de Admin UI.
- Bloques repetidos de home/unete/proyecto cuando se migren.

## SectionHeader

API:

```ts
type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};
```

Reglas:

- `eyebrow` usa acento oficial.
- `title` usa `text-text-primary`.
- `description` usa `text-text-secondary`.
- `action` acepta cualquier nodo, normalmente un `Button`.
- Preparado para home, zonas, platos, admin y marketing.

Reemplazara en futuras migraciones:

- Encabezados locales en `SectionHeading`, admin pages, home, unete y project.

## Reglas De Uso

- No importar estos componentes en paginas existentes hasta iniciar migracion.
- No mezclar estos componentes con tokens legacy en el mismo componente nuevo.
- No pasar `className` con colores hardcodeados salvo durante una migracion controlada y documentada.
- Usar el barrel `src/components/design-system/index.ts` cuando empiece la adopcion.
- Mantenerlos sin logica de negocio.

## Que NO Se Ha Migrado Todavia

- `SiteHeader`
- `MenuItemGalleryCard`
- `ZoneVenueExplorer`
- `CartScreen`
- `VenueCartSummary`
- Admin UI
- Cookies/PWA/Toasts
- Home/Unete/Proyecto
- Demo components
- Naming legacy ZylenPick

## Notas Para Storybook

No se instala Storybook y no se crean stories en esta tarea. La siguiente fase puede crear stories para variantes, tamanos, estados `disabled/loading/active`, focus visible y ejemplos con iconos.

