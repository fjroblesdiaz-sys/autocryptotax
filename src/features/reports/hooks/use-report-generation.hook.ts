'use client';

import { useState } from 'react';
import {
  DataSourceType,
  ReportType,
  WalletData,
  CSVUploadData,
  APIKeyData,
  OAuthData,
  ManualEntryTransaction,
  ReportGenerationData,
  GeneratedReport,
} from '../types/reports.types';

type ReportGenerationStep = 'source-selection' | 'data-input' | 'report-config' | 'generating' | 'complete';

interface UseReportGenerationReturn {
  // State
  currentStep: ReportGenerationStep;
  selectedDataSource: DataSourceType | null;
  collectedData: WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[] | null;
  selectedReportType: ReportType | null;
  fiscalYear: number;
  isGenerating: boolean;
  generationProgress: number;
  generatedReport: GeneratedReport | null;
  error: string | null;

  // Actions
  selectDataSource: (source: DataSourceType) => void;
  submitDataSourceData: (data: WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[]) => void;
  generateReport: (reportType: ReportType, year: number) => Promise<void>;
  resetWizard: () => void;
  goBack: () => void;
}

export const useReportGeneration = (): UseReportGenerationReturn => {
  const [currentStep, setCurrentStep] = useState<ReportGenerationStep>('source-selection');
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceType | null>(null);
  const [collectedData, setCollectedData] = useState<WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[] | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear() - 1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectDataSource = (source: DataSourceType) => {
    setSelectedDataSource(source);
    setCurrentStep('data-input');
    setError(null);
  };

  const submitDataSourceData = (data: WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[]) => {
    setCollectedData(data);
    setCurrentStep('report-config');
    setError(null);
  };

  const generateReport = async (reportType: ReportType, year: number) => {
    if (!selectedDataSource || !collectedData) {
      setError('Missing data source or collected data');
      return;
    }

    setSelectedReportType(reportType);
    setFiscalYear(year);
    setCurrentStep('generating');
    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Simulate report generation with progress updates
      // In a real implementation, this would call your backend API
      
      // Progress: Collecting transactions
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(25);

      // Progress: Fetching historical prices
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress(50);

      // Progress: Calculating gains/losses
      await new Promise(resolve => setTimeout(resolve, 700));
      setGenerationProgress(75);

      // Progress: Generating PDF
      await new Promise(resolve => setTimeout(resolve, 600));
      setGenerationProgress(90);

      // Final step
      await new Promise(resolve => setTimeout(resolve, 400));
      setGenerationProgress(100);

      // Create mock generated report
      const mockReport: GeneratedReport = {
        id: `report-${Date.now()}`,
        reportType,
        fiscalYear: year,
        generatedAt: new Date(),
        status: 'completed',
        dataSource: selectedDataSource,
        downloadUrl: '/api/reports/download/mock-report.pdf',
        summary: {
          totalTransactions: Math.floor(Math.random() * 200) + 50,
          totalGains: Math.random() * 10000,
          totalLosses: Math.random() * 5000,
          netResult: Math.random() * 5000,
        },
      };

      setGeneratedReport(mockReport);
      setCurrentStep('complete');
      setIsGenerating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating report');
      setIsGenerating(false);
      setCurrentStep('report-config');
    }
  };

  const resetWizard = () => {
    setCurrentStep('source-selection');
    setSelectedDataSource(null);
    setCollectedData(null);
    setSelectedReportType(null);
    setFiscalYear(new Date().getFullYear() - 1);
    setIsGenerating(false);
    setGenerationProgress(0);
    setGeneratedReport(null);
    setError(null);
  };

  const goBack = () => {
    if (currentStep === 'data-input') {
      setCurrentStep('source-selection');
      setSelectedDataSource(null);
    } else if (currentStep === 'report-config') {
      setCurrentStep('data-input');
      setCollectedData(null);
    } else if (currentStep === 'complete') {
      resetWizard();
    }
    setError(null);
  };

  return {
    // State
    currentStep,
    selectedDataSource,
    collectedData,
    selectedReportType,
    fiscalYear,
    isGenerating,
    generationProgress,
    generatedReport,
    error,

    // Actions
    selectDataSource,
    submitDataSourceData,
    generateReport,
    resetWizard,
    goBack,
  };
};
