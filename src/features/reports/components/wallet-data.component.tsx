'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, CheckCircle2, Wallet, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { WalletData } from '../types/reports.types';
import { cn } from '@/lib/utils';

interface WalletDataProps {
  address: string;
  onSubmit: (data: WalletData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const WalletDataComponent = ({ address, onSubmit, onBack, isSubmitting = false }: WalletDataProps) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const handleSubmit = () => {
    if (isSubmitting) return; // Prevent double submission
    
    const data: WalletData = {
      address,
      ...(dateFrom && dateTo && {
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
      }),
    };

    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Datos de la Cartera</h2>
          <p className="text-muted-foreground">
            Genera reportes desde tu cartera conectada
          </p>
        </div>
      </div>

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Analizaremos todas las transacciones de tu cartera conectada para generar el reporte fiscal.
          Este proceso puede tardar unos minutos dependiendo del número de transacciones.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Cartera Conectada</CardTitle>
          <CardDescription>
            Configuración de la cartera para la generación del reporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connected Wallet */}
          <div className="space-y-2">
            <Label>Dirección de la Cartera</Label>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
              <Wallet className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono break-all">{address}</p>
              </div>
              <Badge variant="secondary">Conectada</Badge>
            </div>
          </div>

          {/* Date Range (Optional) */}
          <div className="space-y-2">
            <Label>Rango de Fechas (Opcional)</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Si no seleccionas un rango, se analizarán todas las transacciones disponibles
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-from" className="text-sm text-muted-foreground mb-2 block">
                  Desde
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="date-to" className="text-sm text-muted-foreground mb-2 block">
                  Hasta
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="p-4 border rounded-lg bg-primary/5">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Redes Soportadas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <Badge variant="outline">Ethereum</Badge>
              <Badge variant="outline">Binance Smart Chain</Badge>
              <Badge variant="outline">Polygon</Badge>
              <Badge variant="outline">Arbitrum</Badge>
              <Badge variant="outline">Optimism</Badge>
              <Badge variant="outline">Avalanche</Badge>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Continuar con esta Cartera'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>¿Qué información se recopilará?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
              Todas las transacciones enviadas y recibidas
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
              Interacciones con contratos inteligentes (DeFi, NFTs, etc.)
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
              Valores históricos de cada transacción en EUR
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
              Cálculo automático de ganancias y pérdidas de capital
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
