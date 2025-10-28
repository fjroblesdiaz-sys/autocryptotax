'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportGenerationWizard } from '@/features/reports/components/report-generation-wizard.component';
import { ReportType } from '@/features/reports/types/reports.types';
import { useReportData } from '@/features/reports/context/report-data.context';

/**
 * Report Configuration Container
 * Allows users to configure report type and fiscal year
 */
export const ReportConfigContainer = () => {
  const router = useRouter();
  const { dataSource, sourceData, setReportType, setFiscalYear } = useReportData();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Validate that we have the required data to be on this page
    console.log('[ReportConfig] Context data:', { dataSource, hasSourceData: !!sourceData });
    
    if (!dataSource || !sourceData) {
      // Missing required data, redirect back to start
      console.log('[ReportConfig] Missing required data, redirecting to /reports');
      router.push('/reports');
      return;
    }
    
    console.log('[ReportConfig] Ready with data source:', dataSource);
    setIsReady(true);
  }, [dataSource, sourceData, router]);

  const handleGenerate = (reportType: ReportType, year: number) => {
    console.log('[ReportConfig] Saving report config:', { reportType, year });
    
    // Save to context
    setReportType(reportType);
    setFiscalYear(year);
    
    // Navigate to generation page
    router.push('/reports/generate');
  };

  const handleBack = () => {
    // Go back to data input page with the source
    if (dataSource) {
      router.push(`/reports/data-input?source=${dataSource}`);
    } else {
      router.push('/reports');
    }
  };

  if (!isReady) {
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
          <h1 className="text-3xl font-bold tracking-tight">Configurar Informe</h1>
          <p className="text-muted-foreground mt-2">
            Selecciona el tipo de informe y el año fiscal
          </p>
        </div>

        {/* Report Configuration Wizard */}
        <ReportGenerationWizard
          onGenerate={handleGenerate}
          onBack={handleBack}
          isGenerating={false}
          generationProgress={0}
        />
      </div>
    </div>
  );
};

