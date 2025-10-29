'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportComplete } from '@/features/reports/components/report-complete.component';
import { GeneratedReport, WalletData, APIKeyData } from '@/features/reports/types/reports.types';
import { useReportData } from '@/features/reports/context/report-data.context';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getReportFromCache, getPDFFromCache, savePDFToCache } from '@/lib/cache-manager';

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
  const [validationDone, setValidationDone] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

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
    const cachedData = getReportFromCache(reportId);
    
    if (cachedData) {
      console.log('[ReportComplete] Report loaded from cache');
      setReport(cachedData.report);
      
      // Restore CSV to context if available
      if (cachedData.csv) {
        console.log('[ReportComplete] Restoring CSV from cache');
        setReportCSV(cachedData.csv);
      }
      
      setIsReady(true);
      return;
    }

    // If still no report after a delay, redirect
    console.log('[ReportComplete] No report found, waiting 2 seconds before redirect...');
    const timeoutId = setTimeout(() => {
      console.log('[ReportComplete] Still no report after timeout, redirecting to /reports');
      router.push('/reports');
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [reportId, generatedReport, reportCSV, dataSource, reportType, fiscalYear, router]);

  const handleDownloadCSV = async () => {
    if (!report || isDownloadingCSV) return;

    setIsDownloadingCSV(true);
    console.log('[ReportComplete] Starting CSV download...');
    console.log('[ReportComplete] reportCSV available:', !!reportCSV);
    console.log('[ReportComplete] reportCSV length:', reportCSV?.length || 0);
    
    try {
      if (reportCSV) {
        console.log('[ReportComplete] Downloading CSV from context...');
        const blob = new Blob([reportCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `informe-fiscal-${report.reportType}-${report.fiscalYear}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('[ReportComplete] CSV downloaded successfully');
      } else if (generatedReport) {
        console.log('[ReportComplete] Generating and downloading CSV fallback...');
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
        console.log('[ReportComplete] CSV fallback downloaded successfully');
      } else {
        console.warn('[ReportComplete] No CSV data available');
        alert('No hay datos CSV disponibles. Por favor, genera el informe nuevamente.');
      }
    } catch (error) {
      console.error('[ReportComplete] Error downloading CSV:', error);
      alert('Error al descargar el CSV. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDownloadingCSV(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report || isDownloadingPDF) return;

    setIsDownloadingPDF(true);
    console.log('[ReportComplete] Starting PDF download...');
    
    try {
      await downloadPDF();
      console.log('[ReportComplete] PDF downloaded successfully');
    } catch (error) {
      console.error('[ReportComplete] Error downloading PDF:', error);
      alert('Error al descargar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportId) {
      console.error('[ReportComplete] No reportId available');
      return;
    }

    // Try to get cached PDF first for instant download
    const cachedPDF = await getPDFFromCache(reportId);
    if (cachedPDF) {
      console.log('[ReportComplete] Using cached PDF (instant download)');
      const url = URL.createObjectURL(cachedPDF);
      const link = document.createElement('a');
      link.href = url;
      link.download = `modelo-${report?.reportType || 'report'}-${report?.fiscalYear || '2025'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }

    // If not cached, generate it
    console.log('[ReportComplete] PDF not cached, generating...');
    
    // Try to get data from context or localStorage
    let pdfDataSource = dataSource;
    let pdfSourceData = sourceData;
    let pdfReportType = reportType;
    let pdfFiscalYear = fiscalYear;

    if (!pdfDataSource || !pdfSourceData || !pdfReportType || !pdfFiscalYear) {
      console.log('[ReportComplete] Missing context data, trying localStorage...');
      const cachedData = getReportFromCache(reportId);
      if (cachedData) {
        pdfDataSource = cachedData.dataSource;
        pdfReportType = cachedData.reportType;
        pdfFiscalYear = cachedData.fiscalYear;
        // Note: sourceData is not stored in cache for security reasons
        console.warn('[ReportComplete] Could not restore sourceData from cache');
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
      
      // Cache the PDF for future downloads
      if (reportId) {
        await savePDFToCache(reportId, blob);
      }
      
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
    console.log('[ReportComplete] generateCSVReport called');
    console.log('[ReportComplete] reportCSV available:', !!reportCSV);
    console.log('[ReportComplete] reportCSV length:', reportCSV?.length || 0);
    console.log('[ReportComplete] reportCSV preview:', reportCSV?.substring(0, 300));
    
    // Use stored CSV from context if available
    if (reportCSV) {
      console.log('[ReportComplete] Using reportCSV from context');
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
        onDownloadPDF={handleDownloadPDF}
        onDownloadCSV={handleDownloadCSV}
        onGenerateAnother={handleGenerateAnother}
        isDownloadingPDF={isDownloadingPDF}
        isDownloadingCSV={isDownloadingCSV}
      />
      </div>
    </div>
  );
};

