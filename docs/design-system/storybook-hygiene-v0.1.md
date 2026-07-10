# Storybook Hygiene v0.1

Fecha: 2026-07-10  
Estado: Storybook limitado al sistema de diseño oficial de Pickyalo.

## Que Se Ha Limpiado

- Se elimino `src/stories/**`, generado por el CLI oficial de Storybook.
- Se ajusto `.storybook/main.ts` para cargar solo stories oficiales del design system.
- Se dejo preparado un patron futuro para docs MDX en `docs/design-system/**/*.mdx`.
- No se modificaron paginas reales, rutas, storage keys, componentes antiguos, assets legacy ni `src/app/globals.css`.

## Decision

Se eligio la opcion A: eliminar `src/stories/**`.

Motivo: la carpeta solo contenia ejemplos generados por el CLI (`Button`, `Header`, `Page`, `Configure.mdx` y assets de tutorial). No estaba referenciada por nada real del proyecto y contaminaba Storybook con piezas que no pertenecen a Pickyalo.

## Stories Oficiales Finales

Storybook carga ahora:

- `src/components/design-system/button.stories.tsx`
- `src/components/design-system/badge.stories.tsx`
- `src/components/design-system/card.stories.tsx`
- `src/components/design-system/section-header.stories.tsx`
- `src/components/design-system/design-system-overview.stories.tsx`

Patron activo:

```ts
stories: [
  "../src/components/design-system/**/*.stories.@(ts|tsx|mdx)",
  "../docs/design-system/**/*.mdx",
]
```

## Que Se Ha Eliminado

- `src/stories/Button.tsx`
- `src/stories/Button.stories.ts`
- `src/stories/Header.tsx`
- `src/stories/Header.stories.ts`
- `src/stories/Page.tsx`
- `src/stories/Page.stories.ts`
- `src/stories/Configure.mdx`
- `src/stories/*.css`
- `src/stories/assets/**`

## Como Arrancar Storybook

```powershell
npm.cmd run storybook
```

Si PowerShell permite `npm`, tambien funciona:

```powershell
npm run storybook
```

## Como Compilar Storybook

```powershell
npm.cmd run build-storybook
```

La salida queda en `storybook-static`, ignorado por git.

## Checklist De Revision Visual

### Button

- [ ] Primary se ve como CTA principal Pickyalo.
- [ ] Secondary no compite con Primary.
- [ ] Ghost funciona sobre fondo crema.
- [ ] Danger no parece coral de branding.
- [ ] Focus visible correcto.
- [ ] Disabled legible.

### Badge

- [ ] Accent sirve para destacado.
- [ ] Warning y Danger no rompen la paleta.
- [ ] Success queda documentado como provisional hasta tener token verde oficial.
- [ ] ActiveFilter se entiende.

### Card

- [ ] Surface parece parte de Pickyalo.
- [ ] Media tiene sombra/radio correcto.
- [ ] Ticket no parece de otro producto.
- [ ] Admin es sobrio y no demasiado marketing.

### SectionHeader

- [ ] Eyebrow con acento.
- [ ] Title legible.
- [ ] Description con contraste correcto.
- [ ] Centered usable para landing.
- [ ] WithAction no rompe layout.

### Overview

- [ ] El bloque completo parece Pickyalo, no ZylenPick legacy.

## Validaciones

Comandos requeridos para esta fase:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
npm.cmd run build-storybook
npm.cmd audit --audit-level=high
```

`npm audit fix` no debe ejecutarse automaticamente.

Resultados de esta ejecucion:

- TypeScript: `.\node_modules\.bin\tsc.cmd --noEmit` correcto.
- Storybook build: `npm.cmd run build-storybook` correcto.
- npm audit informativo: `18 vulnerabilities (1 low, 8 moderate, 9 high)`.
- Critical vulnerabilities: 0 reportadas.

High vulnerabilities reportadas:

- `fast-uri`: path traversal / host confusion.
- `flatted`: DoS por recursion y prototype pollution.
- `glob`: command injection; fix sugerido requiere `npm audit fix --force` y actualizaria `eslint-config-next` a `16.2.10`.
- `hono`: multiples advisories high.
- `next`: multiples advisories high; fix sugerido requiere `npm audit fix --force` y actualizaria `next` a `16.2.10`.
- `picomatch`: method injection/ReDoS.
- `ws`: memory disclosure / DoS.

No se ejecuto `npm audit fix`.

Warnings de `build-storybook`:

- No story files found para `docs\design-system\**\*.mdx`; esperado porque es un patron futuro.
- Chunks mayores de 500 kB tras minificacion.
- Tiempo significativo en plugins de Storybook/Next/Vite.

## Que NO Se Ha Migrado Todavia

- Paginas reales.
- `SiteHeader`.
- `MenuItemGalleryCard`.
- `ZoneVenueExplorer`.
- `CartScreen`.
- `VenueCartSummary`.
- Admin UI.
- Cookies/PWA/Toasts.
- Home/Unete/Proyecto.
- Demo components.
- Naming legacy ZylenPick.

## Riesgos

- El patron MDX futuro no carga nada si no existen `.mdx` en `docs/design-system`.
- `preview.tsx` sigue importando `src/app/globals.css`, necesario para Tailwind/tokens pero con estilos globales legacy.
- Si en el futuro se crean stories fuera de `src/components/design-system`, no apareceran hasta actualizar `.storybook/main.ts`.
