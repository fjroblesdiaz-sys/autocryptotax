'use client';

import { DataSourceSelection } from '@/features/reports/components/data-source-selection.component';
import { DataSourceType } from '@/features/reports/types/reports.types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useReportRequest } from '@/features/reports/hooks/use-report-request.hook';

/**
 * Data Source Selection Container
 * Handles data source selection logic and creates a new report request
 */
export const DataSourceSelectionContainer = () => {
  const router = useRouter();
  const { create, isLoading } = useReportRequest();
  const [selectedSource, setSelectedSource] = useState<DataSourceType | undefined>(undefined);

  const handleSelectDataSource = async (source: DataSourceType) => {
    console.log('[DataSourceSelection] Selected source:', source);
    setSelectedSource(source);
    
    try {
      // Create a new report request in the database
      const reportRequest = await create({
        dataSource: source,
      });
      
      console.log('[DataSourceSelection] Created report request:', reportRequest.id);
      
      // Navigate to data input page with report request ID and source
      router.push(`/reports/data-input?reportRequestId=${reportRequest.id}&source=${source}`);
    } catch (error) {
      console.error('[DataSourceSelection] Failed to create report request:', error);
      // Show error to user
      alert('Failed to create report request. Please try again.');
      setSelectedSource(undefined);
    }
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
          selectedSource={selectedSource}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

