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
  const { generatedReport, reportCSV, dataSource, sourceData, reportType, fiscalYear, setReportCSV } = useReportData();
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

    // Try to load from context first
    if (generatedReport) {
      // Validate report ID matches URL
      if (generatedReport.id === reportId) {
        console.log('[ReportComplete] Report loaded from context successfully');
        setReport(generatedReport);
        setIsReady(true);
        
        // Save to localStorage as backup
        try {
          localStorage.setItem(`report_${reportId}`, JSON.stringify({
            report: generatedReport,
            csv: reportCSV,
            dataSource,
            reportType,
            fiscalYear,
          }));
        } catch (e) {
          console.error('[ReportComplete] Failed to save to localStorage:', e);
        }
        return;
      } else {
        console.log('[ReportComplete] Report ID mismatch:', {
          context: generatedReport.id,
          url: reportId,
        });
      }
    }

    // If not in context, try to load from localStorage
    console.log('[ReportComplete] No generatedReport in context, checking localStorage...');
    try {
      const stored = localStorage.getItem(`report_${reportId}`);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('[ReportComplete] Report loaded from localStorage');
        setReport(data.report);
        
        // Restore CSV to context if available
        if (data.csv) {
          console.log('[ReportComplete] Restoring CSV from localStorage');
          setReportCSV(data.csv);
        }
        
        setIsReady(true);
        return;
      }
    } catch (e) {
      console.error('[ReportComplete] Failed to load from localStorage:', e);
    }

    // If still no report after a delay, redirect
    console.log('[ReportComplete] No report found, waiting 2 seconds before redirect...');
    const timeoutId = setTimeout(() => {
      console.log('[ReportComplete] Still no report after timeout, redirecting to /reports');
      router.push('/reports');
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [reportId, generatedReport, reportCSV, dataSource, reportType, fiscalYear, router]);

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
    // Try to get data from context or localStorage
    let pdfDataSource = dataSource;
    let pdfSourceData = sourceData;
    let pdfReportType = reportType;
    let pdfFiscalYear = fiscalYear;

    if (!pdfDataSource || !pdfSourceData || !pdfReportType || !pdfFiscalYear) {
      console.log('[ReportComplete] Missing context data, trying localStorage...');
      try {
        const stored = localStorage.getItem(`report_${reportId}`);
        if (stored) {
          const data = JSON.parse(stored);
          pdfDataSource = data.dataSource;
          pdfReportType = data.reportType;
          pdfFiscalYear = data.fiscalYear;
          // Note: sourceData is not stored in localStorage for security reasons
          console.warn('[ReportComplete] Could not restore sourceData from localStorage');
        }
      } catch (e) {
        console.error('[ReportComplete] Failed to load from localStorage:', e);
      }
    }

    if (!pdfSourceData || !pdfReportType || !pdfFiscalYear) {
      console.error('[ReportComplete] Missing data for PDF download');
      alert('No se pueden descargar los archivos. Por favor, genera el informe nuevamente.');
      return;
    }

    try {
      let response: Response;

      // Handle different data sources
      if (pdfDataSource === 'wallet') {
        const walletData = pdfSourceData as WalletData;
        
        response = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: walletData.address,
            chain: walletData.chain || 'ethereum',
            fiscalYear: pdfFiscalYear,
            reportType: pdfReportType,
            dateRange: walletData.dateRange ? {
              from: walletData.dateRange.from.toISOString(),
              to: walletData.dateRange.to.toISOString(),
            } : undefined,
            format: 'pdf',
          }),
        });
      } else if (pdfDataSource === 'api-key') {
        const apiKeyData = pdfSourceData as APIKeyData;
        
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
            fiscalYear: pdfFiscalYear,
            reportType: pdfReportType,
            dateRange: apiKeyData.dateRange ? {
              from: apiKeyData.dateRange.from.toISOString(),
              to: apiKeyData.dateRange.to.toISOString(),
            } : undefined,
            format: 'pdf',
          }),
        });
      } else {
        throw new Error(`Unsupported data source: ${pdfDataSource}`);
      }

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `modelo-${pdfReportType}-${pdfFiscalYear}.pdf`;
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

