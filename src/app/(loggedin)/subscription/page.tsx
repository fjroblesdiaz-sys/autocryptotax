import { Metadata } from 'next';
import { SubscriptionManagementContainer } from '@/features/subscriptions/containers/subscription-management.container';
import { UserSubscription } from '@/features/subscriptions/types/subscription.types';

export const metadata: Metadata = {
  title: 'Mi Suscripción | Auto Crypto Tax',
  description: 'Gestiona tu suscripción, revisa tu uso y actualiza tu plan.',
};

// Mock data for development - TODO: Replace with actual data from database/API
function getMockSubscription(): UserSubscription {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    id: 'sub_123456789',
    userId: 'user_123',
    planId: 'basic',
    status: 'active',
    billingCycle: 'annually',
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_stripe_123',
    stripeCustomerId: 'cus_stripe_123',
    usage: {
      reportsGenerated: 2,
      reportsLimit: 5,
      transactionsProcessed: 234,
      lastReportDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  };
}

export default function SubscriptionPage() {
  // TODO: Get actual subscription from session/database
  // const session = await getServerSession();
  // if (!session) redirect('/auth/login');
  // const subscription = await getUserSubscription(session.user.id);
  
  const subscription = getMockSubscription();

  return <SubscriptionManagementContainer subscription={subscription} />;
}

