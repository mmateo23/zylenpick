const MAX_SIDE = 1600;
const TARGET_BYTES = 500 * 1024;

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo procesar la imagen."))),
      "image/webp",
      quality,
    );
  });
}

function isHeic(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type.includes("heic") || type.includes("heif") || /\.(heic|heif)$/.test(name);
}

async function decodeImage(file: File | Blob) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // HEIC and older mobile browsers use the fallback below.
    }
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("El navegador no puede leer esta imagen."));
    };
    image.src = url;
  });
}

async function decodeWithHeicFallback(file: File) {
  try {
    return await decodeImage(file);
  } catch (error) {
    if (!isHeic(file)) throw error;
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    const jpeg = Array.isArray(converted) ? converted[0] : converted;
    return decodeImage(jpeg);
  }
}

export async function processScoutImage(file: File) {
  if (!file.type.startsWith("image/") && !isHeic(file)) {
    throw new Error("El archivo seleccionado no es una imagen compatible.");
  }

  const source = await decodeWithHeicFallback(file);
  const sourceWidth = source instanceof ImageBitmap ? source.width : source.naturalWidth;
  const sourceHeight = source instanceof ImageBitmap ? source.height : source.naturalHeight;
  if (!sourceWidth || !sourceHeight) throw new Error("La imagen no tiene un tamaño válido.");

  let bestBlob: Blob | null = null;
  for (const maxSide of [MAX_SIDE, 1440, 1280]) {
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("No se pudo preparar la imagen.");
    context.drawImage(source, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.82, 0.76, 0.7, 0.64]) {
      const candidate = await canvasToWebp(canvas, quality);
      bestBlob = candidate;
      if (candidate.size <= TARGET_BYTES) break;
    }
    if ((bestBlob && bestBlob.size <= TARGET_BYTES) || scale === 1) break;
  }

  if (source instanceof ImageBitmap) source.close();
  if (!bestBlob) throw new Error("No se pudo convertir la imagen.");
  return new File([bestBlob], "cover.webp", {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
