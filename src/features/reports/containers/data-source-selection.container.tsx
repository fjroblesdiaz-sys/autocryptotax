'use client';

import { DataSourceSelection } from '@/features/reports/components/data-source-selection.component';
import { DataSourceType } from '@/features/reports/types/reports.types';
import { useReportData } from '@/features/reports/context/report-data.context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Data Source Selection Container
 * Handles data source selection logic
 */
export const DataSourceSelectionContainer = () => {
  const router = useRouter();
  const { clearAll, setDataSource } = useReportData();

  // Clear any existing report data when starting fresh
  useEffect(() => {
    clearAll();
  }, [clearAll]);

  const handleSelectDataSource = (source: DataSourceType) => {
    console.log('[DataSourceSelection] Selected source:', source);
    
    // Save to context
    setDataSource(source);
    
    // Navigate to data input page with source as query param
    router.push(`/reports/data-input?source=${source}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Informes Fiscales</h1>
          <p className="text-muted-foreground mt-2">
            Genera declaraciones fiscales de criptomonedas para las autoridades españolas
          </p>
        </div>

        {/* Data Source Selection */}
        <DataSourceSelection
          onSelect={handleSelectDataSource}
          selectedSource={undefined}
        />
      </div>
    </div>
  );
};

