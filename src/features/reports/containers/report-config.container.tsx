'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportGenerationWizard } from '@/features/reports/components/report-generation-wizard.component';
import { ReportType } from '@/features/reports/types/reports.types';
import { useReportRequest } from '@/features/reports/hooks/use-report-request.hook';

interface ReportConfigContainerProps {
  reportRequestIdParam: string | null;
}

/**
 * Report Configuration Container
 * Allows users to configure report type and fiscal year
 */
export const ReportConfigContainer = ({ reportRequestIdParam }: ReportConfigContainerProps) => {
  const router = useRouter();
  const { reportRequest, update, isLoading, error } = useReportRequest(reportRequestIdParam || undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Validate that we have a report request ID
    if (!reportRequestIdParam) {
      console.log('[ReportConfig] Missing report request ID, redirecting to /reports');
      router.push('/reports');
      return;
    }
    
    // Validate that report request has source data
    if (reportRequest && !reportRequest.sourceData) {
      console.log('[ReportConfig] Report request missing source data, redirecting back');
      router.push(`/reports/data-input?reportRequestId=${reportRequestIdParam}&source=${reportRequest.dataSource}`);
      return;
    }
  }, [reportRequestIdParam, reportRequest, router]);

  const handleGenerate = async (reportType: ReportType, year: number) => {
    console.log('[ReportConfig] Saving report config:', { reportType, year });
    
    setIsSaving(true);
    try {
      // Update report request with configuration
      await update({
        reportType,
        fiscalYear: year,
      });
      
      // Navigate to generation page
      router.push(`/reports/generate?reportRequestId=${reportRequestIdParam}`);
    } catch (error) {
      console.error('[ReportConfig] Failed to update report request:', error);
      alert('Failed to save configuration. Please try again.');
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    // Go back to data input page
    if (reportRequest) {
      router.push(`/reports/data-input?reportRequestId=${reportRequestIdParam}&source=${reportRequest.dataSource}`);
    } else {
      router.push('/reports');
    }
  };

  if (isLoading || !reportRequest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <button onClick={() => router.push('/reports')} className="mt-4 underline">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurar Informe</h1>
          <p className="text-muted-foreground mt-2">
            Selecciona el tipo de informe y el año fiscal
          </p>
        </div>

        {/* Report Configuration Wizard */}
        <ReportGenerationWizard
          onGenerate={handleGenerate}
          onBack={handleBack}
          isGenerating={isSaving}
          generationProgress={0}
        />
      </div>
    </div>
  );
};

