/**
 * Custom Hook: Exchange API Integration
 * Handles API key validation and transaction fetching from exchanges
 */

import { useState } from 'react';
import { APIKeyData } from '../types/reports.types';

interface UseExchangeApiResult {
  testConnection: (data: APIKeyData) => Promise<boolean>;
  generateReport: (
    data: APIKeyData,
    fiscalYear: number,
    reportType: string,
    format?: 'json' | 'csv' | 'pdf'
  ) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const useExchangeApi = (): UseExchangeApiResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async (data: APIKeyData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/exchange/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchange: data.platform,
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
          passphrase: data.passphrase,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to test connection');
      }

      return result.success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (
    data: APIKeyData,
    fiscalYear: number,
    reportType: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        exchange: data.platform,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
        passphrase: data.passphrase,
        fiscalYear,
        reportType,
        format,
        dateRange: data.dateRange
          ? {
              from: data.dateRange.from.toISOString(),
              to: data.dateRange.to.toISOString(),
            }
          : undefined,
      };

      const response = await fetch('/api/reports/generate-from-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle PDF response
      if (format === 'pdf') {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate PDF');
        }
        return await response.blob();
      }

      // Handle JSON/CSV response
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate report');
      }

      if (!result.success) {
        throw new Error(result.error || 'Report generation failed');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    testConnection,
    generateReport,
    isLoading,
    error,
  };
};

