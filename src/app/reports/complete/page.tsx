'use client';

import { useSearchParams } from 'next/navigation';
import { ReportCompleteContainer } from '@/features/reports/containers/report-complete.container';

/**
 * Report Completion Page
 * Shows the completed report and allows download
 */
export default function CompletePage() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');

  return <ReportCompleteContainer reportId={reportId} />;
}

