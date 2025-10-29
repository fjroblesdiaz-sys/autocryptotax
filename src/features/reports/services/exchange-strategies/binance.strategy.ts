/**
 * Binance Exchange Strategy
 * Implements the exchange-specific logic for fetching and transforming Binance data
 * 
 * API Documentation: https://developers.binance.com/docs/binance-spot-api-docs/rest-api
 */

import crypto from 'crypto';

export interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface BinanceTransaction {
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

export class BinanceStrategy {
  private baseUrl = 'https://api.binance.com';

  /**
   * Create HMAC SHA256 signature for Binance API authentication
   */
  private createSignature(queryString: string, apiSecret: string): string {
    return crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Make authenticated request to Binance API
   */
  private async makeRequest(
    endpoint: string,
    params: Record<string, any>,
    credentials: BinanceCredentials
  ): Promise<any> {
    // Trim whitespace from credentials
    const apiKey = credentials.apiKey.trim();
    const apiSecret = credentials.apiSecret.trim();

    const timestamp = Date.now();
    const allParams: Record<string, any> = { ...params, timestamp, recvWindow: 60000 };

    const queryString = Object.keys(allParams)
      .map(key => `${key}=${allParams[key]}`)
      .join('&');

    const signature = this.createSignature(queryString, apiSecret);
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    console.log('[Binance] Request URL:', `${this.baseUrl}${endpoint}`);
    console.log('[Binance] Query params:', Object.keys(allParams).join(', '));

    const response = await fetch(url, {
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });

    console.log('[Binance] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Binance] API Error Response:', error);
      
      // Provide more specific error messages
      if (error.code === -2015) {
        throw new Error('API key inválida o incorrecta');
      } else if (error.code === -1022) {
        throw new Error('Firma inválida. Verifica tu API Secret');
      } else if (error.code === -2014) {
        throw new Error('API key no tiene permisos. Habilita "Enable Reading" en Binance');
      } else if (error.code === -2008) {
        throw new Error('Tu IP no está autorizada. Agrega tu IP en Binance o deshabilita la restricción');
      }
      
      throw new Error(`Binance API Error (${error.code}): ${error.msg || error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Test if the API credentials are valid
   */
  async testConnection(credentials: BinanceCredentials): Promise<boolean> {
    try {
      console.log('[Binance] Testing connection...');
      console.log('[Binance] API Key length:', credentials.apiKey?.length || 0);
      console.log('[Binance] API Secret length:', credentials.apiSecret?.length || 0);
      console.log('[Binance] API Key (first 8 chars):', credentials.apiKey?.substring(0, 8));
      
      await this.makeRequest('/api/v3/account', {}, credentials);
      console.log('[Binance] Connection test successful!');
      return true;
    } catch (error) {
      console.error('[Binance] Connection test failed:', error);
      if (error instanceof Error) {
        console.error('[Binance] Error message:', error.message);
      }
      return false;
    }
  }

  /**
   * Fetch account information including balances
   */
  async fetchAccountInfo(credentials: BinanceCredentials): Promise<any> {
    return this.makeRequest('/api/v3/account', {}, credentials);
  }

  /**
   * Fetch all valid trading symbols from Binance
   * This prevents "Invalid symbol" errors by only checking real trading pairs
   */
  async fetchAllSymbols(): Promise<string[]> {
    try {
      console.log('[Binance] Fetching all valid trading symbols...');
      // This endpoint doesn't require authentication
      const response = await fetch(`${this.baseUrl}/api/v3/exchangeInfo`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange info');
      }
      
      const data = await response.json();
      const symbols = data.symbols
        .filter((s: any) => s.status === 'TRADING') // Only active pairs
        .map((s: any) => s.symbol);
      
      console.log(`[Binance] Found ${symbols.length} valid trading symbols`);
      return symbols;
    } catch (error) {
      console.error('[Binance] Failed to fetch symbols:', error);
      return [];
    }
  }

  /**
   * Fetch deposit history
   */
  async fetchDeposits(
    credentials: BinanceCredentials,
    startTime?: number,
    endTime?: number
  ): Promise<BinanceTransaction[]> {
    try {
      const params: Record<string, any> = {};
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const deposits = await this.makeRequest('/sapi/v1/capital/deposit/hisrec', params, credentials);

      return deposits.map((deposit: any) => ({
        id: `deposit-${deposit.txId || deposit.id}`,
        timestamp: deposit.insertTime,
        type: 'deposit' as const,
        asset: deposit.coin,
        amount: parseFloat(deposit.amount),
        price: 0, // Deposits don't have a price
        fee: 0,
        feeAsset: deposit.coin,
        total: parseFloat(deposit.amount),
        raw: deposit,
      }));
    } catch (error) {
      console.warn('Failed to fetch Binance deposits:', error);
      return [];
    }
  }

  /**
   * Fetch withdrawal history
   */
  async fetchWithdrawals(
    credentials: BinanceCredentials,
    startTime?: number,
    endTime?: number
  ): Promise<BinanceTransaction[]> {
    try {
      const params: Record<string, any> = {};
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const withdrawals = await this.makeRequest('/sapi/v1/capital/withdraw/history', params, credentials);

      return withdrawals.map((withdrawal: any) => ({
        id: `withdrawal-${withdrawal.id}`,
        timestamp: withdrawal.applyTime || withdrawal.completeTime,
        type: 'withdrawal' as const,
        asset: withdrawal.coin,
        amount: parseFloat(withdrawal.amount),
        price: 0, // Withdrawals don't have a price
        fee: parseFloat(withdrawal.transactionFee || 0),
        feeAsset: withdrawal.coin,
        total: parseFloat(withdrawal.amount),
        raw: withdrawal,
      }));
    } catch (error) {
      console.warn('Failed to fetch Binance withdrawals:', error);
      return [];
    }
  }

  /**
   * Fetch trades for a specific symbol
   */
  async fetchTradesForSymbol(
    credentials: BinanceCredentials,
    symbol: string,
    startTime?: number,
    endTime?: number
  ): Promise<BinanceTransaction[]> {
    try {
      const params: Record<string, any> = { symbol, limit: 1000 };
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const trades = await this.makeRequest('/api/v3/myTrades', params, credentials);

      return trades.map((trade: any) => ({
        id: `trade-${symbol}-${trade.id}`,
        timestamp: trade.time,
        type: trade.isBuyer ? 'buy' as const : 'sell' as const,
        asset: this.extractBaseAsset(symbol),
        amount: parseFloat(trade.qty),
        price: parseFloat(trade.price),
        fee: parseFloat(trade.commission),
        feeAsset: trade.commissionAsset,
        total: parseFloat(trade.quoteQty),
        raw: trade,
      }));
    } catch (error) {
      // Silently skip invalid symbols - this is expected when checking trading pairs
      // Only log if it's not an "Invalid symbol" error
      if (error instanceof Error && !error.message.includes('Invalid symbol') && !error.message.includes('-1121')) {
        console.warn(`[Binance] Error fetching trades for ${symbol}:`, error.message);
      }
      return [];
    }
  }

  /**
   * Extract base asset from trading pair symbol
   * Examples: BTCUSDT -> BTC, ETHBTC -> ETH
   */
  private extractBaseAsset(symbol: string): string {
    // Common quote assets in order of priority
    const quoteAssets = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB', 'EUR', 'GBP'];
    
    for (const quote of quoteAssets) {
      if (symbol.endsWith(quote)) {
        return symbol.slice(0, -quote.length);
      }
    }
    
    // If no match, return first 3-4 characters as a guess
    return symbol.slice(0, symbol.length > 6 ? 4 : 3);
  }

  /**
   * Fetch all transactions (deposits, withdrawals, trades) for the account
   */
  async fetchAllTransactions(
    credentials: BinanceCredentials,
    startDate?: Date,
    endDate?: Date
  ): Promise<BinanceTransaction[]> {
    const startTime = startDate?.getTime();
    const endTime = endDate?.getTime();

    console.log('[Binance] Fetching account info...');
    
    // Step 1: Get account info to find balances
    const accountInfo = await this.fetchAccountInfo(credentials);
    const balances = accountInfo.balances || [];

    // Get assets with non-zero balances or history
    const assetsWithBalance = balances
      .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b: any) => b.asset);

    console.log(`[Binance] Found ${assetsWithBalance.length} assets with balance:`, assetsWithBalance.slice(0, 10));

    // Step 2: Fetch all valid trading symbols from Binance
    console.log('[Binance] Fetching valid trading symbols...');
    const allValidSymbols = await this.fetchAllSymbols();
    
    // Step 3: Fetch deposits and withdrawals
    console.log('[Binance] Fetching deposits and withdrawals...');
    const [deposits, withdrawals] = await Promise.all([
      this.fetchDeposits(credentials, startTime, endTime),
      this.fetchWithdrawals(credentials, startTime, endTime),
    ]);

    console.log(`[Binance] Found ${deposits.length} deposits and ${withdrawals.length} withdrawals`);

    // Get all assets from deposits and withdrawals
    const allAssets = new Set<string>([
      ...assetsWithBalance,
      ...deposits.map(d => d.asset),
      ...withdrawals.map(w => w.asset),
    ]);

    console.log(`[Binance] Total unique assets to check: ${allAssets.size}`, Array.from(allAssets));

    // Step 4: Build list of trading pairs to check (only valid ones)
    const commonQuoteAssets = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB', 'EUR', 'GBP', 'TRY', 'FDUSD'];
    const symbolsToCheck = new Set<string>();

    // Generate potential symbols from all assets and filter against valid symbols
    allAssets.forEach((asset: string) => {
      commonQuoteAssets.forEach(quote => {
        if (asset !== quote) {
          const symbol = `${asset}${quote}`;
          if (allValidSymbols.includes(symbol)) {
            symbolsToCheck.add(symbol);
          }
        }
      });
    });

    // Also check reverse pairs (e.g., BTCETH, ETHBTC)
    const majorAssets = ['BTC', 'ETH', 'BNB', 'USDT'];
    majorAssets.forEach(major => {
      allAssets.forEach((asset: string) => {
        if (asset !== major) {
          const symbol = `${asset}${major}`;
          if (allValidSymbols.includes(symbol)) {
            symbolsToCheck.add(symbol);
          }
        }
      });
    });

    console.log(`[Binance] Checking ${symbolsToCheck.size} valid trading pairs (filtered from ${allValidSymbols.length} total symbols)`);

    // Step 5: Fetch trades for each symbol (with rate limiting)
    const allTrades: BinanceTransaction[] = [];
    const symbolArray = Array.from(symbolsToCheck);
    const batchSize = 20; // Process 20 symbols at a time (faster now that we only check valid ones)

    for (let i = 0; i < symbolArray.length; i += batchSize) {
      const batch = symbolArray.slice(i, i + batchSize);
      
      console.log(`[Binance] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(symbolArray.length / batchSize)} (${batch.length} symbols)`);
      
      const batchTrades = await Promise.all(
        batch.map(symbol => this.fetchTradesForSymbol(credentials, symbol, startTime, endTime))
      );

      batchTrades.forEach((trades, index) => {
        if (trades.length > 0) {
          console.log(`[Binance] ✓ ${batch[index]}: ${trades.length} trades`);
          allTrades.push(...trades);
        }
      });

      // Small delay between batches to respect rate limits
      if (i + batchSize < symbolArray.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[Binance] Found ${allTrades.length} trades across all pairs`);

    // Step 6: Combine all transactions and sort by timestamp
    const allTransactions = [...deposits, ...withdrawals, ...allTrades];
    allTransactions.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`[Binance] ✅ Total transactions: ${allTransactions.length}`);
    console.log(`[Binance]    - Deposits: ${deposits.length}`);
    console.log(`[Binance]    - Withdrawals: ${withdrawals.length}`);
    console.log(`[Binance]    - Trades: ${allTrades.length}`);

    return allTransactions;
  }

  /**
   * Get mock/demo data for testing
   */
  getMockTransactions(startDate?: Date, endDate?: Date): BinanceTransaction[] {
    const now = Date.now();
    const yearAgo = now - (365 * 24 * 60 * 60 * 1000);

    const mockData: BinanceTransaction[] = [
      {
        id: 'deposit-1',
        timestamp: yearAgo + (10 * 24 * 60 * 60 * 1000),
        type: 'deposit',
        asset: 'USDT',
        amount: 10000,
        price: 0,
        fee: 0,
        feeAsset: 'USDT',
        total: 10000,
        raw: {},
      },
      {
        id: 'trade-1',
        timestamp: yearAgo + (30 * 24 * 60 * 60 * 1000),
        type: 'buy',
        asset: 'BTC',
        amount: 0.5,
        price: 35000,
        fee: 8.75,
        feeAsset: 'USDT',
        total: 17500,
        raw: {},
      },
      {
        id: 'trade-2',
        timestamp: yearAgo + (90 * 24 * 60 * 60 * 1000),
        type: 'buy',
        asset: 'ETH',
        amount: 5,
        price: 2000,
        fee: 5,
        feeAsset: 'USDT',
        total: 10000,
        raw: {},
      },
      {
        id: 'trade-3',
        timestamp: yearAgo + (180 * 24 * 60 * 60 * 1000),
        type: 'sell',
        asset: 'BTC',
        amount: 0.2,
        price: 42000,
        fee: 4.2,
        feeAsset: 'USDT',
        total: 8400,
        raw: {},
      },
      {
        id: 'trade-4',
        timestamp: yearAgo + (270 * 24 * 60 * 60 * 1000),
        type: 'sell',
        asset: 'ETH',
        amount: 2,
        price: 2500,
        fee: 2.5,
        feeAsset: 'USDT',
        total: 5000,
        raw: {},
      },
      {
        id: 'withdrawal-1',
        timestamp: yearAgo + (300 * 24 * 60 * 60 * 1000),
        type: 'withdrawal',
        asset: 'USDT',
        amount: 3000,
        price: 0,
        fee: 1,
        feeAsset: 'USDT',
        total: 3000,
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

export const binanceStrategy = new BinanceStrategy();

