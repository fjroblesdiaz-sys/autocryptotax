import { ProtectedRoute } from '@/features/auth/components/protected-route.component';
import { ReportsContainer } from '@/features/reports/containers/reports.container';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContainer />
    </ProtectedRoute>
  );
}
