'use client';

import { useSearchParams } from 'next/navigation';
import { DataInputContainer } from '@/features/reports/containers/data-input.container';

/**
 * Data Input Page
 * Handles data collection for all data source types
 * Receives source type via URL search params
 */
export default function DataInputPage() {
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get('source');

  return <DataInputContainer sourceParam={sourceParam} />;
}

