/**
 * Tax Calculation Service
 * Calculates capital gains/losses for cryptocurrency transactions
 * Following Spanish tax regulations
 */

import { BlockchainTransaction } from './blockchain.service';
import { PriceData } from './price.service';

export interface ProcessedTransaction {
  hash: string;
  date: Date;
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out' | 'swap' | 'fee';
  asset: string;
  amount: number;
  priceEUR: number;
  valueEUR: number;
  fee?: number;
  feeValueEUR?: number;
  from?: string;
  to?: string;
}

export interface TaxCalculationResult {
  fiscalYear: number;
  transactions: ProcessedTransaction[];
  holdings: AssetHolding[];
  capitalGains: CapitalGain[];
  summary: {
    totalTransactions: number;
    totalGains: number;
    totalLosses: number;
    netResult: number;
    totalFees: number;
  };
}

export interface AssetHolding {
  asset: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
  currentValue?: number;
}

export interface CapitalGain {
  date: Date;
  asset: string;
  quantity: number;
  acquisitionDate: Date;
  acquisitionPrice: number;
  disposalPrice: number;
  gain: number;
  isLoss: boolean;
  holdingPeriod: number; // days
}

/**
 * Calculate tax for a fiscal year using FIFO method
 * FIFO (First In, First Out) is the standard method in Spain
 */
export function calculateTaxFIFO(
  transactions: ProcessedTransaction[],
  fiscalYear: number
): TaxCalculationResult {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Filter transactions for the fiscal year
  const yearStart = new Date(fiscalYear, 0, 1);
  const yearEnd = new Date(fiscalYear, 11, 31, 23, 59, 59);
  
  const yearTransactions = sortedTransactions.filter(
    tx => tx.date >= yearStart && tx.date <= yearEnd
  );

  // Track holdings per asset (FIFO queue)
  const holdings = new Map<string, FIFOQueue>();
  const capitalGains: CapitalGain[] = [];
  let totalFees = 0;

  for (const tx of sortedTransactions) {
    if (!holdings.has(tx.asset)) {
      holdings.set(tx.asset, new FIFOQueue());
    }
    const queue = holdings.get(tx.asset)!;

    switch (tx.type) {
      case 'buy':
      case 'transfer_in':
        // Add to holdings
        queue.add({
          date: tx.date,
          quantity: tx.amount,
          pricePerUnit: tx.priceEUR,
        });
        break;

      case 'sell':
      case 'transfer_out':
        // Remove from holdings and calculate gains
        const gains = queue.remove(tx.amount, tx.date, tx.priceEUR);
        
        // Only include gains in the fiscal year
        if (tx.date >= yearStart && tx.date <= yearEnd) {
          capitalGains.push(...gains);
        }
        break;

      case 'swap':
        // Swap is considered a sale + purchase
        // First, sell the outgoing asset
        const swapGains = queue.remove(tx.amount, tx.date, tx.priceEUR);
        if (tx.date >= yearStart && tx.date <= yearEnd) {
          capitalGains.push(...swapGains);
        }
        // Then buy the incoming asset (handled separately)
        break;

      case 'fee':
        totalFees += tx.valueEUR;
        break;
    }
  }

  // Calculate summary
  const totalGains = capitalGains
    .filter(g => !g.isLoss)
    .reduce((sum, g) => sum + g.gain, 0);
  
  const totalLosses = capitalGains
    .filter(g => g.isLoss)
    .reduce((sum, g) => sum + Math.abs(g.gain), 0);

  const currentHoldings: AssetHolding[] = Array.from(holdings.entries()).map(
    ([asset, queue]) => ({
      asset,
      quantity: queue.getTotalQuantity(),
      averageCost: queue.getAverageCost(),
      totalCost: queue.getTotalCost(),
    })
  );

  return {
    fiscalYear,
    transactions: yearTransactions,
    holdings: currentHoldings,
    capitalGains,
    summary: {
      totalTransactions: yearTransactions.length,
      totalGains,
      totalLosses,
      netResult: totalGains - totalLosses,
      totalFees,
    },
  };
}

/**
 * FIFO Queue implementation for tracking asset acquisitions
 */
class FIFOQueue {
  private lots: Array<{
    date: Date;
    quantity: number;
    pricePerUnit: number;
  }> = [];

  add(lot: { date: Date; quantity: number; pricePerUnit: number }) {
    this.lots.push(lot);
  }

  remove(quantity: number, disposalDate: Date, disposalPrice: number): CapitalGain[] {
    const gains: CapitalGain[] = [];
    let remaining = quantity;

    while (remaining > 0 && this.lots.length > 0) {
      const lot = this.lots[0];
      const quantityToRemove = Math.min(remaining, lot.quantity);

      const gain: CapitalGain = {
        date: disposalDate,
        asset: '', // Will be set by caller
        quantity: quantityToRemove,
        acquisitionDate: lot.date,
        acquisitionPrice: lot.pricePerUnit,
        disposalPrice,
        gain: quantityToRemove * (disposalPrice - lot.pricePerUnit),
        isLoss: disposalPrice < lot.pricePerUnit,
        holdingPeriod: Math.floor(
          (disposalDate.getTime() - lot.date.getTime()) / (1000 * 60 * 60 * 24)
        ),
      };

      gains.push(gain);

      lot.quantity -= quantityToRemove;
      remaining -= quantityToRemove;

      if (lot.quantity <= 0) {
        this.lots.shift();
      }
    }

    return gains;
  }

  getTotalQuantity(): number {
    return this.lots.reduce((sum, lot) => sum + lot.quantity, 0);
  }

  getAverageCost(): number {
    const totalCost = this.getTotalCost();
    const totalQuantity = this.getTotalQuantity();
    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  getTotalCost(): number {
    return this.lots.reduce((sum, lot) => sum + lot.quantity * lot.pricePerUnit, 0);
  }
}

/**
 * Process raw blockchain transactions into tax-relevant transactions
 */
export function processBlockchainTransactions(
  blockchainTxs: BlockchainTransaction[],
  walletAddress: string,
  prices: Map<string, PriceData | null>
): ProcessedTransaction[] {
  const processed: ProcessedTransaction[] = [];

  // TODO: Implement sophisticated transaction categorization
  // This is a simplified version that needs to handle:
  // - DEX swaps (Uniswap, SushiSwap, etc.)
  // - DeFi interactions (lending, borrowing, staking)
  // - NFT transactions
  // - Token approvals (filter these out)
  // - Contract interactions
  
  for (const tx of blockchainTxs) {
    // Simple classification based on transaction type
    // In production, this needs much more sophisticated logic
    
    const isOutgoing = tx.from.toLowerCase() === walletAddress.toLowerCase();
    const isIncoming = tx.to.toLowerCase() === walletAddress.toLowerCase();

    if (isOutgoing && !isIncoming) {
      const priceEUR = 2500; // Mock price, in production get from prices map
      const amount = parseFloat(tx.value);
      processed.push({
        hash: tx.hash,
        date: new Date(tx.timestamp * 1000),
        type: 'sell', // Transfer out is a sale for tax purposes
        asset: 'ETH',
        amount: amount,
        priceEUR: priceEUR,
        valueEUR: amount * priceEUR,
        to: tx.to,
      });
    } else if (isIncoming && !isOutgoing) {
      const priceEUR = 2500; // Mock price
      const amount = parseFloat(tx.value);
      processed.push({
        hash: tx.hash,
        date: new Date(tx.timestamp * 1000),
        type: 'buy', // Transfer in is a purchase
        asset: 'ETH',
        amount: amount,
        priceEUR: priceEUR,
        valueEUR: amount * priceEUR,
        from: tx.from,
      });
    }
  }

  return processed;
}

