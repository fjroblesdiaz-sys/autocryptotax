'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportComplete } from '@/features/reports/components/report-complete.component';
import { GeneratedReport, WalletData } from '@/features/reports/types/reports.types';
import { reportDataStorage } from '@/features/reports/utils/report-data-storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

    // Get the generated report from storage
    const storedData = reportDataStorage.get();
    
    if (!storedData.generatedReport) {
      // No generated report, redirect to start
      router.push('/reports');
      return;
    }

    setReport(storedData.generatedReport);
    setIsReady(true);
  }, [reportId, router]);

  const handleDownload = async () => {
    if (!report) return;

    try {
      // Get the report data from storage
      const storedData = reportDataStorage.get();
      
      // Download PDF from API
      await downloadPDF();
      
      // Also download CSV as backup
      if (storedData.generatedReport) {
        const csvContent = generateCSVReport(storedData.generatedReport);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `informe-fiscal-${report.reportType}-${report.fiscalYear}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error al descargar el informe. Por favor, inténtalo de nuevo.');
    }
  };

  const downloadPDF = async () => {
    const storedData = reportDataStorage.get();
    const walletData = storedData.sourceData as WalletData;

    if (!walletData) return;

    try {
      // Call API to generate PDF
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletData.address,
          chain: walletData.chain || 'ethereum',
          fiscalYear: storedData.fiscalYear,
          reportType: storedData.reportType,
          dateRange: walletData.dateRange ? {
            from: walletData.dateRange.from.toISOString(),
            to: walletData.dateRange.to.toISOString(),
          } : undefined,
          format: 'pdf',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `modelo-${storedData.reportType}-${storedData.fiscalYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  };

  // Helper function to generate CSV from report
  const generateCSVReport = (report: GeneratedReport): string => {
    const storedData = reportDataStorage.get();
    
    // Use stored CSV from API if available
    if (storedData.reportCSV) {
      return storedData.reportCSV;
    }
    
    // Otherwise, generate simple CSV
    let csv = `Informe Fiscal - ${report.reportType.toUpperCase()}\n`;
    csv += `Año Fiscal: ${report.fiscalYear}\n`;
    csv += `Generado: ${format(report.generatedAt, 'PPP', { locale: es })}\n`;
    csv += `\n`;
    
    if (report.summary) {
      csv += `RESUMEN\n`;
      csv += `Total de Transacciones,${report.summary.totalTransactions}\n`;
      csv += `Ganancias Totales,€${report.summary.totalGains.toFixed(2)}\n`;
      csv += `Pérdidas Totales,€${report.summary.totalLosses.toFixed(2)}\n`;
      csv += `Resultado Neto,€${report.summary.netResult.toFixed(2)}\n`;
      csv += `\n`;
    }
    
    csv += `NOTA: Este es un informe preliminar en formato CSV.\n`;
    csv += `Para obtener el informe completo en PDF, contacte con soporte.\n`;
    
    return csv;
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

