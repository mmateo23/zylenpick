# Storybook v0.1

Fecha: 2026-07-10  
Estado: instalado y compilando. No hay migracion de paginas reales.

## Que Se Ha Instalado

Instalacion hecha con el metodo oficial para proyectos existentes:

```powershell
npm create storybook@latest -- --yes
```

En PowerShell fue necesario ejecutarlo como `npm.cmd` porque `npm.ps1` esta bloqueado por la politica local de ejecucion de scripts.

El CLI detecto el framework `nextjs-vite` y configuro Storybook 10.4.6 con:

- `storybook`
- `@storybook/nextjs-vite`
- `@chromatic-com/storybook`
- `@storybook/addon-vitest`
- `@storybook/addon-a11y`
- `@storybook/addon-docs`
- `@storybook/addon-mcp`
- `vite`
- `eslint-plugin-storybook`
- `vitest`
- `playwright`
- `@vitest/browser-playwright`
- `@vitest/coverage-v8`

Tambien genero:

- `.storybook/main.ts`
- `.storybook/preview.tsx`
- `vitest.config.ts`
- `vitest.shims.d.ts`
- stories de ejemplo en `src/stories/**`

## Scripts

`package.json` ahora incluye:

```json
{
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
}
```

## Configuracion

`.storybook/main.ts`:

- usa `@storybook/nextjs-vite`
- carga stories desde `../src/**/*.stories.@(ts|tsx|mdx)`
- sirve `../public` como `staticDirs`
- activa `nextjs.appDirectory: true`

`.storybook/preview.tsx`:

- importa `../src/app/globals.css`
- usa layout `padded`
- configura fondos Pickyalo: crema, alternativo y superficie
- envuelve stories en un contenedor con `bg-page` y `text-text-primary`
- mantiene a11y en modo `todo`
- activa `nextjs.appDirectory: true`

No se modifico `src/app/globals.css`.

## Como Arrancarlo

```powershell
npm run storybook
```

En este entorno PowerShell puede bloquear `npm.ps1`. Si ocurre, usar:

```powershell
npm.cmd run storybook
```

## Como Compilarlo

```powershell
npm run build-storybook
```

En este entorno:

```powershell
npm.cmd run build-storybook
```

La salida se genera en `storybook-static`, que esta ignorado por git.

## Stories Del Design System

### Button

Archivo: `src/components/design-system/button.stories.tsx`

Stories:

- `Primary`
- `Secondary`
- `Ghost`
- `Danger`
- `Sizes`
- `WithIcons`
- `FullWidth`
- `Loading`
- `Disabled`

### Badge

Archivo: `src/components/design-system/badge.stories.tsx`

Stories:

- `Neutral`
- `Accent`
- `Warning`
- `Danger`
- `Success`
- `WithIcon`
- `Sizes`
- `ActiveFilter`

### Card

Archivo: `src/components/design-system/card.stories.tsx`

Stories:

- `Surface`
- `Media`
- `Ticket`
- `Admin`
- `Interactive`
- `PaddingVariants`

### SectionHeader

Archivo: `src/components/design-system/section-header.stories.tsx`

Stories:

- `Default`
- `Centered`
- `WithEyebrow`
- `WithDescription`
- `WithAction`

### Overview

Archivo: `src/components/design-system/design-system-overview.stories.tsx`

Muestra botones, badges, cards, section headers y un bloque Pickyalo con fondo crema y acento dorado.

## Stories Generadas Por El CLI

El instalador oficial tambien creo ejemplos en `src/stories/**`:

- `Button`
- `Header`
- `Page`
- `Configure.mdx`

No son parte del design system de Pickyalo. Se mantienen por ahora para no eliminar scaffolding generado en esta fase; pueden limpiarse en una tarea posterior si se decide dejar Storybook solo con stories propias.

## Que Componentes Cubre

- `Button`
- `Badge`
- `Card`
- `SectionHeader`
- overview del sistema visual base

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

## Validacion

TypeScript:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
```

Resultado: correcto.

Storybook build:

```powershell
npm.cmd run build-storybook
```

Resultado: correcto. Output: `storybook-static`.

## Warnings Detectados

- `npm.ps1` y `npx.ps1` estan bloqueados por la politica local de PowerShell. Se uso `npm.cmd`.
- El CLI mostro: `"wmic" no se reconoce como un comando interno o externo`. No bloqueo la instalacion.
- npm reporto `18 vulnerabilities` durante la instalacion: `1 low`, `17` restantes no detalladas en la salida capturada. No se ejecuto `npm audit fix`.
- Storybook CLI indico que para finalizar setup AI se puede ejecutar `npx storybook ai setup`; no se ejecuto porque esta tarea no lo requiere.
- `build-storybook` mostro warning de chunks mayores de 500 kB.
- `build-storybook` mostro warning de tiempo significativo en plugins:
  - `vite-plugin-storybook-nextjs-image`
  - `vite-plugin-storybook-nextjs-font`
  - `storybook:project-annotations-plugin`
  - `storybook:code-generator-plugin`
  - `storybook:mock-loader`

## Riesgos

- Las stories de ejemplo en `src/stories/**` quedan incluidas por el patron global de stories.
- Storybook 10.4.6 instalo Vite 8.1.4; si algun plugin del ecosistema espera Vite 5/6/7, puede requerir ajustes.
- Los addons de testing instalaron Playwright y Vitest, aumentando superficie de dependencias.
- `preview.tsx` importa `globals.css`, que aun contiene tokens legacy y estilos globales de proyecto; esto es necesario para Tailwind/tokens, pero puede arrastrar estilos no oficiales a Storybook.

## Siguiente Paso Recomendado

Revisar visualmente `npm.cmd run storybook` en navegador y, despues, decidir si se eliminan o excluyen las stories de ejemplo `src/stories/**` para dejar Storybook enfocado solo en Pickyalo.

