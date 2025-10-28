'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportCompleteContainer } from '@/features/reports/containers/report-complete.container';

/**
 * Inner component that uses useSearchParams
 */
function CompletePageInner() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');

  return <ReportCompleteContainer reportId={reportId} />;
}

/**
 * Report Completion Page
 * Shows the completed report and allows download
 */
export default function CompletePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Cargando...</div>}>
      <CompletePageInner />
    </Suspense>
  );
}

