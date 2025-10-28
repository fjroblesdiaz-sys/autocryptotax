import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { exchangeAPIService } from '@/features/reports/services/exchange-api.service';

/**
 * API Route: Test Exchange API Connection
 * POST /api/exchange/test-connection
 * 
 * Tests if the provided API credentials are valid
 */

const requestSchema = z.object({
  exchange: z.enum(['binance', 'coinbase', 'whitebit']),
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
  passphrase: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validated = requestSchema.parse(body);

    console.log(`Testing connection to ${validated.exchange}...`);

    // Test connection
    const isValid = await exchangeAPIService.testConnection(
      validated.exchange,
      {
        apiKey: validated.apiKey,
        apiSecret: validated.apiSecret,
        passphrase: validated.passphrase,
      }
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API credentials or connection failed',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected to ${validated.exchange}`,
    });

  } catch (error) {
    console.error('Error testing exchange connection:', error);

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
        error: error instanceof Error ? error.message : 'Failed to test connection',
      },
      { status: 500 }
    );
  }
}

