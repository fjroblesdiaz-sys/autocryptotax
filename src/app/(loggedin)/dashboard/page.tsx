import { Metadata } from 'next';
import { DashboardContainer } from '@/features/dashboard/containers/dashboard.container';

export const metadata: Metadata = {
  title: 'Dashboard | Auto Crypto Tax',
  description: 'Panel de control principal de Auto Crypto Tax',
};

export default function DashboardPage() {
  return <DashboardContainer />;
}

