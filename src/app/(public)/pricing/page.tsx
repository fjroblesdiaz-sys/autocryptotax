import { Metadata } from 'next';
import { PricingContainer } from '@/features/subscriptions/containers/pricing.container';

export const metadata: Metadata = {
  title: 'Precios | Auto Crypto Tax',
  description: 'Elige el plan perfecto para tus necesidades de declaración de criptomonedas. Planes desde gratis hasta Business con soporte completo.',
};

export default function PricingPage() {
  // TODO: Get current user's plan from session/database
  // const currentPlanId = await getCurrentUserPlan();
  
  return <PricingContainer />;
}

