'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportComplete } from '@/features/reports/components/report-complete.component';
import { GeneratedReport } from '@/features/reports/types/reports.types';
import { reportDataStorage } from '@/features/reports/utils/report-data-storage';

interface ReportCompleteContainerProps {
  reportId: string | null;
}

/**
 * Report Complete Container
 * Shows the completed report and allows download
 */
export const ReportCompleteContainer = ({ reportId }: ReportCompleteContainerProps) => {
  const router = useRouter();
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!reportId) {
      // No report ID, redirect to start
      router.push('/reports');
      return;
    }

    // Validate stored report ID matches URL
    const storedReportId = reportDataStorage.getField('reportId');
    if (storedReportId !== reportId) {
      router.push('/reports');
      return;
    }

    // Get stored data to create the report object
    const storedData = reportDataStorage.get();
    
    if (!storedData.dataSource || !storedData.reportType || !storedData.fiscalYear) {
      router.push('/reports');
      return;
    }

    // Create mock report object
    // In a real implementation, you would fetch this from your API
    const mockReport: GeneratedReport = {
      id: reportId,
      reportType: storedData.reportType,
      fiscalYear: storedData.fiscalYear,
      generatedAt: new Date(),
      status: 'completed',
      dataSource: storedData.dataSource,
      downloadUrl: '/api/reports/download/mock-report.pdf',
      summary: {
        totalTransactions: Math.floor(Math.random() * 200) + 50,
        totalGains: Math.random() * 10000,
        totalLosses: Math.random() * 5000,
        netResult: Math.random() * 5000,
      },
    };

    setReport(mockReport);
    setIsReady(true);
  }, [reportId, router]);

  const handleDownload = () => {
    // In a real implementation, this would download the actual report
    console.log('Downloading report...');
    alert('Descarga iniciada. En una implementación real, aquí se descargaría el reporte.');
  };

  const handleGenerateAnother = () => {
    // Clear all data and start over
    reportDataStorage.clear();
    router.push('/reports');
  };

  if (!isReady || !report) {
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
          <h1 className="text-3xl font-bold tracking-tight">Informe Completado</h1>
          <p className="text-muted-foreground mt-2">
            Tu informe fiscal ha sido generado exitosamente
          </p>
        </div>

        {/* Report Complete Component */}
        <ReportComplete
          report={report}
          onDownload={handleDownload}
          onGenerateAnother={handleGenerateAnother}
        />
      </div>
    </div>
  );
};

