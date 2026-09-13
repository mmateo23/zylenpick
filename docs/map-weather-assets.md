# Recursos para la escena meteorológica del mapa

La imagen principal de ciudad ya se edita desde la biblioteca del panel (`map_hero`). El cielo y su transición son degradados CSS: no requieren imágenes y se adaptan a cada pantalla. El sol, las fases lunares, las nubes y la precipitación funcionan actualmente con CSS. Sus espacios de subida en el panel quedan pendientes; esta lista prepara los recursos para esa siguiente ampliación.

| Recurso | Preparación recomendada | Uso |
| --- | --- | --- |
| Imagen de ciudad | PNG/WebP transparente, unos 1400 px de ancho, edificio completo y base alineada abajo | Primer plano; sustituible hoy desde el panel |
| Sol | SVG o PNG transparente, 512 × 512, sin cielo ni sombra exterior | Día y luz cálida de amanecer/atardecer |
| Luna | SVG o PNG transparente, 512 × 512 | Disco base; mantener la máscara de fase lunar |
| Nube ligera | SVG o WebP transparente, 1000 × 400 | Cielo parcialmente nublado |
| Nube densa | SVG o WebP transparente, 1000 × 500 | Nublado, lluvia y tormenta |
| Horizonte (opcional) | WebP transparente, 2000 × 500, perfil urbano sin texto | Capa lejana detrás de la ciudad |

Evitar márgenes transparentes grandes y texto incrustado. El color del cielo, la temperatura, el estado meteorológico y el fundido al crema deben seguir siendo elementos adaptables de la web. Lluvia y nieve no necesitan archivos de vídeo ni GIF.

Los periodos de amanecer y atardecer abarcan 45 minutos a cada lado de la salida/puesta de sol que devuelve Open-Meteo. Sin datos meteorológicos se muestra una escena crema neutra, sin inventar temperatura ni condiciones. Producción conserva el requisito existente de `OPEN_METEO_API_KEY` para consultar el proveedor.
