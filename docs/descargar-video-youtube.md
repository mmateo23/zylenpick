# Descargador de vídeos de YouTube

Utilidad local para descargar contenido propio o autorizado con la mejor calidad
que YouTube tenga disponible. En MP4 y MKV, el vídeo y el audio se combinan sin
recodificarlos. La salida MP3 convierte únicamente la mejor pista de audio.

## Preparación

Desde la raíz del proyecto:

```powershell
python -m pip install -r scripts/requirements-video.txt
```

No es necesario instalar FFmpeg manualmente: `imageio-ffmpeg` proporciona un
ejecutable compatible y el programa lo localiza automáticamente.

## Uso recomendado: máxima calidad compatible

```powershell
python scripts/descargar_youtube.py "https://www.youtube.com/watch?v=ID_DEL_VIDEO"
```

El resultado se guarda en `videos_descargados` como MP4. Se conserva la mejor
pista de vídeo disponible y se elige audio AAC para que el sonido funcione en
los reproductores habituales de Windows. Al finalizar, el programa inspecciona
el MP4 y solo confirma la descarga si detecta tanto vídeo como audio.

También se puede pegar la URL de forma interactiva:

```powershell
python scripts/descargar_youtube.py
```

## Calidad absoluta en MKV

```powershell
python scripts/descargar_youtube.py --formato mkv "https://youtu.be/ID_DEL_VIDEO"
```

El modo MKV conserva las mejores pistas absolutas, incluido audio Opus. Algunos
reproductores de Windows muestran el vídeo pero no reproducen ese audio; en ese
caso se debe utilizar el modo MP4 predeterminado o un reproductor como VLC.

## Descargar solamente el audio en MP3

```powershell
python scripts/descargar_youtube.py --formato mp3 "https://youtu.be/ID_DEL_VIDEO"
```

El programa descarga la mejor pista de audio disponible y la convierte a MP3
con la máxima calidad VBR. Al terminar comprueba que el archivo contiene audio.

Para escoger otra carpeta:

```powershell
python scripts/descargar_youtube.py --salida "D:\Videos" "https://youtu.be/ID_DEL_VIDEO"
```

Las playlists están bloqueadas por defecto para evitar descargas accidentales.
Se habilitan expresamente con `--playlist`.

## Actualización y problemas habituales

YouTube cambia con frecuencia. Si aparece un error del extractor, actualiza
`yt-dlp`:

```powershell
python -m pip install --upgrade yt-dlp
```

Utiliza esta herramienta únicamente para vídeos propios, con permiso del titular
o cuya licencia permita la descarga, y respeta las condiciones aplicables.
