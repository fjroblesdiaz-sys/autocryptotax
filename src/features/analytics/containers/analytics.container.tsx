'use client';

/**
 * Analytics Container
 * Main container for analytics and portfolio insights
 */

import { AnalyticsOverview } from '../components/analytics-overview.component';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function AnalyticsContainer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análisis</h1>
        <p className="text-muted-foreground mt-2">
          Visualiza y analiza tu portfolio de criptomonedas
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta es una vista previa de la funcionalidad de análisis. 
          Los datos mostrados son de ejemplo para demostración.
        </AlertDescription>
      </Alert>

      <AnalyticsOverview />
    </div>
  );
}

