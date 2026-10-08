"""Build street geometry from ordered OSM bus relations, never car directions.

Usage: python scripts/build-urbanos-talavera-routes.py
Relations were checked against Urbanos Talavera's June 2026 line timetables.
The cartography remains OSM data, not an operator-provided GPS trace.
Only connected way sequences are exported: gaps must never become straight lines.
"""
from pathlib import Path
import datetime as dt
import json
import math
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
RELATIONS = [9368199, 9368202, 9368204, 9368206, 9368209, 9368210, 9368211,
             9368213, 9368214, 9368215, 9368217, 9368219, 9368220, 9368221,
             9368223, 9368229, 9368230, 9368231, 9368232, 9368233, 9368234,
             9368235, 9368239, 9368240, 9368241, 9368242, 9368243, 9368249,
             21157593, 21157594, 21157690]


def tags(element):
    return {tag.attrib['k']: tag.attrib['v'] for tag in element.findall('tag')}


def build(path, relation_id):
    root = ET.parse(path).getroot()
    nodes = {n.attrib['id']: n for n in root.findall('node')}
    ways = {w.attrib['id']: [n.attrib['ref'] for n in w.findall('nd')] for w in root.findall('way')}
    relation = next(r for r in root.findall('relation') if r.attrib['id'] == str(relation_id))
    info = tags(relation)
    members = relation.findall('member')
    roads = [m for m in members if m.attrib['type'] == 'way' and m.attrib.get('role', '') in ('', 'forward', 'backward')]
    joined = []
    for index, member in enumerate(roads):
        refs = ways[member.attrib['ref']][:]
        if not joined and len(roads) > 1:
            following = ways[roads[index + 1].attrib['ref']]
            if refs[0] in (following[0], following[-1]):
                refs.reverse()
        elif joined and joined[-1] == refs[-1]:
            refs.reverse()
        if joined and joined[-1] != refs[0]:
            raise ValueError(f'Disconnected bus relation {relation_id}; review before publishing')
        joined.extend(refs if not joined else refs[1:])
    coordinates = [[float(nodes[n].attrib['lon']), float(nodes[n].attrib['lat'])] for n in joined]
    stops = []
    for member in members:
        if member.attrib['type'] != 'node' or not member.attrib.get('role', '').startswith('platform'):
            continue
        node = nodes[member.attrib['ref']]
        name = tags(node).get('name')
        if name:
            stops.append({'id': node.attrib['id'], 'name': name, 'longitude': float(node.attrib['lon']), 'latitude': float(node.attrib['lat'])})
    # Assign stops to the bus path in travel order, including repeated circular stops.
    # Prefix-min dynamic programming prevents snapping to a later visit to the same road.
    scale = math.cos(math.radians(39.96))
    if info.get('roundtrip') == 'yes' and stops:
        if coordinates[0] != coordinates[-1]:
            raise ValueError(f'Circular relation {relation_id} does not close')
        first = stops[0]
        start = min(range(len(coordinates) - 1), key=lambda i: ((coordinates[i][0] - first['longitude']) * scale) ** 2 + (coordinates[i][1] - first['latitude']) ** 2)
        coordinates = coordinates[start:-1] + coordinates[:start + 1]
        if stops[-1]['id'] != first['id']:
            stops.append(dict(first))
    costs = [0.0] * len(coordinates)
    history = []
    for stop in stops:
        next_costs, predecessors = [], []
        minimum, previous = float('inf'), 0
        for index, (lon, lat) in enumerate(coordinates):
            if costs[index] < minimum:
                minimum, previous = costs[index], index
            error = ((lon - stop['longitude']) * scale) ** 2 + (lat - stop['latitude']) ** 2
            next_costs.append(minimum + error)
            predecessors.append(previous)
        costs = next_costs
        history.append(predecessors)
    current = min(range(len(costs)), key=lambda i: costs[i])
    for index in range(len(stops) - 1, -1, -1):
        stops[index]['geometryIndex'] = current
        current = history[index][current]
    direction = 'Circular' if info.get('roundtrip') == 'yes' else 'IDA' if 'Alfares' in info.get('from', '') else 'VUELTA'
    return {'id': str(relation_id), 'line': info['ref'], 'direction': direction,
            'service': info.get('description', ''), 'stops': stops, 'coordinates': coordinates}


def main():
    cache = ROOT / 'output' / 'transit-osm'
    cache.mkdir(parents=True, exist_ok=True)
    routes = []
    for relation_id in RELATIONS:
        path = cache / f'{relation_id}.xml'
        if not path.exists():
            request = urllib.request.Request(f'https://api.openstreetmap.org/api/0.6/relation/{relation_id}/full', headers={'User-Agent': 'Pickyalo/1.0'})
            path.write_bytes(urllib.request.urlopen(request, timeout=30).read())
        routes.append(build(path, relation_id))
    output = {'source': 'OpenStreetMap bus route relations; timetable order: Urbanos Talavera',
              'extracted': dt.date.today().isoformat(), 'routes': routes}
    destination = ROOT / 'public' / 'urbanos-talavera-routes.json'
    destination.write_text(json.dumps(output, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    # Include route platforms outside the old city-only stop bounding box.
    stops_path = ROOT / 'public' / 'urbanos-talavera-stops.json'
    stop_data = json.loads(stops_path.read_text(encoding='utf-8'))
    mapped_stops = {stop['id']: stop for stop in stop_data['paradas']}
    for route in routes:
        for stop in route['stops']:
            mapped_stops[stop['id']] = {key: stop[key] for key in ('id', 'name', 'longitude', 'latitude')}
    stop_data['paradas'] = sorted(mapped_stops.values(), key=lambda stop: (stop['name'], stop['id']))
    stop_data['extraido'] = output['extracted']
    stops_path.write_text(json.dumps(stop_data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{len(routes)} connected bus routes -> {destination.name} ({destination.stat().st_size} bytes)')


if __name__ == '__main__':
    main()
