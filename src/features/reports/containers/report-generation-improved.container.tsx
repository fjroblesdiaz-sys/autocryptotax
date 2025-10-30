'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ReportGenerationWizard } from '@/features/reports/components/report-generation-wizard.component';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useReportRequest } from '@/features/reports/hooks/use-report-request.hook';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportGenerationImprovedContainerProps {
  reportRequestIdParam: string | null;
}

/**
 * Improved Report Generation Container
 * Combines the best of both approaches:
 * - Uses database-backed report requests
 * - Real-time progress updates via SSE
 * - Clean UI from report-generation.container.tsx
 */
export const ReportGenerationImprovedContainer = ({ reportRequestIdParam }: ReportGenerationImprovedContainerProps) => {
  const router = useRouter();
  const { reportRequest, refresh, isLoading } = useReportRequest(reportRequestIdParam || undefined);
  
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Preparando...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [skeletonReady, setSkeletonReady] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Track when initial load is complete to prevent skeleton flashing
  useEffect(() => {
    if (reportRequest || (!isLoading && reportRequestIdParam)) {
      setIsInitialLoad(false);
    }
  }, [reportRequest, isLoading, reportRequestIdParam]);

  // Delay skeleton to avoid flash on very fast loads or brief remounts
  useEffect(() => {
    if (isInitialLoad && !reportRequest) {
      const t = setTimeout(() => setSkeletonReady(true), 200);
      return () => clearTimeout(t);
    }
    setSkeletonReady(false);
  }, [isInitialLoad, reportRequest]);

  // Redirect if no report request ID
  useEffect(() => {
    if (!reportRequestIdParam) {
      console.log('[ReportGeneration] Missing report request ID, redirecting');
      router.push('/reports');
      return;
    }
  }, [reportRequestIdParam, router]);

  // Validate and start generation (only run once when reportRequest is first loaded)
  useEffect(() => {
    if (!reportRequest || hasStartedGeneration) return;

    console.log('[ReportGeneration] Report request loaded:', reportRequest);

    // Check if report request has all required fields
    if (!reportRequest.sourceData || !reportRequest.reportType || !reportRequest.fiscalYear) {
      console.error('[ReportGeneration] Missing required data');
      setErrorMessage('Datos incompletos. Por favor, completa todos los pasos anteriores.');
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
      setErrorMessage(reportRequest.errorMessage || 'Error desconocido al generar el informe');
      return;
    }

    // Validate report type is supported
    if (reportRequest.reportType !== 'model-100') {
      setErrorMessage(`El modelo ${reportRequest.reportType} aún no está implementado. Por favor, selecciona Modelo 100 (IRPF).`);
      return;
    }

    // Validate supported data sources
    if (reportRequest.dataSource !== 'wallet' && reportRequest.dataSource !== 'api-key') {
      setErrorMessage(`El origen de datos ${reportRequest.dataSource} no está implementado aún`);
      return;
    }

    // Start generation
    setHasStartedGeneration(true);
    startGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportRequest?.id, hasStartedGeneration]); // Only depend on ID, not the whole object

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log('[ReportGeneration] Closing SSE connection');
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startGeneration = async () => {
    if (!reportRequest || !reportRequestIdParam) return;

    setIsGenerating(true);
    setProgress(10);
    setProgressMessage('Iniciando generación...');
    setErrorMessage(null);

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

      setProgress(20);
      setProgressMessage('Enviando solicitud...');

      // Start SSE connection for progress updates
      startProgressStream();

      // Call the generation API (fire and forget - SSE will track progress)
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

      setProgress(30);
      setProgressMessage('Procesando transacciones...');

      console.log('[ReportGeneration] Generation API called successfully, SSE tracking progress...');
    } catch (error) {
      console.error('[ReportGeneration] Error starting generation:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(errorMsg);
      setProgress(0);
      setIsGenerating(false);
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }
  };

  const startProgressStream = () => {
    if (!reportRequestIdParam) return;

    console.log('[ReportGeneration] Starting SSE progress stream');
    
    const eventSource = new EventSource(`/api/reports/progress/${reportRequestIdParam}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[ReportGeneration] SSE message:', data);

        if (data.type === 'progress') {
          // Real-time progress from database
          setProgress(Math.min(data.progress || 50, 90)); // Cap at 90% until complete
          setProgressMessage(data.message || 'Generando informe...');
        } else if (data.type === 'complete') {
          // Generation complete
          setProgress(100);
          setProgressMessage('¡Completado!');
          setIsGenerating(false);
          eventSource.close();
          
          // Small delay to show 100% completion
          setTimeout(() => {
            console.log('[ReportGeneration] Navigating to complete page...');
            router.push(`/reports/complete?reportRequestId=${reportRequestIdParam}`);
          }, 500);
        } else if (data.type === 'error') {
          // Error occurred
          setErrorMessage(data.message || 'Error al generar el informe');
          setProgress(0);
          setIsGenerating(false);
          eventSource.close();
        }
      } catch (error) {
        console.error('[ReportGeneration] Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[ReportGeneration] SSE error:', error);
      eventSource.close();
      
      // Don't show error if we're already complete or have an error
      if (!errorMessage && progress < 100) {
        setErrorMessage('Conexión perdida. Refrescando estado...');
        // Try to refresh the report request status
        refresh();
      }
    };
  };

  const handleRetry = () => {
    // Reset state and try again
    setHasStartedGeneration(false);
    setErrorMessage(null);
    setProgress(0);
    setIsGenerating(false);
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    refresh();
  };

  const handleBack = () => {
    if (!isGenerating) {
      router.push(`/reports/configure?reportRequestId=${reportRequestIdParam}`);
    }
  };

  // Only show skeleton on initial load, not on subsequent refetches
  if (!reportRequest && isInitialLoad && skeletonReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div>
            <Skeleton className="h-9 w-64 mb-2" /> {/* Title */}
            <Skeleton className="h-5 w-96" /> {/* Subtitle */}
          </div>

          {/* Main Content Skeleton - matches ReportGenerationWizard layout */}
          <div className="space-y-6">
            {/* Card Skeleton */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              {/* Card Header */}
              <div className="flex flex-col space-y-1.5 p-6">
                <Skeleton className="h-6 w-48 mb-2" /> {/* Card title */}
                <Skeleton className="h-4 w-full max-w-md" /> {/* Card description */}
              </div>
              
              {/* Card Content */}
              <div className="p-6 pt-0 space-y-6">
                {/* Progress indicator area */}
                <div className="space-y-4">
                  <Skeleton className="h-2 w-full" /> {/* Progress bar */}
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon */}
                    <Skeleton className="h-4 w-32" /> {/* Status text */}
                  </div>
                </div>

                {/* Step indicators */}
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" /> {/* Step 1 */}
                  <Skeleton className="h-10 w-full" /> {/* Step 2 */}
                  <Skeleton className="h-10 w-full" /> {/* Step 3 */}
                  <Skeleton className="h-10 w-full" /> {/* Step 4 */}
                </div>

                {/* Buttons area */}
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-10 w-24" /> {/* Back button */}
                  <Skeleton className="h-10 w-32" /> {/* Action button */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not initial load and no data, just return null (shouldn't happen)
  if (!reportRequest) {
    return null;
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
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Generation Progress */}
        <ReportGenerationWizard
          onGenerate={handleRetry}
          onBack={handleBack}
          isGenerating={isGenerating}
          generationProgress={progress}
        />
      </div>
    </div>
  );
};

