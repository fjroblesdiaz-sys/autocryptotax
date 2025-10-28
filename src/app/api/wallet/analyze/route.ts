/**
 * API Route: Analyze Wallet
 * POST /api/wallet/analyze
 * 
 * Analyzes a wallet and returns transaction data without generating a report
 * Useful for previewing data before generating a report
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchWalletTransactions } from '@/features/reports/services/blockchain.service';

const AnalyzeWalletSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  chain: z.string().default('ethereum'),
  dateRange: z.object({
    from: z.string().transform(str => new Date(str)),
    to: z.string().transform(str => new Date(str)),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AnalyzeWalletSchema.parse(body);

    // Fetch transactions
    const transactionData = await fetchWalletTransactions(
      validated.walletAddress,
      validated.chain,
      validated.dateRange
    );

    return NextResponse.json({
      success: true,
      wallet: {
        address: validated.walletAddress,
        chain: validated.chain,
      },
      analysis: {
        totalTransactions: transactionData.totalTransactions,
        dateRange: {
          from: transactionData.dateRange.from.toISOString(),
          to: transactionData.dateRange.to.toISOString(),
        },
        // Don't return full transaction data for privacy/performance
        sampleTransactions: transactionData.transactions.slice(0, 10),
      },
    });

  } catch (error) {
    console.error('Error analyzing wallet:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Wallet Analysis API',
    version: '1.0.0',
    status: 'operational',
    endpoint: 'POST /api/wallet/analyze',
    supportedChains: ['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche'],
  });
}

