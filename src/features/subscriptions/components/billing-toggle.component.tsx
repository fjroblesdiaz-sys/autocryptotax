'use client';

/**
 * BillingToggle Component
 * Toggle between monthly and annual billing
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BillingCycle } from '../types/subscription.types';
import { cn } from '@/lib/utils';

export interface BillingToggleProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  showSavings?: boolean;
  savingsPercentage?: number;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  value,
  onChange,
  showSavings = true,
  savingsPercentage = 20,
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant={value === 'monthly' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('monthly')}
        className={cn(
          'transition-all',
          value === 'monthly' && 'shadow-md'
        )}
      >
        Mensual
      </Button>
      
      <Button
        variant={value === 'annually' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('annually')}
        className={cn(
          'transition-all relative',
          value === 'annually' && 'shadow-md'
        )}
      >
        Anual
        {showSavings && (
          <Badge 
            variant="secondary" 
            className="ml-2 absolute -top-2 -right-2 text-xs px-1.5 py-0.5 bg-green-500 text-white border-0"
          >
            -{savingsPercentage}%
          </Badge>
        )}
      </Button>
    </div>
  );
};

