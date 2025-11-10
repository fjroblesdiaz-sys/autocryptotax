'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DataInputContainer } from '@/features/reports/containers/data-input.container';
import { Skeleton } from '@/components/ui/skeleton';

function DataInputContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || '';
  const reportRequestId = searchParams.get('id') || '';

  return <DataInputContainer sourceParam={source} reportRequestIdParam={reportRequestId} />;
}

export default function DataInputPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <DataInputContent />
    </Suspense>
  );
}

