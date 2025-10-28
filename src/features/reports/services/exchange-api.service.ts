/**
 * Exchange API Service
 * Handles secure server-side communication with crypto exchange APIs
 * Uses strategy pattern for exchange-specific implementations
 * 
 * Currently Supported: Binance
 * Coming Soon: Coinbase, WhiteBit
 */

import crypto from 'crypto';
import { binanceStrategy } from './exchange-strategies/binance.strategy';

export type ExchangeType = 'binance' | 'coinbase' | 'whitebit';

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // For Coinbase
}

export interface ExchangeTransaction {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer' | 'deposit' | 'withdrawal';
  asset: string;
  amount: number;
  price: number;
  fee: number;
  feeAsset: string;
  total: number;
  exchange: ExchangeType;
  raw: any; // Original response for debugging
}

/**
 * Binance API Integration (using strategy pattern)
 * Docs: https://developers.binance.com/docs/binance-spot-api-docs/rest-api
 */
class BinanceAPI {
  async fetchTransactions(
    credentials: ExchangeCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<ExchangeTransaction[]> {
    // For testing/demo: Return mock data if using test credentials
    if (credentials.apiKey === 'test' || credentials.apiKey === 'demo') {
      const mockData = binanceStrategy.getMockTransactions(startDate, endDate);
      return mockData.map(tx => ({ ...tx, exchange: 'binance' as const }));
    }

    try {
      console.log('[Binance Service] Starting transaction fetch...');
      
      // Use the Binance strategy to fetch all transactions
      const transactions = await binanceStrategy.fetchAllTransactions(
        {
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret,
        },
        startDate,
        endDate
      );

      // Convert to ExchangeTransaction format
      return transactions.map(tx => ({
        ...tx,
        exchange: 'binance' as const,
      }));

    } catch (error) {
      console.error('[Binance Service] Error:', error);
      throw new Error(`Failed to fetch Binance transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(credentials: ExchangeCredentials): Promise<boolean> {
    // Allow test credentials
    if (credentials.apiKey === 'test' || credentials.apiKey === 'demo') {
      return true;
    }

    try {
      return await binanceStrategy.testConnection({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
      });
    } catch {
      return false;
    }
  }
}

/**
 * Coinbase Advanced Trade API Integration
 * Docs: https://docs.cloud.coinbase.com/advanced-trade-api/docs/
 */
class CoinbaseAPI {
  private baseUrl = 'https://api.coinbase.com/api/v3/brokerage';

  private createSignature(
    timestamp: string,
    method: string,
    path: string,
    body: string,
    apiSecret: string
  ): string {
    const message = timestamp + method + path + body;
    return crypto
      .createHmac('sha256', apiSecret)
      .update(message)
      .digest('hex');
  }

  async fetchTransactions(
    credentials: ExchangeCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<ExchangeTransaction[]> {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const method = 'GET';
      const path = '/orders/historical/fills';
      
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());
      
      const fullPath = params.toString() ? `${path}?${params.toString()}` : path;
      const signature = this.createSignature(timestamp, method, fullPath, '', credentials.apiSecret);

      const response = await fetch(`${this.baseUrl}${fullPath}`, {
        method,
        headers: {
          'CB-ACCESS-KEY': credentials.apiKey,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp,
          'CB-VERSION': '2023-01-01',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Coinbase API Error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      const fills = data.fills || [];

      // Transform to standard format
      return fills.map((fill: any) => ({
        id: fill.trade_id,
        timestamp: new Date(fill.trade_time).getTime(),
        type: fill.side.toLowerCase() as 'buy' | 'sell',
        asset: fill.product_id.split('-')[0],
        amount: parseFloat(fill.size),
        price: parseFloat(fill.price),
        fee: parseFloat(fill.commission),
        feeAsset: fill.product_id.split('-')[1],
        total: parseFloat(fill.size) * parseFloat(fill.price),
        exchange: 'coinbase' as const,
        raw: fill,
      }));
    } catch (error) {
      console.error('Coinbase API Error:', error);
      throw new Error(`Failed to fetch Coinbase transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(credentials: ExchangeCredentials): Promise<boolean> {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const method = 'GET';
      const path = '/accounts';
      const signature = this.createSignature(timestamp, method, path, '', credentials.apiSecret);

      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'CB-ACCESS-KEY': credentials.apiKey,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp,
          'CB-VERSION': '2023-01-01',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * WhiteBit API Integration
 * Docs: https://docs.whitebit.com/
 */
class WhiteBitAPI {
  private baseUrl = 'https://whitebit.com/api/v4';

  private createSignature(data: string, apiSecret: string): string {
    return crypto
      .createHmac('sha512', apiSecret)
      .update(data)
      .digest('hex');
  }

  async fetchTransactions(
    credentials: ExchangeCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<ExchangeTransaction[]> {
    try {
      const nonce = Date.now().toString();
      const body = JSON.stringify({
        request: '/api/v4/trade-account/history',
        nonce,
        ...(startDate && { start: Math.floor(startDate.getTime() / 1000) }),
        ...(endDate && { end: Math.floor(endDate.getTime() / 1000) }),
      });

      const signature = this.createSignature(body, credentials.apiSecret);

      const response = await fetch(`${this.baseUrl}/trade-account/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TXC-APIKEY': credentials.apiKey,
          'X-TXC-PAYLOAD': Buffer.from(body).toString('base64'),
          'X-TXC-SIGNATURE': signature,
        },
        body,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhiteBit API Error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      const records = data.records || [];

      // Transform to standard format
      return records.map((record: any) => ({
        id: record.id.toString(),
        timestamp: record.time * 1000,
        type: record.side.toLowerCase() as 'buy' | 'sell',
        asset: record.market.split('_')[0],
        amount: parseFloat(record.amount),
        price: parseFloat(record.price),
        fee: parseFloat(record.fee),
        feeAsset: record.market.split('_')[1],
        total: parseFloat(record.deal),
        exchange: 'whitebit' as const,
        raw: record,
      }));
    } catch (error) {
      console.error('WhiteBit API Error:', error);
      throw new Error(`Failed to fetch WhiteBit transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(credentials: ExchangeCredentials): Promise<boolean> {
    try {
      const nonce = Date.now().toString();
      const body = JSON.stringify({
        request: '/api/v4/trade-account/balance',
        nonce,
      });

      const signature = this.createSignature(body, credentials.apiSecret);

      const response = await fetch(`${this.baseUrl}/trade-account/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TXC-APIKEY': credentials.apiKey,
          'X-TXC-PAYLOAD': Buffer.from(body).toString('base64'),
          'X-TXC-SIGNATURE': signature,
        },
        body,
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Main Exchange API Service
 * Factory pattern to handle multiple exchanges
 */
export const exchangeAPIService = {
  binance: new BinanceAPI(),
  coinbase: new CoinbaseAPI(),
  whitebit: new WhiteBitAPI(),

  async fetchTransactions(
    exchange: ExchangeType,
    credentials: ExchangeCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<ExchangeTransaction[]> {
    const api = this[exchange];
    if (!api) {
      throw new Error(`Unsupported exchange: ${exchange}`);
    }

    return api.fetchTransactions(credentials, startDate, endDate);
  },

  async testConnection(
    exchange: ExchangeType,
    credentials: ExchangeCredentials
  ): Promise<boolean> {
    const api = this[exchange];
    if (!api) {
      throw new Error(`Unsupported exchange: ${exchange}`);
    }

    return api.testConnection(credentials);
  },
};

