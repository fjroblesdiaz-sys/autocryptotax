/**
 * Report Format Service
 * Generates Spanish tax declaration formats compliant with AEAT regulations
 * 
 * ============================================================================
 * LEGAL FRAMEWORK FOR CRYPTOCURRENCY TAXATION IN SPAIN
 * ============================================================================
 * 
 * 1. MODELO 100 (IRPF - Personal Income Tax)
 *    Legal basis: Ley 35/2006 del IRPF, Article 33.1 (Capital Gains)
 *    
 *    CASILLA 1804: Ganancias y pérdidas patrimoniales - Monedas virtuales
 *    - All crypto gains/losses integrate into "Base Imponible del Ahorro"
 *    - Must declare transactions, not mere holding of cryptocurrencies
 *    - Filing period: April-June (year following the fiscal year)
 *    
 *    Three taxable scenarios:
 *    a) Sale of crypto for euros/fiat currency (Art. 33.1 LIRPF)
 *    b) Exchange of one crypto for another - treated as permuta/barter
 *    c) Platform bankruptcy losses (Art. 14.2.k LIRPF - special rules)
 *    
 *    Valuation method: FIFO (First In, First Out) - Art. 37 LIRPF
 *    - Acquisition cost includes: purchase price + commissions
 *    - Disposal value includes: sale price - commissions
 *    - For partial sales: oldest acquisitions sold first
 * 
 * 2. MODELO 720 (Declaration of Assets Abroad)
 *    Legal basis: Real Decreto 1558/2012
 *    - Reports crypto held in foreign exchanges if >50,000€
 *    - Filing deadline: March 31
 *    - Penalties for non-compliance are severe
 *    - Only required if threshold exceeded
 * 
 * 3. MODELO 714 (Wealth Tax - Impuesto sobre el Patrimonio)
 *    Legal basis: Ley 19/1991 del Impuesto sobre el Patrimonio
 *    - Reports total wealth including crypto
 *    - Threshold varies by Autonomous Community (typically 700,000€)
 *    - Filed together with Modelo 100
 *    - Some regions have abolished this tax
 * 
 * 4. MODELO 721 (Informative Declaration - NEW 2023)
 *    Legal basis: Orden HAC/1398/2021
 *    - Quarterly informative declaration of crypto operations
 *    - Required for exchanges and custodial platforms
 *    - Individuals may need to report if using foreign platforms
 * 
 * ============================================================================
 * IMPORTANT NOTICES
 * ============================================================================
 * - This service generates INFORMATIVE/SUPPORTING documentation
 * - Official submission MUST be done through AEAT channels:
 *   • Renta Web: https://www.agenciatributaria.gob.es
 *   • Programa PADRE (official desktop application)
 * - Consult a qualified tax advisor (asesor fiscal colegiado) before filing
 * - Keep all transaction records for at least 4 years (Art. 66 LGT)
 * 
 * References:
 * - AEAT Crypto Guide: https://sede.agenciatributaria.gob.es
 * - Consulta Vinculante V1579-22 (platform bankruptcy losses)
 * - DGT Guidelines on cryptocurrency taxation
 */

import { TaxCalculationResult } from './tax-calculation.service';

export interface SpanishTaxReport {
  reportType: 'model-720' | 'model-100' | 'model-714';
  fiscalYear: number;
  taxpayerInfo: TaxpayerInfo;
  data: Model100Data | Model720Data | Model714Data;
  generatedAt: Date;
  format: 'pdf' | 'csv' | 'json';
}

export interface TaxpayerInfo {
  nif: string; // Spanish tax ID
  name: string;
  surname: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
}

/**
 * Modelo 100 - IRPF Data Structure
 */
export interface Model100Data {
  capitalGains: {
    shortTerm: CapitalGainEntry[]; // < 1 year
    longTerm: CapitalGainEntry[];  // >= 1 year
  };
  summary: {
    totalShortTermGains: number;
    totalShortTermLosses: number;
    totalLongTermGains: number;
    totalLongTermLosses: number;
    netShortTerm: number;
    netLongTerm: number;
    netTotal: number;
  };
}

export interface CapitalGainEntry {
  description: string; // e.g., "Bitcoin - BTC"
  acquisitionDate: string;
  acquisitionValue: number;
  disposalDate: string;
  disposalValue: number;
  gain: number;
}

/**
 * Modelo 720 - Assets Abroad Data Structure
 */
export interface Model720Data {
  accounts: Array<{
    entityName: string; // Exchange name
    accountNumber: string;
    country: string;
    balance: number; // End of year balance in EUR
    averageBalance: number; // Q4 average
  }>;
  securities: Array<{
    description: string; // Cryptocurrency name
    quantity: number;
    valueEUR: number;
    location: string; // Exchange/wallet location
  }>;
  totalValue: number;
}

/**
 * Modelo 714 - Wealth Tax Data Structure
 */
export interface Model714Data {
  assets: Array<{
    description: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
  }>;
  totalWealth: number;
  threshold: number; // Varies by autonomous community
  taxableWealth: number;
}

/**
 * Generate Modelo 100 (IRPF) report
 */
export function generateModel100Report(
  taxCalculation: TaxCalculationResult,
  taxpayerInfo: TaxpayerInfo
): SpanishTaxReport {
  const shortTermGains: CapitalGainEntry[] = [];
  const longTermGains: CapitalGainEntry[] = [];

  // Classify gains by holding period
  // In Spain, all crypto gains are considered short-term (savings income)
  // regardless of holding period
  for (const gain of taxCalculation.capitalGains) {
    const entry: CapitalGainEntry = {
      description: `${gain.asset}`,
      acquisitionDate: gain.acquisitionDate.toLocaleDateString('es-ES'),
      acquisitionValue: gain.quantity * gain.acquisitionPrice,
      disposalDate: gain.date.toLocaleDateString('es-ES'),
      disposalValue: gain.quantity * gain.disposalPrice,
      gain: gain.gain,
    };

    // In Spain, crypto is typically treated as savings income (short-term)
    // But we track both for flexibility
    if (gain.holdingPeriod < 365) {
      shortTermGains.push(entry);
    } else {
      longTermGains.push(entry);
    }
  }

  const totalShortTermGains = shortTermGains
    .filter(g => g.gain > 0)
    .reduce((sum, g) => sum + g.gain, 0);
  
  const totalShortTermLosses = Math.abs(
    shortTermGains
      .filter(g => g.gain < 0)
      .reduce((sum, g) => sum + g.gain, 0)
  );

  const totalLongTermGains = longTermGains
    .filter(g => g.gain > 0)
    .reduce((sum, g) => sum + g.gain, 0);
  
  const totalLongTermLosses = Math.abs(
    longTermGains
      .filter(g => g.gain < 0)
      .reduce((sum, g) => sum + g.gain, 0)
  );

  const data: Model100Data = {
    capitalGains: {
      shortTerm: shortTermGains,
      longTerm: longTermGains,
    },
    summary: {
      totalShortTermGains,
      totalShortTermLosses,
      totalLongTermGains,
      totalLongTermLosses,
      netShortTerm: totalShortTermGains - totalShortTermLosses,
      netLongTerm: totalLongTermGains - totalLongTermLosses,
      netTotal: (totalShortTermGains + totalLongTermGains) - (totalShortTermLosses + totalLongTermLosses),
    },
  };

  return {
    reportType: 'model-100',
    fiscalYear: taxCalculation.fiscalYear,
    taxpayerInfo,
    data,
    generatedAt: new Date(),
    format: 'json',
  };
}

/**
 * Generate Modelo 720 report
 */
export function generateModel720Report(
  holdings: Array<{ asset: string; quantity: number; valueEUR: number }>,
  fiscalYear: number,
  taxpayerInfo: TaxpayerInfo
): SpanishTaxReport {
  const totalValue = holdings.reduce((sum, h) => sum + h.valueEUR, 0);

  const data: Model720Data = {
    accounts: [
      {
        entityName: 'Blockchain Network',
        accountNumber: 'N/A - Decentralized',
        country: 'Multiple',
        balance: totalValue,
        averageBalance: totalValue, // Simplified
      },
    ],
    securities: holdings.map(h => ({
      description: h.asset,
      quantity: h.quantity,
      valueEUR: h.valueEUR,
      location: 'Blockchain (Decentralized)',
    })),
    totalValue,
  };

  return {
    reportType: 'model-720',
    fiscalYear,
    taxpayerInfo,
    data,
    generatedAt: new Date(),
    format: 'json',
  };
}

/**
 * Generate Modelo 714 report
 */
export function generateModel714Report(
  holdings: Array<{ asset: string; quantity: number; valueEUR: number }>,
  fiscalYear: number,
  taxpayerInfo: TaxpayerInfo,
  threshold: number = 700000 // Default threshold, varies by region
): SpanishTaxReport {
  const totalWealth = holdings.reduce((sum, h) => sum + h.valueEUR, 0);
  const taxableWealth = Math.max(0, totalWealth - threshold);

  const data: Model714Data = {
    assets: holdings.map(h => ({
      description: h.asset,
      quantity: h.quantity,
      unitValue: h.valueEUR / h.quantity,
      totalValue: h.valueEUR,
    })),
    totalWealth,
    threshold,
    taxableWealth,
  };

  return {
    reportType: 'model-714',
    fiscalYear,
    taxpayerInfo,
    data,
    generatedAt: new Date(),
    format: 'json',
  };
}

/**
 * Format report as CSV for Modelo 100
 * Includes all transactions and capital gains
 */
export function formatModel100CSV(report: SpanishTaxReport, taxCalculation?: TaxCalculationResult): string {
  console.log('[formatModel100CSV] Called with taxCalculation:', !!taxCalculation);
  console.log('[formatModel100CSV] Transactions count:', taxCalculation?.transactions?.length || 0);
  
  if (report.reportType !== 'model-100') {
    throw new Error('Invalid report type for Modelo 100 CSV');
  }

  const data = report.data as Model100Data;
  let csv = '';

  // Section 1: All Transactions
  if (taxCalculation && taxCalculation.transactions) {
    console.log('[formatModel100CSV] Adding ALL TRANSACTIONS section with', taxCalculation.transactions.length, 'transactions');
    csv += 'TODAS LAS TRANSACCIONES\n';
    csv += 'Fecha,Tipo,Activo,Cantidad,Precio EUR,Valor EUR,Comisión,Comisión EUR\n';
    
    taxCalculation.transactions.forEach(tx => {
      const typeLabel = {
        'buy': 'Compra',
        'sell': 'Venta',
        'transfer_in': 'Depósito',
        'transfer_out': 'Retiro',
        'swap': 'Intercambio',
        'fee': 'Comisión'
      }[tx.type] || tx.type;

      csv += `${tx.date.toLocaleDateString('es-ES')},${typeLabel},${tx.asset},${tx.amount},${tx.priceEUR.toFixed(2)},${tx.valueEUR.toFixed(2)},${tx.fee || 0},${tx.feeValueEUR || 0}\n`;
    });
    
    csv += `\nTotal de Transacciones: ${taxCalculation.transactions.length}\n\n`;
  }

  // Section 2: Capital Gains (Ganancias y Pérdidas)
  csv += 'GANANCIAS Y PÉRDIDAS PATRIMONIALES\n';
  csv += 'Tipo,Activo,Fecha Adquisición,Valor Adquisición EUR,Fecha Venta,Valor Venta EUR,Ganancia/Pérdida EUR\n';

  data.capitalGains.shortTerm.forEach(entry => {
    csv += `Corto Plazo,${entry.description},${entry.acquisitionDate},${entry.acquisitionValue.toFixed(2)},${entry.disposalDate},${entry.disposalValue.toFixed(2)},${entry.gain.toFixed(2)}\n`;
  });

  data.capitalGains.longTerm.forEach(entry => {
    csv += `Largo Plazo,${entry.description},${entry.acquisitionDate},${entry.acquisitionValue.toFixed(2)},${entry.disposalDate},${entry.disposalValue.toFixed(2)},${entry.gain.toFixed(2)}\n`;
  });

  // Section 3: Summary
  csv += '\nRESUMEN FISCAL\n';
  csv += `Ganancias Corto Plazo,${data.summary.totalShortTermGains.toFixed(2)} EUR\n`;
  csv += `Pérdidas Corto Plazo,${data.summary.totalShortTermLosses.toFixed(2)} EUR\n`;
  csv += `Resultado Neto Corto Plazo,${data.summary.netShortTerm.toFixed(2)} EUR\n`;
  csv += `Ganancias Largo Plazo,${data.summary.totalLongTermGains.toFixed(2)} EUR\n`;
  csv += `Pérdidas Largo Plazo,${data.summary.totalLongTermLosses.toFixed(2)} EUR\n`;
  csv += `Resultado Neto Largo Plazo,${data.summary.netLongTerm.toFixed(2)} EUR\n`;
  csv += `RESULTADO TOTAL,${data.summary.netTotal.toFixed(2)} EUR\n`;

  // Section 4: Holdings (if available)
  if (taxCalculation && taxCalculation.holdings && taxCalculation.holdings.length > 0) {
    csv += '\nPOSICIONES ACTUALES\n';
    csv += 'Activo,Cantidad,Costo Promedio EUR,Costo Total EUR\n';
    
    taxCalculation.holdings.forEach(holding => {
      csv += `${holding.asset},${holding.quantity},${holding.averageCost.toFixed(2)},${holding.totalCost.toFixed(2)}\n`;
    });
  }

  return csv;
}

/**
 * Format report as JSON (for API responses)
 */
export function formatReportJSON(report: SpanishTaxReport): string {
  return JSON.stringify(report, null, 2);
}

