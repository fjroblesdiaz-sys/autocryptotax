'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportConfigContainer } from '@/features/reports/containers/report-config.container';

/**
 * Inner component that uses useSearchParams
 */
function ConfigurePageInner() {
  const searchParams = useSearchParams();
  const reportRequestIdParam = searchParams.get('reportRequestId');

  return <ReportConfigContainer reportRequestIdParam={reportRequestIdParam} />;
}

/**
 * Report Configuration Page
 * Allows users to configure report type and fiscal year
 * Receives report request ID via URL search params
 */
export default function ConfigurePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Cargando...</div>}>
      <ConfigurePageInner />
    </Suspense>
  );
}

