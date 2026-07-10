# Figma Import v1

## Color Variables

| Figma collection | Variable name | Value | Scope | Code syntax |
|---|---|---:|---|---|
| Color | color/bg/page | #f6f1e6 | Fill | `var(--bg-page)` |
| Color | color/bg/page-alt | #e8e1d2 | Fill | `var(--bg-page-alt)` |
| Color | color/bg/surface | rgba(255, 255, 255, 0.7) | Fill | `var(--bg-surface)` |
| Color | color/bg/surface-strong | #ffffff | Fill | `var(--bg-surface-strong)` |
| Color | color/bg/surface-muted | rgba(255, 255, 255, 0.48) | Fill | `var(--bg-surface-muted)` |
| Color | color/text/primary | #181816 | Text | `var(--text-primary)` |
| Color | color/text/secondary | rgba(24, 24, 22, 0.62) | Text | `var(--text-secondary)` |
| Color | color/text/muted | rgba(24, 24, 22, 0.42) | Text | `var(--text-muted)` |
| Color | color/text/inverse | #ffffff | Text | `var(--text-inverse)` |
| Color | color/border/subtle | rgba(0, 0, 0, 0.1) | Stroke | `var(--border-subtle)` |
| Color | color/border/strong | rgba(0, 0, 0, 0.16) | Stroke | `var(--border-strong)` |
| Color | color/overlay/hero-from | rgba(6, 18, 13, 0.62) | Fill | `var(--overlay-hero-from)` |
| Color | color/overlay/hero-to | rgba(5, 8, 22, 0.82) | Fill | `var(--overlay-hero-to)` |
| Color | color/overlay/card-from | rgba(6, 10, 11, 0.04) | Fill | `var(--overlay-card-from)` |
| Color | color/overlay/card-mid | rgba(6, 10, 11, 0.18) | Fill | `var(--overlay-card-mid)` |
| Color | color/overlay/card-to | rgba(6, 10, 11, 0.88) | Fill | `var(--overlay-card-to)` |
| Color | color/brand/accent | #fed47d | Fill, Text, Stroke | `var(--brand-accent)` |
| Color | color/brand/accent-strong | #FED47D | Fill, Text, Stroke | `var(--brand-accent-strong)` |
| Color | color/brand/accent-bright | #FFE7A8 | Fill | `var(--brand-accent-bright)` |
| Color | color/brand/accent-soft | rgba(254, 212, 125, 0.14) | Fill | `var(--brand-accent-soft)` |
| Color | color/brand/accent-border | rgba(254, 212, 125, 0.32) | Stroke | `var(--brand-accent-border)` |
| Color | color/brand/accent-shadow | rgba(254, 212, 125, 0.22) | Fill | `var(--brand-accent-shadow)` |
| Color | color/cta/primary-bg | var(--brand-accent) | Fill | `var(--cta-primary-bg)` |
| Color | color/cta/primary-hover | var(--brand-accent-bright) | Fill | `var(--cta-primary-hover)` |
| Color | color/cta/primary-text | #2a120d | Text | `var(--cta-primary-text)` |
| Color | color/icon/highlight | var(--brand-accent-strong) | Text, Stroke | `var(--icon-highlight)` |
| Color | color/focus/ring | var(--brand-accent) | Stroke | `var(--focus-ring)` |
| Color | color/selection/bg | var(--brand-accent-soft) | Fill | `var(--selection-bg)` |
| Color | color/price/highlight | var(--brand-accent-strong) | Text | `var(--price-highlight)` |
| Color | color/status/danger | #e5484d | Fill, Text, Stroke | `var(--status-danger)` |
| Color | color/status/warning | #d6a648 | Fill, Text, Stroke | `var(--status-warning)` |

## Spacing Variables

| Figma collection | Variable name | Value | Scope | Code syntax |
|---|---|---:|---|---|
| Spacing | space/2 | 8 | Gap, Padding | `var(--space-2)` |
| Spacing | space/3 | 12 | Gap, Padding | `var(--space-3)` |
| Spacing | space/4 | 16 | Gap, Padding | `var(--space-4)` |
| Spacing | space/5 | 20 | Gap, Padding | `var(--space-5)` |
| Spacing | space/6 | 24 | Gap, Padding | `var(--space-6)` |
| Spacing | space/8 | 32 | Gap, Padding | `var(--space-8)` |
| Spacing | space/10 | 40 | Gap, Padding | `var(--space-10)` |
| Spacing | space/12 | 48 | Gap, Padding | `var(--space-12)` |
| Spacing | space/16 | 64 | Gap, Padding | `var(--space-16)` |

## Radius Variables

| Figma collection | Variable name | Value | Scope | Code syntax |
|---|---|---:|---|---|
| Radius | radius/sm | 12 | Corner radius | `var(--radius-sm)` |
| Radius | radius/md | 18 | Corner radius | `var(--radius-md)` |
| Radius | radius/lg | 24 | Corner radius | `var(--radius-lg)` |
| Radius | radius/xl | 32 | Corner radius | `var(--radius-xl)` |
| Radius | radius/full | 999 | Corner radius | `var(--radius-full)` |

## Effect Styles

| Style name | Value | Code source |
|---|---|---|
| shadow/soft | 0 18px 60px rgba(5, 8, 22, 0.1) | `src/app/globals.css --shadow-soft` |

## Manual Figma Steps

1. Open Figma > Local variables.
2. Create collection `Color`.
3. Create one mode: `Light`.
4. Add the 31 color variables from `Color Variables`.
5. Set each variable scope from the `Scope` column.
6. Add each `Code syntax` value in Dev Mode code syntax.
7. For `var(...)` values, alias to the referenced color variable when available.
8. Create collection `Spacing` and add the 9 number variables from `Spacing Variables`.
9. Create collection `Radius` and add the 5 number variables from `Radius Variables`.
10. Open Effects styles.
11. Create effect style `shadow/soft`.
12. Set X `0`, Y `18`, Blur `60`, Spread `0`, Color `rgba(5, 8, 22, 0.1)`.
