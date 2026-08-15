import QRCode from 'qrcode';

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
}

/**
 * Calculates detailed statistics for text
 */
export function analyzeText(text: string): TextStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeMinutes: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const lines = text.split(/\n/).length;
  const readingTimeMinutes = Math.ceil(words / 200);

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes,
  };
}

/**
 * Converts text case based on target format
 */
export function convertTextCase(
  text: string,
  mode: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'kebab' | 'snake'
): string {
  if (!text) return '';

  switch (mode) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    case 'sentence':
      return text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
    case 'camel':
      return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, (c) => c.toLowerCase());
    case 'kebab':
      return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    case 'snake':
      return text
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    default:
      return text;
  }
}

/**
 * Removes duplicate lines from text
 */
export function removeDuplicateLines(text: string, sortAlphabetically: boolean = false): { result: string; removedCount: number } {
  const lines = text.split(/\r?\n/);
  const unique = Array.from(new Set(lines));

  if (sortAlphabetically) {
    unique.sort((a, b) => a.localeCompare(b));
  }

  const removedCount = lines.length - unique.length;
  return {
    result: unique.join('\n'),
    removedCount,
  };
}

/**
 * Cleans text by removing extra whitespaces, blank lines, or HTML tags
 */
export function cleanText(
  text: string,
  options: { removeExtraSpaces?: boolean; removeEmptyLines?: boolean; stripHtml?: boolean }
): string {
  let output = text;

  if (options.stripHtml) {
    output = output.replace(/<[^>]*>?/gm, '');
  }

  if (options.removeExtraSpaces) {
    output = output.replace(/[ \t]+/g, ' ').replace(/^ +| +$/gm, '');
  }

  if (options.removeEmptyLines) {
    output = output
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .join('\n');
  }

  return output;
}

/**
 * Generates QR Code Data URL from text or URL string
 */
export async function generateQRCode(text: string, margin: number = 2, width: number = 300): Promise<string> {
  if (!text.trim()) {
    throw new Error('Text or URL is required to generate QR code');
  }
  return await QRCode.toDataURL(text, {
    margin,
    width,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
}

/**
 * Helper to read a File object as Data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to read a File object as ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Helper to read a File object as plain text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

/**
 * Helper to download Blob or Uint8Array as file in browser
 */
export function downloadFile(data: Uint8Array | Blob | string, fileName: string, mimeType: string = 'application/octet-stream') {
  let blob: Blob;
  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = data;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    blob = new Blob([data], { type: mimeType });
  } else if (data instanceof Uint8Array) {
    blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType });
  } else {
    blob = data;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Converts a data URL to a Blob
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

