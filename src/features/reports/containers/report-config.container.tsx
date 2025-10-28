'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportGenerationWizard } from '@/features/reports/components/report-generation-wizard.component';
import { ReportType } from '@/features/reports/types/reports.types';
import { reportDataStorage } from '@/features/reports/utils/report-data-storage';

/**
 * Report Configuration Container
 * Allows users to configure report type and fiscal year
 */
export const ReportConfigContainer = () => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Validate that we have the required data to be on this page
    const storedData = reportDataStorage.get();
    
    console.log('[ReportConfig] Stored data:', storedData);
    console.log('[ReportConfig] Has dataSource:', !!storedData.dataSource);
    console.log('[ReportConfig] Has sourceData:', !!storedData.sourceData);
    
    if (!storedData.dataSource || !storedData.sourceData) {
      // Missing required data, redirect back to start
      console.log('[ReportConfig] Missing required data, redirecting to /reports');
      router.push('/reports');
      return;
    }
    
    // Clear any previously saved reportType to ensure fresh selection
    const { reportType, fiscalYear, reportId, generatedReport, reportCSV, reportJSON, ...keepData } = storedData;
    reportDataStorage.clear();
    reportDataStorage.save(keepData);
    
    console.log('[ReportConfig] Ready, data preserved:', keepData);
    setIsReady(true);
  }, [router]);

  const handleGenerate = (reportType: ReportType, year: number) => {
    // Save report configuration (always use what user just selected)
    reportDataStorage.save({
      reportType,
      fiscalYear: year,
    });
    
    console.log('Saving report config:', { reportType, year }); // Debug log
    
    // Navigate to generation page
    router.push('/reports/generate');
  };

  const handleBack = () => {
    // Go back to data input page with the source
    const source = reportDataStorage.getField('dataSource');
    if (source) {
      router.push(`/reports/data-input?source=${source}`);
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

