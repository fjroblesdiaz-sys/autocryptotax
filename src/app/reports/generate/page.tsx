'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportGenerationContainerNew } from '@/features/reports/containers/report-generation-new.container';

/**
 * Inner component that uses useSearchParams
 */
function GeneratePageInner() {
  const searchParams = useSearchParams();
  const reportRequestIdParam = searchParams.get('reportRequestId');
  return <ReportGenerationContainerNew reportRequestIdParam={reportRequestIdParam} />;
}

/**
 * Report Generation Page
 * Shows progress while generating the report
 * Polls database for status updates
 */
export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Generando...</div>}>
      <GeneratePageInner />
    </Suspense>
  );
}

