'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Download, FileText, TrendingUp, TrendingDown, Receipt, Loader2 } from 'lucide-react';
import { GeneratedReport } from '../types/reports.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReportCompleteProps {
  report: GeneratedReport;
  onDownload: () => void;
  onGenerateAnother: () => void;
  isDownloading?: boolean;
}

const reportTypeLabels = {
  'model-720': 'Modelo 720',
  'model-100': 'Modelo 100',
  'model-714': 'Modelo 714',
};

const dataSourceLabels = {
  wallet: 'Cartera Conectada',
  csv: 'Archivo CSV',
  'api-key': 'API Key',
  oauth: 'OAuth',
  manual: 'Entrada Manual',
};

export const ReportComplete = ({ report, onDownload, onGenerateAnother, isDownloading = false }: ReportCompleteProps) => {
  const netResult = report.summary ? report.summary.netResult : 0;
  const isProfit = netResult >= 0;

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">¡Reporte Generado con Éxito!</h2>
          <p className="text-muted-foreground">
            Tu declaración fiscal está lista para descargar
          </p>
        </div>
      </div>

      {/* Report Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{reportTypeLabels[report.reportType]}</CardTitle>
              <CardDescription>
                Año fiscal {report.fiscalYear} • Generado el{' '}
                {format(report.generatedAt, 'PPP', { locale: es })}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {report.status === 'completed' && 'Completado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          {report.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Receipt className="h-4 w-4" />
                  Transacciones
                </div>
                <p className="text-2xl font-bold">{report.summary.totalTransactions}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Ganancias
                </div>
                <p className="text-2xl font-bold text-green-600">
                  €{report.summary.totalGains.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingDown className="h-4 w-4" />
                  Pérdidas
                </div>
                <p className="text-2xl font-bold text-red-600">
                  €{report.summary.totalLosses.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <FileText className="h-4 w-4" />
                  Resultado Neto
                </div>
                <p className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {isProfit ? '+' : ''}€{netResult.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t" />

          {/* Data Source Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Origen de datos:</span>
            <Badge variant="outline">{dataSourceLabels[report.dataSource]}</Badge>
          </div>

          {/* Download Button */}
          <Button onClick={onDownload} size="lg" className="w-full" disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Descargando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Descargar Reporte Completo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* What's Included */}
      <Card>
        <CardHeader>
          <CardTitle>Archivos Incluidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Reporte PDF</p>
                <p className="text-sm text-muted-foreground">
                  Documento listo para presentar a Hacienda con toda la información fiscal
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Hoja de Cálculo Excel</p>
                <p className="text-sm text-muted-foreground">
                  Archivo detallado con todos los cálculos y transacciones
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Resumen Ejecutivo</p>
                <p className="text-sm text-muted-foreground">
                  Vista general de tus ganancias, pérdidas y obligaciones fiscales
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                1
              </div>
              <div>
                <p className="font-semibold">Revisa el reporte</p>
                <p className="text-muted-foreground">
                  Asegúrate de que toda la información sea correcta y esté completa
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                2
              </div>
              <div>
                <p className="font-semibold">Consulta con un asesor (opcional)</p>
                <p className="text-muted-foreground">
                  Si tienes dudas, considera consultar con un asesor fiscal especializado
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                3
              </div>
              <div>
                <p className="font-semibold">Presenta tu declaración</p>
                <p className="text-muted-foreground">
                  Utiliza el reporte para completar tu declaración ante Hacienda
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onGenerateAnother} className="flex-1" disabled={isDownloading}>
          Generar Otro Reporte
        </Button>
        <Button onClick={onDownload} className="flex-1" disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Descargando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Descargar Reporte
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
