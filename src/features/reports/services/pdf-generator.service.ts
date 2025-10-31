/**
 * PDF Generator Service for Spanish Tax Forms
 * Generates PDF reports in Hacienda-compliant format
 * 
 * LEGAL COMPLIANCE:
 * Based on Spanish Tax Authority (AEAT) regulations for cryptocurrency declarations
 * - Casilla 1804: Ganancias y pérdidas patrimoniales / Monedas virtuales
 * - Base Imponible del Ahorro: All crypto gains/losses integrate into savings tax base
 * - FIFO Method: Required valuation method (First In, First Out)
 * - Article 33.1 LIRPF: Capital gains from crypto asset transmission
 * 
 * IMPORTANT: This generates an informative/supporting PDF document.
 * For official electronic submission to AEAT, use:
 * - Renta Web (https://www.agenciatributaria.gob.es)
 * - Programa PADRE (official desktop application)
 */

import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts, degrees } from 'pdf-lib';
import { SpanishTaxReport, Model100Data } from './report-format.service';
import { TaxCalculationResult } from './tax-calculation.service';

export interface PDFGenerationOptions {
  includeWatermark?: boolean;
  language?: 'es' | 'en';
  includeDetailedBreakdown?: boolean; // Include full transaction-by-transaction breakdown
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

    // All Transactions - Complete List
    if (yPosition < 250) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = 800;
    }
    const result = drawAllTransactions(pdfDoc, page, report.data as Model100Data, taxCalculation, helveticaBold, helveticaFont, yPosition);
    page = result.page;
    yPosition = result.yPosition;

    // Capital Gains Detail
    if (yPosition < 250) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = 800;
    }
    const result2 = drawCapitalGainsDetail(pdfDoc, page, report.data as Model100Data, taxCalculation, helveticaBold, helveticaFont, yPosition);
    page = result2.page;
    yPosition = result2.yPosition;

    // Calculation methodology example on new page
    page = pdfDoc.addPage([595.28, 841.89]);
    yPosition = 800;
    yPosition = drawCalculationMethodology(page, helveticaBold, helveticaFont, yPosition);

    // Instructions on new page (or continue if space available)
    if (yPosition < 200) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = 800;
    }
    drawModel100Instructions(pdfDoc, page, helveticaBold, helveticaFont, yPosition);

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
  
  // Header box
  page.drawRectangle({
    x: 40,
    y: yPosition - 105,
    width: width - 80,
    height: 115,
    color: rgb(0.95, 0.97, 1),
    borderColor: rgb(0.2, 0.3, 0.5),
    borderWidth: 2,
  });

  // Title
  page.drawText('MODELO 100 - IRPF', {
    x: width / 2 - 110,
    y: yPosition - 15,
    size: 22,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.4),
  });
  yPosition -= 35;

  // Subtitle
  page.drawText('Impuesto sobre la Renta de las Personas Físicas', {
    x: width / 2 - 180,
    y: yPosition,
    size: 13,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 18;

  // Legal reference
  page.drawText('CASILLA 1804: Ganancias y Pérdidas Patrimoniales - Monedas Virtuales', {
    x: width / 2 - 210,
    y: yPosition,
    size: 10,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 14;

  page.drawText('Base Imponible del Ahorro (Art. 33.1 y 37 Ley 35/2006 LIRPF)', {
    x: width / 2 - 170,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 18;

  // Fiscal year
  page.drawText(`Ejercicio Fiscal: ${report.fiscalYear}`, {
    x: width / 2 - 70,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 5;

  // AEAT reference
  page.drawText('AGENCIA ESTATAL DE ADMINISTRACION TRIBUTARIA', {
    x: width - 240,
    y: yPosition + 75,
    size: 8,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('Ministerio de Hacienda y Función Pública', {
    x: width - 205,
    y: yPosition + 65,
    size: 7,
    font: regularFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  yPosition -= 20;

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
 * Draw all transactions section (complete list)
 */
function drawAllTransactions(
  pdfDoc: PDFDocument,
  page: PDFPage,
  data: Model100Data,
  taxCalculation: TaxCalculationResult,
  boldFont: PDFFont,
  regularFont: PDFFont,
  yPosition: number
): { page: PDFPage; yPosition: number } {
  page.drawText('TODAS LAS TRANSACCIONES', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  if (!taxCalculation.transactions || taxCalculation.transactions.length === 0) {
    page.drawText('No hay transacciones para mostrar.', {
      x: 50,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 30;
    return { page, yPosition };
  }

  // Table headers
  const headers = ['Fecha', 'Tipo', 'Activo', 'Cantidad', 'Precio €', 'Valor €', 'Comisión €'];
  const colWidths = [65, 60, 60, 60, 60, 70, 70];
  let xPos = 50;

  // Draw header background
  page.drawRectangle({
    x: 45,
    y: yPosition - 15,
    width: 500,
    height: 18,
    color: rgb(0.9, 0.9, 0.9),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 0.5,
  });

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

  yPosition -= 20;

  // Add all transactions
  let transactionCount = 0;
  for (const tx of taxCalculation.transactions) {
    // Check if we need a new page
    if (yPosition < 80) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = 780;
      
      // Redraw headers on new page
      page.drawText('TODAS LAS TRANSACCIONES (continuación)', {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawRectangle({
        x: 45,
        y: yPosition - 15,
        width: 500,
        height: 18,
        color: rgb(0.9, 0.9, 0.9),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
      });

      xPos = 50;
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
      yPosition -= 20;
    }

    xPos = 50;
    
    // Type labels in Spanish
    const typeLabels: Record<string, string> = {
      'buy': 'Compra',
      'sell': 'Venta',
      'transfer_in': 'Depósito',
      'transfer_out': 'Retiro',
      'swap': 'Intercambio',
      'fee': 'Comisión'
    };

    const rowData = [
      tx.date.toLocaleDateString('es-ES'),
      typeLabels[tx.type] || tx.type,
      tx.asset.substring(0, 8),
      tx.amount.toFixed(6),
      tx.priceEUR.toFixed(2),
      tx.valueEUR.toFixed(2),
      (tx.feeValueEUR || 0).toFixed(2),
    ];

    // Alternate row background
    if (transactionCount % 2 === 0) {
      page.drawRectangle({
        x: 45,
        y: yPosition - 10,
        width: 500,
        height: 12,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    rowData.forEach((dataItem, i) => {
      page.drawText(dataItem, {
        x: xPos,
        y: yPosition,
        size: 7,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      xPos += colWidths[i];
    });

    yPosition -= 12;
    transactionCount++;
  }

  // Summary line
  yPosition -= 5;
  page.drawLine({
    start: { x: 45, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5),
  });
  yPosition -= 15;

  page.drawText(`Total de transacciones: ${taxCalculation.transactions.length}`, {
    x: 50,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 30;

  return { page, yPosition };
}

/**
 * Draw detailed capital gains table
 */
function drawCapitalGainsDetail(
  pdfDoc: PDFDocument,
  page: PDFPage,
  data: Model100Data,
  taxCalculation: TaxCalculationResult,
  boldFont: PDFFont,
  regularFont: PDFFont,
  yPosition: number
): { page: PDFPage; yPosition: number } {
  page.drawText('DETALLE DE GANANCIAS Y PERDIDAS PATRIMONIALES', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 20;

  const allGains = [...data.capitalGains.shortTerm, ...data.capitalGains.longTerm];

  if (allGains.length === 0) {
    page.drawText('No hay ganancias o pérdidas patrimoniales para mostrar.', {
      x: 50,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    yPosition -= 30;
    return { page, yPosition };
  }

  // Table headers
  const headers = ['F. Adq.', 'F. Venta', 'Activo', 'Adquisición', 'Venta', 'Ganancia/Pérd.'];
  const colWidths = [65, 65, 65, 80, 80, 90];
  let xPos = 50;

  // Draw header background
  page.drawRectangle({
    x: 45,
    y: yPosition - 15,
    width: 500,
    height: 18,
    color: rgb(0.9, 0.9, 0.9),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 0.5,
  });

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

  yPosition -= 20;

  // Add all gains entries with pagination
  let gainCount = 0;
  for (const gain of allGains) {
    // Check if we need a new page
    if (yPosition < 80) {
      page = pdfDoc.addPage([595.28, 841.89]);
      yPosition = 780;
      
      // Redraw headers on new page
      page.drawText('DETALLE DE GANANCIAS Y PERDIDAS (continuación)', {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawRectangle({
        x: 45,
        y: yPosition - 15,
        width: 500,
        height: 18,
        color: rgb(0.9, 0.9, 0.9),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
      });

      xPos = 50;
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
      yPosition -= 20;
    }

    xPos = 50;
    const rowData = [
      gain.acquisitionDate.substring(0, 10),
      gain.disposalDate.substring(0, 10),
      gain.description.substring(0, 10),
      `${gain.acquisitionValue.toFixed(2)}€`,
      `${gain.disposalValue.toFixed(2)}€`,
      `${gain.gain.toFixed(2)}€`,
    ];

    // Alternate row background
    if (gainCount % 2 === 0) {
      page.drawRectangle({
        x: 45,
        y: yPosition - 10,
        width: 500,
        height: 12,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    // Color code gains/losses
    const gainColor = gain.gain >= 0 ? rgb(0, 0.5, 0) : rgb(0.7, 0, 0);

    rowData.forEach((dataItem, i) => {
      page.drawText(dataItem, {
        x: xPos,
        y: yPosition,
        size: 7,
        font: regularFont,
        color: i === 5 ? gainColor : rgb(0, 0, 0), // Color the gain/loss column
      });
      xPos += colWidths[i];
    });

    yPosition -= 12;
    gainCount++;
  }

  // Summary line
  yPosition -= 5;
  page.drawLine({
    start: { x: 45, y: yPosition },
    end: { x: 545, y: yPosition },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5),
  });
  yPosition -= 15;

  page.drawText(`Total de operaciones con ganancia/pérdida: ${allGains.length}`, {
    x: 50,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 30;

  return { page, yPosition };
}

/**
 * Draw calculation methodology with FIFO example
 * Based on AEAT official guidance
 */
function drawCalculationMethodology(
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont,
  yPosition: number
): number {
  page.drawText('METODOLOGIA DE CALCULO - METODO FIFO', {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 25;

  // Explanation box
  page.drawRectangle({
    x: 45,
    y: yPosition - 200,
    width: 505,
    height: 210,
    color: rgb(0.98, 0.98, 0.98),
    borderColor: rgb(0.7, 0.7, 0.7),
    borderWidth: 1,
  });

  // FIFO explanation
  page.drawText('Metodo FIFO (First In, First Out):', {
    x: 55,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 15;

  page.drawText('En caso de venta parcial de monedas virtuales homogeneas, adquiridas en', {
    x: 55,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText('diferentes momentos y a diferentes valores, las que primero se transmiten', {
    x: 55,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText('son las adquiridas en primer lugar (criterio FIFO - Art. 37 LIRPF).', {
    x: 55,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 25;

  // Example (based on AEAT guide)
  page.drawText('Ejemplo de Calculo (segun guia AEAT):', {
    x: 55,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: rgb(0, 0.2, 0.4),
  });
  yPosition -= 15;

  page.drawText('Compra 1: 26/06/202X - 0,09 BTC por 3.000€ + 60€ comision = 3.060€', {
    x: 60,
    y: yPosition,
    size: 8,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText('Compra 2: 19/07/202X - 0,22 BTC por 6.000€ + 120€ comision = 6.120€', {
    x: 60,
    y: yPosition,
    size: 8,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText('Venta: 12/11/202X - 0,22 BTC por 14.046,32€ - 280€ comision = 13.766,32€', {
    x: 60,
    y: yPosition,
    size: 8,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 18;

  page.drawText('Calculo de ganancia patrimonial:', {
    x: 60,
    y: yPosition,
    size: 8,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText('(+) Valor de transmision = 14.046,32€ - 280€ (comision) = 13.766,32€', {
    x: 65,
    y: yPosition,
    size: 8,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText('(-) Valor de adquisicion (FIFO):*', {
    x: 65,
    y: yPosition,
    size: 8,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 12;

  page.drawText('    • 0,09 BTC de Compra 1 = 3.060€', {
    x: 70,
    y: yPosition,
    size: 8,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 10;

  page.drawText('    • 0,13 BTC de Compra 2 = (6.120€ x 0,13 / 0,22) = 3.616,36€', {
    x: 70,
    y: yPosition,
    size: 8,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 10;

  page.drawText('    • TOTAL: 3.060€ + 3.616,36€ = 6.676,36€', {
    x: 70,
    y: yPosition,
    size: 8,
    font: regularFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 15;

  page.drawText('(=) Ganancia patrimonial = 13.766,32€ - 6.676,36€ = 7.089,96€', {
    x: 65,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: rgb(0, 0.5, 0),
  });
  yPosition -= 15;

  page.drawText('* Las primeras adquiridas son las primeras vendidas (FIFO)', {
    x: 60,
    y: yPosition,
    size: 7,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 25;

  return yPosition;
}

/**
 * Draw instructions and notes
 */
function drawModel100Instructions(
  pdfDoc: PDFDocument,
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
      title: '1. CASILLA 1804 - Monedas Virtuales',
      content: 'Las ganancias y pérdidas de monedas virtuales deben declararse',
      content2: 'en la CASILLA 1804 del Modelo 100 (Base Imponible del Ahorro).',
      content3: 'Acceda: Ganancias y pérdidas patrimoniales > Monedas virtuales.',
    },
    {
      title: '2. Tipos de Operaciones Declarables',
      content: 'a) Ventas de monedas virtuales por euros u otra moneda de curso legal',
      content2: 'b) Intercambio de una moneda virtual por otra diferente (permuta)',
      content3: 'c) Pérdidas por quiebra de plataforma (Art. 14.2.k LIRPF)',
    },
    {
      title: '3. Método de Valoración FIFO',
      content: 'En caso de venta parcial, las que primero se transmiten son',
      content2: 'las adquiridas en primer lugar (criterio FIFO - Art. 37 LIRPF).',
      content3: 'Se incluyen comisiones en el valor de adquisición y transmisión.',
    },
    {
      title: '4. Documentación de Respaldo',
      content: 'Conserve este informe junto con todos los justificantes de:',
      content2: '• Compras y ventas realizadas (recibos del exchange)',
      content3: '• Comisiones pagadas • Extractos de las plataformas',
    },
    {
      title: '5. Presentación Electrónica Oficial',
      content: 'Este PDF es un DOCUMENTO INFORMATIVO DE APOYO.',
      content2: 'Para la presentación oficial obligatoria debe usar:',
      content3: '• Renta Web (www.agenciatributaria.gob.es) o • Programa PADRE',
    },
    {
      title: '6. Plazos y Obligaciones',
      content: 'Declaración IRPF: Abril-Junio (del año siguiente al fiscal)',
      content2: 'No es necesario declarar la mera tenencia de criptomonedas,',
      content3: 'solo las operaciones que generen rendimientos o ganancias.',
    },
    {
      title: '7. Asesoramiento Profesional',
      content: 'Se recomienda encarecidamente consultar con un asesor fiscal',
      content2: 'colegiado antes de presentar su declaración, especialmente en',
      content3: 'casos complejos (staking, DeFi, NFTs, airdrops, etc.).',
    },
  ];

  instructions.forEach((instruction) => {
    // Check if we need a new page
    if (yPosition < 150) {
      const newPage = pdfDoc.addPage([595.28, 841.89]);
      page = newPage;
      yPosition = 800;
    }

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

    if (instruction.content3) {
      page.drawText(instruction.content3, {
        x: 60,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 12;
    }

    yPosition -= 10;
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
