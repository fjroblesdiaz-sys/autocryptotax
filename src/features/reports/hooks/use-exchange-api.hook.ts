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

      console.log('[ExchangeAPI] Sending request to generate report:', {
        exchange: data.platform,
        fiscalYear,
        reportType,
        format,
      });

      const response = await fetch('/api/reports/generate-from-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[ExchangeAPI] Response status:', response.status, response.statusText);

      // Handle PDF response
      if (format === 'pdf') {
        if (!response.ok) {
          let errorMessage = 'Failed to generate PDF';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            console.error('[ExchangeAPI] Could not parse error response:', e);
          }
          throw new Error(errorMessage);
        }
        return await response.blob();
      }

      // Handle JSON/CSV response
      let result;
      try {
        result = await response.json();
        console.log('[ExchangeAPI] Response data:', result);
      } catch (e) {
        console.error('[ExchangeAPI] Failed to parse JSON response:', e);
        throw new Error('Respuesta inválida del servidor. Por favor, inténtalo de nuevo.');
      }

      if (!response.ok) {
        const errorMessage = result.error || result.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('[ExchangeAPI] API error:', errorMessage);
        throw new Error(errorMessage);
      }

      if (!result.success) {
        const errorMessage = result.error || result.message || 'Report generation failed';
        console.error('[ExchangeAPI] Report generation failed:', errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al generar el informe';
      console.error('[ExchangeAPI] Error in generateReport:', err);
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

