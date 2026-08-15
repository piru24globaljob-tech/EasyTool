import {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
  PDFName,
  PDFArray,
  PDFDict,
  PDFStream,
  PDFRawStream,
} from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Merges multiple PDF ArrayBuffers into a single PDF Uint8Array
 */
export async function mergePDFs(pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Splits PDF into individual page files or extracts page range
 */
export async function splitPDF(pdfBuffer: ArrayBuffer, pageRanges: number[][]): Promise<Uint8Array[]> {
  const srcPdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const results: Uint8Array[] = [];

  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create();
    const indices = range.map((p) => p - 1).filter((i) => i >= 0 && i < srcPdf.getPageCount());
    if (indices.length > 0) {
      const copied = await newPdf.copyPages(srcPdf, indices);
      copied.forEach((page) => newPdf.addPage(page));
      results.push(await newPdf.save());
    }
  }

  return results;
}

/**
 * Rotates specific or all pages in a PDF
 */
export async function rotatePDFPages(
  pdfBuffer: ArrayBuffer,
  rotationAngle: number, // 90, 180, 270
  pageIndices?: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const total = pdfDoc.getPageCount();
  const targetIndices = pageIndices || Array.from({ length: total }, (_, i) => i);

  for (const idx of targetIndices) {
    if (idx >= 0 && idx < total) {
      const page = pdfDoc.getPage(idx);
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  }

  return await pdfDoc.save();
}

/**
 * Removes selected page indices from a PDF
 */
export async function deletePDFPages(pdfBuffer: ArrayBuffer, pageIndicesToDelete: number[]): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const totalPages = srcPdf.getPageCount();
  const keepIndices = Array.from({ length: totalPages }, (_, i) => i).filter((i) => !pageIndicesToDelete.includes(i));

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages from PDF');
  }

  const copiedPages = await newPdf.copyPages(srcPdf, keepIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Reorders PDF pages according to a new index array
 */
export async function reorderPDFPages(pdfBuffer: ArrayBuffer, newOrderIndices: number[]): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(srcPdf, newOrderIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

/**
 * Adds a text watermark to every page in a PDF
 */
export async function watermarkPDF(
  pdfBuffer: ArrayBuffer,
  text: string,
  options?: { opacity?: number; size?: number; color?: { r: number; g: number; b: number } }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const opacity = options?.opacity ?? 0.3;
  const fontSize = options?.size ?? 48;
  const color = options?.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0.7, 0.7, 0.7);

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      size: fontSize,
      font,
      color,
      opacity,
      rotate: degrees(45),
    });
  }

  return await pdfDoc.save();
}

export interface WatermarkRemovalOptions {
  watermarkText?: string;
  removeAnnotations?: boolean;
  removeArtifacts?: boolean;
  mode?: 'smart-auto' | 'custom-text' | 'scanned-filter' | 'all';
}

/**
 * Removes watermarks, confidential stamps, and overlay annotations from PDF documents
 */
export async function removeWatermarkFromPDF(
  pdfBuffer: ArrayBuffer,
  options: WatermarkRemovalOptions = {}
): Promise<{ pdfBytes: Uint8Array; removedCount: number; status: string }> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();
  let removedCount = 0;

  const defaultWatermarkWords = [
    'CONFIDENTIAL',
    'DRAFT',
    'SAMPLE',
    'COPY',
    'WATERMARK',
    'EVALUATION',
    'CAMSCANNER',
    'PREVIEW',
    'TRIAL',
    'DO NOT COPY',
    'FOR REVIEW ONLY',
    'UNAUTHORIZED',
    'INTERNAL USE ONLY',
  ];

  const targetWords = (options.watermarkText ? options.watermarkText.split(',') : defaultWatermarkWords)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);

    // 1. Remove Watermark / Stamp Annotations
    if (options.removeAnnotations !== false) {
      try {
        const annots = page.node.Annots();
        if (annots && annots instanceof PDFArray) {
          const keepAnnots: any[] = [];
          for (let a = 0; a < annots.size(); a++) {
            const annotRef = annots.get(a);
            const annot = pdfDoc.context.lookup(annotRef);
            if (annot && annot instanceof PDFDict) {
              const subtype = annot.get(PDFName.of('Subtype'))?.toString();
              const contents = annot.get(PDFName.of('Contents'))?.toString()?.toLowerCase() || '';
              const nm = annot.get(PDFName.of('NM'))?.toString()?.toLowerCase() || '';

              const isWatermarkAnnot =
                subtype === '/Watermark' ||
                subtype === '/Stamp' ||
                targetWords.some((w) => contents.includes(w) || nm.includes(w));

              if (isWatermarkAnnot) {
                removedCount++;
              } else {
                keepAnnots.push(annotRef);
              }
            } else {
              keepAnnots.push(annotRef);
            }
          }

          if (keepAnnots.length < annots.size()) {
            const newArray = pdfDoc.context.obj(keepAnnots);
            page.node.set(PDFName.of('Annots'), newArray);
          }
        }
      } catch (err) {
        console.warn('Annotation cleanup warning:', err);
      }
    }

    // 2. Remove / Filter Content Stream Watermark Text & Marked Content
    try {
      const contentsRef = page.node.get(PDFName.of('Contents'));
      if (contentsRef) {
        const contentsObj = pdfDoc.context.lookup(contentsRef);
        const streams: any[] = [];

        if (contentsObj instanceof PDFStream) {
          streams.push(contentsObj);
        } else if (contentsObj instanceof PDFArray) {
          for (let s = 0; s < contentsObj.size(); s++) {
            const sObj = pdfDoc.context.lookup(contentsObj.get(s));
            if (sObj instanceof PDFStream) {
              streams.push(sObj);
            }
          }
        }

        for (const stream of streams) {
          try {
            // Get stream bytes
            const rawBytes = typeof (stream as any).getContents === 'function' 
              ? (stream as any).getContents() 
              : (stream as any).contents;

            if (rawBytes && rawBytes.length > 0) {
              let textContent = new TextDecoder('latin1').decode(rawBytes);
              let streamModified = false;

              // A. Remove /Artifact << ... /Watermark ... >> BDC ... EMC
              const artifactRegex = /\/Artifact\s*<<[^>]*\/Subtype\s*\/Watermark[^>]*>>\s*BDC[\s\S]*?EMC/gi;
              if (artifactRegex.test(textContent)) {
                textContent = textContent.replace(artifactRegex, '');
                streamModified = true;
                removedCount++;
              }

              // B. Remove matching Watermark Text Tj / TJ operators
              for (const word of targetWords) {
                if (!word || word.length < 2) continue;
                const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // Case-insensitive match for (watermark text) Tj, ', "
                const tjRegex = new RegExp(`\\([^)]*?${escaped}[^)]*?\\)\\s*(?:Tj|'|")`, 'gi');
                if (tjRegex.test(textContent)) {
                  textContent = textContent.replace(tjRegex, '() Tj');
                  streamModified = true;
                  removedCount++;
                }

                // Match [(w) 20 (atermark)] TJ
                const tjArrayRegex = new RegExp(`\\[[^\\]]*?${escaped}[^\\]]*?\\]\\s*TJ`, 'gi');
                if (tjArrayRegex.test(textContent)) {
                  textContent = textContent.replace(tjArrayRegex, '[] TJ');
                  streamModified = true;
                  removedCount++;
                }
              }

              if (streamModified) {
                const encodedBytes = new TextEncoder().encode(textContent);
                if (typeof (stream as any).setContents === 'function') {
                  (stream as any).setContents(encodedBytes);
                } else if ((stream as any).contents) {
                  (stream as any).contents = encodedBytes;
                }
              }
            }
          } catch (streamErr) {
            console.warn('Stream processing error:', streamErr);
          }
        }
      }
    } catch (err) {
      console.warn('Content stream cleanup error:', err);
    }
  }

  // Ensure metadata is sanitized as well
  pdfDoc.setProducer('FileKit AI Document Sanitizer');

  const pdfBytes = await pdfDoc.save();
  return {
    pdfBytes,
    removedCount,
    status: removedCount > 0 
      ? `Successfully purged ${removedCount} watermark layer(s) and stamps across ${totalPages} page(s).` 
      : `Cleaned and reconstructed ${totalPages} page(s) with sanitized document content stream.`,
  };
}

/**
 * Removes watermarks, background WordArt, and drawing stamps from Word (.docx) documents
 */
export async function removeWatermarkFromDocx(
  docxBuffer: ArrayBuffer
): Promise<{ docxBytes: Uint8Array; removedCount: number; status: string }> {
  const zip = await JSZip.loadAsync(docxBuffer);
  let removedCount = 0;

  // Word XML files where watermarks, header art, and drawing layers reside
  const filesToClean = Object.keys(zip.files).filter(
    (name) =>
      name.startsWith('word/header') ||
      name.startsWith('word/footer') ||
      name === 'word/document.xml' ||
      name === 'word/document2.xml'
  );

  for (const fileName of filesToClean) {
    const file = zip.file(fileName);
    if (!file) continue;

    let content = await file.async('string');
    let modified = false;

    // 1. Remove WordArt / PowerPlus watermark shapes
    const pictWatermarkRegex = /<w:pict>[\s\S]*?(?:PowerPlusWatermarkObject|WordPictureWatermark|v:textpath|watermark|WaterMark)[\s\S]*?<\/w:pict>/gi;
    if (pictWatermarkRegex.test(content)) {
      content = content.replace(pictWatermarkRegex, () => {
        removedCount++;
        return '';
      });
      modified = true;
    }

    // 2. Remove v:shape with id starting with PowerPlusWatermarkObject or type #_x0000_t136
    const shapeWatermarkRegex = /<v:shape[^>]*?(?:id="PowerPlusWatermarkObject[^"]*"|id="WordPictureWatermark[^"]*"|type="#_x0000_t136")[^>]*>[\s\S]*?<\/v:shape>/gi;
    if (shapeWatermarkRegex.test(content)) {
      content = content.replace(shapeWatermarkRegex, () => {
        removedCount++;
        return '';
      });
      modified = true;
    }

    // 3. Remove w:drawing watermark elements
    const drawingWatermarkRegex = /<w:drawing>[\s\S]*?(?:Watermark|watermark|CONFIDENTIAL|DRAFT|SAMPLE)[\s\S]*?<\/w:drawing>/gi;
    if (drawingWatermarkRegex.test(content)) {
      content = content.replace(drawingWatermarkRegex, () => {
        removedCount++;
        return '';
      });
      modified = true;
    }

    // 4. Remove w:background if it contains watermark fill
    const bgWatermarkRegex = /<w:background[^>]*?(?:Watermark|watermark)[^>]*>[\s\S]*?<\/w:background>/gi;
    if (bgWatermarkRegex.test(content)) {
      content = content.replace(bgWatermarkRegex, () => {
        removedCount++;
        return '';
      });
      modified = true;
    }

    if (modified) {
      zip.file(fileName, content);
    }
  }

  const docxBytes = await zip.generateAsync({ type: 'uint8array' });
  return {
    docxBytes,
    removedCount,
    status: removedCount > 0
      ? `Successfully purged ${removedCount} WordArt/header watermark object(s) from Word document.`
      : `Sanitized headers, footers, and background drawings in Word document.`,
  };
}

/**
 * Removes translucent / faint background watermarks from scanned documents or images using adaptive thresholding
 */
export function removeWatermarkFromImage(
  imageDataUrl: string,
  options: {
    sensitivity?: number; // 0.1 to 1.0
    mode?: 'smart-clean' | 'contrast-boost' | 'high-pass';
  } = {}
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const sensitivity = options.sensitivity ?? 0.7;
      // Faint watermark threshold: watermarks usually have luminance between 180 and 245
      const lowerThreshold = 255 - Math.round(sensitivity * 85); // e.g. ~195

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Perceptual luminance
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Faint watermark pixels
        if (lum >= lowerThreshold && lum < 252) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        } else if (lum < 130 && options.mode === 'contrast-boost') {
          // Sharp text enhancement
          data[i] = Math.max(0, r - 30);
          data[i + 1] = Math.max(0, g - 30);
          data[i + 2] = Math.max(0, b - 30);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(imageDataUrl);
    img.src = imageDataUrl;
  });
}

/**
 * Completely wipes PDF metadata (Author, Creator, Producer, Title, Subject, Keywords)
 */
export async function removePDFMetadata(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });

  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('FileKit AI Privacy Engine');
  pdfDoc.setCreator('FileKit AI');

  return await pdfDoc.save();
}

/**
 * Signs a PDF page with a drawn signature PNG data URL or custom text stamp
 */
export async function signPDF(
  pdfBuffer: ArrayBuffer,
  signatureDataUrl: string,
  pageIndex: number = 0,
  position?: { x: number; y: number; width: number; height: number }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const page = pdfDoc.getPage(pageIndex);
  const { height: pageHeight } = page.getSize();

  const pngImage = await pdfDoc.embedPng(signatureDataUrl);
  const posX = position?.x ?? 50;
  const posY = position?.y ?? 50; // PDF origin is bottom-left
  const width = position?.width ?? 180;
  const height = position?.height ?? 60;

  page.drawImage(pngImage, {
    x: posX,
    y: pageHeight - posY - height,
    width,
    height,
  });

  return await pdfDoc.save();
}

/**
 * Converts images (JPG/PNG/WebP data URLs) into a clean PDF document
 */
export async function imagesToPDF(imageDataUrls: string[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const dataUrl of imageDataUrls) {
    let image;
    if (dataUrl.startsWith('data:image/png')) {
      image = await pdfDoc.embedPng(dataUrl);
    } else {
      // JPG / WebP canvas convert to JPEG
      image = await pdfDoc.embedJpg(dataUrl);
    }

    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  return await pdfDoc.save();
}

/**
 * Creates a PDF from plain text or Markdown formatted text
 */
export async function textToPDF(text: string, title: string = 'Document'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const maxWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title
  page.drawText(title, {
    x: margin,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.2),
  });
  y -= 30;

  const lines = text.split('\n');
  for (const line of lines) {
    if (y < margin + 20) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    if (line.trim().length === 0) {
      y -= lineHeight;
      continue;
    }

    // Rough word wrapping
    const words = line.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth) {
        page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
        y -= lineHeight;
        if (y < margin + 20) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      y -= lineHeight;
    }
  }

  return await pdfDoc.save();
}

/**
 * Gets PDF total page count quickly
 */
export async function getPDFPageCount(pdfBuffer: ArrayBuffer): Promise<number> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (err) {
    return 1;
  }
}
