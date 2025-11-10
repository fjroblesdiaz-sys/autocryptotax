import { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutContainer } from '@/features/subscriptions/containers/checkout.container';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Checkout | Auto Crypto Tax',
  description: 'Completa tu suscripción a Auto Crypto Tax',
};

function CheckoutSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-1" />
        <Skeleton className="h-96 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContainer />
    </Suspense>
  );
}

