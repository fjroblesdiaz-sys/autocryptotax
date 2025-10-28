'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportGenerationWizard } from '@/features/reports/components/report-generation-wizard.component';
import { reportDataStorage } from '@/features/reports/utils/report-data-storage';
import { GeneratedReport } from '@/features/reports/types/reports.types';

/**
 * Report Generation Container
 * Shows progress while generating the report
 */
export const ReportGenerationContainer = () => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Validate that we have all required data
    const storedData = reportDataStorage.get();
    
    if (!storedData.dataSource || !storedData.sourceData || !storedData.reportType || !storedData.fiscalYear) {
      // Missing required data, redirect back to start
      router.push('/reports');
      return;
    }
    
    setIsReady(true);
    
    // Start generation automatically
    startGeneration(storedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const startGeneration = async (storedData: ReturnType<typeof reportDataStorage.get>) => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate report generation with progress updates
      // In a real implementation, this would call your backend API
      
      // Progress: Collecting transactions
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(25);

      // Progress: Fetching historical prices
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(50);

      // Progress: Calculating gains/losses
      await new Promise(resolve => setTimeout(resolve, 700));
      setProgress(75);

      // Progress: Generating PDF
      await new Promise(resolve => setTimeout(resolve, 600));
      setProgress(90);

      // Final step
      await new Promise(resolve => setTimeout(resolve, 400));
      setProgress(100);

      // Create mock generated report
      const mockReport: GeneratedReport = {
        id: `report-${Date.now()}`,
        reportType: storedData.reportType!,
        fiscalYear: storedData.fiscalYear!,
        generatedAt: new Date(),
        status: 'completed',
        dataSource: storedData.dataSource!,
        downloadUrl: '/api/reports/download/mock-report.pdf',
        summary: {
          totalTransactions: Math.floor(Math.random() * 200) + 50,
          totalGains: Math.random() * 10000,
          totalLosses: Math.random() * 5000,
          netResult: Math.random() * 5000,
        },
      };

      // Save report ID to session storage
      reportDataStorage.save({ reportId: mockReport.id });

      // Navigate to completion page
      router.push(`/reports/complete?id=${mockReport.id}`);
    } catch (err) {
      console.error('Error generating report:', err);
      // On error, go back to configuration
      router.push('/reports/configure');
    }
  };

  const handleBack = () => {
    // Can't go back while generating
    if (!isGenerating) {
      router.push('/reports/configure');
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
          <h1 className="text-3xl font-bold tracking-tight">Generando Informe</h1>
          <p className="text-muted-foreground mt-2">
            Por favor espera mientras generamos tu informe fiscal
          </p>
        </div>

        {/* Generation Progress */}
        <ReportGenerationWizard
          onGenerate={() => {}} // Not used in this page
          onBack={handleBack}
          isGenerating={isGenerating}
          generationProgress={progress}
        />
      </div>
    </div>
  );
};

