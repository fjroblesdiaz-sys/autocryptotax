/**
 * API Route: Generate Tax Report
 * POST /api/reports/generate
 * 
 * Generates tax declarations from wallet data
 * Supports third-party API access
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchWalletTransactions } from '@/features/reports/services/blockchain.service';
import { processBlockchainTransactions, calculateTaxFIFO } from '@/features/reports/services/tax-calculation.service';
import { generateModel100Report, formatModel100CSV, formatReportJSON } from '@/features/reports/services/report-format.service';
import { generateModel100PDF } from '@/features/reports/services/pdf-generator.service';

// Request validation schema
const GenerateReportSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  chain: z.string().default('ethereum'),
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

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = GenerateReportSchema.parse(body);

    // TODO: Add authentication/API key validation for production
    // const apiKey = request.headers.get('X-API-Key');
    // if (!apiKey || !await validateApiKey(apiKey)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Step 1: Fetch blockchain transactions
    console.log(`Fetching transactions for wallet: ${validated.walletAddress}`);
    const transactionData = await fetchWalletTransactions(
      validated.walletAddress,
      validated.chain,
      validated.dateRange
    );

    if (transactionData.transactions.length === 0) {
      return NextResponse.json({
        error: 'No transactions found for the specified wallet and time period',
        details: 'The wallet may be new or have no activity in the specified date range'
      }, { status: 404 });
    }

    // Step 2: Process transactions (categorize, get prices, etc.)
    console.log(`Processing ${transactionData.transactions.length} transactions`);
    const pricesMap = new Map(); // TODO: Fetch actual historical prices
    const processedTransactions = processBlockchainTransactions(
      transactionData.transactions,
      validated.walletAddress,
      pricesMap
    );

    // Step 3: Calculate taxes using FIFO method
    console.log(`Calculating taxes for fiscal year ${validated.fiscalYear}`);
    const taxCalculation = calculateTaxFIFO(
      processedTransactions,
      validated.fiscalYear
    );

    // Step 4: Generate report in requested format
    let report;
    let formattedOutput;
    let pdfBuffer: Buffer | undefined;

    switch (validated.reportType) {
      case 'model-100':
        report = generateModel100Report(taxCalculation, {
          nif: validated.taxpayerInfo?.nif || '',
          name: validated.taxpayerInfo?.name || '',
          surname: validated.taxpayerInfo?.surname || '',
        });

        if (validated.format === 'pdf') {
          // Generate PDF
          pdfBuffer = await generateModel100PDF(report, taxCalculation, {
            includeWatermark: true, // Mark as informative document
          });
          formattedOutput = 'PDF generated';
        } else if (validated.format === 'csv') {
          formattedOutput = formatModel100CSV(report);
        } else {
          formattedOutput = formatReportJSON(report);
        }
        break;

      case 'model-720':
        // TODO: Implement Model 720 generation
        return NextResponse.json({
          error: 'Model 720 generation not yet implemented',
          message: 'This feature is under development'
        }, { status: 501 });

      case 'model-714':
        // TODO: Implement Model 714 generation
        return NextResponse.json({
          error: 'Model 714 generation not yet implemented',
          message: 'This feature is under development'
        }, { status: 501 });

      default:
        return NextResponse.json({
          error: 'Invalid report type'
        }, { status: 400 });
    }

    // Step 5: Return the generated report
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // TODO: Save report to database for download later
    // await saveReport(reportId, report, formattedOutput, pdfBuffer);

    // If PDF format, return the file directly
    if (validated.format === 'pdf' && pdfBuffer) {
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="modelo-${validated.reportType}-${validated.fiscalYear}-${reportId}.pdf"`,
        },
      });
    }

    // For JSON and CSV, return structured response
    return NextResponse.json({
      success: true,
      reportId,
      report: validated.format === 'json' ? JSON.parse(formattedOutput) : undefined,
      downloadUrl: `/api/reports/download/${reportId}`,
      summary: {
        fiscalYear: validated.fiscalYear,
        reportType: validated.reportType,
        walletAddress: validated.walletAddress,
        totalTransactions: taxCalculation.transactions.length,
        totalGains: taxCalculation.summary.totalGains,
        totalLosses: taxCalculation.summary.totalLosses,
        netResult: taxCalculation.summary.netResult,
        generatedAt: new Date().toISOString(),
      },
      // Include raw data in CSV response
      ...(validated.format === 'csv' && { csv: formattedOutput }),
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating report:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }, { status: 400 });
    }

    // Handle other errors
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

// GET endpoint to check API status
export async function GET() {
  return NextResponse.json({
    service: 'Tax Report Generation API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      generate: 'POST /api/reports/generate',
      download: 'GET /api/reports/download/:reportId',
    },
    supportedReportTypes: ['model-100', 'model-720', 'model-714'],
    supportedFormats: ['json', 'csv', 'pdf'],
    documentation: '/api/docs',
  });
}

