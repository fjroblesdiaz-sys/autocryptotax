'use client';

/**
 * PricingCard Component
 * Displays a subscription plan with its features and pricing
 */

import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlan, BillingCycle } from '../types/subscription.types';
import { calculateSavingsPercentage } from '../constants/plans.constants';
import { cn } from '@/lib/utils';

export interface PricingCardProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  currentPlan?: boolean;
  onSelect: (planId: string) => void;
  className?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  billingCycle,
  currentPlan = false,
  onSelect,
  className,
}) => {
  const price = billingCycle === 'annually' ? plan.price.annually : plan.price.monthly;
  const displayPrice = billingCycle === 'annually' ? price / 12 : price;
  const savings = calculateSavingsPercentage(plan);

  const handleSelect = () => {
    if (!currentPlan) {
      onSelect(plan.id);
    }
  };

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-200',
        plan.popular && 'border-primary shadow-lg scale-105',
        currentPlan && 'border-green-500',
        className
      )}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            Más Popular
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {currentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge variant="outline" className="bg-green-50 border-green-500 text-green-700 px-3 py-1">
            Tu Plan Actual
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <CardDescription className="text-sm">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Pricing */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">
              {price === 0 ? 'Gratis' : `€${displayPrice.toFixed(2)}`}
            </span>
            {price > 0 && (
              <span className="text-muted-foreground text-sm">
                /{billingCycle === 'annually' ? 'mes' : 'mes'}
              </span>
            )}
          </div>
          
          {billingCycle === 'annually' && price > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                Facturado anualmente (€{price})
              </p>
              {savings > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Ahorra {savings}%
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSelect}
          disabled={currentPlan}
          className="w-full"
          variant={plan.popular ? 'default' : 'outline'}
          size="lg"
        >
          {currentPlan ? 'Plan Actual' : plan.cta}
        </Button>
      </CardFooter>
    </Card>
  );
};

