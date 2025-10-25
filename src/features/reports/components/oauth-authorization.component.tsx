'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { ExchangePlatform, OAuthData } from '../types/reports.types';

interface OAuthAuthorizationProps {
  onSubmit: (data: OAuthData) => void;
  onBack: () => void;
}

export const OAuthAuthorization = ({ onSubmit, onBack }: OAuthAuthorizationProps) => {
  const [platform, setPlatform] = useState<ExchangePlatform>('binance');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authData, setAuthData] = useState<OAuthData | null>(null);

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    
    // Simulate OAuth flow
    // In a real implementation, this would open a popup or redirect to the exchange's OAuth page
    setTimeout(() => {
      const mockAuthData: OAuthData = {
        platform,
        accessToken: 'mock_access_token_' + Math.random(),
        refreshToken: 'mock_refresh_token_' + Math.random(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };
      
      setAuthData(mockAuthData);
      setIsAuthorized(true);
      setIsAuthorizing(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (!authData) return;
    onSubmit(authData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Autorización OAuth</h2>
          <p className="text-muted-foreground">
            Autoriza el acceso seguro a la API del exchange mediante OAuth
          </p>
        </div>
      </div>

      {/* Security Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          OAuth es el método más seguro para conectar tu exchange. No necesitas compartir tus
          claves API, y puedes revocar el acceso en cualquier momento desde la configuración de tu exchange.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de OAuth</CardTitle>
          <CardDescription>
            Selecciona el exchange y autoriza el acceso a tus transacciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Plataforma / Exchange</Label>
            <Select 
              value={platform} 
              onValueChange={(value) => setPlatform(value as ExchangePlatform)}
              disabled={isAuthorized}
            >
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binance">Binance</SelectItem>
                <SelectItem value="coinbase">Coinbase</SelectItem>
                <SelectItem value="kraken">Kraken</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Authorization Status */}
          {isAuthorized ? (
            <div className="p-4 border-2 border-green-500 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Autorización Exitosa
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Tu cuenta de {platform} ha sido conectada correctamente
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Conectado
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Permisos Solicitados:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Ver historial de transacciones (solo lectura)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Ver balances de cuenta (solo lectura)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Ver información de perfil básica
                  </li>
                </ul>
              </div>

              <Button 
                onClick={handleAuthorize} 
                disabled={isAuthorizing}
                className="w-full"
                size="lg"
              >
                {isAuthorizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autorizando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Autorizar con {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Submit Button */}
          {isAuthorized && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onBack}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Continuar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card>
        <CardHeader>
          <CardTitle>Beneficios de OAuth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Más Seguro</h4>
                <p className="text-sm text-muted-foreground">
                  No necesitas compartir tus claves API. El exchange gestiona la autorización de forma segura.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Control Total</h4>
                <p className="text-sm text-muted-foreground">
                  Puedes revocar el acceso en cualquier momento desde la configuración de tu exchange.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Acceso Limitado</h4>
                <p className="text-sm text-muted-foreground">
                  Solo solicitamos permisos de lectura. Nunca tendremos acceso a funciones de trading o retiro.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
