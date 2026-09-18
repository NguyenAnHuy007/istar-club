/**
 * Image processing utilities for iStar Club.
 * Provides client-side HTML5 Canvas based auto-crop, resize, and compression.
 */

/**
 * Loads an image File or Blob into an HTMLImageElement in memory.
 */
export function loadImageFromFile(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Converts a canvas to a Blob with specified MIME type and quality.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.85
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      type,
      quality
    );
  });
}

export interface CompressResult {
  file: File;
  wasCompressed: boolean;
  originalSize: number;
  compressedSize: number;
}

/**
 * Automatically compresses an image if it exceeds maxSizeBytes (default: 3MB).
 * Outputs a JPG File format.
 * If file.size <= maxSizeBytes, returns original file untouched.
 */
export async function compressImageToMaxSize(
  file: File,
  maxSizeBytes = 3 * 1024 * 1024,
  targetFormat = "image/jpeg"
): Promise<CompressResult> {
  const originalSize = file.size;
  if (originalSize <= maxSizeBytes) {
    return {
      file,
      wasCompressed: false,
      originalSize,
      compressedSize: originalSize,
    };
  }

  const img = await loadImageFromFile(file);

  // If dimensions are extremely large (e.g. > 2560px on any side), downscale first
  let targetWidth = img.naturalWidth;
  let targetHeight = img.naturalHeight;
  const maxDim = 2560;
  if (targetWidth > maxDim || targetHeight > maxDim) {
    const scale = Math.min(maxDim / targetWidth, maxDim / targetHeight);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Không thể khởi tạo Canvas 2D để nén ảnh!");
  }
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Stepped compression: try descending qualities until <= maxSizeBytes
  const qualities = [0.85, 0.75, 0.65, 0.5, 0.4, 0.3];
  let bestBlob: Blob | null = null;

  for (const q of qualities) {
    const blob = await canvasToBlob(canvas, targetFormat, q);
    if (blob) {
      bestBlob = blob;
      if (blob.size <= maxSizeBytes) {
        break;
      }
    }
  }

  // If still over target size after minimum quality, reduce resolution further
  if (bestBlob && bestBlob.size > maxSizeBytes) {
    let scale = 0.75;
    while (bestBlob && bestBlob.size > maxSizeBytes && scale >= 0.3) {
      const w = Math.round(targetWidth * scale);
      const h = Math.round(targetHeight * scale);
      const rescaledCanvas = document.createElement("canvas");
      rescaledCanvas.width = w;
      rescaledCanvas.height = h;
      const rescaledCtx = rescaledCanvas.getContext("2d");
      if (rescaledCtx) {
        rescaledCtx.drawImage(img, 0, 0, w, h);
        const blob = await canvasToBlob(rescaledCanvas, targetFormat, 0.6);
        if (blob) {
          bestBlob = blob;
        }
      }
      scale -= 0.15;
    }
  }

  if (!bestBlob) {
    return { file, wasCompressed: false, originalSize, compressedSize: originalSize };
  }

  const rawBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_") || "image";
  const newFileName = `${rawBaseName}-compressed.jpg`;
  const compressedFile = new File([bestBlob], newFileName, {
    type: targetFormat,
    lastModified: Date.now(),
  });

  return {
    file: compressedFile,
    wasCompressed: true,
    originalSize,
    compressedSize: compressedFile.size,
  };
}

/**
 * Automatically processes a check-in candidate portrait photo:
 * 1. Center-crops to 3:4 vertical aspect ratio.
 * 2. Resizes to exactly 1500 × 2000 px.
 * 3. Compresses to approximately 1MB (~1024KB) in JPG format.
 */
export async function processCheckinPhoto(file: File): Promise<File> {
  const img = await loadImageFromFile(file);

  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  // 3:4 aspect ratio = 0.75
  const targetAspect = 3 / 4;
  const currentAspect = naturalWidth / naturalHeight;

  let cropWidth = naturalWidth;
  let cropHeight = naturalHeight;
  let cropX = 0;
  let cropY = 0;

  if (currentAspect > targetAspect) {
    // Image is wider than 3:4 -> crop horizontally from center
    cropHeight = naturalHeight;
    cropWidth = Math.round(naturalHeight * targetAspect);
    cropX = Math.round((naturalWidth - cropWidth) / 2);
    cropY = 0;
  } else {
    // Image is taller than 3:4 -> crop vertically from center
    cropWidth = naturalWidth;
    cropHeight = Math.round(naturalWidth / targetAspect);
    cropX = 0;
    cropY = Math.round((naturalHeight - cropHeight) / 2);
  }

  // Exact 1500 x 2000 target canvas
  const targetWidth = 1500;
  const targetHeight = 2000;

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Không thể khởi tạo Canvas 2D để xử lý ảnh check-in!");
  }

  ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);

  // Target size ~1MB (1,048,576 bytes)
  const targetBytes = 1024 * 1024;
  let minQ = 0.55;
  let maxQ = 0.95;
  let bestBlob: Blob | null = null;

  for (let iter = 0; iter < 5; iter++) {
    const midQ = (minQ + maxQ) / 2;
    const blob = await canvasToBlob(canvas, "image/jpeg", midQ);
    if (!blob) break;
    bestBlob = blob;

    if (Math.abs(blob.size - targetBytes) < 80 * 1024) {
      // Within 80KB of 1MB, ideal
      break;
    }
    if (blob.size > targetBytes) {
      maxQ = midQ;
    } else {
      minQ = midQ;
    }
  }

  if (!bestBlob) {
    // Fallback quality 0.85
    bestBlob = await canvasToBlob(canvas, "image/jpeg", 0.85);
  }

  const rawBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_") || "checkin";
  const newFileName = `${rawBaseName}-checkin-3x4.jpg`;

  return new File([bestBlob || file], newFileName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
