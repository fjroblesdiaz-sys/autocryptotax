'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Download, FileText, AlertCircle } from 'lucide-react';
import { useReportRequest } from '@/features/reports/hooks/use-report-request.hook';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportCompleteContainerNewProps {
  reportRequestIdParam: string | null;
}

/**
 * NEW Report Complete Container
 * Shows completed report and downloads from Cloudinary
 */
export const ReportCompleteContainerNew = ({ reportRequestIdParam }: ReportCompleteContainerNewProps) => {
  const router = useRouter();
  const { reportRequest, refresh, isLoading, error } = useReportRequest(reportRequestIdParam || undefined);
  
  const [isDownloading, setIsDownloading] = useState(false);

  // Redirect if no report request ID
  useEffect(() => {
    if (!reportRequestIdParam) {
      console.log('[ReportComplete] Missing report request ID, redirecting');
      router.push('/reports');
      return;
    }
  }, [reportRequestIdParam, router]);

  // Check report status
  useEffect(() => {
    if (reportRequest) {
      if (reportRequest.status === 'processing') {
        // Still processing, redirect back to generation page
        console.log('[ReportComplete] Report still processing, redirecting');
        router.push(`/reports/generate?reportRequestId=${reportRequestIdParam}`);
        return;
      }

      if (reportRequest.status === 'draft') {
        // Not yet generated, redirect to start
        console.log('[ReportComplete] Report not generated yet, redirecting');
        router.push('/reports');
        return;
      }
    }
  }, [reportRequest, reportRequestIdParam, router]);

  const handleDownload = async () => {
    if (!reportRequest || !reportRequest.cloudinaryUrl) {
      alert('No hay archivo disponible para descargar');
      return;
    }

    setIsDownloading(true);

    try {
      // Use the download API endpoint which will redirect to Cloudinary
      const downloadUrl = `/api/reports/download/${reportRequestIdParam}`;
      
      // Open in new tab to trigger download
      window.open(downloadUrl, '_blank');

      console.log('[ReportComplete] Download initiated');
    } catch (error) {
      console.error('[ReportComplete] Download error:', error);
      alert('Error al descargar el informe. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGenerateAnother = () => {
    router.push('/reports');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => router.push('/reports')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (reportRequest.status === 'error') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Error en Generación</h1>
            <p className="text-muted-foreground mt-2">
              Hubo un problema al generar tu informe
            </p>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {reportRequest.errorMessage || 'Error desconocido'}
            </AlertDescription>
          </Alert>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleGenerateAnother}>
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">¡Informe Completado!</h1>
          <p className="text-muted-foreground mt-2">
            Tu informe fiscal ha sido generado exitosamente
          </p>
        </div>

        {/* Report Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Informe</CardTitle>
            <CardDescription>
              Generado el {format(new Date(reportRequest.updatedAt), 'PPP', { locale: es })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Report Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Informe</p>
                <p className="font-medium">{reportRequest.reportType?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Año Fiscal</p>
                <p className="font-medium">{reportRequest.fiscalYear}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Origen de Datos</p>
                <p className="font-medium capitalize">{reportRequest.dataSource}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Formato</p>
                <p className="font-medium uppercase">{reportRequest.fileFormat || 'PDF'}</p>
              </div>
            </div>

            {/* Financial Summary */}
            {reportRequest.totalTransactions !== null && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Resumen Financiero</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transacciones</p>
                    <p className="text-lg font-bold">{reportRequest.totalTransactions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ganancias</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(reportRequest.totalGains || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pérdidas</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(reportRequest.totalLosses || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Resultado Neto</p>
                    <p className={`text-lg font-bold ${(reportRequest.netResult || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportRequest.netResult || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownload}
            disabled={isDownloading || !reportRequest.cloudinaryUrl}
            size="lg"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Descargando...' : 'Descargar Informe'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGenerateAnother}
            size="lg"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Generar Otro Informe
          </Button>
        </div>

        {/* Info Note */}
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Tu informe se ha guardado de forma segura. Puedes descargarlo tantas veces como necesites.
            El archivo está almacenado en la nube y estará disponible para futuras descargas.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

