'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

/**
 * Report Data Context
 * Replaces sessionStorage for passing data between report generation steps
 */

interface ReportDataContextType {
  // Step 1: Data Source Selection
  dataSource: DataSourceType | null;
  setDataSource: (source: DataSourceType) => void;

  // Step 2: Source Data
  sourceData:
    | WalletData
    | CSVUploadData
    | APIKeyData
    | OAuthData
    | ManualEntryTransaction[]
    | null;
  setSourceData: (
    data: WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[]
  ) => void;

  // Step 3: Report Configuration
  reportType: ReportType | null;
  setReportType: (type: ReportType) => void;
  fiscalYear: number | null;
  setFiscalYear: (year: number) => void;

  // Step 4: Generated Report
  generatedReport: GeneratedReport | null;
  setGeneratedReport: (report: GeneratedReport) => void;
  reportCSV: string | null;
  setReportCSV: (csv: string) => void;

  // Utility
  clearAll: () => void;
}

const ReportDataContext = createContext<ReportDataContextType | undefined>(undefined);

export const ReportDataProvider = ({ children }: { children: ReactNode }) => {
  const [dataSource, setDataSource] = useState<DataSourceType | null>(null);
  const [sourceData, setSourceData] = useState<
    | WalletData
    | CSVUploadData
    | APIKeyData
    | OAuthData
    | ManualEntryTransaction[]
    | null
  >(null);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [fiscalYear, setFiscalYear] = useState<number | null>(null);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [reportCSV, setReportCSV] = useState<string | null>(null);

  const clearAll = () => {
    setDataSource(null);
    setSourceData(null);
    setReportType(null);
    setFiscalYear(null);
    setGeneratedReport(null);
    setReportCSV(null);
  };

  return (
    <ReportDataContext.Provider
      value={{
        dataSource,
        setDataSource,
        sourceData,
        setSourceData,
        reportType,
        setReportType,
        fiscalYear,
        setFiscalYear,
        generatedReport,
        setGeneratedReport,
        reportCSV,
        setReportCSV,
        clearAll,
      }}
    >
      {children}
    </ReportDataContext.Provider>
  );
};

export const useReportData = () => {
  const context = useContext(ReportDataContext);
  if (context === undefined) {
    throw new Error('useReportData must be used within a ReportDataProvider');
  }
  return context;
};

