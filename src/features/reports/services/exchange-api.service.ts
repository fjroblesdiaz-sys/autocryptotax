/**
 * Exchange API Service
 * Handles secure server-side communication with crypto exchange APIs
 * Uses strategy pattern for exchange-specific implementations
 * 
 * Currently Supported: Binance, Coinbase, WhiteBit
 */

import crypto from 'crypto';
import { binanceStrategy } from './exchange-strategies/binance.strategy';
import { coinbaseStrategy } from './exchange-strategies/coinbase.strategy';
import { whitebitStrategy } from './exchange-strategies/whitebit.strategy';

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
 * Coinbase Advanced Trade API Integration (using strategy pattern)
 * Docs: https://docs.cdp.coinbase.com/advanced-trade-api/docs/
 */
class CoinbaseAPI {
  async fetchTransactions(
    credentials: ExchangeCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<ExchangeTransaction[]> {
    // For testing/demo: Return mock data if using test credentials
    if (credentials.apiKey === 'test' || credentials.apiKey === 'demo') {
      const mockData = coinbaseStrategy.getMockTransactions(startDate, endDate);
      return mockData.map(tx => ({ ...tx, exchange: 'coinbase' as const }));
    }

    try {
      console.log('[Coinbase Service] Starting transaction fetch...');
      
      // Use the Coinbase strategy to fetch all transactions
      const transactions = await coinbaseStrategy.fetchAllTransactions(
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
        exchange: 'coinbase' as const,
      }));

    } catch (error) {
      console.error('[Coinbase Service] Error:', error);
      throw new Error(`Failed to fetch Coinbase transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(credentials: ExchangeCredentials): Promise<boolean> {
    // Allow test credentials
    if (credentials.apiKey === 'test' || credentials.apiKey === 'demo') {
      return true;
    }

    try {
      return await coinbaseStrategy.testConnection({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
      });
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
  async fetchTransactions(
    credentials: ExchangeCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<ExchangeTransaction[]> {
    // For testing/demo: Return mock data if using test credentials
    if (credentials.apiKey === 'test' || credentials.apiKey === 'demo') {
      const mockData = whitebitStrategy.getMockTransactions(startDate, endDate);
      return mockData.map(tx => ({ ...tx, exchange: 'whitebit' as const }));
    }

    try {
      console.log('[WhiteBit Service] Starting transaction fetch...');
      
      // Use the WhiteBit strategy to fetch all transactions
      const transactions = await whitebitStrategy.fetchAllTransactions(
        {
          apiKey: credentials.apiKey,
          apiSecret: credentials.apiSecret,
        },
        startDate,
        endDate
      );

      // Transform to standard format
      const standardTransactions = whitebitStrategy.transformToStandardFormat(transactions);

      // Convert to ExchangeTransaction format
      return standardTransactions.map(tx => ({
        id: tx.id,
        timestamp: new Date(tx.timestamp).getTime(),
        type: tx.type as 'buy' | 'sell',
        asset: tx.baseAsset,
        amount: tx.amount,
        price: tx.price,
        fee: tx.fee,
        feeAsset: tx.feeAsset,
        total: tx.total,
        exchange: 'whitebit' as const,
        raw: tx,
      }));

    } catch (error) {
      console.error('[WhiteBit Service] Error:', error);
      throw new Error(`Failed to fetch WhiteBit transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(credentials: ExchangeCredentials): Promise<boolean> {
    // Allow test credentials
    if (credentials.apiKey === 'test' || credentials.apiKey === 'demo') {
      return true;
    }

    try {
      return await whitebitStrategy.testConnection({
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
      });
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

