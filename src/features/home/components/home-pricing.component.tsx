'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/features/subscriptions/components/pricing-card.component';
import { BillingToggle } from '@/features/subscriptions/components/billing-toggle.component';
import { getAllPlans } from '@/features/subscriptions/constants/plans.constants';
import { BillingCycle } from '@/features/subscriptions/types/subscription.types';

export const HomePricing = () => {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annually');
  const plans = getAllPlans();

  const handleSelectPlan = (planId: string) => {
    // Navigate to checkout or pricing page for more details
    router.push(`/pricing#${planId}`);
  };

  return (
    <section id="pricing" className="bg-muted/50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Precios simples y transparentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para tus necesidades. Sin letra pequeña, sin sorpresas.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <BillingToggle
            value={billingCycle}
            onChange={setBillingCycle}
            showSavings={true}
            savingsPercentage={20}
          />
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              onSelect={handleSelectPlan}
              className={plan.popular ? 'lg:scale-105' : ''}
            />
          ))}
        </div>

        {/* View All Plans CTA */}
        <div className="text-center mt-12">
          <Button
            onClick={() => router.push('/pricing')}
            variant="outline"
            size="lg"
          >
            Ver comparación completa
          </Button>
        </div>
      </div>
    </section>
  );
};

