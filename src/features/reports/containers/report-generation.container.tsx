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
import { saveReportToCache } from '@/lib/cache-manager';

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
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const [validationChecked, setValidationChecked] = useState(false);

  useEffect(() => {
    // Only validate once to prevent redirect loops
    if (validationChecked) {
      return;
    }

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
      setValidationChecked(true);
      return;
    }
    
    // Validate supported data sources
    if (dataSource !== 'wallet' && dataSource !== 'api-key') {
      setErrorMessage(`El origen de datos ${dataSource} no está implementado aún`);
      setIsReady(true);
      setValidationChecked(true);
      return;
    }
    
    setIsReady(true);
    setValidationChecked(true);
    
    // Start generation automatically only once
    if (!hasStartedGeneration) {
      setHasStartedGeneration(true);
      startGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const errorMsg = error || exchangeError || 'Error desconocido al generar el informe';
        console.error('[ReportGeneration] Result is null/undefined. Error:', errorMsg);
        throw new Error(errorMsg);
      }

      // Check if the API returned an error in the response
      if (result.error) {
        console.error('[ReportGeneration] API returned error:', result.error);
        throw new Error(result.error);
      }

      // Verify we have the minimum required data
      if (!result.reportId && !result.summary) {
        console.error('[ReportGeneration] Invalid API response format:', result);
        throw new Error('Respuesta inválida del servidor. Por favor, inténtalo de nuevo.');
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
      console.log('[ReportGeneration] Setting report and CSV in context');
      console.log('[ReportGeneration] CSV length:', result.csv?.length || 0);
      console.log('[ReportGeneration] CSV preview:', result.csv?.substring(0, 300));
      
      setGeneratedReport(generatedReport);
      if (result.csv) {
        setReportCSV(result.csv);
      }

      // Save to localStorage as backup to prevent data loss on navigation
      try {
        saveReportToCache(generatedReport.id, {
          report: generatedReport,
          csv: result.csv,
          dataSource,
          reportType,
          fiscalYear,
        });
      } catch (e) {
        console.error('[ReportGeneration] Failed to save to localStorage:', e);
      }

      // Small delay to show 100% completion and ensure context is saved
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to completion page with reportId as query param
      console.log('[ReportGeneration] Navigating to complete page...');
      router.push(`/reports/complete?id=${generatedReport.id}`);
    } catch (err) {
      console.error('[ReportGeneration] Error during report generation:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido al generar el informe';
      setErrorMessage(errorMsg);
      setProgress(0);
      // Don't redirect on error, let user see the error message and retry
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

