'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportCompleteContainerNew } from '@/features/reports/containers/report-complete-new.container';
import { Skeleton } from '@/components/ui/skeleton';

function ReportCompleteContent() {
  const searchParams = useSearchParams();
  const reportRequestId = searchParams.get('reportRequestId');

  return <ReportCompleteContainerNew reportRequestIdParam={reportRequestId} />;
}

export default function ReportCompletePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <ReportCompleteContent />
    </Suspense>
  );
}

