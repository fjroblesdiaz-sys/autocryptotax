'use client';

/**
 * Pricing Container
 * Main container for the pricing page with all plans
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCard } from '../components/pricing-card.component';
import { BillingToggle } from '../components/billing-toggle.component';
import { BillingCycle } from '../types/subscription.types';
import { getAllPlans } from '../constants/plans.constants';

export interface PricingContainerProps {
  currentPlanId?: string;
}

export const PricingContainer: React.FC<PricingContainerProps> = ({
  currentPlanId,
}) => {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annually');
  const plans = getAllPlans();

  const handleSelectPlan = (planId: string) => {
    // Navigate to checkout or subscription management
    if (planId === 'free') {
      // Free plan - just navigate to sign up
      router.push('/auth/register?plan=free');
    } else if (planId === 'business') {
      // Business plan - contact sales
      router.push('/contact-sales');
    } else {
      // Paid plans - go to checkout
      router.push(`/checkout?plan=${planId}&billing=${billingCycle}`);
    }
  };

  return (
    <div className="w-full py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Elige tu plan perfecto
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automatiza tus declaraciones de impuestos sobre criptomonedas.
            Cumple con la normativa española sin complicaciones.
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

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
              currentPlan={currentPlanId === plan.id}
              onSelect={handleSelectPlan}
              className={plan.popular ? 'lg:scale-105' : ''}
            />
          ))}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            ¿Tienes preguntas?{' '}
            <a href="/faq" className="text-primary hover:underline font-medium">
              Consulta nuestras FAQ
            </a>
            {' '}o{' '}
            <a href="/contact" className="text-primary hover:underline font-medium">
              contáctanos
            </a>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-12 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-sm text-muted-foreground">
                Conforme con normativa española
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-sm text-muted-foreground">
                Soporte disponible
              </p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">30 días</div>
              <p className="text-sm text-muted-foreground">
                Garantía de devolución
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

