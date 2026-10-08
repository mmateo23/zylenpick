"""Genera public/urbanos-talavera.json: horarios de bus urbano de Talavera.

Fuente: urbanostalavera.com -> PDFs oficiales por linea
(https://www.urbanostalavera.com/lineas-y-horarios/descargar/linea/{N}).

Uso:
    python scripts/build-urbanos-talavera.py

Requiere: pypdf (pip install pypdf)

Cuando cambien los horarios (la web lo indica), basta con re-ejecutar este
script y el JSON se regenera; la app solo lee public/urbanos-talavera.json.

Hecho del layout (verificado contra los 6 PDFs):
- Pagina 0 = portada (se salta).
- Cada seccion empieza con una cabecera en la columna izquierda:
  uno de los tipos de dia (con o sin sufijo "· IDA"/"· VUELTA").
- Cada fila es una parada: nombre (columna izquierda) + horas (resto).
  La desviacion Y intra-fila es <=1.8px; el espaciado minimo entre filas
  es ~3.1px -> clustering por proximidad de Y (gap > GAP_MAX inicia fila
  nueva), sin suposiciones de offset.
- Algunos nombres van partidos en dos lineas a mitad de palabra
  (Gl/ orieta Tres Olivos) -> se fusionan si la 2a parte empieza en
  minuscula y la anterior termina en letra.
- Pie de pagina (* Solo laborables..., notas de paradas) -> se descartan.
- Banners de cabecera de ruta en MAYUSCULAS (C. C. LOS ALFARES -, PATROCINIO,
  CIRCULAR...) -> se descartan.
"""
from __future__ import annotations

import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "urbanos-talavera.json"
TMP = ROOT / "scripts" / ".urbanos_tmp"

TIME = re.compile(r"^\d{1,2}:\d{2}$")
GAP_MAX = 2.2  # px maximo entre celdas de la misma fila

DAYS = [
    "LUNES A VIERNES",
    "LABORABLES DE AGOSTO Y NAVIDAD",
    "LABORABLES",
    "SÁBADOS Y LABORABLES DE AGOSTO Y NAVIDAD",
    "SÁBADOS",
    "DOMINGOS Y FESTIVOS",
]
HDR = re.compile(
    r"^(" + "|".join(re.escape(d) for d in DAYS) + r")"
    r"\s*(?:[·-]\s*(IDA|VUELTA))?$"
)
FOOTNOTE = re.compile(
    r"^\*|solo se realiza|solo laborables|horarios y tarifas|no se realizan",
    re.I,
)

LINES = {
    "1": "C.C. Los Alfares - Patrocinio",
    "3": "C.C. Los Alfares - Bº Santa María",
    "4": "C.C. Los Alfares - Talavera la Nueva",
    "5": "C.C. Los Alfares - Gamonal",
    "6": "Circular",
    "9": "Circular",
}


def download(n: str) -> Path:
    TMP.mkdir(parents=True, exist_ok=True)
    url = f"https://www.urbanostalavera.com/lineas-y-horarios/descargar/linea/{n}"
    dest = TMP / f"linea{n}.pdf"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (pickyalo)"})
    with urllib.request.urlopen(req, timeout=120) as resp, open(dest, "wb") as f:
        f.write(resp.read())
    return dest


def extract(path: Path) -> list[dict]:
    import pypdf

    reader = pypdf.PdfReader(str(path))
    items: list[dict] = []

    def visit(page_no: int, text: str, tm, _font_dict, _font_size) -> None:
        t = text.strip()
        if not t:
            return
        items.append(
            {"p": page_no, "x": round(tm[4], 1), "y": round(tm[5], 1), "t": t}
        )

    for pno, page in enumerate(reader.pages):
        page.extract_text(visitor_text=lambda t, cm, tm, fd, fs: visit(pno, t, tm, fd, fs))
    return items


def cluster_rows(cells: list[dict]) -> list[list[dict]]:
    """Agrupar celdas por fila (Y desc, tolerancia GAP_MAX)."""
    cells = sorted(cells, key=lambda c: -c["y"])
    rows: list[list[dict]] = []
    cur: list[dict] = []
    last_y: float | None = None
    for c in cells:
        if last_y is not None and last_y - c["y"] > GAP_MAX:
            rows.append(cur)
            cur = []
        cur.append(c)
        last_y = c["y"]
    if cur:
        rows.append(cur)
    return rows


def parse_linea(items: list[dict]) -> list[dict]:
    items = [c for c in items if c["p"] > 0]

    # Cabeceras, ordenadas por documento (pagina asc, Y desc = de arriba a abajo)
    headers = [
        (c["p"], c["y"], m)
        for c in items
        if c["x"] < 90 and (m := HDR.fullmatch(c["t"].strip()))
    ]
    headers.sort(key=lambda h: (h[0], -h[1]))

    sections: list[dict] = []
    for idx, (p, y, m) in enumerate(headers):
        dias = m.group(1)
        direccion = m.group(2)  # None para circulares
        y_end = -1e9
        for p2, y2, _ in headers[idx + 1 :]:
            if p2 == p:
                y_end = y2
                break
        # Celdas de la seccion: misma pagina, Y entre cabeceras
        cells = [c for c in items if c["p"] == p and y_end < c["y"] < y]
        paradas: list[dict] = []
        for row in cluster_rows(cells):
            name_parts = [
                c["t"].strip()
                for c in row
                if c["x"] < 90
                and not TIME.fullmatch(c["t"])
                and not FOOTNOTE.search(c["t"])
            ]
            horas = sorted({c["t"] for c in row if TIME.fullmatch(c["t"])})
            if name_parts:
                nm = " ".join(name_parts)
                # Banners de cabecera de ruta en 100% MAYUSCULAS -> descartar.
                if nm.upper() == nm and any(ch.isalpha() for ch in nm):
                    continue
                paradas.append({"nombre": nm, "horas": horas,
                                "celdas": [(c["x"], c["t"]) for c in row if TIME.fullmatch(c["t"])]})
        # Fusionar nombres partidos a mitad de palabra
        merged: list[dict] = []
        for st in paradas:
            if merged and st["nombre"][0].islower() and merged[-1]["nombre"][-1].isalpha():
                merged[-1]["nombre"] += st["nombre"]
                merged[-1]["horas"] = sorted(set(merged[-1]["horas"]) | set(st["horas"]))
                merged[-1]["celdas"].extend(st["celdas"])
            else:
                merged.append(st)
        # Each timetable column is a trip. Blank cells mean the bus does not
        # serve that stop on that trip; concatenating all rows invents detours.
        columns: list[float] = []
        for x in sorted({x for stop in merged for x, _ in stop["celdas"]}):
            if not columns or x - columns[-1] > 3:
                columns.append(x)
        variants: dict[tuple, list[dict]] = {}
        for column in columns:
            trip = [{"nombre": stop["nombre"], "horas": [time for x, time in stop["celdas"] if abs(x - column) <= 3]}
                    for stop in merged]
            trip = [stop for stop in trip if stop["horas"]]
            if len(trip) < 2:
                continue
            signature = tuple(stop["nombre"] for stop in trip)
            if signature not in variants:
                variants[signature] = trip
            else:
                for existing, stop in zip(variants[signature], trip):
                    existing["horas"] = sorted(set(existing["horas"] + stop["horas"]))
        for stop in merged:
            del stop["celdas"]
        sections.append({"dias": dias, "direccion": direccion, "paradas": merged,
                         "recorridos": [{"paradas": trip} for trip in variants.values()]})
    return sections


def main() -> int:
    try:
        import pypdf  # noqa: F401
    except ImportError:
        print("Falta pypdf. Instala con: pip install pypdf", file=sys.stderr)
        return 1

    result = {
        "fuente": "urbanostalavera.com (PDFs oficiales, v. junio 2026)",
        "extraido": str(date.today()),
        "lineas": {},
    }
    for n, nombre in LINES.items():
        pdf = download(n)
        secs = parse_linea(extract(pdf))
        result["lineas"][n] = {"nombre": nombre, "secciones": secs}
        total_horas = sum(len(p["horas"]) for s in secs for p in s["paradas"])
        total_paradas = sum(len(s["paradas"]) for s in secs)
        sin_horas = [p["nombre"] for s in secs for p in s["paradas"] if not p["horas"]]
        print(f"Línea {n} ({nombre}): {len(secs)} secciones, "
              f"{total_paradas} paradas, {total_horas} horas")
        for s in secs:
            d = s["direccion"] or "CIRCULAR"
            print(f"   {s['dias'][:45]:45s} {d:7s} -> {len(s['paradas']):3d} paradas")
        if sin_horas:
            print(f"   !! paradas sin horas ({len(sin_horas)}): {sin_horas[:8]}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    print(f"\nOK -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
