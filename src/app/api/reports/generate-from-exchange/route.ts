/**
 * API Route: Generate Tax Report from Exchange API
 * POST /api/reports/generate-from-exchange
 * 
 * Generates tax declarations from exchange API credentials
 * Supports: Binance, Coinbase, WhiteBit
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { exchangeAPIService, ExchangeTransaction } from '@/features/reports/services/exchange-api.service';
import { calculateTaxFIFO, ProcessedTransaction } from '@/features/reports/services/tax-calculation.service';
import { generateModel100Report, formatModel100CSV, formatReportJSON } from '@/features/reports/services/report-format.service';
import { generateModel100PDF } from '@/features/reports/services/pdf-generator.service';

// Request validation schema
const GenerateReportSchema = z.object({
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
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

type GenerateReportRequest = z.infer<typeof GenerateReportSchema>;

/**
 * Convert ExchangeTransaction to ProcessedTransaction format
 */
function convertExchangeTransactions(
  exchangeTransactions: ExchangeTransaction[]
): ProcessedTransaction[] {
  return exchangeTransactions.map((tx) => ({
    hash: tx.id,
    date: new Date(tx.timestamp),
    type: tx.type === 'buy' ? 'buy' : tx.type === 'sell' ? 'sell' : 'transfer_in',
    asset: tx.asset,
    amount: tx.amount,
    priceEUR: tx.price,
    valueEUR: tx.total,
    fee: tx.fee,
    feeValueEUR: tx.fee * tx.price,
    from: tx.type === 'buy' ? tx.exchange : undefined,
    to: tx.type === 'sell' ? tx.exchange : undefined,
  }));
}

export async function POST(request: NextRequest) {
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

    // TODO: Add authentication/API key validation for production
    // const apiKey = request.headers.get('X-API-Key');
    // if (!apiKey || !await validateApiKey(apiKey)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Step 1: Test API connection
    console.log(`Testing connection to ${validated.exchange}...`);
    const isValidConnection = await exchangeAPIService.testConnection(
      validated.exchange,
      {
        apiKey: validated.apiKey,
        apiSecret: validated.apiSecret,
        passphrase: validated.passphrase,
      }
    );

    if (!isValidConnection) {
      return NextResponse.json(
        {
          error: 'Invalid API credentials',
          message: 'Failed to connect to exchange. Please verify your API key and secret.',
        },
        { status: 401 }
      );
    }

    // Step 2: Fetch transactions from exchange
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
    const processedTransactions = convertExchangeTransactions(exchangeTransactions);

    // Step 4: Calculate taxes using FIFO method
    console.log(`Calculating taxes for fiscal year ${validated.fiscalYear}`);
    const taxCalculation = calculateTaxFIFO(
      processedTransactions,
      validated.fiscalYear
    );

    // Step 5: Generate report in requested format
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
      formattedOutput = formatModel100CSV(report);
    } else if (validated.format === 'pdf') {
      // Generate PDF
      pdfBuffer = await generateModel100PDF(report, taxCalculation, {
        includeWatermark: true,
      });
      formattedOutput = 'PDF generated';
    } else {
      formattedOutput = formatReportJSON(report);
    }

    // Return PDF directly if requested
    if (validated.format === 'pdf' && pdfBuffer) {
      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="modelo-${validated.reportType}-${validated.fiscalYear}-${reportId}.pdf"`,
        },
      });
    }

    // Return JSON or CSV response
    const response = {
      success: true,
      reportId,
      report,
      taxCalculation: {
        totalGains: taxCalculation.summary.totalGains,
        totalLosses: taxCalculation.summary.totalLosses,
        netGainLoss: taxCalculation.summary.netResult,
        taxableAmount: taxCalculation.summary.netResult,
        transactionCount: exchangeTransactions.length,
      },
      format: validated.format,
      ...(validated.format === 'csv' && { csv: formattedOutput }),
      ...(validated.format === 'json' && { data: formattedOutput }),
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error generating report from exchange:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Failed to generate report from exchange API',
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

