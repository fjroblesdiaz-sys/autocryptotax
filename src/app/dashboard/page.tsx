import { ProtectedRoute } from '@/features/auth/components/protected-route.component';
import { DashboardContainer } from '@/features/dashboard/containers/dashboard.container';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContainer />
    </ProtectedRoute>
  );
}
