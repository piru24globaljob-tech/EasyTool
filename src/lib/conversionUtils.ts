import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Paragraph, TextRun, HeadingLevel, Packer, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, WidthType, BorderStyle } from 'docx';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';

/**
 * 1. Convert DOCX to PDF
 * Extracts raw text / HTML structure from DOCX via Mammoth and generates a styled PDF using jsPDF.
 */
export async function convertDocxToPdf(arrayBuffer: ArrayBuffer, fileName: string): Promise<Uint8Array> {
  let text = '';
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value || '';
  } catch (err) {
    console.warn('Mammoth extraction warning, falling back:', err);
    text = 'Could not extract raw text from DOCX file.';
  }

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  const maxLineWidth = pageWidth - margin * 2;

  // Header banner
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageWidth, 50, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(fileName.replace(/\.[^/.]+$/, ''), margin, 32);

  // Body content
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  const paragraphs = text.split(/\r?\n/).filter((p) => p.trim().length > 0);
  let y = 75;
  const pageHeight = pdf.internal.pageSize.getHeight();

  if (paragraphs.length === 0) {
    pdf.text('[Empty Document]', margin, y);
  } else {
    for (const p of paragraphs) {
      const lines = pdf.splitTextToSize(p, maxLineWidth);
      for (const line of lines) {
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = 50;
        }
        pdf.text(line, margin, y);
        y += 14;
      }
      y += 6; // paragraph spacing
    }
  }

  // Footer page numbers
  const pageCount = (pdf.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${i} of ${pageCount} • Converted with FileKit AI`, margin, pageHeight - 20);
  }

  return new Uint8Array(pdf.output('arraybuffer'));
}

/**
 * 2. Convert PDF to Word (.docx)
 * Converts extracted text or text lines from PDF into a structured Word document.
 */
export async function convertPdfToDocx(pdfText: string, fileName: string): Promise<Blob> {
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  const lines = pdfText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  const children: (Paragraph | DocxTable)[] = [];

  // Title
  children.push(
    new Paragraph({
      text: cleanName,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Converted from PDF on ${new Date().toLocaleDateString()} • FileKit AI`,
          italics: true,
          color: '64748B',
          size: 18,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  if (lines.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'No text content extracted from source document.', italics: true })],
      })
    );
  } else {
    for (const line of lines) {
      // Heading heuristic: short line without ending punctuation
      const isShortHeading = line.length < 50 && !line.trim().endsWith('.') && !line.trim().endsWith(',');
      if (isShortHeading) {
        children.push(
          new Paragraph({
            text: line.trim(),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
          })
        );
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line, size: 22 })],
            spacing: { after: 120 },
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * 3. Convert Excel (.xlsx, .xls, .csv) to PDF
 * Converts all worksheets into formatted printable tables in PDF using autoTable.
 */
export async function convertExcelToPdf(arrayBuffer: ArrayBuffer, fileName: string): Promise<Uint8Array> {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
  const cleanName = fileName.replace(/\.[^/.]+$/, '');

  let isFirstSheet = true;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!data || data.length === 0) continue;

    if (!isFirstSheet) {
      pdf.addPage();
    }
    isFirstSheet = false;

    // Sheet Header Title
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 45, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`${cleanName} — Sheet: ${sheetName}`, 30, 28);

    const headers = data[0].map((cell) => String(cell ?? ''));
    const rows = data.slice(1).map((row) => row.map((cell) => String(cell ?? '')));

    autoTable(pdf, {
      head: [headers],
      body: rows,
      startY: 60,
      margin: { left: 30, right: 30 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // slate-50
      },
    });
  }

  // Footer page numbers
  const pageCount = (pdf.internal as any).getNumberOfPages();
  const pageHeight = pdf.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${i} of ${pageCount} • FileKit AI Spreadsheet Export`, 30, pageHeight - 15);
  }

  return new Uint8Array(pdf.output('arraybuffer'));
}

/**
 * 4. Convert PDF to Excel (.xlsx)
 * Converts text/tabular contents of a PDF into structured rows and cells in an Excel spreadsheet.
 */
export async function convertPdfToExcel(pdfText: string, fileName: string, tableData?: { headers?: string[]; rows?: string[][] }): Promise<Uint8Array> {
  const wb = XLSX.utils.book_new();

  let rows: string[][] = [];

  if (tableData && tableData.headers && tableData.headers.length > 0) {
    rows.push(tableData.headers);
    if (tableData.rows) {
      rows.push(...tableData.rows);
    }
  } else {
    // Parse lines from raw PDF text
    const lines = pdfText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    for (const line of lines) {
      // Split by tab, comma, multiple spaces, or pipe
      const tokens = line.split(/\t|,|\||\s{2,}/).map((t) => t.trim()).filter((t) => t.length > 0);
      if (tokens.length > 0) {
        rows.push(tokens);
      }
    }
  }

  if (rows.length === 0) {
    rows = [['Extracted Text'], [pdfText || 'No text found']];
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Auto-fit column widths
  const maxCols = Math.max(...rows.map((r) => r.length));
  const colWidths = Array.from({ length: maxCols }, (_, colIdx) => {
    const maxLen = rows.reduce((max, row) => Math.max(max, (row[colIdx] || '').length), 10);
    return { wch: Math.min(Math.max(maxLen + 3, 10), 50) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuffer);
}

/**
 * 5. Convert PowerPoint (.pptx) to Word (.docx)
 * Unzips PPTX, parses slide XML for titles, body text, and notes, then outputs a structured DOCX document.
 */
export async function convertPptxToDocx(arrayBuffer: ArrayBuffer, fileName: string): Promise<Blob> {
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
      return numA - numB;
    });

  const children: (Paragraph | DocxTable)[] = [];

  // Document Title
  children.push(
    new Paragraph({
      text: `${cleanName} — Presentation Transcript`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Converted from PowerPoint (${slideFiles.length} slides) on ${new Date().toLocaleDateString()} • FileKit AI`,
          italics: true,
          color: '64748B',
          size: 18,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  if (slideFiles.length === 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'No presentation slides found in this PPTX file.', italics: true })],
      })
    );
  } else {
    for (let i = 0; i < slideFiles.length; i++) {
      const slidePath = slideFiles[i];
      const xmlText = await zip.files[slidePath].async('string');

      // Simple XML regex parser for <a:t> text elements
      const textMatches = Array.from(xmlText.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)).map((m) => m[1]);

      const slideTitle = textMatches[0] ? textMatches[0].trim() : `Slide ${i + 1}`;
      const slideBodyText = textMatches.slice(1).filter((t) => t.trim().length > 0);

      // Slide Header
      children.push(
        new Paragraph({
          text: `Slide ${i + 1}: ${slideTitle}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 120 },
        })
      );

      if (slideBodyText.length === 0) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '[Visual or graphic slide content]', italics: true, color: '94A3B8' })],
            spacing: { after: 120 },
          })
        );
      } else {
        for (const bodyItem of slideBodyText) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: '• ', bold: true, color: '475569' }),
                new TextRun({ text: bodyItem, size: 22 }),
              ],
              spacing: { after: 80 },
            })
          );
        }
      }

      // Check for matching speaker notes
      const notePath = `ppt/notesSlides/notesSlide${i + 1}.xml`;
      if (zip.files[notePath]) {
        const noteXml = await zip.files[notePath].async('string');
        const noteTexts = Array.from(noteXml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g))
          .map((m) => m[1])
          .filter((t) => t.trim().length > 0 && !t.includes('Slide'));

        if (noteTexts.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Speaker Notes: ', bold: true, color: '0284C7' }),
                new TextRun({ text: noteTexts.join(' '), italics: true, color: '334155' }),
              ],
              spacing: { before: 80, after: 160 },
            })
          );
        }
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * 6. Convert Excel (.xlsx, .csv) to PowerPoint (.pptx)
 * Reads Excel workbook sheets and generates a presentation deck with Title slide and styled Data Table slides.
 */
export async function convertExcelToPptx(arrayBuffer: ArrayBuffer, fileName: string): Promise<Blob> {
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = cleanName;

  // Slide 1: Cover Title Slide
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: '0F172A' }; // slate-900

  coverSlide.addText(cleanName, {
    x: 0.8,
    y: 2.2,
    w: '80%',
    fontSize: 32,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
  });

  coverSlide.addText(`Spreadsheet Presentation • ${workbook.SheetNames.length} Sheet(s)`, {
    x: 0.8,
    y: 3.2,
    w: '80%',
    fontSize: 16,
    color: '38BDF8', // sky-400
    fontFace: 'Arial',
  });

  coverSlide.addText(`Converted on ${new Date().toLocaleDateString()} with FileKit AI`, {
    x: 0.8,
    y: 4.8,
    w: '80%',
    fontSize: 12,
    color: '94A3B8',
    fontFace: 'Arial',
  });

  // Slide per Sheet
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!data || data.length === 0) continue;

    const slide = pptx.addSlide();
    slide.background = { color: 'F8FAFC' }; // slate-50

    // Header Title
    slide.addText(`Sheet: ${sheetName}`, {
      x: 0.5,
      y: 0.4,
      w: '90%',
      fontSize: 22,
      bold: true,
      color: '0F172A',
      fontFace: 'Arial',
    });

    // Subtitle
    slide.addText(`Showing top ${Math.min(data.length - 1, 15)} rows from source workbook`, {
      x: 0.5,
      y: 0.9,
      w: '90%',
      fontSize: 11,
      color: '64748B',
      fontFace: 'Arial',
    });

    // Format PPTX Table
    const formattedRows: PptxGenJS.TableRow[] = data.slice(0, 16).map((row, rowIdx) => {
      return row.slice(0, 8).map((cell) => ({
        text: String(cell ?? ''),
        options: {
          fontSize: 10,
          color: rowIdx === 0 ? 'FFFFFF' : '1E293B',
          fill: rowIdx === 0 ? { color: '0F172A' } : rowIdx % 2 === 0 ? { color: 'FFFFFF' } : { color: 'F1F5F9' },
          bold: rowIdx === 0,
          align: 'left' as const,
          valign: 'middle' as const,
        },
      }));
    });

    if (formattedRows.length > 0) {
      slide.addTable(formattedRows, {
        x: 0.5,
        y: 1.3,
        w: 9.0,
        colW: Array(formattedRows[0].length).fill(9.0 / formattedRows[0].length),
        border: { pt: 1, color: 'CBD5E1' },
      });
    }
  }

  const pptxArrayBuffer = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
  return new Blob([pptxArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
}
