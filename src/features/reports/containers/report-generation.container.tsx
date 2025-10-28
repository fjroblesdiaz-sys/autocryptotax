'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportGenerationWizard } from '@/features/reports/components/report-generation-wizard.component';
import { reportDataStorage } from '@/features/reports/utils/report-data-storage';
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
  const { generateReport, isLoading, error } = useReportApi();
  const { generateReport: generateFromExchange, isLoading: isExchangeLoading, error: exchangeError } = useExchangeApi();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Validate that we have all required data
    const storedData = reportDataStorage.get();
    
    console.log('Report generation - stored data:', storedData); // Debug log
    
    if (!storedData.dataSource || !storedData.sourceData || !storedData.reportType || !storedData.fiscalYear) {
      // Missing required data, redirect back to start
      console.error('Missing required data:', storedData);
      router.push('/reports');
      return;
    }
    
    // Validate report type is supported
    if (storedData.reportType !== 'model-100') {
      setErrorMessage(`El modelo ${storedData.reportType} aún no está implementado. Por favor, selecciona Modelo 100 (IRPF).`);
      setIsReady(true);
      return;
    }
    
    // Validate supported data sources
    if (storedData.dataSource !== 'wallet' && storedData.dataSource !== 'api-key') {
      setErrorMessage(`El origen de datos ${storedData.dataSource} no está implementado aún`);
      setIsReady(true);
      return;
    }
    
    setIsReady(true);
    
    // Start generation automatically
    startGeneration(storedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const startGeneration = async (storedData: ReturnType<typeof reportDataStorage.get>) => {
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
      if (storedData.dataSource === 'wallet') {
        const walletData = storedData.sourceData as WalletData;
        
        result = await generateReport({
          walletAddress: walletData.address,
          chain: walletData.chain || 'ethereum',
          fiscalYear: storedData.fiscalYear!,
          reportType: storedData.reportType!,
          dateRange: walletData.dateRange,
          format: 'csv',
        });
      } else if (storedData.dataSource === 'api-key') {
        const apiKeyData = storedData.sourceData as APIKeyData;
        
        result = await generateFromExchange(
          apiKeyData,
          storedData.fiscalYear!,
          storedData.reportType!,
          'csv'
        );
      }

      clearInterval(progressInterval);

      if (!result) {
        throw new Error(error || exchangeError || 'Error desconocido al generar el informe');
      }

      setProgress(100);

      // Create generated report object
      const generatedReport: GeneratedReport = {
        id: result.reportId,
        reportType: storedData.reportType!,
        fiscalYear: storedData.fiscalYear!,
        generatedAt: new Date(result.report?.metadata?.generatedAt || Date.now()),
        status: 'completed',
        dataSource: storedData.dataSource!,
        downloadUrl: result.downloadUrl,
        summary: {
          totalTransactions: result.taxCalculation?.transactionCount || 0,
          totalGains: result.taxCalculation?.totalGains || 0,
          totalLosses: result.taxCalculation?.totalLosses || 0,
          netResult: result.taxCalculation?.netGainLoss || 0,
        },
      };

      // Save report ID, full report data, and CSV if available
      reportDataStorage.save({ 
        reportId: generatedReport.id,
        generatedReport,
        reportCSV: result.csv,
      });

      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to completion page
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

