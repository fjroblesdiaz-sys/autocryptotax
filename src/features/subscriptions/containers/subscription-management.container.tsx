'use client';

/**
 * Subscription Management Container
 * Handles the subscription management page logic
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionDashboard } from '../components/subscription-dashboard.component';
import { UserSubscription } from '../types/subscription.types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export interface SubscriptionManagementContainerProps {
  subscription: UserSubscription;
}

export const SubscriptionManagementContainer: React.FC<SubscriptionManagementContainerProps> = ({
  subscription,
}) => {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = () => {
    // Navigate to pricing page
    router.push('/pricing');
  };

  const handleManagePayment = () => {
    // TODO: Integrate with Stripe Customer Portal
    console.log('Opening payment management...');
    // window.open(stripePortalUrl, '_blank');
  };

  const handleCancelSubscription = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    setIsProcessing(true);
    
    try {
      // TODO: Call API to cancel subscription
      console.log('Canceling subscription...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message and reload
      alert('Tu suscripción se cancelará al final del período actual');
      window.location.reload();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Hubo un error al cancelar la suscripción. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
      setShowCancelDialog(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Suscripción</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu plan, uso y facturación
        </p>
      </div>

      <SubscriptionDashboard
        subscription={subscription}
        onUpgrade={handleUpgrade}
        onManage={handleManagePayment}
        onCancelSubscription={handleCancelSubscription}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar suscripción?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tu suscripción se cancelará al final del período actual (
                {subscription.currentPeriodEnd.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}).
              </p>
              <p>
                Podrás seguir usando todas las funciones hasta esa fecha.
                Después, tu cuenta volverá al plan gratuito.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Mantener suscripción
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancel}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? 'Cancelando...' : 'Sí, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

