/**
 * Report API Hook
 * Handles API calls for report generation
 */

'use client';

import { useState } from 'react';
import { ReportType } from '../types/reports.types';

export interface GenerateReportParams {
  walletAddress: string;
  chain?: string;
  fiscalYear: number;
  reportType: ReportType;
  dateRange?: {
    from: Date;
    to: Date;
  };
  taxpayerInfo?: {
    nif?: string;
    name?: string;
    surname?: string;
  };
  format?: 'json' | 'csv' | 'pdf';
}

export interface ReportApiResponse {
  success: boolean;
  reportId: string;
  report?: unknown;
  downloadUrl: string;
  summary: {
    fiscalYear: number;
    reportType: string;
    walletAddress: string;
    totalTransactions: number;
    totalGains: number;
    totalLosses: number;
    netResult: number;
    generatedAt: string;
  };
  csv?: string;
}

export interface AnalyzeWalletParams {
  walletAddress: string;
  chain?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface WalletAnalysisResponse {
  success: boolean;
  wallet: {
    address: string;
    chain: string;
  };
  analysis: {
    totalTransactions: number;
    dateRange: {
      from: string;
      to: string;
    };
    sampleTransactions: unknown[];
  };
}

export const useReportApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (
    params: GenerateReportParams
  ): Promise<ReportApiResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: params.walletAddress,
          chain: params.chain || 'ethereum',
          fiscalYear: params.fiscalYear,
          reportType: params.reportType,
          dateRange: params.dateRange ? {
            from: params.dateRange.from.toISOString(),
            to: params.dateRange.to.toISOString(),
          } : undefined,
          taxpayerInfo: params.taxpayerInfo,
          format: params.format || 'json',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data: ReportApiResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error generating report:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWallet = async (
    params: AnalyzeWalletParams
  ): Promise<WalletAnalysisResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: params.walletAddress,
          chain: params.chain || 'ethereum',
          dateRange: params.dateRange ? {
            from: params.dateRange.from.toISOString(),
            to: params.dateRange.to.toISOString(),
          } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze wallet');
      }

      const data: WalletAnalysisResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error analyzing wallet:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    generateReport,
    analyzeWallet,
    isLoading,
    error,
    clearError,
  };
};

