import { ReportDataProvider } from '@/features/reports/context/report-data.context';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <ReportDataProvider>{children}</ReportDataProvider>;
}

