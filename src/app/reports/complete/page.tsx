'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportCompleteContainerNew } from '@/features/reports/containers/report-complete-new.container';

/**
 * Inner component that uses useSearchParams
 */
function CompletePageInner() {
  const searchParams = useSearchParams();
  const reportRequestIdParam = searchParams.get('reportRequestId');

  return <ReportCompleteContainerNew reportRequestIdParam={reportRequestIdParam} />;
}

/**
 * Report Completion Page
 * Shows the completed report and downloads from Cloudinary
 */
export default function CompletePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Cargando...</div>}>
      <CompletePageInner />
    </Suspense>
  );
}

