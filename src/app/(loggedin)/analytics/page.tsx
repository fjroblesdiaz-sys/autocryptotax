import { Metadata } from 'next';
import { AnalyticsContainer } from '@/features/analytics/containers/analytics.container';

export const metadata: Metadata = {
  title: 'Análisis | Auto Crypto Tax',
  description: 'Análisis detallado de tu portfolio de criptomonedas',
};

/**
 * Analytics Page
 * Shows portfolio analysis and insights
 */
export default function AnalyticsPage() {
  return <AnalyticsContainer />;
}

