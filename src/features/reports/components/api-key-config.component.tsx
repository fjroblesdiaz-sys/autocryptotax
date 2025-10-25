'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Calendar as CalendarIcon, Shield, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExchangePlatform, APIKeyData } from '../types/reports.types';
import { cn } from '@/lib/utils';

interface APIKeyConfigProps {
  onSubmit: (data: APIKeyData) => void;
  onBack: () => void;
}

export const APIKeyConfig = ({ onSubmit, onBack }: APIKeyConfigProps) => {
  const [platform, setPlatform] = useState<ExchangePlatform>('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const handleSubmit = () => {
    if (!apiKey || !apiSecret) return;

    const data: APIKeyData = {
      platform,
      apiKey,
      apiSecret,
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
          <h2 className="text-2xl font-semibold">Configurar API Key</h2>
          <p className="text-muted-foreground">
            Conecta mediante API key para obtener transacciones automáticamente
          </p>
        </div>
      </div>

      {/* Security Warning */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Tus claves API se almacenan de forma segura y encriptada. Solo se utilizan para obtener
          tu historial de transacciones. Asegúrate de crear una API key con permisos de solo lectura.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de la API</CardTitle>
          <CardDescription>
            Proporciona las credenciales de API de tu exchange
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Plataforma / Exchange</Label>
            <Select value={platform} onValueChange={(value) => setPlatform(value as ExchangePlatform)}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binance">Binance</SelectItem>
                <SelectItem value="coinbase">Coinbase</SelectItem>
                <SelectItem value="kraken">Kraken</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="text"
              placeholder="Ingresa tu API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {/* API Secret */}
          <div className="space-y-2">
            <Label htmlFor="api-secret">API Secret</Label>
            <div className="relative">
              <Input
                id="api-secret"
                type={showSecret ? 'text' : 'password'}
                placeholder="Ingresa tu API Secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Date Range (Optional) */}
          <div className="space-y-2">
            <Label>Rango de Fechas (Opcional)</Label>
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

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onBack}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!apiKey || !apiSecret}>
              Conectar API
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>¿Cómo obtener tu API Key?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Binance</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Ve a tu perfil → API Management</li>
              <li>Crea una nueva API key</li>
              <li>Activa solo el permiso &quot;Leer&quot; (Read)</li>
              <li>Guarda tu API Key y Secret de forma segura</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Coinbase</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Ve a Settings → API</li>
              <li>Crea una nueva API key</li>
              <li>Selecciona permisos de solo lectura</li>
              <li>Copia tu API Key y Secret</li>
            </ol>
          </div>
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Nunca compartas tus claves API. Asegúrate de que la API
              key tenga solo permisos de lectura y nunca permisos de trading o retiro.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
