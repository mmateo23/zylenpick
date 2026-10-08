"""Genera las coordenadas de paradas urbanas desde OpenStreetMap/Overpass."""

from __future__ import annotations

import datetime as dt
import json
import urllib.parse
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "urbanos-talavera-stops.json"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
QUERY = """
[out:json][timeout:25];
(
  node["highway"="bus_stop"](39.92,-4.90,40.00,-4.75);
  node["public_transport"="platform"]["bus"="yes"](39.92,-4.90,40.00,-4.75);
);
out body;
""".strip()


def main() -> None:
    url = f"{OVERPASS_URL}?{urllib.parse.urlencode({'data': QUERY})}"
    request = urllib.request.Request(url, headers={"User-Agent": "Pickyalo/1.0"})
    with urllib.request.urlopen(request, timeout=90) as response:
        payload = json.load(response)

    seen: set[int] = set()
    stops: list[dict[str, object]] = []
    for element in payload.get("elements", []):
        stop_id = int(element["id"])
        name = str(element.get("tags", {}).get("name", "")).strip()
        if not name or stop_id in seen:
            continue
        seen.add(stop_id)
        stops.append(
            {
                "id": str(stop_id),
                "name": name,
                "latitude": float(element["lat"]),
                "longitude": float(element["lon"]),
            }
        )

    result = {
        "fuente": "OpenStreetMap / Overpass",
        "extraido": dt.date.today().isoformat(),
        "paradas": sorted(stops, key=lambda stop: (str(stop["name"]), str(stop["id"]))),
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK -> {OUT.relative_to(ROOT)} ({len(stops)} paradas)")


if __name__ == "__main__":
    main()
