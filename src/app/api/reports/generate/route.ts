/**
 * API Route: Generate Tax Report
 * POST /api/reports/generate
 * 
 * Generates tax declarations from wallet data
 * Saves to database and uploads to Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchWalletTransactions } from '@/features/reports/services/blockchain.service';
import { processBlockchainTransactions, calculateTaxFIFO } from '@/features/reports/services/tax-calculation.service';
import { generateModel100Report, formatModel100CSV, formatReportJSON } from '@/features/reports/services/report-format.service';
import { generateModel100PDF } from '@/features/reports/services/pdf-generator.service';
import { prisma } from '@/lib/prisma';
import { uploadReportToCloudinary } from '@/lib/cloudinary';

// Request validation schema
const GenerateReportSchema = z.object({
  reportRequestId: z.string().optional(), // ID of existing report request to update
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
  format: z.enum(['json', 'csv', 'pdf']).default('pdf'),
});

type GenerateReportRequest = z.infer<typeof GenerateReportSchema>;

export async function POST(request: NextRequest) {
  let reportRequest: any = null;
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = GenerateReportSchema.parse(body);

    // Step 0: Create or update report request in database
    if (validated.reportRequestId) {
      reportRequest = await prisma.reportRequest.update({
        where: { id: validated.reportRequestId },
        data: {
          status: 'processing',
          dataSource: 'wallet',
          sourceData: {
            walletAddress: validated.walletAddress,
            chain: validated.chain,
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
    } else {
      reportRequest = await prisma.reportRequest.create({
        data: {
          status: 'processing',
          dataSource: 'wallet',
          sourceData: {
            walletAddress: validated.walletAddress,
            chain: validated.chain,
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
    }

    // TODO: Add authentication/API key validation for production
    // const apiKey = request.headers.get('X-API-Key');
    // if (!apiKey || !await validateApiKey(apiKey)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Step 1: Fetch blockchain transactions
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
    const pricesMap = new Map(); // TODO: Fetch actual historical prices
    const processedTransactions = processBlockchainTransactions(
      transactionData.transactions,
      validated.walletAddress,
      pricesMap
    );

    // Step 3: Calculate taxes using FIFO method
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
          formattedOutput = formatModel100CSV(report, taxCalculation);
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

    // Step 5: Upload to Cloudinary
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
    } catch (cloudinaryError) {
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

    // Step 6: Update database with final report data
    const updatedReportRequest = await prisma.reportRequest.update({
      where: { id: reportRequest.id },
      data: {
        status: 'completed',
        generatedReport: report as any, // Cast to any for Prisma Json field
        cloudinaryPublicId: cloudinaryResult.public_id,
        cloudinaryUrl: cloudinaryResult.secure_url,
        totalTransactions: taxCalculation.transactions.length,
        totalGains: taxCalculation.summary.totalGains,
        totalLosses: taxCalculation.summary.totalLosses,
        netResult: taxCalculation.summary.netResult,
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      reportRequestId: reportRequest.id,
      reportRequest: updatedReportRequest,
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
    }, { status: 200 });

  } catch (error) {
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
        // Silent error handling
      }
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
        reportRequestId: reportRequest?.id,
      }, { status: 400 });
    }

    // Handle other errors
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      reportRequestId: reportRequest?.id,
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

