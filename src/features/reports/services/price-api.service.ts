/**
 * Price API Service
 * Fetches cryptocurrency prices from CoinGecko API
 * Free tier: 10-30 calls/minute
 */

interface CoinGeckoPriceResponse {
  [coinId: string]: {
    eur: number;
  };
}

// Map common crypto symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  // Major cryptocurrencies
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LTC': 'litecoin',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'XLM': 'stellar',
  'ALGO': 'algorand',
  'NEAR': 'near',
  'FIL': 'filecoin',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'MKR': 'maker',
  'AAVE': 'aave',
  'COMP': 'compound-governance-token',
  'CRV': 'curve-dao-token',
  'SNX': 'synthetix-network-token',
  '1INCH': '1inch',
  'SUSHI': 'sushi',
  'YFI': 'yearn-finance',
  'BAL': 'balancer',
  'ZRX': '0x',
  'BAT': 'basic-attention-token',
  'ENJ': 'enjincoin',
  'MANA': 'decentraland',
  'SAND': 'the-sandbox',
  'AXS': 'axie-infinity',
  'GALA': 'gala',
  'CHZ': 'chiliz',
  'FTM': 'fantom',
  'HBAR': 'hedera-hashgraph',
  'VET': 'vechain',
  'THETA': 'theta-token',
  'ICP': 'internet-computer',
  'EOS': 'eos',
  'EGLD': 'elrond-erd-2',
  'XTZ': 'tezos',
  'FLOW': 'flow',
  'KLAY': 'klay-token',
  'IMX': 'immutable-x',
  'APE': 'apecoin',
  'LDO': 'lido-dao',
  'SHIB': 'shiba-inu',
  'PEPE': 'pepe',
  'WLD': 'worldcoin-wld',
  'SEI': 'sei-network',
  'TIA': 'celestia',
  'SUI': 'sui',
  'INJ': 'injective-protocol',
  'RUNE': 'thorchain',
  'OSMO': 'osmosis',
  'LUNA': 'terra-luna-2',
  'LUNC': 'terra-luna',
  'XNO': 'nano',
  
  // Stablecoins
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BUSD': 'binance-usd',
  'DAI': 'dai',
  'TUSD': 'true-usd',
  'USDD': 'usdd',
  'FRAX': 'frax',
  'USDP': 'paxos-standard',
  'GUSD': 'gemini-dollar',
};

// Price cache to avoid hitting rate limits
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class PriceAPIService {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  /**
   * Get current EUR prices for multiple cryptocurrencies
   */
  async getPricesInEUR(symbols: string[]): Promise<Map<string, number>> {
    const prices = new Map<string, number>();
    const symbolsToFetch: string[] = [];
    const now = Date.now();

    // Check cache first
    for (const symbol of symbols) {
      const cached = priceCache.get(symbol);
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        prices.set(symbol, cached.price);
      } else {
        symbolsToFetch.push(symbol);
      }
    }

    if (symbolsToFetch.length === 0) {
      return prices;
    }

    // Convert symbols to CoinGecko IDs
    const coinIds = symbolsToFetch
      .map(symbol => SYMBOL_TO_COINGECKO_ID[symbol])
      .filter(id => id !== undefined);

    if (coinIds.length === 0) {
      console.warn('[PriceAPI] No CoinGecko IDs found for symbols:', symbolsToFetch);
      // Return 1 EUR as fallback for unknown tokens
      symbolsToFetch.forEach(symbol => prices.set(symbol, 1.0));
      return prices;
    }

    try {
      // Batch request (up to 250 coins per request)
      const idsParam = coinIds.join(',');
      const url = `${this.baseUrl}/simple/price?ids=${idsParam}&vs_currencies=eur`;

      console.log('[PriceAPI] Fetching prices for:', coinIds.length, 'coins');

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      const data: CoinGeckoPriceResponse = await response.json();

      // Map prices back to symbols
      for (const symbol of symbolsToFetch) {
        const coinId = SYMBOL_TO_COINGECKO_ID[symbol];
        if (coinId && data[coinId]?.eur) {
          const price = data[coinId].eur;
          prices.set(symbol, price);
          
          // Cache the price
          priceCache.set(symbol, { price, timestamp: now });
        } else {
          // Fallback to 1 EUR for unknown tokens
          prices.set(symbol, 1.0);
          console.warn(`[PriceAPI] No price found for ${symbol}, using 1 EUR`);
        }
      }

      console.log('[PriceAPI] Successfully fetched', prices.size, 'prices');
      return prices;

    } catch (error) {
      console.error('[PriceAPI] Error fetching prices:', error);
      
      // Fallback: return 1 EUR for all requested symbols
      symbolsToFetch.forEach(symbol => prices.set(symbol, 1.0));
      return prices;
    }
  }

  /**
   * Get historical price for a specific date
   * Note: Free tier has limited historical data (last 365 days)
   */
  async getHistoricalPriceInEUR(symbol: string, date: Date): Promise<number> {
    const coinId = SYMBOL_TO_COINGECKO_ID[symbol];
    
    if (!coinId) {
      console.warn(`[PriceAPI] No CoinGecko ID for ${symbol}, using 1 EUR`);
      return 1.0;
    }

    try {
      // Format date as DD-MM-YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const dateStr = `${day}-${month}-${year}`;

      const url = `${this.baseUrl}/coins/${coinId}/history?date=${dateStr}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.market_data?.current_price?.eur) {
        return data.market_data.current_price.eur;
      }

      console.warn(`[PriceAPI] No historical price for ${symbol} on ${dateStr}, using 1 EUR`);
      return 1.0;

    } catch (error) {
      console.error(`[PriceAPI] Error fetching historical price for ${symbol}:`, error);
      return 1.0;
    }
  }
}

export const priceAPIService = new PriceAPIService();

