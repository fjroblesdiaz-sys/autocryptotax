'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataInputContainer } from '@/features/reports/containers/data-input.container';

/**
 * Inner component that uses useSearchParams
 */
function DataInputPageInner() {
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get('source');

  return <DataInputContainer sourceParam={sourceParam} />;
}

/**
 * Data Input Page
 * Handles data collection for all data source types
 * Receives source type via URL search params
 */
export default function DataInputPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Cargando...</div>}>
      <DataInputPageInner />
    </Suspense>
  );
}

