'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportConfigContainer } from '@/features/reports/containers/report-config.container';
import { Skeleton } from '@/components/ui/skeleton';

function ConfigureReportContent() {
  const searchParams = useSearchParams();
  const reportRequestId = searchParams.get('reportRequestId');

  return <ReportConfigContainer reportRequestIdParam={reportRequestId} />;
}

export default function ConfigureReportPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ConfigureReportContent />
    </Suspense>
  );
}

