'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportGenerationImprovedContainer } from '@/features/reports/containers/report-generation-improved.container';
import { Skeleton } from '@/components/ui/skeleton';

function GenerateReportContent() {
  const searchParams = useSearchParams();
  const reportRequestId = searchParams.get('reportRequestId');

  return <ReportGenerationImprovedContainer reportRequestIdParam={reportRequestId} />;
}

export default function GenerateReportPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <GenerateReportContent />
    </Suspense>
  );
}

