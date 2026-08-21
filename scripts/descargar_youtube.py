"""Descarga vídeos de YouTube conservando la mejor calidad disponible.

Usa este programa únicamente con contenido propio o con autorización.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse


FORMATOS = {
    # Conserva el mejor vídeo y elige AAC, ampliamente compatible, para el audio.
    "mp4": {
        "format": (
            "bestvideo+bestaudio[ext=m4a][acodec^=mp4a]"
            "/best[ext=mp4][vcodec!=none][acodec!=none]"
        ),
        "merge_output_format": "mp4",
        "extension": "mp4",
        "requiere_video": True,
    },
    # MKV conserva las mejores pistas absolutas, aunque algunos reproductores
    # de Windows no reproducen audio Opus dentro de este contenedor.
    "mkv": {
        "format": "bestvideo+bestaudio/best",
        "merge_output_format": "mkv",
        "extension": "mkv",
        "requiere_video": True,
    },
    # Extrae la mejor pista de audio y la convierte a MP3 VBR de máxima calidad.
    "mp3": {
        "format": "bestaudio/best",
        "extension": "mp3",
        "requiere_video": False,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "0",
            }
        ],
    },
}

DOMINIOS_YOUTUBE = {
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtu.be",
    "www.youtu.be",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
}


def validar_url(url: str) -> str:
    """Valida que sea una URL HTTPS perteneciente a YouTube."""
    parsed = urlparse(url.strip())
    host = (parsed.hostname or "").lower()

    if parsed.scheme != "https" or host not in DOMINIOS_YOUTUBE:
        raise argparse.ArgumentTypeError(
            "Introduce una URL HTTPS válida de youtube.com o youtu.be."
        )
    return url.strip()


def crear_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Descarga un vídeo de YouTube con la mejor calidad disponible.",
        epilog=(
            "MP4 conserva el mejor vídeo y utiliza audio AAC compatible. "
            "MKV conserva las mejores pistas absolutas. MP3 descarga solo el audio."
        ),
    )
    parser.add_argument("url", nargs="?", type=validar_url, help="URL del vídeo")
    parser.add_argument(
        "-o",
        "--salida",
        type=Path,
        default=Path("videos_descargados"),
        help="Carpeta de destino (por defecto: videos_descargados)",
    )
    parser.add_argument(
        "-f",
        "--formato",
        choices=FORMATOS,
        default="mp4",
        help="Salida: mp4 = recomendado; mkv = calidad absoluta; mp3 = solo audio",
    )
    parser.add_argument(
        "--playlist",
        action="store_true",
        help="Permite descargar una playlist completa (desactivado por defecto)",
    )
    return parser


def cargar_dependencias():
    try:
        import yt_dlp
        from imageio_ffmpeg import get_ffmpeg_exe
    except ImportError as exc:
        raise RuntimeError(
            "Faltan dependencias. Ejecuta: "
            "python -m pip install -r scripts/requirements-video.txt"
        ) from exc

    return yt_dlp, get_ffmpeg_exe


def extraer_ids(info: dict) -> list[str]:
    """Obtiene los identificadores de los vídeos, incluidos los de una playlist."""
    if info.get("_type") in {"playlist", "multi_video"}:
        ids: list[str] = []
        for entrada in info.get("entries") or []:
            if isinstance(entrada, dict):
                ids.extend(extraer_ids(entrada))
        return ids

    video_id = info.get("id")
    return [str(video_id)] if video_id else []


def encontrar_archivo(salida: Path, video_id: str, extension: str) -> Path:
    marcador = f"[{video_id}]"
    candidatos = [
        archivo
        for archivo in salida.iterdir()
        if archivo.is_file()
        and archivo.suffix.lower() == f".{extension}"
        and marcador in archivo.stem
    ]
    if not candidatos:
        raise RuntimeError(
            f"No se encontró el archivo final del vídeo {video_id} para validarlo."
        )
    return max(candidatos, key=lambda archivo: archivo.stat().st_mtime)


def verificar_archivo(ffmpeg: Path, archivo: Path, requiere_video: bool) -> None:
    """Comprueba las pistas requeridas en el archivo final."""
    resultado = subprocess.run(
        [str(ffmpeg), "-hide_banner", "-i", str(archivo)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    diagnostico = resultado.stderr
    tiene_video = any(" Video:" in linea for linea in diagnostico.splitlines())
    tiene_audio = any(" Audio:" in linea for linea in diagnostico.splitlines())

    if not tiene_audio or (requiere_video and not tiene_video):
        archivo.unlink(missing_ok=True)
        pistas_esperadas = "vídeo y audio" if requiere_video else "audio"
        raise RuntimeError(
            f"El archivo generado no contenía {pistas_esperadas}. Se eliminó el "
            "archivo incompleto; vuelve a intentarlo tras actualizar yt-dlp."
        )


def descargar(url: str, salida: Path, formato: str, playlist: bool) -> None:
    yt_dlp, get_ffmpeg_exe = cargar_dependencias()

    salida = salida.expanduser().resolve()
    salida.mkdir(parents=True, exist_ok=True)
    ffmpeg = Path(get_ffmpeg_exe()).resolve()
    seleccion = FORMATOS[formato]

    opciones = {
        "format": seleccion["format"],
        "ffmpeg_location": str(ffmpeg),
        "outtmpl": str(salida / "%(title).180B [%(id)s].%(ext)s"),
        "noplaylist": not playlist,
        "windowsfilenames": sys.platform == "win32",
        "restrictfilenames": False,
        "continuedl": True,
        "overwrites": False,
        "ignoreerrors": False,
        "retries": 10,
        "fragment_retries": 10,
        "concurrent_fragment_downloads": 4,
    }
    if "merge_output_format" in seleccion:
        opciones["merge_output_format"] = seleccion["merge_output_format"]
    if "postprocessors" in seleccion:
        opciones["postprocessors"] = seleccion["postprocessors"]

    print(f"\nDestino: {salida}")
    print(f"Formato: {formato.upper()}")
    print("Iniciando descarga...\n")

    with yt_dlp.YoutubeDL(opciones) as ydl:
        info = ydl.extract_info(url, download=True)

    if not isinstance(info, dict):
        raise RuntimeError("YouTube no devolvió información válida del vídeo.")

    archivos = [
        encontrar_archivo(salida, video_id, seleccion["extension"])
        for video_id in extraer_ids(info)
    ]
    if not archivos:
        raise RuntimeError("No se encontró ningún vídeo descargado para validar.")

    for archivo in archivos:
        verificar_archivo(ffmpeg, archivo, seleccion["requiere_video"])
        contenido = "vídeo + audio" if seleccion["requiere_video"] else "audio"
        print(f"Verificado ({contenido}): {archivo.name}")

    print(f"\nDescarga completada en: {salida}")


def main() -> int:
    parser = crear_parser()
    args = parser.parse_args()

    url = args.url
    if url is None:
        try:
            url = validar_url(input("Pega la URL del vídeo de YouTube: "))
        except (EOFError, KeyboardInterrupt):
            print("\nOperación cancelada.")
            return 130
        except argparse.ArgumentTypeError as exc:
            parser.error(str(exc))

    try:
        descargar(url, args.salida, args.formato, args.playlist)
    except KeyboardInterrupt:
        print("\nDescarga cancelada. Podrás reanudarla ejecutando el mismo comando.")
        return 130
    except Exception as exc:
        print(f"\nError: {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
