'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useReportRequest } from '@/features/reports/hooks/use-report-request.hook';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ReportGenerationContainerNewProps {
  reportRequestIdParam: string | null;
}

/**
 * NEW Report Generation Container
 * Triggers report generation and polls database for completion
 */
export const ReportGenerationContainerNew = ({ reportRequestIdParam }: ReportGenerationContainerNewProps) => {
  const router = useRouter();
  const { reportRequest, refresh, poll, error } = useReportRequest(reportRequestIdParam || undefined);
  
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Redirect if no report request ID
  useEffect(() => {
    if (!reportRequestIdParam) {
      console.log('[ReportGeneration] Missing report request ID, redirecting');
      router.push('/reports');
      return;
    }
  }, [reportRequestIdParam, router]);

  // Validate report request has all required data
  useEffect(() => {
    if (reportRequest && !hasStartedGeneration) {
      // Check if report request has all required fields
      if (!reportRequest.sourceData || !reportRequest.reportType || !reportRequest.fiscalYear) {
        console.error('[ReportGeneration] Missing required data in report request');
        setGenerationError('Datos incompletos. Por favor, completa todos los pasos anteriores.');
        return;
      }

      // Check if already completed
      if (reportRequest.status === 'completed') {
        console.log('[ReportGeneration] Report already completed, redirecting');
        router.push(`/reports/complete?reportRequestId=${reportRequestIdParam}`);
        return;
      }

      // Check if there's an error
      if (reportRequest.status === 'error') {
        setGenerationError(reportRequest.errorMessage || 'Error desconocido al generar el informe');
        return;
      }

      // Start generation if not already processing
      if (reportRequest.status === 'draft') {
        startGeneration();
      } else if (reportRequest.status === 'processing') {
        // Already processing, start polling
        startPolling();
      }
    }
  }, [reportRequest, hasStartedGeneration, reportRequestIdParam, router]);

  const startGeneration = async () => {
    if (!reportRequest || !reportRequestIdParam) return;

    setHasStartedGeneration(true);
    setGenerationError(null);
    setProgress(10);

    try {
      console.log('[ReportGeneration] Starting report generation...');

      // Determine which API endpoint to call based on data source
      let endpoint = '/api/reports/generate';
      let body: any = {
        reportRequestId: reportRequestIdParam,
        fiscalYear: reportRequest.fiscalYear,
        reportType: reportRequest.reportType,
        format: 'pdf', // Default to PDF
      };

      if (reportRequest.dataSource === 'wallet') {
        // Wallet-based generation
        const walletData = reportRequest.sourceData as any;
        body = {
          ...body,
          walletAddress: walletData.address,
          chain: walletData.chain || 'ethereum',
          dateRange: walletData.dateRange,
        };
      } else if (reportRequest.dataSource === 'api-key') {
        // Exchange API-based generation
        endpoint = '/api/reports/generate-from-exchange';
        const apiKeyData = reportRequest.sourceData as any;
        body = {
          ...body,
          exchange: apiKeyData.platform,
          apiKey: apiKeyData.apiKey,
          apiSecret: apiKeyData.apiSecret,
          passphrase: apiKeyData.passphrase,
          dateRange: apiKeyData.dateRange,
        };
      } else {
        throw new Error(`Data source ${reportRequest.dataSource} is not yet implemented`);
      }

      setProgress(30);

      // Call the generation API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      setProgress(50);

      // API call successful, now poll for completion
      await startPolling();

    } catch (error) {
      console.error('[ReportGeneration] Error starting generation:', error);
      setGenerationError(error instanceof Error ? error.message : 'Error desconocido');
      setProgress(0);
    }
  };

  const startPolling = async () => {
    setProgress(60);

    try {
      // Simulate progress during polling
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 1000);

      // Poll the database until completed or error
      const completedRequest = await poll();
      
      clearInterval(progressInterval);
      setProgress(100);

      console.log('[ReportGeneration] Report generation completed');

      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to complete page
      router.push(`/reports/complete?reportRequestId=${reportRequestIdParam}`);

    } catch (error) {
      console.error('[ReportGeneration] Polling error:', error);
      setGenerationError(error instanceof Error ? error.message : 'Error al generar el informe');
      setProgress(0);
    }
  };

  const handleRetry = () => {
    setHasStartedGeneration(false);
    setGenerationError(null);
    setProgress(0);
    refresh(); // Refresh report request data
  };

  const handleBack = () => {
    router.push(`/reports/configure?reportRequestId=${reportRequestIdParam}`);
  };

  if (!reportRequest || error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">{error || 'Cargando...'}</p>
          <Button onClick={() => router.push('/reports')} className="mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Generando Informe</h1>
          <p className="text-muted-foreground mt-2">
            Por favor espera mientras generamos tu informe fiscal
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          
          <div className="flex items-center justify-center gap-2">
            {progress < 100 ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {progress < 30 ? 'Preparando datos...' :
                   progress < 60 ? 'Procesando transacciones...' :
                   progress < 90 ? 'Generando informe...' :
                   'Finalizando...'}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">¡Completado!</span>
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {generationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generationError}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {generationError && (
            <>
              <Button variant="outline" onClick={handleBack}>
                Volver
              </Button>
              <Button onClick={handleRetry}>
                Reintentar
              </Button>
            </>
          )}
        </div>

        {/* Status Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Tipo: {reportRequest.reportType?.toUpperCase()}</p>
          <p>Año Fiscal: {reportRequest.fiscalYear}</p>
          <p>Estado: {reportRequest.status}</p>
        </div>
      </div>
    </div>
  );
};

