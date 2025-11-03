/**
 * Coinbase Advanced Trade API Strategy
 * Implements the exchange-specific logic for fetching and transforming Coinbase data
 * 
 * API Documentation: https://docs.cdp.coinbase.com/advanced-trade-api/docs/
 * Authentication: https://docs.cdp.coinbase.com/coinbase-app/authentication-authorization/api-key-authentication
 */

import crypto from 'crypto';
import { generateJwt } from '@coinbase/cdp-sdk/auth';

export interface CoinbaseCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface CoinbaseTransaction {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  asset: string;
  amount: number;
  price: number;
  fee: number;
  feeAsset: string;
  total: number;
  raw: any;
}

export class CoinbaseStrategy {
  private baseUrl = 'https://api.coinbase.com';

  /**
   * Generate JWT token for Coinbase API authentication using the official CDP SDK
   * Based on: https://docs.cdp.coinbase.com/get-started/authentication/jwt-authentication
   * 
   * The CDP SDK handles all key formats automatically (PEM or base64)
   * Accepts:
   * - apiKeyId: UUID, "name" or "organizations/{org_id}/apiKeys/{key_id}" format  
   * - privateKey: Private key from CDP JSON file (any supported format)
   */
  private async generateJWT(
    apiKeyId: string,
    privateKey: string,
    requestMethod: string,
    requestPath: string
  ): Promise<string> {
    try {
      console.log('[Coinbase] Generating JWT using CDP SDK...');
      console.log('[Coinbase] API Key ID:', apiKeyId);
      console.log('[Coinbase] Private key length:', privateKey.length);
      console.log('[Coinbase] Private key format:', privateKey.includes('BEGIN') ? 'PEM' : 'base64');
      
      // Use the official CDP SDK to generate JWT
      // It handles both PEM and base64 formats automatically
      const token = await generateJwt({
        apiKeyId: apiKeyId,
        apiKeySecret: privateKey.trim(),
        requestMethod: requestMethod,
        requestHost: this.baseUrl.replace('https://', ''),
        requestPath: requestPath,
        expiresIn: 120,
      });

      console.log('[Coinbase] JWT generated successfully');
      return token;
    } catch (error) {
      console.error('[Coinbase] Error generating JWT:', error);
      console.error('[Coinbase] API Key ID:', apiKeyId);
      console.error('[Coinbase] Private key preview:', privateKey.substring(0, 50) + '...');
      
      throw new Error(`Failed to generate JWT with Coinbase CDP SDK. Please ensure you're using the correct values from your cdp_api_key.json file. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make authenticated request to Coinbase Advanced Trade API
   */
  private async makeRequest(
    endpoint: string,
    credentials: CoinbaseCredentials,
    method: 'GET' | 'POST' = 'GET',
    params?: Record<string, any>
  ): Promise<any> {
    // Build full path with query params for GET requests
    let fullPath = endpoint;
    if (method === 'GET' && params) {
      const queryString = new URLSearchParams(params).toString();
      fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;
    }

    // Generate JWT for authentication using CDP SDK
    const jwtToken = await this.generateJWT(
      credentials.apiKey.trim(),
      credentials.apiSecret.trim(),
      method,
      endpoint // Use endpoint without params for JWT generation
    );

    const url = `${this.baseUrl}${fullPath}`;

    console.log('[Coinbase] Request URL:', url);
    console.log('[Coinbase] Method:', method);

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    };

    // Add body for POST requests
    if (method === 'POST' && params) {
      requestOptions.body = JSON.stringify(params);
    }

    const response = await fetch(url, requestOptions);

    console.log('[Coinbase] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      
      try {
        const error = JSON.parse(errorText);
        console.error('[Coinbase] API Error Response:', error);
        
        // Provide more specific error messages
        if (response.status === 401) {
          errorMessage = 'API key inválida o expirada. Verifica tus credenciales en Coinbase';
        } else if (response.status === 403) {
          errorMessage = 'Permisos insuficientes. Asegúrate de que tu API key tenga permiso "View"';
        } else if (response.status === 429) {
          errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo';
        } else {
          errorMessage = error.message || error.error || response.statusText;
        }
      } catch {
        errorMessage = errorText || response.statusText;
      }
      
      throw new Error(`Coinbase API Error (${response.status}): ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Test if the API credentials are valid
   */
  async testConnection(credentials: CoinbaseCredentials): Promise<boolean> {
    try {
      console.log('[Coinbase] Testing connection...');
      console.log('[Coinbase] API Key length:', credentials.apiKey?.length || 0);
      console.log('[Coinbase] API Secret length:', credentials.apiSecret?.length || 0);
      console.log('[Coinbase] API Key preview:', credentials.apiKey?.substring(0, 20));
      console.log('[Coinbase] Private Key format:', credentials.apiSecret?.includes('BEGIN') ? 'PEM' : 'base64/other');
      
      await this.makeRequest('/api/v3/brokerage/accounts', credentials, 'GET', { limit: 1 });
      console.log('[Coinbase] Connection test successful!');
      return true;
    } catch (error) {
      console.error('[Coinbase] Connection test failed:', error);
      if (error instanceof Error) {
        console.error('[Coinbase] Error message:', error.message);
        console.error('[Coinbase] Error stack:', error.stack);
      }
      throw error; // Re-throw para que el endpoint pueda capturar el error específico
    }
  }

  /**
   * Fetch all accounts
   * Endpoint: GET /api/v3/brokerage/accounts
   * Docs: https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/rest-api/accounts/list-accounts
   */
  async fetchAccounts(credentials: CoinbaseCredentials): Promise<any[]> {
    try {
      console.log('[Coinbase] Fetching accounts...');
      
      const response = await this.makeRequest(
        '/api/v3/brokerage/accounts',
        credentials,
        'GET',
        { limit: 250 } // Max limit
      );

      const accounts = response.accounts || [];
      console.log(`[Coinbase] Found ${accounts.length} accounts`);
      
      return accounts;
    } catch (error) {
      console.error('[Coinbase] Failed to fetch accounts:', error);
      return [];
    }
  }

  /**
   * Fetch fills (completed orders) for transaction history
   * Endpoint: GET /api/v3/brokerage/orders/historical/fills
   * Docs: https://docs.cdp.coinbase.com/advanced-trade-api/docs/rest-api-fills
   */
  async fetchFills(
    credentials: CoinbaseCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<CoinbaseTransaction[]> {
    try {
      console.log('[Coinbase] Fetching fills (transaction history)...');
      
      const params: Record<string, any> = {
        limit: 1000, // Max limit per request
      };
      
      // Add date filters if provided
      if (startDate) {
        params.start_sequence_timestamp = startDate.toISOString();
      }
      if (endDate) {
        params.end_sequence_timestamp = endDate.toISOString();
      }

      const response = await this.makeRequest(
        '/api/v3/brokerage/orders/historical/fills',
        credentials,
        'GET',
        params
      );

      const fills = response.fills || [];
      console.log(`[Coinbase] Found ${fills.length} fills`);

      // Transform Coinbase fills to standard transaction format
      const transactions: CoinbaseTransaction[] = fills.map((fill: any) => {
        // Parse product_id (e.g., "BTC-USD" -> base: BTC, quote: USD)
        const [baseAsset, quoteAsset] = fill.product_id.split('-');
        
        return {
          id: fill.trade_id || fill.entry_id,
          timestamp: new Date(fill.trade_time).getTime(),
          type: fill.side.toLowerCase() as 'buy' | 'sell',
          asset: baseAsset,
          amount: parseFloat(fill.size),
          price: parseFloat(fill.price),
          fee: parseFloat(fill.commission) || 0,
          feeAsset: quoteAsset,
          total: parseFloat(fill.size) * parseFloat(fill.price),
          raw: fill,
        };
      });

      return transactions;
    } catch (error) {
      console.error('[Coinbase] Failed to fetch fills:', error);
      return [];
    }
  }

  /**
   * Fetch all transactions for the account
   * For Coinbase, this primarily consists of fills (trades)
   * Note: Coinbase Advanced Trade API focuses on trading, not deposits/withdrawals
   */
  async fetchAllTransactions(
    credentials: CoinbaseCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<CoinbaseTransaction[]> {
    console.log('[Coinbase] Starting comprehensive transaction fetch...');

    // Fetch fills (trades)
    const fills = await this.fetchFills(credentials, startDate, endDate);

    // Sort by timestamp
    const allTransactions = [...fills];
    allTransactions.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`[Coinbase] ✅ Total transactions: ${allTransactions.length}`);
    console.log(`[Coinbase]    - Fills/Trades: ${fills.length}`);

    return allTransactions;
  }

  /**
   * Get mock/demo data for testing
   */
  getMockTransactions(startDate?: Date, endDate?: Date): CoinbaseTransaction[] {
    const now = Date.now();
    const yearAgo = now - (365 * 24 * 60 * 60 * 1000);

    const mockData: CoinbaseTransaction[] = [
      {
        id: 'fill-1',
        timestamp: yearAgo + (30 * 24 * 60 * 60 * 1000),
        type: 'buy',
        asset: 'BTC',
        amount: 0.5,
        price: 35000,
        fee: 87.5,
        feeAsset: 'USD',
        total: 17500,
        raw: {},
      },
      {
        id: 'fill-2',
        timestamp: yearAgo + (90 * 24 * 60 * 60 * 1000),
        type: 'buy',
        asset: 'ETH',
        amount: 5,
        price: 2000,
        fee: 50,
        feeAsset: 'USD',
        total: 10000,
        raw: {},
      },
      {
        id: 'fill-3',
        timestamp: yearAgo + (180 * 24 * 60 * 60 * 1000),
        type: 'sell',
        asset: 'BTC',
        amount: 0.2,
        price: 42000,
        fee: 42,
        feeAsset: 'USD',
        total: 8400,
        raw: {},
      },
      {
        id: 'fill-4',
        timestamp: yearAgo + (270 * 24 * 60 * 60 * 1000),
        type: 'sell',
        asset: 'ETH',
        amount: 2,
        price: 2500,
        fee: 25,
        feeAsset: 'USD',
        total: 5000,
        raw: {},
      },
    ];

    return mockData.filter(tx => {
      if (startDate && tx.timestamp < startDate.getTime()) return false;
      if (endDate && tx.timestamp > endDate.getTime()) return false;
      return true;
    });
  }
}

export const coinbaseStrategy = new CoinbaseStrategy();

