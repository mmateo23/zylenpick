# Talavera bus cartography review — 2026-10-07

Official schedules: https://www.urbanostalavera.com/lineas-y-horarios/linea-1
Six PDFs re-downloaded using the existing `build-urbanos-talavera.py` script.

## Corrections

- Directions for cars through bus-stop coordinates did not represent bus routes.
  `/api/transit/route` now returns stored OSM bus relation geometry only. It does
  not call a road-routing service, request a Mapbox token or invent connecting lines.
- PDF timetable columns describe individual services. Blank cells represent stops
  not served on that trip. The importer retains the original rows and derives
  `recorridos` from columns; the application preserves branches and short services.
- Stops are matched to ordered platforms in the chosen bus relation, preserving
  direction and physical platform. Missing platforms are counted honestly.
- Connected OSM ways are joined by shared node IDs. Disconnected relations fail
  the build. Circular geometry is rotated to its origin, matched monotonically
  and clipped to at most one lap. Direct journeys use only the selected segment.
- A variant without sufficient cartography shows stops and its official link;
  it does not fall back to a car route or a straight line through buildings.

## Sources and limits

Street geometry is **OpenStreetMap**, not operator-provided GPS or GTFS data.
31 bus relations were read through the OSM API and compared with the official
stop order. They cover the 82 distinct stop sequences derived from the current
PDF columns. Coverage does not mean every platform has been independently verified
in person. Unmatched platform names are omitted from the map, with the mapped/total
count shown. Official timings remain separate from cartographic data.

No live arrival times, festive-calendar guarantees, or temporary diversions are
inferred. The operator's live-information and trip-planner pages currently say
that the service will be available later. For temporary changes consult
https://www.urbanostalavera.com/avisos.

## Maintenance

1. `python scripts/build-urbanos-talavera.py` refreshes the published timetables.
2. `python scripts/build-urbanos-talavera-routes.py` builds cartography from the
   listed OSM relations and merges their platforms into the stop dataset.
   XML files in ignored `output/transit-osm` cache the retrieval; refresh these
   specific files when checking a new source revision.
3. Run `npx vitest run --config vitest.discovery.config.mjs tests/urbanos-talavera.test.ts`.
   Tests cover timetable conservation, branches, directions, circular laps,
   clipped journeys, unsupported routes and coverage of all extracted variants.

Do not claim that an automatically generated driving route is a bus itinerary.
