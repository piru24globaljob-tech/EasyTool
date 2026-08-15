/**
 * Client-side Canvas Image Utilities for FileKit AI
 */

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
}

/**
 * Loads image Data URL or File into HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Compress and/or convert an image to specified format and quality
 */
export async function compressAndConvertImage(
  imageDataUrl: string,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.8
): Promise<{ dataUrl: string; size: number }> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // Fill white background for JPEGs to prevent black transparency
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const dataUrl = canvas.toDataURL(format, quality);
  // Estimate byte size from base64
  const head = `data:${format};base64,`;
  const size = Math.round(((dataUrl.length - head.length) * 3) / 4);

  return { dataUrl, size };
}

/**
 * Resize image to specific dimensions
 */
export async function resizeImage(
  imageDataUrl: string,
  targetWidth: number,
  targetHeight: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL(format, 0.9);
}

/**
 * Rotate image by 90, 180, 270 degrees
 */
export async function rotateImage(imageDataUrl: string, degrees: number): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');

  const rad = (degrees * Math.PI) / 180;
  if (degrees % 180 !== 0) {
    canvas.width = img.height;
    canvas.height = img.width;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return canvas.toDataURL('image/png');
}

/**
 * Crop image to a bounding rectangle
 */
export async function cropImage(
  imageDataUrl: string,
  cropRect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = cropRect.width;
  canvas.height = cropRect.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(
    img,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    cropRect.width,
    cropRect.height
  );

  return canvas.toDataURL('image/png');
}

/**
 * Generate Passport Photo Printable Sheet (2, 4, 6, or 8 passport photos on standard 4x6 inch paper canvas)
 */
export async function generatePassportPhotoSheet(
  imageDataUrl: string,
  photoCount: number = 6,
  options?: {
    photoWidth?: number;
    photoHeight?: number;
    backgroundColor?: string;
    targetSizeKB?: number;
  }
): Promise<string> {
  const img = await loadImage(imageDataUrl);

  // 4x6 inches at 300 DPI = 1200 x 1800 px
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1800;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const passportWidth = options?.photoWidth || 360;
  const passportHeight = options?.photoHeight || 450;
  const bgColor = options?.backgroundColor || '#FFFFFF';

  const marginX = 80;
  const marginY = 120;
  const gapX = 60;
  const gapY = 80;

  const cols = 2;
  const rows = Math.min(Math.ceil(photoCount / cols), 4);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r * cols + c >= photoCount) break;

      const x = marginX + c * (passportWidth + gapX);
      const y = marginY + r * (passportHeight + gapY);

      // Background color for photo if specified
      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, passportWidth, passportHeight);
      }

      // Draw photo with cover aspect ratio
      const imgAspect = img.width / img.height;
      const targetAspect = passportWidth / passportHeight;
      let sX = 0, sY = 0, sW = img.width, sH = img.height;

      if (imgAspect > targetAspect) {
        sW = img.height * targetAspect;
        sX = (img.width - sW) / 2;
      } else {
        sH = img.width / targetAspect;
        sY = (img.height - sH) / 2;
      }

      ctx.drawImage(img, sX, sY, sW, sH, x, y, passportWidth, passportHeight);

      // Draw subtle cutting border guideline around each photo
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(x, y, passportWidth, passportHeight);
      ctx.setLineDash([]);
    }
  }

  // Header banner on printable sheet
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FileKit AI — Standard Printable Passport / Visa Photo Sheet (4x6")', canvas.width / 2, 55);

  let quality = 0.95;
  if (options?.targetSizeKB && options.targetSizeKB > 0) {
    const targetBytes = options.targetSizeKB * 1024;
    return await compressToTargetBytes(canvas, 'image/jpeg', targetBytes);
  }

  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Resizes and compresses an image to exact Pixel dimensions and Target File Size (KB / MB)
 */
export async function resizeImageToTarget(
  imageDataUrl: string,
  options: {
    width?: number;
    height?: number;
    targetSizeValue?: number; // e.g. 50
    targetSizeUnit?: 'KB' | 'MB' | 'None'; // 'KB' or 'MB'
    format?: 'image/jpeg' | 'image/png' | 'image/webp';
    backgroundColor?: string;
    fitMode?: 'cover' | 'contain' | 'stretch';
  }
): Promise<{ dataUrl: string; actualSizeBytes: number; width: number; height: number }> {
  const img = await loadImage(imageDataUrl);

  const targetWidth = options.width && options.width > 0 ? Math.round(options.width) : img.width;
  const targetHeight = options.height && options.height > 0 ? Math.round(options.height) : img.height;
  const format = options.format || 'image/jpeg';
  const bgColor = options.backgroundColor || '#FFFFFF';
  const fitMode = options.fitMode || 'cover';

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  // Fill background
  if (format === 'image/jpeg' || bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (fitMode === 'stretch') {
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  } else if (fitMode === 'contain') {
    const imgAspect = img.width / img.height;
    const canvasAspect = targetWidth / targetHeight;
    let dW = targetWidth;
    let dH = targetHeight;
    let dX = 0;
    let dY = 0;

    if (imgAspect > canvasAspect) {
      dH = targetWidth / imgAspect;
      dY = (targetHeight - dH) / 2;
    } else {
      dW = targetHeight * imgAspect;
      dX = (targetWidth - dW) / 2;
    }
    ctx.drawImage(img, 0, 0, img.width, img.height, dX, dY, dW, dH);
  } else {
    // cover (default for passport photos)
    const imgAspect = img.width / img.height;
    const canvasAspect = targetWidth / targetHeight;
    let sX = 0, sY = 0, sW = img.width, sH = img.height;

    if (imgAspect > canvasAspect) {
      sW = img.height * canvasAspect;
      sX = (img.width - sW) / 2;
    } else {
      sH = img.width / canvasAspect;
      sY = (img.height - sH) / 2;
    }
    ctx.drawImage(img, sX, sY, sW, sH, 0, 0, targetWidth, targetHeight);
  }

  // Calculate target bytes
  let targetBytes = 0;
  if (options.targetSizeUnit === 'KB' && options.targetSizeValue && options.targetSizeValue > 0) {
    targetBytes = Math.round(options.targetSizeValue * 1024);
  } else if (options.targetSizeUnit === 'MB' && options.targetSizeValue && options.targetSizeValue > 0) {
    targetBytes = Math.round(options.targetSizeValue * 1024 * 1024);
  }

  let finalDataUrl: string;

  if (targetBytes > 0 && format !== 'image/png') {
    finalDataUrl = await compressToTargetBytes(canvas, format, targetBytes);
  } else {
    finalDataUrl = canvas.toDataURL(format, format === 'image/png' ? undefined : 0.92);
  }

  const head = `data:${format};base64,`;
  const actualSizeBytes = Math.round(((finalDataUrl.length - head.length) * 3) / 4);

  return {
    dataUrl: finalDataUrl,
    actualSizeBytes,
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Binary search compression to hit target byte limit
 */
async function compressToTargetBytes(
  canvas: HTMLCanvasElement,
  format: 'image/jpeg' | 'image/webp' = 'image/jpeg',
  targetBytes: number
): Promise<string> {
  let lowQuality = 0.05;
  let highQuality = 0.98;
  let bestUrl = canvas.toDataURL(format, 0.8);
  const head = `data:${format};base64,`;

  for (let i = 0; i < 8; i++) {
    const midQuality = (lowQuality + highQuality) / 2;
    const testUrl = canvas.toDataURL(format, midQuality);
    const size = Math.round(((testUrl.length - head.length) * 3) / 4);

    bestUrl = testUrl;

    if (Math.abs(size - targetBytes) < targetBytes * 0.05 || size <= targetBytes) {
      if (size <= targetBytes) {
        lowQuality = midQuality;
      } else {
        highQuality = midQuality;
      }
    } else {
      highQuality = midQuality;
    }
  }

  return bestUrl;
}

/**
 * Stamp custom watermark text on an image
 */
export async function watermarkImage(
  imageDataUrl: string,
  watermarkText: string,
  color: string = 'rgba(255, 255, 255, 0.7)',
  fontSize: number = 36
): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(img, 0, 0);

  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Diagonal repeat watermark or centered
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-30 * Math.PI) / 180);
  ctx.fillText(watermarkText, 0, 0);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Strips EXIF by re-drawing image onto a canvas and exporting
 */
export async function stripEXIF(imageDataUrl: string): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(img, 0, 0);

  // Exporting via canvas automatically strips EXIF data
  return canvas.toDataURL('image/jpeg', 0.92);
}
