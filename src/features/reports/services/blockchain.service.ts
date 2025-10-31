/**
 * Blockchain Service
 * Fetches transaction data from blockchain networks
 */

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  gasUsed?: string;
  gasPrice?: string;
  tokenTransfers?: TokenTransfer[];
  methodId?: string;
  contractAddress?: string;
  type: 'transfer' | 'contract_interaction' | 'token_transfer';
}

export interface TokenTransfer {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  from: string;
  to: string;
  value: string;
  valueInEther: string;
}

export interface TransactionAnalysis {
  address: string;
  chain: string;
  transactions: BlockchainTransaction[];
  totalTransactions: number;
  dateRange: {
    from: Date;
    to: Date;
  };
}

/**
 * Fetch transactions for a wallet address
 * Uses Etherscan API for Ethereum mainnet
 */
export async function fetchWalletTransactions(
  address: string,
  chain: string = 'ethereum',
  dateRange?: { from: Date; to: Date }
): Promise<TransactionAnalysis> {
  console.log(`[Blockchain] Fetching transactions for ${address} on ${chain}`);
  
  // Get API configuration
  const etherscanApiKey = process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  
  if (!etherscanApiKey) {
    console.warn('[Blockchain] No Etherscan API key found, using mock data');
    return getMockTransactions(address, dateRange);
  }

  try {
    // Fetch normal transactions using Etherscan API V2
    const normalTxUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`;
    
    console.log('[Blockchain] Calling Etherscan API V2...');
    const response = await fetch(normalTxUrl);
    
    if (!response.ok) {
      throw new Error(`Etherscan API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== '1') {
      console.warn('[Blockchain] Etherscan API error:', {
        status: data.status,
        message: data.message,
        result: data.result
      });
      
      if (data.message === 'No transactions found') {
        console.log('[Blockchain] No transactions found for this address');
        return {
          address,
          chain,
          transactions: [],
          totalTransactions: 0,
          dateRange: dateRange || {
            from: new Date(new Date().getFullYear() - 1, 0, 1),
            to: new Date()
          }
        };
      }
      
      // Common Etherscan errors
      if (data.result && typeof data.result === 'string') {
        if (data.result.includes('Invalid API Key')) {
          console.error('[Blockchain] Invalid Etherscan API key');
        } else if (data.result.includes('rate limit')) {
          console.error('[Blockchain] Rate limit exceeded');
        }
        throw new Error(`Etherscan API: ${data.result}`);
      }
      
      throw new Error(data.message || data.result || 'Etherscan API error');
    }

    const rawTransactions = data.result || [];
    console.log(`[Blockchain] Found ${rawTransactions.length} transactions from Etherscan`);

    // Convert Etherscan format to our format
    const transactions: BlockchainTransaction[] = rawTransactions
      .filter((tx: any) => {
        const txDate = new Date(parseInt(tx.timeStamp) * 1000);
        if (!dateRange) return true;
        return txDate >= dateRange.from && txDate <= dateRange.to;
      })
      .map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: (parseInt(tx.value) / 1e18).toString(), // Convert Wei to ETH
        timestamp: parseInt(tx.timeStamp),
        blockNumber: parseInt(tx.blockNumber),
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        methodId: tx.methodId,
        contractAddress: tx.contractAddress,
        type: tx.value === '0' ? 'contract_interaction' : 'transfer' as const,
      }));

    console.log(`[Blockchain] After date filtering: ${transactions.length} transactions`);

    return {
      address,
      chain,
      transactions,
      totalTransactions: transactions.length,
      dateRange: dateRange || {
        from: new Date(new Date().getFullYear() - 1, 0, 1),
        to: new Date()
      }
    };
  } catch (error) {
    console.error('[Blockchain] Error fetching from Etherscan:', error);
    console.warn('[Blockchain] Falling back to mock data');
    return getMockTransactions(address, dateRange);
  }
}

/**
 * Get mock transactions for testing
 */
function getMockTransactions(address: string, dateRange?: { from: Date; to: Date }): TransactionAnalysis {
  const mockTransactions: BlockchainTransaction[] = [
    {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: '0x0000000000000000000000000000000000000000',
      to: address.toLowerCase(),
      value: '1.5',
      timestamp: new Date('2024-01-15').getTime() / 1000,
      blockNumber: 18900000,
      type: 'transfer',
    },
    {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      from: address.toLowerCase(),
      to: '0x0000000000000000000000000000000000000001',
      value: '0.5',
      timestamp: new Date('2024-03-20').getTime() / 1000,
      blockNumber: 19100000,
      type: 'transfer',
    },
    {
      hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      from: '0x0000000000000000000000000000000000000002',
      to: address.toLowerCase(),
      value: '2.0',
      timestamp: new Date('2024-05-10').getTime() / 1000,
      blockNumber: 19300000,
      type: 'transfer',
    },
  ];
  
  return {
    address,
    chain: 'ethereum',
    transactions: mockTransactions,
    totalTransactions: mockTransactions.length,
    dateRange: dateRange || {
      from: new Date(new Date().getFullYear() - 1, 0, 1),
      to: new Date()
    }
  };
}

/**
 * Fetch token balances for a wallet
 */
export async function fetchTokenBalances(
  address: string,
  chain: string = 'ethereum'
): Promise<TokenBalance[]> {
  // TODO: Implement using Alchemy, Moralis, or similar
  console.log(`Fetching token balances for ${address} on ${chain}`);
  
  return [];
}

export interface TokenBalance {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: string;
  balanceInEther: string;
  decimals: number;
  price?: number;
  valueInEUR?: number;
}

