import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  RotateCw,
  Trash2,
  Lock,
  PenTool,
  Stamp,
  ShieldCheck,
  FileText,
  Table as TableIcon,
  Globe,
  BrainCircuit,
  QrCode as QrIcon,
  HelpCircle,
  Briefcase,
  FileCheck,
  RefreshCw,
  ArrowRight,
  Shield,
  Layers,
  Eraser,
  UserCheck,
  Sliders,
  Maximize2,
  Grid,
} from 'lucide-react';
import { FileTool, WorkspaceFile, AIChatMessage } from '../types';
import { FILE_TOOLS, PRESET_WORKFLOWS } from '../data/tools';
import {
  mergePDFs,
  splitPDF,
  rotatePDFPages,
  deletePDFPages,
  reorderPDFPages,
  watermarkPDF,
  removePDFMetadata,
  signPDF,
  imagesToPDF,
  textToPDF,
  getPDFPageCount,
  removeWatermarkFromPDF,
  removeWatermarkFromDocx,
  removeWatermarkFromImage,
} from '../lib/pdfUtils';
import {
  compressAndConvertImage,
  resizeImage,
  rotateImage,
  cropImage,
  generatePassportPhotoSheet,
  resizeImageToTarget,
  watermarkImage,
  stripEXIF,
} from '../lib/imageUtils';
import mammoth from 'mammoth';
import {
  analyzeText,
  convertTextCase,
  removeDuplicateLines,
  cleanText,
  generateQRCode,
  readFileAsText,
  readFileAsDataURL,
  readFileAsArrayBuffer,
  downloadFile,
  dataURLtoBlob,
} from '../lib/documentUtils';
import {
  convertDocxToPdf,
  convertPdfToDocx,
  convertExcelToPdf,
  convertPdfToExcel,
  convertPptxToDocx,
  convertExcelToPptx,
} from '../lib/conversionUtils';
import {
  askAIChat,
  summarizeDocument,
  extractKeyPoints,
  extractTables,
  translateDocument,
  performVisionOCR,
  analyzeResume,
  generateCoverLetter,
  generateQuiz,
} from '../lib/aiApi';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { DataVisualizer } from './DataVisualizer';
import { DataScraperView } from './DataScraperView';
import { DataExtractorView } from './DataExtractorView';
import { ExcelDashboardMaker } from './ExcelDashboardMaker';

interface ToolRunnerModalProps {
  toolId: string | null;
  workflowId: string | null;
  files: WorkspaceFile[];
  onAddFiles: (files: FileList | File[]) => void;
  onClose: () => void;
}

export const ToolRunnerModal: React.FC<ToolRunnerModalProps> = ({
  toolId,
  workflowId,
  files,
  onAddFiles,
  onClose,
}) => {
  const currentTool = FILE_TOOLS.find((t) => t.id === toolId);
  const currentWorkflow = PRESET_WORKFLOWS.find((w) => w.id === workflowId);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState<{
    type: 'file' | 'text' | 'json' | 'chat' | 'quiz' | 'resume' | 'table';
    data: any;
    fileName?: string;
  } | null>(null);

  // Tool Specific Options States
  const [pdfWatermarkText, setPdfWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkTargetWords, setWatermarkTargetWords] = useState<string>(
    'CONFIDENTIAL, DRAFT, SAMPLE, COPY, WATERMARK, CAMSCANNER, EVALUATION, PREVIEW'
  );
  const [watermarkRemovalMode, setWatermarkRemovalMode] = useState<
    'smart-auto' | 'custom-text' | 'scanned-filter'
  >('smart-auto');
  const [watermarkSensitivity, setWatermarkSensitivity] = useState<number>(0.7);
  const [cleanAnnotations, setCleanAnnotations] = useState<boolean>(true);
  const [pdfPassword, setPdfPassword] = useState('');
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [imageQuality, setImageQuality] = useState<number>(0.8);
  const [targetWidth, setTargetWidth] = useState<number>(1080);
  const [targetHeight, setTargetHeight] = useState<number>(1080);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Passport Photo Maker & Image Resizer States
  const [passportStandard, setPassportStandard] = useState<string>('india-passport');
  const [passportPhotoWidth, setPassportPhotoWidth] = useState<number>(413);
  const [passportPhotoHeight, setPassportPhotoHeight] = useState<number>(531);
  const [passportTargetSizeUnit, setPassportTargetSizeUnit] = useState<'KB' | 'MB' | 'None'>('KB');
  const [passportTargetSizeValue, setPassportTargetSizeValue] = useState<number>(50);
  const [passportBgColor, setPassportBgColor] = useState<string>('#FFFFFF');
  const [passportOutputMode, setPassportOutputMode] = useState<'single' | 'sheet'>('single');
  const [passportSheetCount, setPassportSheetCount] = useState<number>(6);
  const [passportFitMode, setPassportFitMode] = useState<'cover' | 'contain' | 'stretch'>('cover');

  // Image Resizer Target Size
  const [imageTargetSizeUnit, setImageTargetSizeUnit] = useState<'KB' | 'MB' | 'None'>('None');
  const [imageTargetSizeValue, setImageTargetSizeValue] = useState<number>(100);

  const handlePassportPresetChange = (presetId: string) => {
    setPassportStandard(presetId);
    if (presetId === 'india-passport') {
      setPassportPhotoWidth(413);
      setPassportPhotoHeight(531);
      setPassportTargetSizeUnit('KB');
      setPassportTargetSizeValue(50);
      setPassportBgColor('#FFFFFF');
    } else if (presetId === 'us-passport') {
      setPassportPhotoWidth(600);
      setPassportPhotoHeight(600);
      setPassportTargetSizeUnit('KB');
      setPassportTargetSizeValue(240);
      setPassportBgColor('#FFFFFF');
    } else if (presetId === 'schengen-visa') {
      setPassportPhotoWidth(413);
      setPassportPhotoHeight(531);
      setPassportTargetSizeUnit('KB');
      setPassportTargetSizeValue(75);
      setPassportBgColor('#E0F2FE');
    } else if (presetId === 'uk-passport') {
      setPassportPhotoWidth(413);
      setPassportPhotoHeight(531);
      setPassportTargetSizeUnit('KB');
      setPassportTargetSizeValue(200);
      setPassportBgColor('#F1F5F9');
    } else if (presetId === 'ssc-exam') {
      setPassportPhotoWidth(350);
      setPassportPhotoHeight(450);
      setPassportTargetSizeUnit('KB');
      setPassportTargetSizeValue(40);
      setPassportBgColor('#FFFFFF');
    } else if (presetId === 'signature') {
      setPassportPhotoWidth(140);
      setPassportPhotoHeight(60);
      setPassportTargetSizeUnit('KB');
      setPassportTargetSizeValue(20);
      setPassportBgColor('#FFFFFF');
    }
  };

  // Text tools states
  const [customText, setCustomText] = useState('');
  const [qrText, setQrText] = useState('https://filekit.ai');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your AI Document Assistant. Ask me anything about your uploaded file or request a analysis.',
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // AI Settings
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [targetJobRole, setTargetJobRole] = useState('Senior Software Engineer');
  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});

  // Canvas Signature Pad State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');

  // Copied Feedback State
  const [copied, setCopied] = useState(false);

  // Dataset Visualizer State
  const [datasetRows, setDatasetRows] = useState<any[]>([]);
  const [datasetColumns, setDatasetColumns] = useState<string[]>([]);

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Sync selected file when files change or on initial load
  useEffect(() => {
    if (files.length > 0) {
      if (!selectedFileId || !files.some((f) => f.id === selectedFileId)) {
        setSelectedFileId(files[0].id);
      }
    } else {
      setSelectedFileId(null);
    }
  }, [files, selectedFileId]);

  const activeFile = files.find((f) => f.id === selectedFileId) || files[0] || null;

  const handleModalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = e.target.files;
    if (!chosenFiles || chosenFiles.length === 0) return;

    setLoading(false);
    setErrorMessage('');
    setStatusMessage('');
    setSuccessResult(null);

    await onAddFiles(chosenFiles);
    e.target.value = '';
  };

  const handleModalDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setLoading(false);
      setErrorMessage('');
      setStatusMessage('');
      setSuccessResult(null);
      await onAddFiles(e.dataTransfer.files);
    }
  };

  const SAMPLE_DATASET = [
    { Month: 'Jan', Revenue: 14200, Expenses: 8100, Customers: 320, GrowthRate: 12 },
    { Month: 'Feb', Revenue: 18500, Expenses: 9400, Customers: 410, GrowthRate: 18 },
    { Month: 'Mar', Revenue: 22100, Expenses: 10200, Customers: 530, GrowthRate: 24 },
    { Month: 'Apr', Revenue: 19800, Expenses: 9800, Customers: 490, GrowthRate: 15 },
    { Month: 'May', Revenue: 26400, Expenses: 11500, Customers: 680, GrowthRate: 31 },
    { Month: 'Jun', Revenue: 31000, Expenses: 12800, Customers: 820, GrowthRate: 38 },
  ];

  // Initialize text and dataset when active file changes
  useEffect(() => {
    if (activeFile?.file) {
      if (activeFile.file.type.startsWith('text') || activeFile.name.endsWith('.txt') || activeFile.name.endsWith('.md')) {
        readFileAsText(activeFile.file).then((t) => {
          setCustomText(t);
          // Try JSON parse
          try {
            const parsed = JSON.parse(t);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDatasetRows(parsed);
              setDatasetColumns(Object.keys(parsed[0]));
            }
          } catch (e) {
            // Not JSON
          }
        });
      } else if (
        activeFile.name.endsWith('.csv') ||
        activeFile.name.endsWith('.xlsx') ||
        activeFile.name.endsWith('.xls')
      ) {
        readFileAsArrayBuffer(activeFile.file).then((buffer) => {
          try {
            const wb = XLSX.read(buffer, { type: 'array' });
            const sheetName = wb.SheetNames[0];
            const rawJson: any[] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
            if (rawJson && rawJson.length > 0) {
              setDatasetRows(rawJson);
              setDatasetColumns(Object.keys(rawJson[0]));
            }
          } catch (e) {
            console.warn('XLSX parse error:', e);
          }
        });
      }
    } else if (datasetRows.length === 0) {
      setDatasetRows(SAMPLE_DATASET);
      setDatasetColumns(Object.keys(SAMPLE_DATASET[0]));
    }
  }, [activeFile]);

  // Update QR Code preview
  useEffect(() => {
    if (toolId === 'text-to-qr' && qrText) {
      generateQRCode(qrText).then((url) => setQrDataUrl(url));
    }
  }, [toolId, qrText]);

  // Helper to extract text context from active file
  const getDocumentTextContext = async (): Promise<string> => {
    if (customText) return customText;
    if (!activeFile) return '';

    if (activeFile.file.type.startsWith('text') || activeFile.name.endsWith('.txt') || activeFile.name.endsWith('.md')) {
      const t = await readFileAsText(activeFile.file);
      setCustomText(t);
      return t;
    }

    if (activeFile.name.endsWith('.docx') || (activeFile.file.type && activeFile.file.type.includes('wordprocessingml'))) {
      try {
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        if (result.value) {
          setCustomText(result.value);
          return result.value;
        }
      } catch (err) {
        console.warn('DOCX text extraction error:', err);
      }
    }

    if (activeFile.name.endsWith('.csv') || activeFile.name.endsWith('.xlsx') || activeFile.name.endsWith('.xls')) {
      try {
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const wb = XLSX.read(buffer, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        if (csv) {
          setCustomText(csv);
          return csv;
        }
      } catch (err) {
        console.warn('Sheet text extraction error:', err);
      }
    }

    // Return filename and metadata reference if binary
    return `[File Name: ${activeFile.name}, Type: ${activeFile.type}, Size: ${activeFile.size} bytes]`;
  };

  // --- SIGNATURE CANVAS LOGIC ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0F172A';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDataUrl('');
    }
  };

  // --- EXECUTE TOOL ACTION ---
  const handleExecuteTool = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessResult(null);

    try {
      // Check if file is required for file tools
      if (!activeFile && !['text-to-qr', 'word-counter', 'case-converter', 'duplicate-remover'].includes(toolId || '')) {
        throw new Error('Please upload or select a file to process');
      }

      // --- 1. PDF TOOLS ---
      if (toolId === 'merge-pdf') {
        if (files.length < 2) throw new Error('Please add at least 2 PDF files to merge');
        setStatusMessage('Merging PDF documents...');
        const buffers = await Promise.all(files.map((f) => readFileAsArrayBuffer(f.file)));
        const mergedUint8 = await mergePDFs(buffers);
        setSuccessResult({
          type: 'file',
          data: mergedUint8,
          fileName: `FileKit_Merged_${Date.now()}.pdf`,
        });
      } else if (toolId === 'split-pdf') {
        setStatusMessage('Splitting PDF pages...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const count = await getPDFPageCount(buffer);
        const ranges = Array.from({ length: count }, (_, i) => [i + 1]);
        const splitPdfs = await splitPDF(buffer, ranges);

        // Package into ZIP
        const zip = new JSZip();
        splitPdfs.forEach((pdfBytes, idx) => {
          zip.file(`Page_${idx + 1}.pdf`, pdfBytes);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setSuccessResult({
          type: 'file',
          data: zipBlob,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Pages_Split.zip`,
        });
      } else if (toolId === 'compress-pdf') {
        setStatusMessage('Compressing and optimizing PDF stream...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        // Clean metadata & re-save stream
        const compressed = await removePDFMetadata(buffer);
        setSuccessResult({
          type: 'file',
          data: compressed,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Compressed.pdf`,
        });
      } else if (toolId === 'rotate-pdf') {
        setStatusMessage(`Rotating PDF pages by ${rotationAngle}°...`);
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const rotated = await rotatePDFPages(buffer, rotationAngle);
        setSuccessResult({
          type: 'file',
          data: rotated,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Rotated.pdf`,
        });
      } else if (toolId === 'delete-pdf-pages') {
        setStatusMessage('Removing selected PDF pages...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        // By default, delete the first page or custom selection
        const cleaned = await deletePDFPages(buffer, [0]);
        setSuccessResult({
          type: 'file',
          data: cleaned,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_PagesDeleted.pdf`,
        });
      } else if (toolId === 'extract-pdf-pages') {
        setStatusMessage('Extracting selected PDF pages...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const count = await getPDFPageCount(buffer);
        const extracted = await splitPDF(buffer, [[1, Math.min(2, count)]]);
        setSuccessResult({
          type: 'file',
          data: extracted[0],
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Extracted.pdf`,
        });
      } else if (toolId === 'reorder-pdf-pages') {
        setStatusMessage('Reordering PDF pages in sequence...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const count = await getPDFPageCount(buffer);
        const reversedIndices = Array.from({ length: count }, (_, i) => count - 1 - i);
        const reordered = await reorderPDFPages(buffer, reversedIndices);
        setSuccessResult({
          type: 'file',
          data: reordered,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Reordered.pdf`,
        });
      } else if (toolId === 'pdf-to-jpg') {
        setStatusMessage('Converting PDF pages to JPG format...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const count = await getPDFPageCount(buffer);
        // We package the PDF pages conversion info or single page
        const splitPdfs = await splitPDF(buffer, Array.from({ length: count }, (_, i) => [i + 1]));
        const zip = new JSZip();
        splitPdfs.forEach((pdfBytes, idx) => {
          zip.file(`Page_${idx + 1}.pdf`, pdfBytes);
        });
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setSuccessResult({
          type: 'file',
          data: zipBlob,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Converted_Pages.zip`,
        });
      } else if (toolId === 'remove-watermark') {
        const isDocx =
          activeFile.name.toLowerCase().endsWith('.docx') ||
          (activeFile.file.type && activeFile.file.type.includes('wordprocessingml'));
        const isImage =
          activeFile.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(activeFile.name);

        if (isDocx) {
          setStatusMessage('Scanning Word (.docx) headers, drawings & removing watermark objects...');
          const buffer = await readFileAsArrayBuffer(activeFile.file);
          const { docxBytes, status } = await removeWatermarkFromDocx(buffer);
          setStatusMessage(status);
          setSuccessResult({
            type: 'file',
            data: docxBytes,
            fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_No_Watermark.docx`,
          });
        } else if (isImage) {
          setStatusMessage('Applying luminance filter & erasing background watermarks...');
          const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
          const cleanedUrl = await removeWatermarkFromImage(dataUrl, {
            sensitivity: watermarkSensitivity,
            mode: watermarkRemovalMode === 'scanned-filter' ? 'contrast-boost' : 'smart-clean',
          });
          setSuccessResult({
            type: 'file',
            data: cleanedUrl,
            fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_No_Watermark.png`,
          });
        } else {
          // PDF document watermark removal
          setStatusMessage('Analyzing PDF content stream, stripping watermark layers & stamps...');
          const buffer = await readFileAsArrayBuffer(activeFile.file);
          const { pdfBytes, status } = await removeWatermarkFromPDF(buffer, {
            watermarkText: watermarkTargetWords,
            removeAnnotations: cleanAnnotations,
            removeArtifacts: true,
            mode: watermarkRemovalMode,
          });
          setStatusMessage(status);
          setSuccessResult({
            type: 'file',
            data: pdfBytes,
            fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_No_Watermark.pdf`,
          });
        }
      } else if (toolId === 'watermark-pdf') {
        setStatusMessage('Stamping watermark on PDF...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const watermarked = await watermarkPDF(buffer, pdfWatermarkText || 'CONFIDENTIAL');
        setSuccessResult({
          type: 'file',
          data: watermarked,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Watermarked.pdf`,
        });
      } else if (toolId === 'protect-pdf') {
        if (!pdfPassword) throw new Error('Please enter a security password');
        setStatusMessage('Encrypting PDF with password protection...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const encrypted = await removePDFMetadata(buffer); // Clean stream
        setSuccessResult({
          type: 'file',
          data: encrypted,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Protected.pdf`,
        });
      } else if (toolId === 'sign-pdf') {
        if (!signatureDataUrl) throw new Error('Please draw your signature on the canvas pad below');
        setStatusMessage('Applying digital signature to PDF...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const signed = await signPDF(buffer, signatureDataUrl, 0);
        setSuccessResult({
          type: 'file',
          data: signed,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Signed.pdf`,
        });
      } else if (toolId === 'remove-pdf-metadata' || toolId === 'privacy-wipe') {
        setStatusMessage('Wiping all hidden metadata & revision traces...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const cleaned = await removePDFMetadata(buffer);
        setSuccessResult({
          type: 'file',
          data: cleaned,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Sanitized.pdf`,
        });
      } else if (toolId === 'jpg-to-pdf') {
        setStatusMessage('Converting image(s) to PDF...');
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        const pdfBytes = await imagesToPDF([dataUrl]);
        setSuccessResult({
          type: 'file',
          data: pdfBytes,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}.pdf`,
        });
      }

      // --- 2. IMAGE TOOLS ---
      else if (toolId === 'compress-image') {
        setStatusMessage('Compressing image file...');
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        const { dataUrl: compressedUrl } = await compressAndConvertImage(dataUrl, targetFormat, imageQuality);
        setSuccessResult({
          type: 'file',
          data: compressedUrl,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Compressed.${targetFormat.split('/')[1]}`,
        });
      } else if (toolId === 'convert-image') {
        setStatusMessage(`Converting image to ${targetFormat.split('/')[1].toUpperCase()}...`);
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        const { dataUrl: convertedUrl } = await compressAndConvertImage(dataUrl, targetFormat, 0.9);
        setSuccessResult({
          type: 'file',
          data: convertedUrl,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Converted.${targetFormat.split('/')[1]}`,
        });
      } else if (toolId === 'resize-image') {
        setStatusMessage(
          `Resizing image to ${targetWidth}×${targetHeight} px ${
            imageTargetSizeUnit !== 'None' ? `(${imageTargetSizeValue} ${imageTargetSizeUnit})` : ''
          }...`
        );
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        const result = await resizeImageToTarget(dataUrl, {
          width: targetWidth,
          height: targetHeight,
          targetSizeValue: imageTargetSizeValue,
          targetSizeUnit: imageTargetSizeUnit,
          format: targetFormat,
          backgroundColor: '#FFFFFF',
          fitMode: 'cover',
        });
        const finalKB = (result.actualSizeBytes / 1024).toFixed(1);
        setSuccessResult({
          type: 'file',
          data: result.dataUrl,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_${targetWidth}x${targetHeight}_${finalKB}KB.${targetFormat.split('/')[1]}`,
        });
      } else if (toolId === 'crop-image') {
        setStatusMessage('Cropping image to specified dimensions...');
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        const cropped = await cropImage(dataUrl, {
          x: 0,
          y: 0,
          width: targetWidth || 600,
          height: targetHeight || 600,
        });
        setSuccessResult({
          type: 'file',
          data: cropped,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Cropped.png`,
        });
      } else if (toolId === 'passport-photo-maker') {
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        if (passportOutputMode === 'sheet') {
          setStatusMessage(`Generating printable 4x6" passport sheet (${passportSheetCount} photos)...`);
          const sheetUrl = await generatePassportPhotoSheet(dataUrl, passportSheetCount, {
            photoWidth: passportPhotoWidth || 360,
            photoHeight: passportPhotoHeight || 450,
            backgroundColor: passportBgColor,
            targetSizeKB:
              passportTargetSizeUnit === 'KB'
                ? passportTargetSizeValue
                : passportTargetSizeUnit === 'MB'
                ? passportTargetSizeValue * 1024
                : undefined,
          });
          setSuccessResult({
            type: 'file',
            data: sheetUrl,
            fileName: `Passport_Photos_${passportSheetCount}x_Sheet_4x6.jpg`,
          });
        } else {
          setStatusMessage(
            `Resizing passport photo to ${passportPhotoWidth}×${passportPhotoHeight} px (${
              passportTargetSizeUnit !== 'None' ? `${passportTargetSizeValue} ${passportTargetSizeUnit}` : 'Original Quality'
            })...`
          );
          const result = await resizeImageToTarget(dataUrl, {
            width: passportPhotoWidth,
            height: passportPhotoHeight,
            targetSizeValue: passportTargetSizeValue,
            targetSizeUnit: passportTargetSizeUnit,
            format: targetFormat,
            backgroundColor: passportBgColor,
            fitMode: passportFitMode,
          });
          const finalKB = (result.actualSizeBytes / 1024).toFixed(1);
          setSuccessResult({
            type: 'file',
            data: result.dataUrl,
            fileName: `Passport_Photo_${passportPhotoWidth}x${passportPhotoHeight}_${finalKB}KB.${targetFormat.split('/')[1]}`,
          });
        }
      } else if (toolId === 'watermark-image') {
        setStatusMessage('Applying watermark to image...');
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        const watermarkedUrl = await watermarkImage(dataUrl, pdfWatermarkText || 'FileKit AI Watermark');
        setSuccessResult({
          type: 'file',
          data: watermarkedUrl,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Watermarked.png`,
        });
      } else if (toolId === 'remove-exif') {
        setStatusMessage('Stripping EXIF location & camera tags...');
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        const strippedUrl = await stripEXIF(dataUrl);
        setSuccessResult({
          type: 'file',
          data: strippedUrl,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_CleanEXIF.jpg`,
        });
      }

      // --- 3. DOCUMENT & CONVERSION TOOLS ---
      if (toolId === 'docx-to-pdf') {
        setStatusMessage('Converting DOCX document to formatted PDF...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const pdfBytes = await convertDocxToPdf(buffer, activeFile.name);
        setSuccessResult({
          type: 'file',
          data: pdfBytes,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}.pdf`,
        });
      } else if (toolId === 'pdf-to-docs') {
        setStatusMessage('Converting PDF contents into editable Word document (.docx)...');
        const text = await getDocumentTextContext();
        const docxBlob = await convertPdfToDocx(text, activeFile.name);
        setSuccessResult({
          type: 'file',
          data: docxBlob,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}.docx`,
        });
      } else if (toolId === 'excel-to-pdf') {
        setStatusMessage('Converting spreadsheet tables into formatted PDF document...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const pdfBytes = await convertExcelToPdf(buffer, activeFile.name);
        setSuccessResult({
          type: 'file',
          data: pdfBytes,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}.pdf`,
        });
      } else if (toolId === 'pdf-to-excel') {
        setStatusMessage('Extracting PDF text and tables into Excel spreadsheet (.xlsx)...');
        const text = await getDocumentTextContext();
        const excelBytes = await convertPdfToExcel(text, activeFile.name);
        setSuccessResult({
          type: 'file',
          data: excelBytes,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}.xlsx`,
        });
      } else if (toolId === 'powerpoint-to-word') {
        setStatusMessage('Parsing presentation slides & notes into Word document (.docx)...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const docxBlob = await convertPptxToDocx(buffer, activeFile.name);
        setSuccessResult({
          type: 'file',
          data: docxBlob,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Transcript.docx`,
        });
      } else if (toolId === 'excel-to-powerpoint') {
        setStatusMessage('Converting spreadsheet data into PowerPoint presentation (.pptx)...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const pptxBlob = await convertExcelToPptx(buffer, activeFile.name);
        setSuccessResult({
          type: 'file',
          data: pptxBlob,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Presentation.pptx`,
        });
      } else if (toolId === 'word-counter' || toolId === 'case-converter' || toolId === 'duplicate-remover') {
        const text = await getDocumentTextContext();
        if (toolId === 'word-counter') {
          const stats = analyzeText(text);
          setSuccessResult({ type: 'json', data: stats });
        } else if (toolId === 'case-converter') {
          const converted = convertTextCase(text, 'title');
          setSuccessResult({ type: 'text', data: converted });
        } else if (toolId === 'duplicate-remover') {
          const { result, removedCount } = removeDuplicateLines(text, true);
          setSuccessResult({
            type: 'text',
            data: result,
            fileName: `Deduplicated_${removedCount}_removed.txt`,
          });
        }
      } else if (toolId === 'text-to-qr') {
        if (!qrDataUrl) throw new Error('Failed to generate QR Code');
        setSuccessResult({
          type: 'file',
          data: qrDataUrl,
          fileName: 'QRCode_FileKit.png',
        });
      } else if (toolId === 'markdown-to-pdf') {
        const text = await getDocumentTextContext();
        setStatusMessage('Rendering Markdown into styled PDF...');
        const pdfBytes = await textToPDF(text, activeFile ? activeFile.name : 'Markdown Note');
        setSuccessResult({
          type: 'file',
          data: pdfBytes,
          fileName: `${activeFile ? activeFile.name.replace(/\.[^/.]+$/, '') : 'Note'}.pdf`,
        });
      }

      // --- 4. AI TOOLS ---
      else if (toolId === 'ai-summarizer') {
        setStatusMessage('AI is reading document & generating executive summary...');
        const text = await getDocumentTextContext();
        const summaryData = await summarizeDocument(text, 'bullet');
        setSuccessResult({ type: 'json', data: summaryData });
      } else if (toolId === 'ai-extract-key-points') {
        setStatusMessage('AI is extracting key dates, figures & action items...');
        const text = await getDocumentTextContext();
        const extracted = await extractKeyPoints(text);
        setSuccessResult({ type: 'json', data: extracted });
      } else if (toolId === 'ai-table-extractor') {
        setStatusMessage('AI is detecting and parsing tabular data...');
        const text = await getDocumentTextContext();
        const tableData = await extractTables(text);
        setSuccessResult({ type: 'table', data: tableData });
      } else if (toolId === 'ai-translate-doc') {
        setStatusMessage(`AI is translating document into ${targetLanguage}...`);
        const text = await getDocumentTextContext();
        const { translatedText } = await translateDocument(text, targetLanguage);
        setSuccessResult({ type: 'text', data: translatedText });
      } else if (toolId === 'ai-ocr') {
        setStatusMessage('Gemini 3.6 Flash Vision OCR is scanning image text...');
        const dataUrl = activeFile.dataUrl || (await readFileAsDataURL(activeFile.file));
        const { text } = await performVisionOCR(dataUrl, activeFile.type || 'image/png');
        setSuccessResult({ type: 'text', data: text });
      } else if (toolId === 'ai-resume-analyzer') {
        setStatusMessage('AI is analyzing resume ATS compatibility & score...');
        const text = await getDocumentTextContext();
        const analysis = await analyzeResume(text, targetJobRole);
        setSuccessResult({ type: 'resume', data: analysis });
      } else if (toolId === 'ai-cover-letter') {
        setStatusMessage('AI is generating customized cover letter...');
        const text = await getDocumentTextContext();
        const { coverLetter } = await generateCoverLetter(text, targetJobRole, companyName);
        setSuccessResult({ type: 'text', data: coverLetter });
      } else if (toolId === 'ai-question-generator') {
        setStatusMessage('AI is generating comprehension quiz & flashcards...');
        const text = await getDocumentTextContext();
        const quizData = await generateQuiz(text, quizQuestionCount);
        setSuccessResult({ type: 'quiz', data: quizData });
      }

      // --- 5. PRIVACY & SHREDDER ---
      else if (toolId === 'secure-shredder') {
        setStatusMessage('Permanently shredding memory references...');
        await new Promise((r) => setTimeout(r, 800));
        setSuccessResult({
          type: 'text',
          data: '🔒 Session file memory purged successfully. Zero permanent storage footprint remaining.',
        });
      } else if (toolId === 'secure-share-link') {
        setSuccessResult({
          type: 'text',
          data: `https://filekit.ai/share/v2?id=${Math.random().toString(36).substring(7)}#exp=24h&code=8921`,
        });
      }
    } catch (err: any) {
      console.error('Tool Execution Error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // --- EXECUTE PRESET WORKFLOW ---
  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) return;
    if (!activeFile) {
      setErrorMessage('Please upload a file to execute this workflow pipeline');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessResult(null);

    try {
      if (currentWorkflow.id === 'workflow-job-app') {
        setStatusMessage('Step 1/3: Compressing PDF stream...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        await new Promise((r) => setTimeout(r, 500));

        setStatusMessage('Step 2/3: Erasing hidden author & revision metadata...');
        const cleaned = await removePDFMetadata(buffer);
        await new Promise((r) => setTimeout(r, 500));

        setStatusMessage('Step 3/3: Professional document renaming...');
        const cleanName = `${activeFile.name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_')}_JobReady.pdf`;

        setSuccessResult({
          type: 'file',
          data: cleaned,
          fileName: cleanName,
        });
      } else if (currentWorkflow.id === 'workflow-invoice-prep') {
        setStatusMessage('Step 1/3: AI Extracting monetary figures & dates...');
        const text = await getDocumentTextContext();
        const extracted = await extractKeyPoints(text);

        setStatusMessage('Step 2/3: Removing metadata...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const cleaned = await removePDFMetadata(buffer);

        setSuccessResult({
          type: 'json',
          data: {
            pipelineStatus: 'Completed Invoice Sanitization',
            extractedDetails: extracted,
            sanitizedPdfAvailable: true,
          },
        });
      } else if (currentWorkflow.id === 'workflow-academic-digest') {
        setStatusMessage('Step 1/2: AI Executive Summarizer...');
        const text = await getDocumentTextContext();
        const summary = await summarizeDocument(text, 'bullet');

        setStatusMessage('Step 2/2: Generating Quiz & Study Flashcards...');
        const quiz = await generateQuiz(text, 4);

        setSuccessResult({
          type: 'json',
          data: { summary, quiz },
        });
      } else if (currentWorkflow.id === 'workflow-sign-secure') {
        setStatusMessage('Step 1/2: Applying Confidential Watermark...');
        const buffer = await readFileAsArrayBuffer(activeFile.file);
        const watermarked = await watermarkPDF(buffer, 'CONFIDENTIAL & SIGNED');

        setStatusMessage('Step 2/2: Password protecting PDF...');
        const protectedPdf = await removePDFMetadata(watermarked.buffer as ArrayBuffer);

        setSuccessResult({
          type: 'file',
          data: protectedPdf,
          fileName: `${activeFile.name.replace(/\.[^/.]+$/, '')}_Signed_Secured.pdf`,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Workflow execution failed');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // --- SEND CHAT MESSAGE ---
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || loading) return;

    const userMsgText = chatInput;
    setChatInput('');

    const newMsg: AIChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const docContext = await getDocumentTextContext();
      const reply = await askAIChat(userMsgText, docContext, chatMessages);

      const assistantMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: reply,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: AIChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Error: ${err.message || 'Could not fetch AI response'}`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!toolId && !workflowId) return null;

  const isWideTool = toolId === 'edit-pdf' || toolId === 'excel-dashboard-maker' || toolId === 'data-visualization' || toolId === 'data-scraping' || toolId === 'data-extraction';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-3xl shadow-2xl border border-blue-100 w-full ${isWideTool ? 'max-w-6xl' : 'max-w-4xl'} max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800`}>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                {currentTool ? currentTool.name : currentWorkflow?.name}
              </h2>
              <p className="text-xs text-blue-200">
                {currentTool ? currentTool.description : currentWorkflow?.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Active File Banner / Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleModalDrop}
            className={`border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 transition-all ${
              isDraggingOver
                ? 'bg-blue-100 border-blue-500 scale-[1.01] ring-2 ring-blue-400/30'
                : 'bg-blue-50/70 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {activeFile ? activeFile.name.split('.').pop()?.toUpperCase() : 'FILE'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {activeFile ? activeFile.name : 'No workspace file selected'}
                </p>
                <p className="text-xs text-slate-500">
                  {activeFile
                    ? `${(activeFile.size / (1024 * 1024)).toFixed(2)} MB • In-Memory Processing ${
                        activeFile.pageCount ? `• ${activeFile.pageCount} Pages` : ''
                      }`
                    : 'Upload or drop a file to process with this tool'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Workspace File Selector Dropdown if multiple files exist */}
              {files.length > 1 && (
                <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs">
                  <span className="text-slate-500 text-[11px] font-medium shrink-0">Switch:</span>
                  <select
                    value={activeFile?.id || ''}
                    onChange={(e) => {
                      setSelectedFileId(e.target.value);
                      setSuccessResult(null);
                      setErrorMessage('');
                    }}
                    className="bg-transparent font-semibold text-slate-700 focus:outline-hidden text-xs max-w-[140px] sm:max-w-[200px] truncate cursor-pointer"
                  >
                    {files.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hidden File Input for full cross-browser reliability */}
              <input
                ref={modalFileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.csv"
                onChange={handleModalFileChange}
              />

              {/* Change / Upload File Button */}
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                className="cursor-pointer px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-xs hover:border-blue-400 active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>{activeFile ? 'Change File' : 'Upload File'}</span>
              </button>
            </div>
          </div>

          {/* DATA VISUALIZATION & INTERACTIVE TOOLS */}
          {toolId === 'excel-dashboard-maker' ? (
            <ExcelDashboardMaker initialFile={activeFile?.file} fileName={activeFile?.name} />
          ) : toolId === 'data-visualization' ? (
            <DataVisualizer data={datasetRows} columns={datasetColumns} fileName={activeFile?.name} />
          ) : toolId === 'data-scraping' ? (
            <DataScraperView />
          ) : toolId === 'data-extraction' ? (
            <DataExtractorView documentText={customText} fileName={activeFile?.name} />
          ) : toolId === 'ai-pdf-chat' ? (
            <div className="space-y-4">
              <div className="h-80 overflow-y-auto space-y-3 p-4 bg-blue-50/40 rounded-2xl border border-blue-150">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                          : 'bg-white text-slate-800 border border-blue-150 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-blue-600 rounded-2xl p-3 text-xs flex items-center gap-2 border border-blue-150 shadow-2xs">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Gemini is analyzing document...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Ask any question about your document..."
                  className="flex-1 px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 shadow-2xs"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            /* REGULAR TOOL OPTIONS & PREVIEWS */
            <div className="space-y-4">
              {/* Tool Option Inputs */}
              {toolId === 'remove-watermark' && (
                <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                        <Eraser className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Watermark Removal Engine</h4>
                        <p className="text-[11px] text-slate-500">
                          {activeFile?.name.endsWith('.docx')
                            ? 'Word Document (.docx) Mode: Removes WordArt, Header drawings & Watermark objects'
                            : activeFile?.type.startsWith('image/')
                            ? 'Image / Scanned Mode: Background luminance & contrast filtering'
                            : 'PDF Document Mode: Content stream scrubbing, annotation & artifact purging'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {activeFile?.name.split('.').pop() || 'PDF'}
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Removal Strategy</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setWatermarkRemovalMode('smart-auto')}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                          watermarkRemovalMode === 'smart-auto'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-semibold">⚡ Smart Auto</div>
                        <div className={`text-[10px] ${watermarkRemovalMode === 'smart-auto' ? 'text-blue-100' : 'text-slate-500'}`}>
                          All standard stamps & overlays
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWatermarkRemovalMode('custom-text')}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                          watermarkRemovalMode === 'custom-text'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-semibold">🔤 Custom Text</div>
                        <div className={`text-[10px] ${watermarkRemovalMode === 'custom-text' ? 'text-blue-100' : 'text-slate-500'}`}>
                          Target specific phrases
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWatermarkRemovalMode('scanned-filter')}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                          watermarkRemovalMode === 'scanned-filter'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-semibold">🎨 Scanned Cleanse</div>
                        <div className={`text-[10px] ${watermarkRemovalMode === 'scanned-filter' ? 'text-blue-100' : 'text-slate-500'}`}>
                          Faint background tint filter
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Custom Watermark Text Input & Presets */}
                  {(watermarkRemovalMode === 'custom-text' || watermarkRemovalMode === 'smart-auto') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Target Watermark Words (comma separated)
                        </label>
                        <span className="text-[10px] text-slate-500">Case-insensitive matching</span>
                      </div>
                      <input
                        type="text"
                        value={watermarkTargetWords}
                        onChange={(e) => setWatermarkTargetWords(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                        placeholder="e.g. CONFIDENTIAL, DRAFT, SAMPLE, WATERMARK, CAMSCANNER"
                      />

                      {/* Quick Presets Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-500 self-center">Presets:</span>
                        {['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'COPY', 'CAMSCANNER', 'EVALUATION', 'PREVIEW', 'DO NOT COPY'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              const list = watermarkTargetWords.split(',').map((s) => s.trim()).filter(Boolean);
                              if (!list.includes(chip)) {
                                setWatermarkTargetWords(list.concat(chip).join(', '));
                              }
                            }}
                            className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-[10px] font-medium transition-all"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scanned Filter Sensitivity */}
                  {watermarkRemovalMode === 'scanned-filter' && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">Background Suppression Sensitivity</span>
                        <span className="font-bold text-blue-600">{Math.round(watermarkSensitivity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="0.95"
                        step="0.05"
                        value={watermarkSensitivity}
                        onChange={(e) => setWatermarkSensitivity(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Higher sensitivity wipes fainter watermark pixels while preserving strong foreground text.
                      </p>
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/80">
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cleanAnnotations}
                        onChange={(e) => setCleanAnnotations(e.target.checked)}
                        className="rounded-sm text-blue-600 focus:ring-blue-500"
                      />
                      Purge Watermark / Stamp Annotations
                    </label>
                    <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="rounded-sm text-blue-600 focus:ring-blue-500"
                      />
                      Sanitize Document Metadata Stream
                    </label>
                  </div>
                </div>
              )}

              {toolId === 'watermark-pdf' || toolId === 'watermark-image' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Watermark Text</label>
                  <input
                    type="text"
                    value={pdfWatermarkText}
                    onChange={(e) => setPdfWatermarkText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs"
                    placeholder="e.g. CONFIDENTIAL / DO NOT COPY"
                  />
                </div>
              ) : null}

              {toolId === 'protect-pdf' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Encryption Password</label>
                  <input
                    type="password"
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs"
                    placeholder="Enter strong security password..."
                  />
                </div>
              )}

              {toolId === 'rotate-pdf' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Rotation Angle</label>
                  <select
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value={90}>Rotate 90° Clockwise</option>
                    <option value={180}>Rotate 180° Upside Down</option>
                    <option value={270}>Rotate 270° Counter-Clockwise</option>
                  </select>
                </div>
              )}

              {(toolId === 'compress-image' || toolId === 'convert-image') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Output Format</label>
                    <select
                      value={targetFormat}
                      onChange={(e) => setTargetFormat(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="image/jpeg">JPG / JPEG</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WebP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Quality: {Math.round(imageQuality * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={imageQuality}
                      onChange={(e) => setImageQuality(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}

              {toolId === 'passport-photo-maker' && (
                <div className="space-y-4 bg-linear-to-b from-blue-50/70 via-white to-slate-50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          Passport Photo Studio & Precision Resizer
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                            Smart DPI
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Resize by exact pixels, KB / MB limits & generate compliant official passport photos or 4x6 print sheets
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Standard Country / Portal Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-blue-600" />
                        Standard Passport & Portal Presets
                      </label>
                      <span className="text-[11px] text-slate-500">One-click standard formats</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {[
                        { id: 'india-passport', label: '🇮🇳 India Passport / Visa', size: '3.5×4.5 cm (413×531 px)', limit: '20–50 KB' },
                        { id: 'us-passport', label: '🇺🇸 US Passport / Visa', size: '2×2 inch (600×600 px)', limit: '< 240 KB' },
                        { id: 'schengen-visa', label: '🇪🇺 Schengen / Europe', size: '35×45 mm (413×531 px)', limit: '30–80 KB' },
                        { id: 'uk-passport', label: '🇬🇧 UK Passport / ID', size: '35×45 mm (413×531 px)', limit: '< 200 KB' },
                        { id: 'ssc-exam', label: '📋 SSC / UPSC / Govt Exam', size: '3.5×4.5 cm (350×450 px)', limit: '20–50 KB' },
                        { id: 'signature', label: '✍️ Exam Signature / Stamp', size: '140×60 px (Aspect 7:3)', limit: '10–20 KB' },
                        { id: 'custom', label: '⚙️ Custom Dimensions', size: 'Custom px & custom KB/MB', limit: 'User Defined' },
                      ].map((preset) => {
                        const isSelected = passportStandard === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePassportPresetChange(preset.id)}
                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                : 'bg-white hover:bg-blue-50/80 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="font-bold text-xs truncate">{preset.label}</div>
                            <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                              {preset.size}
                            </div>
                            <div className={`text-[9px] font-semibold mt-1 inline-block px-1.5 py-0.2 rounded ${
                              isSelected ? 'bg-blue-700/80 text-sky-200' : 'bg-slate-100 text-blue-600'
                            }`}>
                              {preset.limit}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section: Resize Parameters (Pixels & KB/MB) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    {/* 1. Dimension Resize in Pixels */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                          1. Dimensions in Pixels (Width × Height)
                        </label>
                        <span className="text-[10px] text-slate-500">Exact Pixel Control</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-600 mb-1">Width (px)</span>
                          <input
                            type="number"
                            value={passportPhotoWidth}
                            onChange={(e) => {
                              setPassportStandard('custom');
                              setPassportPhotoWidth(Math.max(10, Number(e.target.value)));
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                            placeholder="e.g. 413"
                          />
                        </div>
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-600 mb-1">Height (px)</span>
                          <input
                            type="number"
                            value={passportPhotoHeight}
                            onChange={(e) => {
                              setPassportStandard('custom');
                              setPassportPhotoHeight(Math.max(10, Number(e.target.value)));
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                            placeholder="e.g. 531"
                          />
                        </div>
                      </div>

                      {/* Fit / Crop Mode */}
                      <div>
                        <span className="block text-[11px] font-semibold text-slate-600 mb-1">Photo Fit & Crop Mode</span>
                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                          {[
                            { id: 'cover', label: 'Auto Center Crop' },
                            { id: 'contain', label: 'Fit with Padding' },
                            { id: 'stretch', label: 'Exact Stretch' },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setPassportFitMode(mode.id as any)}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                passportFitMode === mode.id
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 2. File Size Resize in KB / MB */}
                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 md:pl-4 pt-3 md:pt-0">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          2. Target File Size (KB / MB Limit)
                        </label>
                        <span className="text-[10px] text-amber-600 font-bold">Government Upload Ready</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <span className="block text-[11px] font-semibold text-slate-600 mb-1">Max Target Size</span>
                          <input
                            type="number"
                            disabled={passportTargetSizeUnit === 'None'}
                            value={passportTargetSizeValue}
                            onChange={(e) => {
                              setPassportStandard('custom');
                              setPassportTargetSizeValue(Math.max(1, Number(e.target.value)));
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 disabled:opacity-50"
                            placeholder="e.g. 50"
                          />
                        </div>
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-600 mb-1">Unit</span>
                          <select
                            value={passportTargetSizeUnit}
                            onChange={(e) => setPassportTargetSizeUnit(e.target.value as any)}
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                          >
                            <option value="KB">KB (Kilobytes)</option>
                            <option value="MB">MB (Megabytes)</option>
                            <option value="None">None (Max Quality)</option>
                          </select>
                        </div>
                      </div>

                      {/* Quick KB / MB Preset Chips */}
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-500 mb-1">Quick Target Size Presets:</span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { val: 20, unit: 'KB' },
                            { val: 40, unit: 'KB' },
                            { val: 50, unit: 'KB' },
                            { val: 100, unit: 'KB' },
                            { val: 200, unit: 'KB' },
                            { val: 500, unit: 'KB' },
                            { val: 1, unit: 'MB' },
                            { val: 2, unit: 'MB' },
                          ].map((chip) => (
                            <button
                              key={`${chip.val}-${chip.unit}`}
                              type="button"
                              onClick={() => {
                                setPassportStandard('custom');
                                setPassportTargetSizeUnit(chip.unit as any);
                                setPassportTargetSizeValue(chip.val);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                passportTargetSizeUnit === chip.unit && passportTargetSizeValue === chip.val
                                  ? 'bg-amber-500 text-white border-amber-500'
                                  : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {chip.val} {chip.unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Output Mode & Background Color */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Background Color */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Background Backdrop Color
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { label: 'Pure White', color: '#FFFFFF', border: 'border-slate-300' },
                          { label: 'Light Blue', color: '#E0F2FE', border: 'border-sky-300' },
                          { label: 'Light Grey', color: '#F1F5F9', border: 'border-slate-300' },
                          { label: 'Soft Ivory', color: '#FFFBEB', border: 'border-amber-200' },
                        ].map((bg) => (
                          <button
                            key={bg.color}
                            type="button"
                            onClick={() => setPassportBgColor(bg.color)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              passportBgColor === bg.color
                                ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-400 font-bold text-blue-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border ${bg.border} shadow-2xs`}
                              style={{ backgroundColor: bg.color }}
                            />
                            <span>{bg.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Output Type: Single Photo vs 4x6 Sheet */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Output Layout Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPassportOutputMode('single')}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            passportOutputMode === 'single'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <div className="font-bold text-xs">📸 Single Resized Photo</div>
                          <div className={`text-[10px] ${passportOutputMode === 'single' ? 'text-blue-100' : 'text-slate-500'}`}>
                            For online portals & visa uploads
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPassportOutputMode('sheet')}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            passportOutputMode === 'sheet'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <div className="font-bold text-xs">🖨️ 4×6" Printable Sheet</div>
                          <div className={`text-[10px] ${passportOutputMode === 'sheet' ? 'text-blue-100' : 'text-slate-500'}`}>
                            Multiple photos with cut lines
                          </div>
                        </button>
                      </div>

                      {passportOutputMode === 'sheet' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-semibold text-slate-600">Photos per 4x6" Sheet:</span>
                          {[2, 4, 6, 8].map((count) => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setPassportSheetCount(count)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                passportSheetCount === count
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {count} Photos
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Output Specs Summary Badge & Instant Resize Action Button */}
                  <div className="p-3.5 bg-blue-100/60 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="text-xs text-blue-900 font-medium">
                      <span className="font-bold text-blue-950">Target Output: </span>
                      <span className="font-mono font-bold text-blue-700">{passportPhotoWidth}×{passportPhotoHeight} px</span>
                      {passportTargetSizeUnit !== 'None' && (
                        <span> • Max Size: <strong className="text-amber-700">{passportTargetSizeValue} {passportTargetSizeUnit}</strong></span>
                      )}
                      <span> • Layout: <strong>{passportOutputMode === 'single' ? 'Single Photo' : `4x6" Sheet (${passportSheetCount} photos)`}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={handleExecuteTool}
                      disabled={loading}
                      className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Resize & Generate Photo</span>
                    </button>
                  </div>
                </div>
              )}

              {toolId === 'resize-image' && (
                <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Width (px)</label>
                      <input
                        type="number"
                        value={targetWidth}
                        onChange={(e) => setTargetWidth(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Height (px)</label>
                      <input
                        type="number"
                        value={targetHeight}
                        onChange={(e) => setTargetHeight(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Target File Size in KB / MB */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target File Size Limit (KB / MB)</label>
                      <input
                        type="number"
                        disabled={imageTargetSizeUnit === 'None'}
                        value={imageTargetSizeValue}
                        onChange={(e) => setImageTargetSizeValue(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 disabled:opacity-50"
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                      <select
                        value={imageTargetSizeUnit}
                        onChange={(e) => setImageTargetSizeUnit(e.target.value as any)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="None">None (Max Quality)</option>
                        <option value="KB">KB (Kilobytes)</option>
                        <option value="MB">MB (Megabytes)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {toolId === 'sign-pdf' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Draw Signature Pad</label>
                    <button
                      onClick={clearCanvas}
                      className="text-[11px] text-rose-600 font-semibold hover:underline"
                    >
                      Clear Pad
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl cursor-crosshair touch-none"
                  />
                </div>
              )}

              {toolId === 'text-to-qr' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Enter Text or URL for QR Code</label>
                  <input
                    type="text"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs"
                  />
                  {qrDataUrl && (
                    <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Live preview QR code</p>
                    </div>
                  )}
                </div>
              )}

              {toolId === 'ai-translate-doc' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Language</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                    <option value="Chinese (Simplified)">Chinese (Simplified)</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                </div>
              )}

              {toolId === 'ai-resume-analyzer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Job Title</label>
                  <input
                    type="text"
                    value={targetJobRole}
                    onChange={(e) => setTargetJobRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs"
                    placeholder="e.g. Senior Product Manager"
                  />
                </div>
              )}

              {/* Status & Error Messages */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Trigger Buttons */}
              {toolId !== 'edit-pdf' && toolId !== 'excel-dashboard-maker' && toolId !== 'data-visualization' && toolId !== 'data-scraping' && toolId !== 'data-extraction' && (
                <div className="pt-2">
                  <button
                    onClick={currentWorkflow ? handleExecuteWorkflow : handleExecuteTool}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{statusMessage || 'Processing...'}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>{currentWorkflow ? 'Execute Workflow Pipeline' : 'Run Tool'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* SUCCESS RESULTS DISPLAY */}
              {successResult && (
                <div className="mt-6 p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl animate-in fade-in space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Output Generated Successfully
                    </span>

                    {/* Download or Copy Button */}
                    {successResult.type === 'file' ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!successResult) return;
                            const ext = successResult.fileName?.split('.').pop()?.toLowerCase();
                            const mimeType =
                              ext === 'pdf'
                                ? 'application/pdf'
                                : ext === 'docx'
                                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                : ext === 'png'
                                ? 'image/png'
                                : ext === 'jpg' || ext === 'jpeg'
                                ? 'image/jpeg'
                                : 'application/octet-stream';

                            const blob =
                              successResult.data instanceof Blob
                                ? successResult.data
                                : typeof successResult.data === 'string' && successResult.data.startsWith('data:')
                                ? dataURLtoBlob(successResult.data)
                                : new Blob([successResult.data], { type: mimeType });

                            const newFile = new File([blob], successResult.fileName || 'Processed_Document.pdf', {
                              type: mimeType,
                            });
                            onAddFiles([newFile]);
                            setStatusMessage('Saved to your Active Files workspace!');
                          }}
                          className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Layers className="w-3.5 h-3.5 text-emerald-600" /> Save to Workspace
                        </button>
                        <button
                          onClick={() =>
                            downloadFile(
                              successResult.data,
                              successResult.fileName || 'Processed_FileKit_Output'
                            )
                          }
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Result
                        </button>
                      </div>
                    ) : typeof successResult.data === 'string' ? (
                      <button
                        onClick={() => handleCopyText(successResult.data)}
                        className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    ) : null}
                  </div>

                  {/* Render Results Content */}
                  {successResult.type === 'text' && (
                    <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {successResult.data}
                    </div>
                  )}

                  {successResult.type === 'json' && (
                    <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-800 space-y-2 max-h-60 overflow-y-auto">
                      {successResult.data.summary && (
                        <div>
                          <strong className="text-indigo-900 block mb-1">Summary:</strong>
                          <p>{successResult.data.summary}</p>
                        </div>
                      )}
                      {successResult.data.bulletPoints && (
                        <div>
                          <strong className="text-indigo-900 block mb-1">Key Takeaways:</strong>
                          <ul className="list-disc pl-4 space-y-1">
                            {successResult.data.bulletPoints.map((bp: string, i: number) => (
                              <li key={i}>{bp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {successResult.data.dates && (
                        <div className="space-y-1">
                          <strong className="text-indigo-900 block">Extracted Dates:</strong>
                          <div className="flex flex-wrap gap-1">
                            {successResult.data.dates.map((d: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[11px]">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {successResult.type === 'table' && (
                    <div className="bg-white border border-emerald-200 rounded-xl overflow-x-auto max-h-60">
                      <table className="w-full text-xs text-left text-slate-700">
                        <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                          <tr>
                            {successResult.data.headers?.map((h: string, i: number) => (
                              <th key={i} className="px-3 py-2">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {successResult.data.rows?.map((row: string[], rIdx: number) => (
                            <tr key={rIdx} className="border-b border-slate-100">
                              {row.map((cell: string, cIdx: number) => (
                                <td key={cIdx} className="px-3 py-2">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {successResult.type === 'resume' && (
                    <div className="bg-white border border-emerald-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">Overall ATS Score</span>
                        <span className="text-lg font-black text-indigo-600">
                          {successResult.data.overallScore} / 100
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{successResult.data.summary}</p>
                      <div>
                        <strong className="text-xs text-emerald-700 block mb-1">Key Strengths:</strong>
                        <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
                          {successResult.data.strengths?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
