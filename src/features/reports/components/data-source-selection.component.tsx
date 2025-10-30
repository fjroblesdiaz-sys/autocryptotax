'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, FileSpreadsheet, Edit, Key, ShieldCheck, Loader2 } from 'lucide-react';
import { DataSourceType } from '../types/reports.types';

interface DataSourceSelectionProps {
  onSelect: (source: DataSourceType) => void;
  selectedSource?: DataSourceType;
  isLoading?: boolean;
}

const dataSources = [
  {
    type: 'wallet' as DataSourceType,
    label: 'Cartera Conectada',
    description: 'Genera reportes desde tu cartera conectada a través de thirdweb',
    icon: Wallet,
    badge: 'Recomendado',
    disabled: false,
  },
  {
    type: 'api-key' as DataSourceType,
    label: 'API Key',
    description: 'Conecta mediante API key para obtener transacciones automáticamente',
    icon: Key,
    badge: 'Automático',
    disabled: false,
  },
  {
    type: 'csv' as DataSourceType,
    label: 'Archivo CSV',
    description: 'Sube archivos CSV exportados de Binance, Coinbase u otros exchanges',
    icon: FileSpreadsheet,
    badge: 'Próximamente',
    disabled: true,
  },

  {
    type: 'oauth' as DataSourceType,
    label: 'Autorización OAuth',
    description: 'Autoriza el acceso seguro a la API del exchange mediante OAuth',
    icon: ShieldCheck,
    badge: 'Próximamente',
    disabled: true,
  },
  {
    type: 'manual' as DataSourceType,
    label: 'Entrada Manual',
    description: 'Ingresa manualmente tus transacciones de criptomonedas',
    icon: Edit,
    badge: 'Próximamente',
    disabled: true,
  },
];

export const DataSourceSelection = ({ onSelect, selectedSource, isLoading = false }: DataSourceSelectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Selecciona el Origen de Datos</h2>
        <p className="text-muted-foreground">
          Elige cómo deseas proporcionar la información de tus transacciones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataSources.map((source) => {
          const Icon = source.icon;
          const isSelected = selectedSource === source.type;
          const isDisabled = source.disabled || isLoading;
          const isCurrentlyLoading = isSelected && isLoading;

          return (
            <Card
              key={source.type}
              className={`transition-all relative ${
                isDisabled 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'cursor-pointer hover:shadow-lg'
              } ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => !isDisabled && onSelect(source.type)}
            >
              {isCurrentlyLoading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Creando solicitud...</p>
                  </div>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isDisabled ? 'bg-muted' : 'bg-primary/10'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        isDisabled ? 'text-muted-foreground' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${
                        isDisabled ? 'text-muted-foreground' : ''
                      }`}>
                        {source.label}
                      </CardTitle>
                      {source.badge && (
                        <Badge 
                          variant={isDisabled ? 'outline' : 'secondary'} 
                          className="mt-1"
                        >
                          {source.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{source.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
