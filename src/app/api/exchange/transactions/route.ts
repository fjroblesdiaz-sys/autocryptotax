import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { exchangeAPIService } from '@/features/reports/services/exchange-api.service';

/**
 * API Route: Fetch Exchange Transactions
 * POST /api/exchange/transactions
 * 
 * Fetches transaction history from a crypto exchange using API credentials
 */

const requestSchema = z.object({
  exchange: z.enum(['binance', 'coinbase', 'whitebit']),
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
  passphrase: z.string().optional(),
  dateRange: z
    .object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validated = requestSchema.parse(body);

    console.log(`Fetching transactions from ${validated.exchange}...`);

    // Parse dates if provided
    const startDate = validated.dateRange?.from
      ? new Date(validated.dateRange.from)
      : undefined;
    const endDate = validated.dateRange?.to
      ? new Date(validated.dateRange.to)
      : undefined;

    // Fetch transactions
    const transactions = await exchangeAPIService.fetchTransactions(
      validated.exchange,
      {
        apiKey: validated.apiKey,
        apiSecret: validated.apiSecret,
        passphrase: validated.passphrase,
      },
      startDate,
      endDate
    );

    console.log(`Successfully fetched ${transactions.length} transactions from ${validated.exchange}`);

    return NextResponse.json({
      success: true,
      data: {
        exchange: validated.exchange,
        transactionCount: transactions.length,
        transactions,
        dateRange: {
          from: startDate?.toISOString(),
          to: endDate?.toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching exchange transactions:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      },
      { status: 500 }
    );
  }
}

