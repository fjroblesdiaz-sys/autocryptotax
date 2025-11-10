'use client';

/**
 * SubscriptionGate Component
 * Checks subscription limits and shows upgrade prompts when needed
 */

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  ArrowUpCircle, 
  Check, 
  Lock,
  Zap,
} from 'lucide-react';
import { UserSubscription } from '../types/subscription.types';
import { getPlanById } from '../constants/plans.constants';
import { cn } from '@/lib/utils';

export interface SubscriptionGateProps {
  subscription: UserSubscription | null;
  onContinue?: () => void;
  feature?: 'report-generation' | 'api-access' | 'custom-templates';
  showUpgradeOptions?: boolean;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  subscription,
  onContinue,
  feature = 'report-generation',
  showUpgradeOptions = true,
}) => {
  const router = useRouter();

  // No subscription or free plan
  if (!subscription || subscription.planId === 'free') {
    const plan = getPlanById('free');
    const hasReachedLimit = subscription && subscription.usage.reportsGenerated >= 1;

    return (
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-600" />
                {hasReachedLimit ? 'Límite Alcanzado' : 'Plan Gratuito'}
              </CardTitle>
              <CardDescription>
                {hasReachedLimit 
                  ? 'Has usado tu reporte gratis. Actualiza para continuar.'
                  : 'Con el plan gratuito puedes generar 1 reporte al año.'
                }
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              Free
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Uso actual</span>
                <span className="font-semibold">
                  {subscription.usage.reportsGenerated} / 1
                </span>
              </div>
              <Progress value={subscription.usage.reportsGenerated * 100} className="h-2" />
            </div>
          )}

          {showUpgradeOptions && (
            <>
              <Alert className="bg-white">
                <Zap className="h-4 w-4 text-primary" />
                <AlertTitle>Actualiza tu plan y obtén:</AlertTitle>
                <AlertDescription className="mt-2">
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3" /> Hasta 5 reportes al año (Basic)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3" /> Reportes ilimitados (Pro)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3" /> Todos los modelos fiscales
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3" /> Soporte prioritario
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          {!hasReachedLimit && onContinue && (
            <Button onClick={onContinue} variant="outline" className="flex-1">
              Usar mi reporte gratis
            </Button>
          )}
          <Button
            onClick={() => router.push('/pricing')}
            className={cn("gap-2", !hasReachedLimit && onContinue ? "flex-1" : "w-full")}
          >
            <ArrowUpCircle className="w-4 h-4" />
            Ver Planes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Has subscription but reached limit
  const plan = getPlanById(subscription.planId);
  if (!plan) return null;

  const hasReachedLimit = 
    subscription.usage.reportsLimit !== null && 
    subscription.usage.reportsGenerated >= subscription.usage.reportsLimit;

  const isNearLimit = 
    subscription.usage.reportsLimit !== null &&
    subscription.usage.reportsGenerated >= subscription.usage.reportsLimit * 0.8;

  if (hasReachedLimit) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Límite Alcanzado
              </CardTitle>
              <CardDescription>
                Has usado todos los reportes de tu plan {plan.name}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              {plan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Uso actual</span>
              <span className="font-semibold text-destructive">
                {subscription.usage.reportsGenerated} / {subscription.usage.reportsLimit}
              </span>
            </div>
            <Progress value={100} className="h-2 [&>*]:bg-destructive" />
          </div>

          <Alert>
            <ArrowUpCircle className="h-4 w-4" />
            <AlertTitle>Actualiza a Pro para obtener:</AlertTitle>
            <AlertDescription className="mt-2">
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Reportes ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Transacciones ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Soporte prioritario
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" /> Análisis avanzado
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push('/pricing')}
            className="w-full gap-2"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Actualizar Plan
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Near limit warning
  if (isNearLimit && onContinue) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="w-5 h-5" />
            Cerca del Límite
          </CardTitle>
          <CardDescription>
            Estás usando {subscription.usage.reportsGenerated} de {subscription.usage.reportsLimit} reportes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress 
            value={(subscription.usage.reportsGenerated / (subscription.usage.reportsLimit || 1)) * 100} 
            className="h-2 [&>*]:bg-yellow-500"
          />
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={onContinue} variant="outline" className="flex-1">
            Continuar
          </Button>
          <Button
            onClick={() => router.push('/pricing')}
            variant="default"
            className="flex-1 gap-2"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Ver Planes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // All good - can continue
  if (onContinue) {
    onContinue();
  }

  return null;
};

