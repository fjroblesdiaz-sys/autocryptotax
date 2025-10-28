/**
 * PDF Generator Service for Spanish Tax Forms
 * Generates PDF reports in Hacienda-compliant format
 * 
 * Note: This implementation creates informative PDF reports.
 * For official electronic submission to AEAT, use their official software.
 */

import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts, degrees } from 'pdf-lib';
import { SpanishTaxReport, Model100Data } from './report-format.service';
import { TaxCalculationResult } from './tax-calculation.service';

export interface PDFGenerationOptions {
  includeWatermark?: boolean;
  language?: 'es' | 'en';
}

/**
 * Generate PDF for Modelo 100 (IRPF)
 */
export async function generateModel100PDF(
  report: SpanishTaxReport,
  taxCalculation: TaxCalculationResult,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Set document metadata
    pdfDoc.setTitle(`Modelo 100 - IRPF ${report.fiscalYear}`);
    pdfDoc.setAuthor('Auto Crypto Tax');
    pdfDoc.setSubject('Declaración de la Renta - Criptomonedas');
    pdfDoc.setKeywords(['IRPF', 'Modelo 100', 'Criptomonedas', 'Hacienda']);
    pdfDoc.setCreationDate(new Date());

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add first page
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    let yPosition = 800;

    // Add watermark if specified
    if (options.includeWatermark !== false) {
      page.drawText('DOCUMENTO INFORMATIVO', {
        x: 150,
        y: 400,
        size: 40,
        font: helveticaBold,
        color: rgb(1, 0, 0),
        opacity: 0.1,
        rotate: degrees(-45),
      });
    }

    // Header
    yPosition = drawModel100Header(page, report, helveticaBold, helveticaFont, yPosition);
    yPosition -= 30;

    // Taxpayer Info
    yPosition = drawTaxpayerInfo(page, report, helveticaBold, helveticaFont, yPosition);
    yPosition -= 30;

    // Summary
    yPosition = drawModel100Summary(page, report.data as Model100Data, helveticaBold, helveticaFont, yPosition);
    yPosition -= 30;

    // Capital Gains Detail
    if (yPosition < 250) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = 800;
    }
    yPosition = drawCapitalGainsDetail(page, report.data as Model100Data, taxCalculation, helveticaBold, helveticaFont, yPosition);

    // Instructions on new page
    page = pdfDoc.addPage([595.28, 841.89]);
    yPosition = 800;
    drawModel100Instructions(page, helveticaBold, helveticaFont, yPosition);

    // Add footer to all pages
    const pages = pdfDoc.getPages();
    pages.forEach((p, index) => {
      drawPageFooter(p, helveticaFont, report, index + 1, pages.length);
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Draw Modelo 100 header
 */
function drawModel100Header(
  page: PDFPage,
  report: SpanishTaxReport,
  boldFont: PDFFont,
  regularFont: PDFFont,
  yPosition: number
): number {
  const { width } = page.getSize();
  
  // Title
  page.drawText('MODELO 100', {
    x: width / 2 - 80,
    y: yPosition,
    size: 20,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 25;

  // Subtitle
  page.drawText('Impuesto sobre la Renta de las Personas Fisicas', {
    x: width / 2 - 180,
    y: yPosition,
    size: 14,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  // Fiscal year
  page.drawText(`Ejercicio Fiscal: ${report.fiscalYear}`, {
    x: width / 2 - 80,
    y: yPosition,
    size: 12,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  // AEAT logo area
  page.drawText('AGENCIA TRIBUTARIA', {
    x: width - 150,
    y: yPosition + 40,
    size: 10,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  return yPosition;
}

/**
 * Draw taxpayer information
 */
function drawTaxpayerInfo(
  page: PDFPage,
  report: SpanishTaxReport,
  boldFont: PDFFont,
  regularFont: PDFFont,
  yPosition: number
): number {
  page.drawText('DATOS DEL CONTRIBUYENTE', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  const info = report.taxpayerInfo;

  if (info.nif) {
    page.drawText(`NIF/NIE: ${info.nif}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  }

  if (info.name && info.surname) {
    page.drawText(`Nombre y Apellidos: ${info.name} ${info.surname}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  }

  return yPosition;
}

/**
 * Draw summary section for Modelo 100
 */
function drawModel100Summary(
  page: PDFPage,
  data: Model100Data,
  boldFont: PDFFont,
  regularFont: PDFFont,
  yPosition: number
): number {
  page.drawText('RESUMEN DE GANANCIAS Y PERDIDAS PATRIMONIALES', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 25;

  // Draw summary box background
  page.drawRectangle({
    x: 50,
    y: yPosition - 110,
    width: 495,
    height: 120,
    color: rgb(0.96, 0.96, 0.96),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });

  yPosition -= 15;

  // Short term
  page.drawText('Ganancias y Perdidas a Corto Plazo:', {
    x: 60,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 15;

  page.drawText(`Ganancias: EUR ${data.summary.totalShortTermGains.toFixed(2)}`, {
    x: 70,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText(`Perdidas: EUR ${data.summary.totalShortTermLosses.toFixed(2)}`, {
    x: 70,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText(`Resultado Neto: EUR ${data.summary.netShortTerm.toFixed(2)}`, {
    x: 70,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  // Long term  
  const longTermY = yPosition + 57;
  page.drawText('Ganancias y Perdidas a Largo Plazo:', {
    x: 300,
    y: longTermY,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Ganancias: EUR ${data.summary.totalLongTermGains.toFixed(2)}`, {
    x: 310,
    y: longTermY - 15,
    size: 9,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Perdidas: EUR ${data.summary.totalLongTermLosses.toFixed(2)}`, {
    x: 310,
    y: longTermY - 27,
    size: 9,
    font: regularFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Resultado Neto: EUR ${data.summary.netLongTerm.toFixed(2)}`, {
    x: 310,
    y: longTermY - 39,
    size: 9,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  // Total
  const totalColor = data.summary.netTotal >= 0 ? rgb(0, 0.4, 0) : rgb(0.55, 0, 0);
  page.drawText(`RESULTADO TOTAL: EUR ${data.summary.netTotal.toFixed(2)}`, {
    x: 60,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: totalColor,
  });

  yPosition -= 30;

  return yPosition;
}

/**
 * Draw detailed capital gains table
 */
function drawCapitalGainsDetail(
  page: PDFPage,
  data: Model100Data,
  taxCalculation: TaxCalculationResult,
  boldFont: PDFFont,
  regularFont: PDFFont,
  yPosition: number
): number {
  page.drawText('DETALLE DE OPERACIONES', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  // Table headers
  const headers = ['Fecha Adq.', 'Fecha Venta', 'Activo', 'Adquisicion', 'Venta', 'Ganancia'];
  const colWidths = [70, 70, 60, 80, 80, 85];
  let xPos = 50;

  headers.forEach((header, i) => {
    page.drawText(header, {
      x: xPos,
      y: yPosition,
      size: 8,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    xPos += colWidths[i];
  });

  // Draw line under headers
  page.drawLine({
    start: { x: 50, y: yPosition - 5 },
    end: { x: 545, y: yPosition - 5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  yPosition -= 15;

  // Add gains entries (limited to fit on page)
  const allGains = [...data.capitalGains.shortTerm, ...data.capitalGains.longTerm];
  const maxEntries = 15;

  allGains.slice(0, maxEntries).forEach((gain) => {
    if (yPosition < 100) return;

    xPos = 50;
    const rowData = [
      gain.acquisitionDate.substring(0, 10),
      gain.disposalDate.substring(0, 10),
      gain.description.substring(0, 8),
      `EUR${gain.acquisitionValue.toFixed(2)}`,
      `EUR${gain.disposalValue.toFixed(2)}`,
      `EUR${gain.gain.toFixed(2)}`,
    ];

    rowData.forEach((data, i) => {
      page.drawText(data, {
        x: xPos,
        y: yPosition,
        size: 7,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      xPos += colWidths[i];
    });

    yPosition -= 12;
  });

  if (allGains.length > maxEntries) {
    page.drawText(`... y ${allGains.length - maxEntries} operaciones mas (ver anexo completo CSV)`, {
      x: 50,
      y: yPosition - 10,
      size: 8,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  return yPosition - 20;
}

/**
 * Draw instructions and notes
 */
function drawModel100Instructions(
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont,
  yPosition: number
): void {
  page.drawText('INSTRUCCIONES PARA COMPLETAR LA DECLARACION', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 25;

  const instructions = [
    {
      title: '1. Casillas del Modelo 100',
      content: 'Las ganancias y perdidas de criptomonedas se declaran en',
      content2: 'las casillas 1625-1639 (Ganancias Patrimoniales del Ahorro).',
    },
    {
      title: '2. Documentacion de Respaldo',
      content: 'Conserve todos los registros de transacciones y este',
      content2: 'informe como documentacion de respaldo.',
    },
    {
      title: '3. Presentacion Electronica',
      content: 'Este documento es informativo. Para la presentacion oficial,',
      content2: 'utilice el programa PADRE o Renta Web de la AEAT.',
    },
    {
      title: '4. Metodo de Valoracion',
      content: 'Los calculos se han realizado usando el metodo FIFO',
      content2: '(First In, First Out) conforme a la normativa fiscal.',
    },
    {
      title: '5. Asesoramiento Profesional',
      content: 'Se recomienda consultar con un asesor fiscal cualificado',
      content2: 'antes de presentar su declaracion.',
    },
  ];

  instructions.forEach((instruction) => {
    if (yPosition < 100) return;

    page.drawText(instruction.title, {
      x: 50,
      y: yPosition,
      size: 10,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;

    page.drawText(instruction.content, {
      x: 60,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 12;

    if (instruction.content2) {
      page.drawText(instruction.content2, {
        x: 60,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 12;
    }

    yPosition -= 8;
  });
}

/**
 * Draw footer on page
 */
function drawPageFooter(
  page: PDFPage,
  font: PDFFont,
  report: SpanishTaxReport,
  pageNum: number,
  totalPages: number
): void {
  const { width } = page.getSize();

  // Footer line
  page.drawLine({
    start: { x: 50, y: 50 },
    end: { x: width - 50, y: 50 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Footer text
  const footerText = `Documento generado por Auto Crypto Tax - ${new Date(report.generatedAt).toLocaleDateString('es-ES')}`;
  page.drawText(footerText, {
    x: width / 2 - 150,
    y: 35,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Page number
  page.drawText(`Pagina ${pageNum} de ${totalPages}`, {
    x: width / 2 - 40,
    y: 20,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  });
}

/**
 * Generate a simple summary PDF
 */
export async function generateSummaryPDF(
  fiscalYear: number,
  totalTransactions: number,
  totalGains: number,
  totalLosses: number,
  netResult: number
): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = height - 100;

    // Title
    page.drawText('Resumen Fiscal - Criptomonedas', {
      x: width / 2 - 120,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    page.drawText(`Ano Fiscal: ${fiscalYear}`, {
      x: width / 2 - 60,
      y: yPosition,
      size: 14,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPosition -= 50;

    // Summary data
    page.drawText(`Total de Transacciones: ${totalTransactions}`, {
      x: 100,
      y: yPosition,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(`Ganancias Totales: EUR ${totalGains.toFixed(2)}`, {
      x: 100,
      y: yPosition,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(`Perdidas Totales: EUR ${totalLosses.toFixed(2)}`, {
      x: 100,
      y: yPosition,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    page.drawText(`Resultado Neto: EUR ${netResult.toFixed(2)}`, {
      x: 100,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: netResult >= 0 ? rgb(0, 0.4, 0) : rgb(0.55, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating summary PDF:', error);
    throw error;
  }
}
