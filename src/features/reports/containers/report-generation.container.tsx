'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportGenerationWizard } from '@/features/reports/components/report-generation-wizard.component';
import { useReportData } from '@/features/reports/context/report-data.context';
import { GeneratedReport, WalletData, APIKeyData } from '@/features/reports/types/reports.types';
import { useReportApi } from '@/features/reports/hooks/use-report-api.hook';
import { useExchangeApi } from '@/features/reports/hooks/use-exchange-api.hook';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Report Generation Container
 * Shows progress while generating the report using the real API
 */
export const ReportGenerationContainer = () => {
  const router = useRouter();
  const { dataSource, sourceData, reportType, fiscalYear, setGeneratedReport, setReportCSV } = useReportData();
  const { generateReport, isLoading, error } = useReportApi();
  const { generateReport: generateFromExchange, isLoading: isExchangeLoading, error: exchangeError } = useExchangeApi();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Validate that we have all required data
    console.log('[ReportGeneration] Context data:', { dataSource, hasSourceData: !!sourceData, reportType, fiscalYear });
    
    if (!dataSource || !sourceData || !reportType || !fiscalYear) {
      // Missing required data, redirect back to start
      console.error('[ReportGeneration] Missing required data, redirecting to /reports');
      router.push('/reports');
      return;
    }
    
    // Validate report type is supported
    if (reportType !== 'model-100') {
      setErrorMessage(`El modelo ${reportType} aún no está implementado. Por favor, selecciona Modelo 100 (IRPF).`);
      setIsReady(true);
      return;
    }
    
    // Validate supported data sources
    if (dataSource !== 'wallet' && dataSource !== 'api-key') {
      setErrorMessage(`El origen de datos ${dataSource} no está implementado aún`);
      setIsReady(true);
      return;
    }
    
    setIsReady(true);
    
    // Start generation automatically
    startGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, sourceData, reportType, fiscalYear, router]);

  const startGeneration = async () => {
    if (!dataSource || !sourceData || !reportType || !fiscalYear) {
      console.error('[ReportGeneration] Missing data for generation');
      return;
    }

    setProgress(0);
    setErrorMessage(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      let result;

      // Handle different data sources
      if (dataSource === 'wallet') {
        const walletData = sourceData as WalletData;
        
        result = await generateReport({
          walletAddress: walletData.address,
          chain: walletData.chain || 'ethereum',
          fiscalYear: fiscalYear,
          reportType: reportType,
          dateRange: walletData.dateRange,
          format: 'csv',
        });
      } else if (dataSource === 'api-key') {
        const apiKeyData = sourceData as APIKeyData;
        
        result = await generateFromExchange(
          apiKeyData,
          fiscalYear,
          reportType,
          'csv'
        );
      }

      clearInterval(progressInterval);

      console.log('[ReportGeneration] API result:', result);

      if (!result) {
        throw new Error(error || exchangeError || 'Error desconocido al generar el informe');
      }

      setProgress(100);

      // Create generated report object with proper fallbacks
      const generatedReport: GeneratedReport = {
        id: result.reportId || `report-${Date.now()}`,
        reportType: reportType,
        fiscalYear: fiscalYear,
        generatedAt: new Date(result.report?.metadata?.generatedAt || result.summary?.generatedAt || Date.now()),
        status: 'completed',
        dataSource: dataSource,
        downloadUrl: result.downloadUrl,
        summary: {
          totalTransactions: result.taxCalculation?.transactionCount || result.summary?.totalTransactions || 0,
          totalGains: result.taxCalculation?.totalGains || result.summary?.totalGains || 0,
          totalLosses: result.taxCalculation?.totalLosses || result.summary?.totalLosses || 0,
          netResult: result.taxCalculation?.netGainLoss || result.summary?.netResult || 0,
        },
      };

      console.log('[ReportGeneration] Generated report object:', generatedReport);

      // Save to context
      setGeneratedReport(generatedReport);
      if (result.csv) {
        setReportCSV(result.csv);
      }

      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to completion page with reportId as query param
      console.log('[ReportGeneration] Navigating to complete page...');
      router.push(`/reports/complete?id=${generatedReport.id}`);
    } catch (err) {
      console.error('Error generating report:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido');
      setProgress(0);
    }
  };

  const handleBack = () => {
    // Can't go back while generating
    if (!isLoading && !isExchangeLoading) {
      router.push('/reports/configure');
    }
  };

  const handleRetry = () => {
    // Go back to config page to reselect report type
    router.push('/reports/configure');
  };

  if (!isReady && !errorMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generando Informe</h1>
          <p className="text-muted-foreground mt-2">
            Por favor espera mientras generamos tu informe fiscal
          </p>
        </div>

        {/* Error Display */}
        {(errorMessage || error || exchangeError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage || error || exchangeError}
            </AlertDescription>
          </Alert>
        )}

        {/* Generation Progress */}
        <ReportGenerationWizard
          onGenerate={handleRetry}
          onBack={handleBack}
          isGenerating={isLoading || isExchangeLoading}
          generationProgress={progress}
        />
      </div>
    </div>
  );
};

