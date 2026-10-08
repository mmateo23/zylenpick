# Design QA — tarjetas de locales

- Source visual truth: `C:\Users\Manu\.codex\codex-remote-attachments\01a09239-031c-7c02-8002-436a8db74123\69A51EF0-8D14-4315-8D4F-736A94B75BBA\1-Foto-1.jpg`
- Source dimensions: 1199 × 853 px. The selected target is the full-bleed card on the right.
- Implementation: `http://localhost:3000/platos?modo=locales`
- Implementation capture: Codex in-app browser, 560 × 610 px viewport, dark theme, Locales selected, feed scrolled to the first complete card row.
- Density normalization: visual comparison by component proportions; the source is a presentation board rather than a direct viewport capture.
- State: populated local cards, no geolocation selected.

## Full-view comparison evidence

The rendered cards use the same main composition as the selected reference: tall full-bleed photography, a progressively darkened lower image area, overlaid title and supporting copy, compact metadata pills, and one high-contrast full-width action at the bottom. The Pickyalo burgundy/cream palette replaces the neutral green/white palette from the reference while preserving its hierarchy.

## Focused region comparison evidence

The first complete implementation row (Burger Mc Queen's and Casco Viejo Bar & Kitchen) was inspected at mobile width. The imagery remains clear in the upper half, the copy stays readable over the lower gradient, metadata does not collide with the title, and “Ver el local” remains visible without opening the card. A separate crop was unnecessary because each card occupies approximately half of the captured viewport and its typography and controls are legible in the full capture.

## Required fidelity surfaces

- Fonts and typography: existing Pickyalo display and body styles are preserved. The title weight, tight tracking and short supporting copy match the reference hierarchy.
- Spacing and layout rhythm: the cards now span three grid rows, use a vertical proportion close to the reference, rounded corners, inset content and one bottom CTA.
- Colors and visual tokens: Pickyalo cream, dark brown and burgundy replace the source’s neutral palette intentionally. Contrast remains strong over photography.
- Image quality and asset fidelity: existing real venue and product images are reused at full bleed with `object-fit: cover`; no placeholder or generated image is introduced.
- Copy and content: venue name, real description, category, distance when available and a real link to the venue page are retained.

## Comparison history

### Baseline

- P1: the previous local card showed a full image with only a small top category and bottom title. It lacked the reference’s integrated information block and dominant bottom action.
- Fix: increased the vertical proportion, rebuilt the lower image treatment, added description and metadata pills, and added the full-width “Ver el local” action.

### Final pass

- No actionable P0, P1 or P2 visual mismatch remains for the requested card direction.
- Responsive interaction, keyboard focus and the real destination link remain intact.
- Browser console: no errors.

## Follow-up polish

- P3: once more venues have curated cover photography, individual image focal points can be tuned per venue for even more consistent crops.

final result: passed

---

# Design QA — ficha lateral ampliada de producto

- Source visual truth: `C:\Users\Manu\.codex\codex-remote-attachments\01a09239-031c-7c02-8002-436a8db74123\4174516D-131E-44B6-B550-1A1095F19086\1-Foto-1.jpg`
- Source dimensions: 959 × 1280 px. La referencia muestra la ficha anterior fotografiada en un navegador horizontal y señala el espacio insuficiente del bloque informativo.
- Implementation: `http://127.0.0.1:3000/platos`, producto “Classic Burger” de Bendita Burger abierto.
- Implementation captures: capturas visuales del navegador integrado de Codex a 1280 × 720 px y 390 × 844 px. El proveedor del navegador no expone una ruta de archivo para sus capturas.
- Density normalization: comparación por proporción del componente; la fuente es una fotografía rotada del navegador y no una captura directa a densidad conocida.
- State: tema oscuro, producto real, navegación 2 / 3 disponible y ubicación no concedida.

## Full-view comparison evidence

La ficha de escritorio pasa de un marco estrecho de 58 rem a uno de hasta 72 rem. La fotografía ocupa el 56 % izquierdo y el panel derecho el 44 %, con una separación limpia y todo el contenido principal visible en una pantalla de 1280 × 720 px. En móvil conserva la composición vertical completa a 390 × 844 px sin desplazamiento interno.

## Focused region comparison evidence

Se revisó el bloque de navegación inferior y el visor de imágenes. “Anterior” y “Siguiente” utilizan flechas horizontales abiertas; el indicador de galería usa un contador `1 / N` en lugar de puntos circulares. El gesto móvil también se alinea con esa dirección y cambia de producto mediante deslizamiento horizontal.

## Required fidelity surfaces

- Fonts and typography: se conservan las familias, pesos y jerarquía existentes; la mayor anchura evita comprimir el título y la descripción.
- Spacing and layout rhythm: el panel derecho tiene ancho propio, separación vertical suficiente y mantiene la acción principal visible sin scroll.
- Colors and visual tokens: se mantienen granate, crema y blanco hueso de Pickyalo con contraste estable sobre fotografía y panel.
- Image quality and asset fidelity: se utiliza la imagen real del producto sin sustituciones; el área visual crece y mantiene `object-fit: cover`.
- Copy and content: nombre, descripción, categoría, tiempo, local, distancia disponible y CTA permanecen intactos.

## Comparison history

### Baseline

- P1: la ficha quedaba demasiado estrecha y alta en escritorio, comprimiendo el bloque derecho y ocultando parte de la experiencia en la misma pantalla.
- P2: la navegación mezclaba cheurones verticales y puntos circulares con un recorrido visual horizontal.

### Fixes made

- Se amplió el marco hasta 72 rem y se separó la imagen al 56 % del panel informativo al 44 %.
- Se sustituyeron cheurones y puntos de galería por flechas horizontales y contador numérico.
- Se cambió el gesto móvil a deslizamiento horizontal y se mantuvieron acciones táctiles de al menos 44 px.

### Final pass

- La ficha completa cabe en escritorio a 1280 × 720 px y en móvil a 390 × 844 px.
- Las flechas cambian correctamente entre productos del mismo local; se comprobó “Classic Burger” → “Patatas fritas” → “Classic Burger”.
- No hay desbordamiento visible ni errores o avisos en la consola del navegador.
- TypeScript y ESLint pasan sin errores.

final result: passed

---

# Design QA — wallpaper cerámico en Autobuses

- Source visual truth: `C:\Users\Manu\.codex\codex-remote-attachments\01a09239-031c-7c02-8002-436a8db74123\FF8EC43F-C460-460D-AC38-29E3A557117C\1-Foto-1.jpg`
- Source dimensions: 720 × 1280 px, vertical ceramic ornament.
- Implementation: `http://localhost:3000/`, banner “¿Qué línea pasa por aquí?”.
- Implementation captures: Codex in-app browser visual captures at 390 × 844 px and 1280 × 800 px; light and dark theme. The browser provider did not expose a filesystem screenshot path.
- Density normalization: the source is used directly at native aspect ratio and cropped with CSS background positioning; comparison focused on asset fidelity, crop and legibility rather than identical viewport geometry.
- State: Home populated, Pocket Map loaded, bus banner visible.

## Full-view comparison evidence

The supplied ornament remains clearly identifiable inside the bus banner. On mobile the central ceramic motif frames the copy; on desktop the same artwork becomes a panoramic strip without stretching. The bus action remains visually distinct from the neighboring Pocket Map and editorial terminal.

## Focused region comparison evidence

The banner was inspected separately in light and dark modes. Both states preserve the burgundy brushwork and aged cream texture. Theme-specific overlays protect the eyebrow, headline, description and action without flattening the illustration.

## Required fidelity surfaces

- Fonts and typography: existing Pickyalo editorial hierarchy is unchanged; the artwork remains background rather than competing with the copy.
- Spacing and layout rhythm: the established banner dimensions, touch area and responsive grid remain unchanged.
- Colors and visual tokens: the wallpaper's burgundy and cream align with the existing palette; light and dark overlays use the current theme colors.
- Image quality and asset fidelity: the supplied JPG is copied without regeneration, deformation or destructive editing. `background-size` preserves its aspect ratio.
- Copy and content: the existing Autobuses copy and destination remain unchanged.

## Comparison history

### Final pass

- No actionable P0, P1 or P2 mismatch was found.
- Mobile and desktop crops keep a recognizable ornamental area without hiding the functional content.
- Light and dark modes retain readable text and visible focus behavior.
- Browser console: no errors.

final result: passed

---

# Design QA — sistema de tarjetas públicas

- Visual base: tarjeta full-bleed aprobada para Locales.
- Superficies revisadas: Locales, productos en el explorador y en la ficha, detalle de producto, eventos y detalle de lugares del mapa.
- Viewports verificados: 390 × 844 px y escritorio.
- Datos: contenido real ya disponible en el proyecto; no se añadieron datos ficticios.

## Resultado

Las tarjetas de contenido comparten ahora fotografía a sangre, degradado granate oscuro, texto superpuesto, metadatos en cápsulas translúcidas y una acción crema clara. Las superficies informativas que no representan contenido —filtros, paneles de datos y controles del mapa— conservan su estructura para no sacrificar legibilidad ni crear decoración artificial.

## Comprobaciones visuales

- Eventos: fecha, tipo, título, resumen, metadatos y acceso a la ficha se leen sobre una única superficie visual.
- Productos: las tarjetas compactas mantienen alérgenos y modos de precio; el detalle abierto muestra la información principal y la acción sin exigir desplazamiento.
- Lugares: el detalle de mapa funciona como tarjeta vertical en móvil y como composición horizontal en escritorio, manteniendo compartir, historia, accesibilidad, fuente, cercanía y cómo llegar.
- Tema oscuro: el patrón usa colores propios estables y conserva contraste en ambos temas.
- Interacción: controles de al menos 44 px, foco visible, enlaces reales, cierre con Escape y movimiento reducido.

final result: passed

---

# Design QA — detalle abierto de producto

- Source visual truth: `C:\Users\Manu\.codex\codex-remote-attachments\01a09239-031c-7c02-8002-436a8db74123\69A51EF0-8D14-4315-8D4F-736A94B75BBA\1-Foto-1.jpg`
- Selected target: the full-bleed card on the right.
- Implementation: product overlay opened from `http://localhost:3000/platos`.
- Verified viewports: 390 × 844 px and 1440 × 900 px, dark theme.
- State: real product, venue and price-mode data; no geolocation selected.

## Full-view comparison evidence

The opened product is now one visual surface instead of a white header, separate photograph and white information footer. Photography fills the card, a Pickyalo burgundy gradient protects the copy, and the product name, short description, venue, price mode and action live inside the image. The primary “Ver el local” action remains visible without scrolling.

## Required fidelity surfaces

- Mobile composition: portrait card, rounded silhouette, edge-to-edge image, top utility controls and a fixed lower information area.
- Desktop composition: the same card expands horizontally with the product copy intentionally anchored on the right, rather than stretching the mobile stack.
- Content fidelity: real image, venue, category, price mode, preparation time, description and location label are preserved.
- Interaction fidelity: close, share, call, image gallery, full-image view, swipe/wheel product navigation and direct venue link remain available.
- Accessibility: 44 px minimum utility controls, visible focus rings, semantic dialog labelling, real links and reduced-motion handling remain intact.

## Comparison history

### Baseline

- P1: the previous modal matched the left reference: three visibly separate blocks, a generic white information panel and competing small actions.
- Fix: rebuilt the existing modal as one full-bleed composition and promoted the venue link to the persistent cream action.
- P1: the global dark-theme bridge initially recolored the cream CTA burgundy and reduced its contrast.
- Fix: moved the CTA to a dedicated cream token that is not remapped by the legacy bridge.

### Final pass

- The complete card is visible at 390 × 844 without internal scrolling.
- The desktop composition keeps a large image area and readable copy without empty or stretched panels.
- TypeScript and targeted ESLint checks pass.

final result: passed
