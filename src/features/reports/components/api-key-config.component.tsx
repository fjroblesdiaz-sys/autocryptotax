'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { ExchangePlatform, APIKeyData } from '../types/reports.types';

interface APIKeyConfigProps {
  onSubmit: (data: APIKeyData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const APIKeyConfig = ({ onSubmit, onBack, isSubmitting = false }: APIKeyConfigProps) => {
  const [platform, setPlatform] = useState<ExchangePlatform>('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);

  const requiresPassphrase = false; // Coinbase CDP uses API Key Name + Private Key, not passphrase

  const handleSubmit = () => {
    if (!apiKey || !apiSecret) return;
    if (requiresPassphrase && !passphrase) return;
    if (isSubmitting) return; // Prevent double submission

    const data: APIKeyData = {
      platform,
      apiKey,
      apiSecret,
      ...(passphrase && { passphrase }),
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
                <SelectItem value="coinbase">Coinbase Advanced Trade</SelectItem>
                <SelectItem value="whitebit" disabled>WhiteBit (Próximamente)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">
              {platform === 'coinbase' ? 'API Key Name (campo "name" del JSON)' : 'API Key'}
            </Label>
            <Input
              id="api-key"
              type="text"
              placeholder={
                platform === 'coinbase' 
                  ? 'organizations/xxx/apiKeys/yyy' 
                  : 'Ingresa tu API Key'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {platform === 'coinbase' && (
              <p className="text-xs text-muted-foreground">
                Usa el campo &quot;name&quot; del archivo cdp_api_key.json (comienza con organizations/)
              </p>
            )}
          </div>

          {/* API Secret */}
          <div className="space-y-2">
            <Label htmlFor="api-secret">
              {platform === 'coinbase' ? 'Private Key (del archivo JSON)' : 'API Secret'}
            </Label>
            <div className="relative">
              <Input
                id="api-secret"
                type={showSecret ? 'text' : 'password'}
                placeholder={
                  platform === 'coinbase'
                    ? 'Copia el valor de privateKey del JSON...'
                    : 'Ingresa tu API Secret'
                }
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
            {platform === 'coinbase' && (
              <p className="text-xs text-muted-foreground">
                Usa el campo &quot;privateKey&quot; del archivo JSON (formato base64 o PEM, ambos funcionan)
              </p>
            )}
          </div>

          {/* Passphrase (Only for Coinbase) */}
          {requiresPassphrase && (
            <div className="space-y-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <div className="relative">
                <Input
                  id="passphrase"
                  type={showPassphrase ? 'text' : 'password'}
                  placeholder="Ingresa tu passphrase de API"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                >
                  {showPassphrase ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Info about fiscal year */}
          <Alert>
            <AlertDescription>
              Las transacciones se filtrarán automáticamente según el año fiscal seleccionado en el paso anterior.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!apiKey || !apiSecret || (requiresPassphrase && !passphrase) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Conectar API'
              )}
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
            <h4 className="font-semibold mb-2">Coinbase Advanced Trade</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Ve a <a href="https://portal.cdp.coinbase.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Coinbase Developer Platform</a></li>
              <li>Inicia sesión y navega a <strong>API Keys</strong></li>
              <li>Crea una nueva clave: selecciona <strong>ECDSA</strong> como algoritmo (NO Ed25519)</li>
              <li>Habilita el permiso <strong>&quot;view&quot;</strong> para acceder a tu historial</li>
              <li>Descarga el archivo <strong>cdp_api_key.json</strong></li>
              <li>Abre el archivo JSON y copia exactamente:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>name</strong> (el que inicia con organizations/) → pega en &quot;API Key Name&quot;</li>
                  <li><strong>privateKey</strong> (el string completo) → pega en &quot;Private Key&quot;</li>
                </ul>
              </li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2 font-semibold">
              📝 El archivo JSON solo se descarga una vez. Guárdalo en un lugar seguro.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">WhiteBit</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Ve a tu perfil → API Keys</li>
              <li>Crea una nueva API key</li>
              <li>Activa solo permisos de lectura (Trading history)</li>
              <li>Guarda tu API Key y Secret</li>
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
