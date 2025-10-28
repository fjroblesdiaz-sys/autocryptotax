/**
 * Utility for managing report generation data across pages using sessionStorage
 * This allows data to persist as users navigate through the multi-page report generation flow
 */

import {
  DataSourceType,
  WalletData,
  CSVUploadData,
  APIKeyData,
  OAuthData,
  ManualEntryTransaction,
  ReportType,
  GeneratedReport,
} from '../types/reports.types';

const STORAGE_KEY = 'report-generation-data';

export interface ReportGenerationSessionData {
  dataSource?: DataSourceType;
  sourceData?: WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[];
  reportType?: ReportType;
  fiscalYear?: number;
  reportId?: string;
  generatedReport?: GeneratedReport;
  reportCSV?: string;
  reportJSON?: string;
}

export const reportDataStorage = {
  /**
   * Save report generation data to session storage
   */
  save(data: Partial<ReportGenerationSessionData>): void {
    if (typeof window === 'undefined') return;
    
    const currentData = this.get();
    const updatedData = { ...currentData, ...data };
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving report data to session storage:', error);
    }
  },

  /**
   * Get report generation data from session storage
   */
  get(): ReportGenerationSessionData {
    if (typeof window === 'undefined') return {};
    
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading report data from session storage:', error);
      return {};
    }
  },

  /**
   * Clear all report generation data from session storage
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing report data from session storage:', error);
    }
  },

  /**
   * Get specific field from storage
   */
  getField<K extends keyof ReportGenerationSessionData>(
    field: K
  ): ReportGenerationSessionData[K] | undefined {
    const data = this.get();
    return data[field];
  },
};

