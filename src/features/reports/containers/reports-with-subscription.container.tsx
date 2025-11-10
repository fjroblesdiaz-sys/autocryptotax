'use client';

/**
 * Reports with Subscription Container
 * Wraps the report generation flow with subscription checking
 */

import { useState, useEffect } from 'react';
import { SubscriptionGate } from '@/features/subscriptions/components/subscription-gate.component';
import { UserSubscription } from '@/features/subscriptions/types/subscription.types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportsWithSubscriptionContainerProps {
  children: React.ReactNode;
}

// Mock subscription data - TODO: Replace with actual subscription from API/database
const getMockSubscription = (): UserSubscription | null => {
  // Return null for no subscription (free tier without account)
  // or return a subscription object
  
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Simulate different scenarios:
  // 1. No subscription (null)
  // 2. Free plan with no reports generated
  // 3. Free plan with limit reached
  // 4. Paid plan near limit
  // 5. Paid plan with plenty of reports left

  // For demo, returning a free plan
  return {
    id: 'sub_demo',
    userId: 'user_demo',
    planId: 'free',
    status: 'active',
    billingCycle: 'annually',
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    usage: {
      reportsGenerated: 0, // Change to 1 to simulate limit reached
      reportsLimit: 1,
      transactionsProcessed: 0,
    },
  };
};

export const ReportsWithSubscriptionContainer: React.FC<ReportsWithSubscriptionContainerProps> = ({
  children,
}) => {
  const [subscription, setSubscription] = useState<UserSubscription | null | undefined>(undefined);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    // TODO: Fetch actual subscription from API
    const fetchSubscription = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSubscription(getMockSubscription());
    };

    fetchSubscription();
  }, []);

  // Loading state
  if (subscription === undefined) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user can proceed
  const hasReachedLimit = subscription && subscription.usage.reportsLimit !== null &&
    subscription.usage.reportsGenerated >= subscription.usage.reportsLimit;

  // Show gate if no subscription or limit reached
  if ((!subscription || subscription.planId === 'free' && hasReachedLimit) && !canProceed) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Generar Reporte Fiscal</h1>
          <p className="text-muted-foreground">
            Verifica tu plan antes de continuar
          </p>
        </div>
        <SubscriptionGate
          subscription={subscription}
          onContinue={() => setCanProceed(true)}
          feature="report-generation"
          showUpgradeOptions={true}
        />
      </div>
    );
  }

  // User can proceed - show the actual report generation flow
  return <>{children}</>;
};

