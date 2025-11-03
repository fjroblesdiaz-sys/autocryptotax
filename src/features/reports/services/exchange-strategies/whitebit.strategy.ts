/**
 * WhiteBit API Strategy
 * Implements the exchange-specific logic for fetching and transforming WhiteBit data
 * 
 * API Documentation: https://docs.whitebit.com/
 * Authentication: Uses HMAC-SHA512 signature with API Key and Secret
 */

import crypto from 'crypto';

export interface WhiteBitCredentials {
  apiKey: string;
  apiSecret: string;
}

interface WhiteBitTrade {
  id: number;
  time: number; // timestamp in seconds
  deal: string; // order ID
  side: 'buy' | 'sell';
  role: number; // 1 = maker, 2 = taker
  amount: string;
  price: string;
  fee: string;
  market: string; // e.g., "BTC_USDT"
}

interface WhiteBitResponse<T> {
  success: boolean;
  result?: T;
  records?: T[];
  error?: string;
  message?: string;
}

export class WhiteBitStrategy {
  private baseUrl = 'https://whitebit.com';

  /**
   * Generate authentication signature for WhiteBit API
   * Uses HMAC-SHA512 with base64 encoded payload
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Make authenticated request to WhiteBit API
   */
  private async makeRequest(
    endpoint: string,
    credentials: WhiteBitCredentials,
    body: Record<string, any> = {}
  ): Promise<any> {
    const nonce = Date.now();
    
    // Add nonce to body
    const requestBody = {
      ...body,
      request: endpoint,
      nonce: nonce,
    };

    // Convert body to base64 encoded payload
    const payload = Buffer.from(JSON.stringify(requestBody)).toString('base64');
    
    // Generate signature
    const signature = this.generateSignature(payload, credentials.apiSecret);

    const url = `${this.baseUrl}${endpoint}`;

    console.log('[WhiteBit] Request URL:', url);
    console.log('[WhiteBit] Nonce:', nonce);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TXC-APIKEY': credentials.apiKey,
        'X-TXC-PAYLOAD': payload,
        'X-TXC-SIGNATURE': signature,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[WhiteBit] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const error = JSON.parse(errorText);
        console.error('[WhiteBit] API Error Response:', error);
        
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'API key inválida o permisos insuficientes. Verifica tus credenciales en WhiteBit';
        } else if (response.status === 429) {
          errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo';
        } else {
          errorMessage = error.message || error.error || response.statusText;
        }
      } catch {
        errorMessage = errorText || response.statusText;
      }
      
      throw new Error(`WhiteBit API Error (${response.status}): ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Test if the API credentials are valid
   */
  async testConnection(credentials: WhiteBitCredentials): Promise<boolean> {
    try {
      console.log('[WhiteBit] Testing connection...');
      console.log('[WhiteBit] API Key length:', credentials.apiKey?.length || 0);
      console.log('[WhiteBit] API Secret length:', credentials.apiSecret?.length || 0);
      
      // Use the main balance endpoint to test credentials
      await this.makeRequest('/api/v4/main-account/balance', credentials);
      
      console.log('[WhiteBit] Connection test successful!');
      return true;
    } catch (error) {
      console.error('[WhiteBit] Connection test failed:', error);
      if (error instanceof Error) {
        console.error('[WhiteBit] Error message:', error.message);
      }
      throw error;
    }
  }

  /**
   * Fetch executed trade history
   * Endpoint: POST /api/v4/trade-account/executed-history
   * Docs: https://docs.whitebit.com/private/http-trade-v4/#executed-history
   */
  async fetchExecutedHistory(
    credentials: WhiteBitCredentials,
    market?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<WhiteBitTrade[]> {
    try {
      console.log('[WhiteBit] Fetching executed history...');
      
      const body: Record<string, any> = {
        limit: Math.min(limit, 100), // WhiteBit max is typically 100
        offset: offset,
      };

      if (market) {
        body.market = market;
      }

      const response: WhiteBitResponse<WhiteBitTrade> = await this.makeRequest(
        '/api/v4/trade-account/executed-history',
        credentials,
        body
      );

      const trades = response.records || [];
      console.log('[WhiteBit] Found', trades.length, 'trades');

      return trades;
    } catch (error) {
      console.error('[WhiteBit] Error fetching executed history:', error);
      throw error;
    }
  }

  /**
   * Fetch all transactions with pagination
   */
  async fetchAllTransactions(
    credentials: WhiteBitCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    console.log('[WhiteBit] Starting comprehensive transaction fetch...');
    
    const allTransactions: any[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    // Fetch executed trades with pagination
    while (hasMore) {
      try {
        const trades = await this.fetchExecutedHistory(credentials, undefined, limit, offset);
        
        if (trades.length === 0) {
          hasMore = false;
          break;
        }

        // Filter by date if provided
        const filteredTrades = trades.filter(trade => {
          const tradeDate = new Date(trade.time * 1000); // Convert seconds to milliseconds
          if (startDate && tradeDate < startDate) return false;
          if (endDate && tradeDate > endDate) return false;
          return true;
        });

        allTransactions.push(...filteredTrades);
        
        offset += limit;

        // If we got fewer trades than the limit, we've reached the end
        if (trades.length < limit) {
          hasMore = false;
        }

        // Safety limit to prevent infinite loops
        if (offset >= 10000) {
          console.warn('[WhiteBit] Reached maximum offset limit (10000)');
          hasMore = false;
        }
      } catch (error) {
        console.error('[WhiteBit] Error during pagination at offset', offset, ':', error);
        hasMore = false;
      }
    }

    console.log('[WhiteBit] ✅ Total transactions fetched:', allTransactions.length);
    
    return allTransactions;
  }

  /**
   * Transform WhiteBit trades to standard format
   */
  transformToStandardFormat(trades: WhiteBitTrade[]): any[] {
    return trades.map(trade => {
      const [baseAsset, quoteAsset] = trade.market.split('_');
      const timestamp = new Date(trade.time * 1000);

      return {
        id: trade.id.toString(),
        timestamp: timestamp.toISOString(),
        type: trade.side,
        baseAsset: baseAsset,
        quoteAsset: quoteAsset,
        amount: parseFloat(trade.amount),
        price: parseFloat(trade.price),
        fee: parseFloat(trade.fee),
        feeAsset: trade.side === 'buy' ? baseAsset : quoteAsset,
        total: parseFloat(trade.amount) * parseFloat(trade.price),
        role: trade.role === 1 ? 'maker' : 'taker',
      };
    });
  }

  /**
   * Get mock transactions for testing
   */
  getMockTransactions(startDate?: Date, endDate?: Date): any[] {
    const now = new Date();
    const mockTrades: WhiteBitTrade[] = [
      {
        id: 1001,
        time: Math.floor(now.getTime() / 1000) - 86400, // 1 day ago
        deal: 'mock-order-1',
        side: 'buy',
        role: 2,
        amount: '0.5',
        price: '45000.00',
        fee: '0.001',
        market: 'BTC_USDT',
      },
      {
        id: 1002,
        time: Math.floor(now.getTime() / 1000) - 43200, // 12 hours ago
        deal: 'mock-order-2',
        side: 'sell',
        role: 1,
        amount: '0.3',
        price: '46000.00',
        fee: '0.0006',
        market: 'BTC_USDT',
      },
    ];

    return this.transformToStandardFormat(mockTrades);
  }
}

export const whitebitStrategy = new WhiteBitStrategy();

