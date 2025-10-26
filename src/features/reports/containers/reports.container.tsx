'use client';

import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { useReportGeneration } from '../hooks/use-report-generation.hook';
import { DataSourceSelection } from '../components/data-source-selection.component';
import { WalletDataComponent } from '../components/wallet-data.component';
import { CSVUpload } from '../components/csv-upload.component';
import { APIKeyConfig } from '../components/api-key-config.component';
import { OAuthAuthorization } from '../components/oauth-authorization.component';
import { ManualEntry } from '../components/manual-entry.component';
import { ReportGenerationWizard } from '../components/report-generation-wizard.component';
import { ReportComplete } from '../components/report-complete.component';
import {
  WalletData,
  CSVUploadData,
  APIKeyData,
  OAuthData,
  ManualEntryTransaction,
} from '../types/reports.types';

export const ReportsContainer = () => {
  const { address } = useAuth();
  const {
    currentStep,
    selectedDataSource,
    selectedReportType,
    fiscalYear,
    isGenerating,
    generationProgress,
    generatedReport,
    selectDataSource,
    submitDataSourceData,
    generateReport,
    resetWizard,
    goBack,
  } = useReportGeneration();

  const handleDownload = () => {
    // In a real implementation, this would download the actual report
    console.log('Downloading report...');
    alert('Descarga iniciada. En una implementación real, aquí se descargaría el reporte.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Informes Fiscales</h1>
          <p className="text-muted-foreground mt-2">
            Genera declaraciones fiscales de criptomonedas para las autoridades españolas
          </p>
        </div>

        {/* Step Content */}
        {currentStep === 'source-selection' && (
          <DataSourceSelection
            onSelect={selectDataSource}
            selectedSource={selectedDataSource || undefined}
          />
        )}

        {currentStep === 'data-input' && selectedDataSource === 'wallet' && address && (
          <WalletDataComponent
            address={address}
            onSubmit={(data: WalletData) => submitDataSourceData(data)}
            onBack={goBack}
          />
        )}

        {currentStep === 'data-input' && selectedDataSource === 'csv' && (
          <CSVUpload
            onSubmit={(data: CSVUploadData) => submitDataSourceData(data)}
            onBack={goBack}
          />
        )}

        {currentStep === 'data-input' && selectedDataSource === 'api-key' && (
          <APIKeyConfig
            onSubmit={(data: APIKeyData) => submitDataSourceData(data)}
            onBack={goBack}
          />
        )}

        {currentStep === 'data-input' && selectedDataSource === 'oauth' && (
          <OAuthAuthorization
            onSubmit={(data: OAuthData) => submitDataSourceData(data)}
            onBack={goBack}
          />
        )}

        {currentStep === 'data-input' && selectedDataSource === 'manual' && (
          <ManualEntry
            onSubmit={(data: ManualEntryTransaction[]) => submitDataSourceData(data)}
            onBack={goBack}
          />
        )}

        {(currentStep === 'report-config' || currentStep === 'generating') && (
          <ReportGenerationWizard
            onGenerate={generateReport}
            onBack={goBack}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
          />
        )}

        {currentStep === 'complete' && generatedReport && (
          <ReportComplete
            report={generatedReport}
            onDownload={handleDownload}
            onGenerateAnother={resetWizard}
          />
        )}
      </div>
    </div>
  );
};
