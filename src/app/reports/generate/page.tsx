'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportGenerationImprovedContainer } from '@/features/reports/containers/report-generation-improved.container';

/**
 * Inner component that uses useSearchParams
 */
function GeneratePageInner() {
  const searchParams = useSearchParams();
  const reportRequestIdParam = searchParams.get('reportRequestId');
  return <ReportGenerationImprovedContainer reportRequestIdParam={reportRequestIdParam} />;
}

/**
 * Report Generation Page
 * Shows progress while generating the report with real-time SSE updates
 */
export default function GeneratePage() {
  return (
    <GeneratePageInner />

  );
}

