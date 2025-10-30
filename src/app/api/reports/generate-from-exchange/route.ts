/**
 * API Route: Generate Tax Report from Exchange API
 * POST /api/reports/generate-from-exchange
 * 
 * Generates tax declarations from exchange API credentials
 * Saves to database and uploads to Cloudinary
 * Supports: Binance, Coinbase, WhiteBit
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Helper function to update progress in database
 */
async function updateProgress(reportRequestId: string, progress: number, message: string) {
  try {
    await prisma.reportRequest.update({
      where: { id: reportRequestId },
      data: {
        progress,
        progressMessage: message,
      },
    });
    console.log(`[Progress] ${progress}% - ${message}`);
  } catch (error) {
    console.error('[Progress] Failed to update progress:', error);
  }
}
import { exchangeAPIService, ExchangeTransaction } from '@/features/reports/services/exchange-api.service';
import { calculateTaxFIFO, ProcessedTransaction } from '@/features/reports/services/tax-calculation.service';
import { generateModel100Report, formatModel100CSV, formatReportJSON } from '@/features/reports/services/report-format.service';
import { generateModel100PDF } from '@/features/reports/services/pdf-generator.service';
import { priceAPIService } from '@/features/reports/services/price-api.service';
import { prisma } from '@/lib/prisma';
import { uploadReportToCloudinary } from '@/lib/cloudinary';

// Request validation schema
const GenerateReportSchema = z.object({
  reportRequestId: z.string().optional(), // ID of existing report request to update
  exchange: z.enum(['binance', 'coinbase', 'whitebit']),
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
  passphrase: z.string().optional(),
  fiscalYear: z.number().int().min(2009).max(new Date().getFullYear()),
  reportType: z.enum(['model-100', 'model-720', 'model-714']),
  dateRange: z.object({
    from: z.string().transform(str => new Date(str)),
    to: z.string().transform(str => new Date(str)),
  }).optional(),
  taxpayerInfo: z.object({
    nif: z.string().optional(),
    name: z.string().optional(),
    surname: z.string().optional(),
  }).optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('pdf'),
});

type GenerateReportRequest = z.infer<typeof GenerateReportSchema>;

/**
 * Convert ExchangeTransaction to ProcessedTransaction format
 */
async function convertExchangeTransactions(
  exchangeTransactions: ExchangeTransaction[]
): Promise<ProcessedTransaction[]> {
  console.log(`[Exchange API] Converting ${exchangeTransactions.length} transactions to ProcessedTransaction format`);
  
  // Get unique assets that need pricing
  const assetsNeedingPrices = new Set<string>();
  exchangeTransactions.forEach(tx => {
    if (tx.price === 0 || tx.total === 0) {
      assetsNeedingPrices.add(tx.asset);
      if (tx.feeAsset && tx.feeAsset !== tx.asset) {
        assetsNeedingPrices.add(tx.feeAsset);
      }
    }
  });

  // Fetch current prices for all assets that need them
  const prices = new Map<string, number>();
  if (assetsNeedingPrices.size > 0) {
    console.log(`[Exchange API] Fetching current prices for ${assetsNeedingPrices.size} assets...`);
    const fetchedPrices = await priceAPIService.getPricesInEUR(Array.from(assetsNeedingPrices));
    fetchedPrices.forEach((price, symbol) => prices.set(symbol, price));
    console.log(`[Exchange API] Fetched prices for assets:`, Array.from(prices.keys()).join(', '));
  }
  
  return exchangeTransactions.map((tx) => {
    // Map exchange transaction types to tax calculation types
    let type: ProcessedTransaction['type'];
    switch (tx.type) {
      case 'buy':
        type = 'buy';
        break;
      case 'sell':
        type = 'sell';
        break;
      case 'deposit':
        // Deposits are acquisitions (like buying)
        type = 'transfer_in';
        break;
      case 'withdrawal':
        // Withdrawals are disposals (like selling)
        type = 'transfer_out';
        break;
      case 'transfer':
        type = 'transfer_in';
        break;
      default:
        type = 'transfer_in';
    }

    // Use traded price if available, otherwise use fetched market price
    let priceEUR = tx.price;
    let valueEUR = tx.total;
    
    if (tx.price === 0 || tx.total === 0) {
      // Use fetched price or fallback to 1 EUR
      priceEUR = prices.get(tx.asset) || 1.0;
      valueEUR = tx.amount * priceEUR;
    }

    // Calculate fee value
    let feeValueEUR = 0;
    if (tx.fee > 0) {
      if (tx.feeAsset === tx.asset) {
        feeValueEUR = tx.fee * priceEUR;
      } else {
        // Fee is in a different asset, use its price
        const feeAssetPrice = prices.get(tx.feeAsset) || priceEUR;
        feeValueEUR = tx.fee * feeAssetPrice;
      }
    }

    const processed: ProcessedTransaction = {
      hash: tx.id,
      date: new Date(tx.timestamp),
      type,
      asset: tx.asset,
      amount: tx.amount,
      priceEUR,
      valueEUR,
      fee: tx.fee,
      feeValueEUR,
      from: tx.type === 'buy' || tx.type === 'deposit' ? tx.exchange : undefined,
      to: tx.type === 'sell' || tx.type === 'withdrawal' ? tx.exchange : undefined,
    };

    return processed;
  });
}

export async function POST(request: NextRequest) {
  let reportRequest: any = null;
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = GenerateReportSchema.parse(body);

    // Only Model 100 is currently supported
    if (validated.reportType !== 'model-100') {
      return NextResponse.json(
        {
          error: `Report type ${validated.reportType} is not yet implemented`,
          message: 'Currently only Model 100 (IRPF) is supported for exchange API integration',
        },
        { status: 501 }
      );
    }

    // Step 0: Create or get existing report request in database
    if (validated.reportRequestId) {
      // Update existing report request
      reportRequest = await prisma.reportRequest.update({
        where: { id: validated.reportRequestId },
        data: {
          status: 'processing',
          dataSource: 'api-key',
          sourceData: {
            exchange: validated.exchange,
            apiKey: '***REDACTED***', // Don't store actual API keys
            dateRange: validated.dateRange,
          },
          reportType: validated.reportType,
          fiscalYear: validated.fiscalYear,
          taxpayerNif: validated.taxpayerInfo?.nif,
          taxpayerName: validated.taxpayerInfo?.name,
          taxpayerSurname: validated.taxpayerInfo?.surname,
          fileFormat: validated.format,
        },
      });
      console.log(`[API] Updated existing report request: ${reportRequest.id}`);
    } else {
      // Create new report request
      reportRequest = await prisma.reportRequest.create({
        data: {
          status: 'processing',
          dataSource: 'api-key',
          sourceData: {
            exchange: validated.exchange,
            apiKey: '***REDACTED***', // Don't store actual API keys
            dateRange: validated.dateRange,
          },
          reportType: validated.reportType,
          fiscalYear: validated.fiscalYear,
          taxpayerNif: validated.taxpayerInfo?.nif,
          taxpayerName: validated.taxpayerInfo?.name,
          taxpayerSurname: validated.taxpayerInfo?.surname,
          fileFormat: validated.format,
        },
      });
      console.log(`[API] Created new report request: ${reportRequest.id}`);
    }

    // TODO: Add authentication/API key validation for production
    // const apiKey = request.headers.get('X-API-Key');
    // if (!apiKey || !await validateApiKey(apiKey)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Step 1: Test API connection
    await updateProgress(reportRequest.id, 15, 'Verificando credenciales del exchange...');
    console.log(`[API Route] Testing connection to ${validated.exchange}...`);
    console.log(`[API Route] API Key (first 8): ${validated.apiKey.substring(0, 8)}...`);
    
    let isValidConnection = false;
    let connectionError = null;
    
    try {
      isValidConnection = await exchangeAPIService.testConnection(
        validated.exchange,
        {
          apiKey: validated.apiKey,
          apiSecret: validated.apiSecret,
          passphrase: validated.passphrase,
        }
      );
    } catch (err) {
      connectionError = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[API Route] Connection test threw error:`, connectionError);
    }

    if (!isValidConnection) {
      return NextResponse.json(
        {
          error: 'Invalid API credentials',
          message: connectionError || 'Failed to connect to exchange. Please verify your API key and secret.',
          details: 'Asegúrate de que tu API key tiene permisos de lectura y que tu IP está autorizada (o sin restricción de IP).',
        },
        { status: 401 }
      );
    }

    console.log(`[API Route] Connection to ${validated.exchange} successful!`);

    // Step 2: Fetch transactions from exchange
    await updateProgress(reportRequest.id, 25, `Obteniendo transacciones de ${validated.exchange}...`);
    console.log(`Fetching transactions from ${validated.exchange}...`);
    const exchangeTransactions = await exchangeAPIService.fetchTransactions(
      validated.exchange,
      {
        apiKey: validated.apiKey,
        apiSecret: validated.apiSecret,
        passphrase: validated.passphrase,
      },
      validated.dateRange?.from,
      validated.dateRange?.to
    );

    if (exchangeTransactions.length === 0) {
      return NextResponse.json(
        {
          error: 'No transactions found',
          message: 'No transactions found for the specified exchange and time period',
        },
        { status: 404 }
      );
    }

    console.log(`Found ${exchangeTransactions.length} transactions from ${validated.exchange}`);

    // Step 3: Convert to standard format
    await updateProgress(reportRequest.id, 45, `Procesando ${exchangeTransactions.length} transacciones...`);
    const processedTransactions = await convertExchangeTransactions(exchangeTransactions);
    
    console.log(`[Exchange API] Converted ${processedTransactions.length} transactions:`);
    processedTransactions.slice(0, 5).forEach((tx, i) => {
      console.log(`  [${i}] ${tx.date.toISOString()} - ${tx.type} ${tx.amount} ${tx.asset} @ €${tx.priceEUR}`);
    });
    if (processedTransactions.length > 5) {
      console.log(`  ... and ${processedTransactions.length - 5} more`);
    }

    // Step 4: Calculate taxes using FIFO method
    await updateProgress(reportRequest.id, 65, 'Calculando impuestos con método FIFO...');
    console.log(`[Exchange API] Calculating taxes for fiscal year ${validated.fiscalYear}`);
    console.log(`[Exchange API] Fiscal year range: ${validated.fiscalYear}-01-01 to ${validated.fiscalYear}-12-31`);
    
    const taxCalculation = calculateTaxFIFO(
      processedTransactions,
      validated.fiscalYear
    );
    
    console.log(`[Exchange API] Tax calculation complete:`, {
      totalTransactions: taxCalculation.transactions.length,
      totalGains: taxCalculation.summary.totalGains,
      totalLosses: taxCalculation.summary.totalLosses,
      netResult: taxCalculation.summary.netResult,
      capitalGains: taxCalculation.capitalGains.length,
    });

    // Step 5: Generate report in requested format
    await updateProgress(reportRequest.id, 75, 'Generando documento del informe...');
    let report;
    let formattedOutput;
    let pdfBuffer: Buffer | null = null;
    const reportId = `exchange-${validated.exchange}-${Date.now()}`;

    // Provide default taxpayer info if not specified
    const taxpayerInfo = {
      nif: validated.taxpayerInfo?.nif || 'PENDIENTE',
      name: validated.taxpayerInfo?.name || 'Por Rellenar',
      surname: validated.taxpayerInfo?.surname || '',
      ...validated.taxpayerInfo,
    };

    // Generate Model 100 report (only supported type for now)
    report = generateModel100Report(
      taxCalculation,
      taxpayerInfo
    );
    
    if (validated.format === 'csv') {
      console.log('[API] Generating CSV with taxCalculation containing', taxCalculation.transactions.length, 'transactions');
      formattedOutput = formatModel100CSV(report, taxCalculation);
      console.log('[API] CSV generated, length:', formattedOutput.length, 'chars');
      console.log('[API] CSV preview (first 500 chars):', formattedOutput.substring(0, 500));
    } else if (validated.format === 'pdf') {
      // Generate PDF
      pdfBuffer = await generateModel100PDF(report, taxCalculation, {
        includeWatermark: true,
      });
      formattedOutput = 'PDF generated';
    } else {
      formattedOutput = formatReportJSON(report);
    }

    // Step 6: Upload to Cloudinary
    await updateProgress(reportRequest.id, 85, 'Subiendo archivo a Cloudinary...');
    console.log(`[API] Uploading report to Cloudinary...`);
    let cloudinaryResult = null;
    let fileBuffer: Buffer;

    if (validated.format === 'pdf' && pdfBuffer) {
      fileBuffer = pdfBuffer;
    } else if (validated.format === 'csv') {
      fileBuffer = Buffer.from(formattedOutput, 'utf-8');
    } else {
      fileBuffer = Buffer.from(formattedOutput, 'utf-8');
    }

    try {
      cloudinaryResult = await uploadReportToCloudinary(fileBuffer, {
        reportId: reportRequest.id,
        format: validated.format,
        fiscalYear: validated.fiscalYear,
        reportType: validated.reportType,
      });
      console.log(`[API] Successfully uploaded to Cloudinary: ${cloudinaryResult.secure_url}`);
    } catch (cloudinaryError) {
      console.error('[API] Cloudinary upload failed:', cloudinaryError);
      // Continue even if Cloudinary fails - update status to error
      await prisma.reportRequest.update({
        where: { id: reportRequest.id },
        data: {
          status: 'error',
          errorMessage: `Report generated but failed to upload to Cloudinary: ${cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'}`,
        },
      });
      
      return NextResponse.json({
        error: 'Failed to upload report to cloud storage',
        message: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error',
        reportRequestId: reportRequest.id,
      }, { status: 500 });
    }

    // Step 7: Update database with final report data
    await updateProgress(reportRequest.id, 95, 'Guardando en base de datos...');
    const updatedReportRequest = await prisma.reportRequest.update({
      where: { id: reportRequest.id },
      data: {
        status: 'completed',
        progress: 100,
        progressMessage: '¡Completado!',
        generatedReport: report as any, // Cast to any for Prisma Json field
        cloudinaryPublicId: cloudinaryResult.public_id,
        cloudinaryUrl: cloudinaryResult.secure_url,
        totalTransactions: taxCalculation.summary.totalTransactions,
        totalGains: taxCalculation.summary.totalGains,
        totalLosses: taxCalculation.summary.totalLosses,
        netResult: taxCalculation.summary.netResult,
      },
    });

    console.log(`[API] Report generation completed successfully:`, {
      reportRequestId: reportRequest.id,
      cloudinaryUrl: cloudinaryResult.secure_url,
      transactionCount: exchangeTransactions.length,
      totalGains: taxCalculation.summary.totalGains,
      totalLosses: taxCalculation.summary.totalLosses,
      netResult: taxCalculation.summary.netResult,
    });

    // Return success response with report request info
    return NextResponse.json({
      success: true,
      reportRequestId: reportRequest.id,
      reportRequest: updatedReportRequest,
      summary: {
        totalTransactions: taxCalculation.summary.totalTransactions,
        totalGains: taxCalculation.summary.totalGains,
        totalLosses: taxCalculation.summary.totalLosses,
        netResult: taxCalculation.summary.netResult,
        generatedAt: new Date().toISOString(),
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating report from exchange:', error);

    // Update report request status to error if we have a reportRequest
    if (reportRequest) {
      try {
        await prisma.reportRequest.update({
          where: { id: reportRequest.id },
          data: {
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
          },
        });
      } catch (dbError) {
        console.error('Failed to update report request status:', dbError);
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
          reportRequestId: reportRequest?.id,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to generate report from exchange API',
        reportRequestId: reportRequest?.id,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/reports/generate-from-exchange',
    supportedExchanges: ['binance', 'coinbase', 'whitebit'],
    supportedReports: ['model-100'],
    message: 'Exchange API report generation endpoint',
  });
}

