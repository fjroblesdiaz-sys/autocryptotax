'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, CheckCircle2, Loader2, Download, Info } from 'lucide-react';
import { ReportType } from '../types/reports.types';

interface ReportGenerationWizardProps {
  onGenerate: (reportType: ReportType, fiscalYear: number) => void;
  onBack: () => void;
  isGenerating?: boolean;
  generationProgress?: number;
}

const reportTypes = [
  {
    id: 'model-100' as ReportType,
    title: 'Modelo 100',
    description: 'IRPF - Ganancias y pérdidas de capital',
    details: 'Para declarar las ganancias o pérdidas derivadas de la compra/venta de criptomonedas',
    available: true,
  },
  {
    id: 'model-720' as ReportType,
    title: 'Modelo 720',
    description: 'Declaración de bienes y derechos en el extranjero',
    details: 'Obligatorio si el valor de tus criptomonedas supera los 50.000€',
    available: false,
  },
  {
    id: 'model-714' as ReportType,
    title: 'Modelo 714',
    description: 'Impuesto sobre el Patrimonio',
    details: 'Declaración del patrimonio total incluyendo criptomonedas',
    available: false,
  },
];

export const ReportGenerationWizard = ({
  onGenerate,
  onBack,
  isGenerating = false,
  generationProgress = 0,
}: ReportGenerationWizardProps) => {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('model-100');
  const [fiscalYear, setFiscalYear] = useState<number>(2025);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleGenerate = () => {
    onGenerate(selectedReportType, fiscalYear);
  };

  const selectedReport = reportTypes.find(r => r.id === selectedReportType);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          ← Volver
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Generar Reporte Fiscal</h2>
          <p className="text-muted-foreground">
            Selecciona el tipo de reporte y año fiscal
          </p>
        </div>
      </div>

      {isGenerating ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Generando Reporte...
            </CardTitle>
            <CardDescription>
              Procesando tus transacciones y generando el reporte fiscal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                {generationProgress > 20 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <div className="h-4 w-4 border-2 border-muted rounded-full mt-0.5" />
                )}
                <span>Recopilando transacciones</span>
              </div>
              <div className="flex items-start gap-2">
                {generationProgress > 40 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <div className="h-4 w-4 border-2 border-muted rounded-full mt-0.5" />
                )}
                <span>Obteniendo precios históricos</span>
              </div>
              <div className="flex items-start gap-2">
                {generationProgress > 60 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <div className="h-4 w-4 border-2 border-muted rounded-full mt-0.5" />
                )}
                <span>Calculando ganancias y pérdidas</span>
              </div>
              <div className="flex items-start gap-2">
                {generationProgress > 80 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <div className="h-4 w-4 border-2 border-muted rounded-full mt-0.5" />
                )}
                <span>Generando documento PDF</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Reporte</CardTitle>
              <CardDescription>
                Selecciona el modelo de declaración que necesitas generar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type Selection */}
              <div className="space-y-3">
                {reportTypes.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      !report.available
                        ? 'opacity-50 cursor-not-allowed bg-muted'
                        : selectedReportType === report.id
                        ? 'border-primary bg-primary/5 cursor-pointer'
                        : 'border-border hover:border-primary/50 cursor-pointer'
                    }`}
                    onClick={() => report.available && setSelectedReportType(report.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${report.available ? 'bg-primary/10' : 'bg-muted'}`}>
                        <FileText className={`h-5 w-5 ${report.available ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{report.title}</h4>
                          {report.id === 'model-100' && (
                            <Badge variant="secondary">Más común</Badge>
                          )}
                          {!report.available && (
                            <Badge variant="outline">Próximamente</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.description}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          {report.details}
                        </p>
                      </div>
                      {selectedReportType === report.id && report.available && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fiscal Year Selection */}
              <div className="space-y-2">
                <Label htmlFor="fiscal-year">Año Fiscal</Label>
                <Select
                  value={fiscalYear.toString()}
                  onValueChange={(value) => setFiscalYear(parseInt(value))}
                >
                  <SelectTrigger id="fiscal-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onBack}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerate} size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Generar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information Alert */}
          {selectedReport && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedReport.title}:</strong> {selectedReport.details}
              </AlertDescription>
            </Alert>
          )}

          {/* What's Included Card */}
          <Card>
            <CardHeader>
              <CardTitle>¿Qué incluye el reporte?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  Resumen ejecutivo de todas tus transacciones
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  Cálculo detallado de ganancias y pérdidas de capital
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  Listado completo de transacciones con valores en EUR
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  Documento PDF listo para presentar a Hacienda
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  Archivo Excel con todos los cálculos detallados
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
