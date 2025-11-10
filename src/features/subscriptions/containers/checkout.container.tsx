'use client';

/**
 * Checkout Container
 * Handles the checkout flow logic
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckoutForm, CheckoutFormData } from '../components/checkout-form.component';
import { BillingCycle, PlanTier } from '../types/subscription.types';
import { getPlanById } from '../constants/plans.constants';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const CheckoutContainer: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get plan and billing from URL
  const planId = (searchParams.get('plan') || 'basic') as PlanTier;
  const billingCycle = (searchParams.get('billing') || 'annually') as BillingCycle;
  
  const plan = getPlanById(planId);

  if (!plan) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Plan no encontrado. Por favor, regresa a la página de precios.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Free plan doesn't need checkout
  if (plan.id === 'free') {
    router.push('/auth/register');
    return null;
  }

  const handleSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Processing checkout...', { plan: planId, billingCycle, data });

      // TODO: Integrate with Stripe API
      // 1. Create or get customer
      // 2. Create checkout session
      // 3. Redirect to Stripe checkout
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: In production, redirect to Stripe Checkout
      // const { sessionId } = await createStripeCheckoutSession({ planId, billingCycle, email: data.email });
      // window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;

      // For now, simulate success and redirect
      router.push('/subscription?success=true');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Finalizar Suscripción</h1>
        <p className="text-muted-foreground mt-2">
          Completa tu pago para empezar a usar Auto Crypto Tax
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Checkout Form */}
      <CheckoutForm
        plan={plan}
        billingCycle={billingCycle}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isProcessing={isProcessing}
      />

      {/* Trust Indicators */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-muted-foreground">
        <div>
          <strong className="text-foreground">Cancelación en cualquier momento</strong>
          <p>Sin compromiso de permanencia</p>
        </div>
        <div>
          <strong className="text-foreground">30 días de garantía</strong>
          <p>Devolución completa si no estás satisfecho</p>
        </div>
        <div>
          <strong className="text-foreground">Soporte incluido</strong>
          <p>Ayuda cuando la necesites</p>
        </div>
      </div>
    </div>
  );
};

