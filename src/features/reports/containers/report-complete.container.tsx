'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportComplete } from '@/features/reports/components/report-complete.component';
import { GeneratedReport, WalletData, APIKeyData } from '@/features/reports/types/reports.types';
import { useReportData } from '@/features/reports/context/report-data.context';
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
  const { generatedReport, reportCSV, dataSource, sourceData, reportType, fiscalYear } = useReportData();
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[ReportComplete] reportId from URL:', reportId);
    console.log('[ReportComplete] Context report:', generatedReport);
    
    if (!reportId) {
      // No report ID, redirect to start
      console.log('[ReportComplete] No reportId, redirecting to /reports');
      router.push('/reports');
      return;
    }

    if (!generatedReport) {
      // No generated report, redirect to start
      console.log('[ReportComplete] No generatedReport in context, redirecting to /reports');
      router.push('/reports');
      return;
    }

    // Validate report ID matches URL
    if (generatedReport.id !== reportId) {
      console.log('[ReportComplete] Report ID mismatch:', {
        context: generatedReport.id,
        url: reportId,
      });
      console.log('[ReportComplete] Redirecting to /reports due to ID mismatch');
      router.push('/reports');
      return;
    }

    console.log('[ReportComplete] Report loaded successfully');
    setReport(generatedReport);
    setIsReady(true);
  }, [reportId, generatedReport, router]);

  const handleDownload = async () => {
    if (!report) return;

    try {
      // Download PDF from API
      await downloadPDF();
      
      // Also download CSV if available
      if (reportCSV) {
        const blob = new Blob([reportCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `informe-fiscal-${report.reportType}-${report.fiscalYear}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (generatedReport) {
        // Fallback: generate CSV from report data
        const csvContent = generateCSVReport(generatedReport);
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
    if (!sourceData || !reportType || !fiscalYear) {
      console.error('[ReportComplete] Missing data for PDF download');
      return;
    }

    try {
      let response: Response;

      // Handle different data sources
      if (dataSource === 'wallet') {
        const walletData = sourceData as WalletData;
        
        response = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: walletData.address,
            chain: walletData.chain || 'ethereum',
            fiscalYear: fiscalYear,
            reportType: reportType,
            dateRange: walletData.dateRange ? {
              from: walletData.dateRange.from.toISOString(),
              to: walletData.dateRange.to.toISOString(),
            } : undefined,
            format: 'pdf',
          }),
        });
      } else if (dataSource === 'api-key') {
        const apiKeyData = sourceData as APIKeyData;
        
        response = await fetch('/api/reports/generate-from-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exchange: apiKeyData.platform,
            apiKey: apiKeyData.apiKey,
            apiSecret: apiKeyData.apiSecret,
            passphrase: apiKeyData.passphrase,
            fiscalYear: fiscalYear,
            reportType: reportType,
            dateRange: apiKeyData.dateRange ? {
              from: apiKeyData.dateRange.from.toISOString(),
              to: apiKeyData.dateRange.to.toISOString(),
            } : undefined,
            format: 'pdf',
          }),
        });
      } else {
        throw new Error(`Unsupported data source: ${dataSource}`);
      }

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `modelo-${reportType}-${fiscalYear}.pdf`;
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
    // Use stored CSV from context if available
    if (reportCSV) {
      return reportCSV;
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
    // Navigate to reports start
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

