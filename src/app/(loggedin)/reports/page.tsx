import { DataSourceSelectionContainer } from '@/features/reports/containers/data-source-selection.container';
import { ReportsWithSubscriptionContainer } from '@/features/reports/containers/reports-with-subscription.container';

/**
 * Reports landing page - Data Source Selection
 * First step in the report generation flow with subscription checking
 */
export default function ReportsPage() {
  return (
    <ReportsWithSubscriptionContainer>
      <DataSourceSelectionContainer />
    </ReportsWithSubscriptionContainer>
  );
}

