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
  console.log(`[Exchange API] Converting ${exchangeTransactions.length} transactions to ProcessedTransaction format`);
  
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

    // For deposits/withdrawals with no price, we need to use a market price
    // In production, this should fetch from a price API
    // For now, use mock prices for common cryptocurrencies
    let priceEUR = tx.price;
    let valueEUR = tx.total;
    
    if (tx.price === 0 || tx.total === 0) {
      // Mock prices in EUR (approximate market prices for testing)
      const mockPrices: Record<string, number> = {
        // Stablecoins
        'USDT': 0.92,
        'USDC': 0.92,
        'BUSD': 0.92,
        'DAI': 0.92,
        'TUSD': 0.92,
        // Major cryptocurrencies
        'BTC': 85000,
        'ETH': 3200,
        'BNB': 580,
        'SOL': 140,
        'XRP': 0.50,
        'ADA': 0.45,
        'DOGE': 0.08,
        'DOT': 6.5,
        'MATIC': 0.85,
        'LTC': 85,
        'AVAX': 35,
        'LINK': 14,
        'UNI': 8,
        'ATOM': 10,
        // Other tokens
        'NXPC': 0.01, // Unknown token, use minimal price
      };
      
      priceEUR = mockPrices[tx.asset] || 1.0; // Default to 1 EUR if not found
      valueEUR = tx.amount * priceEUR;
      
      if (!mockPrices[tx.asset]) {
        console.warn(`[Exchange API] No mock price for ${tx.asset}, using 1 EUR`);
      }
    }

    // Calculate fee value
    const feeValueEUR = tx.fee > 0 && priceEUR > 0 ? tx.fee * priceEUR : 0;

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
      // Add summary field for frontend compatibility
      summary: {
        totalTransactions: taxCalculation.summary.totalTransactions,
        totalGains: taxCalculation.summary.totalGains,
        totalLosses: taxCalculation.summary.totalLosses,
        netResult: taxCalculation.summary.netResult,
        generatedAt: new Date().toISOString(),
      },
      format: validated.format,
      ...(validated.format === 'csv' && { csv: formattedOutput }),
      ...(validated.format === 'json' && { data: formattedOutput }),
    };

    console.log(`[Exchange API] Successfully generated report:`, {
      reportId,
      transactionCount: exchangeTransactions.length,
      totalGains: taxCalculation.summary.totalGains,
      totalLosses: taxCalculation.summary.totalLosses,
      netResult: taxCalculation.summary.netResult,
    });

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

