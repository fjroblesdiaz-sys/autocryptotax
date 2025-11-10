'use client';

/**
 * SubscriptionDashboard Component
 * Displays user's current subscription status, usage, and management options
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Check,
  ArrowUpCircle,
  FileText,
} from 'lucide-react';
import { UserSubscription } from '../types/subscription.types';
import { getPlanById } from '../constants/plans.constants';
import { cn } from '@/lib/utils';

export interface SubscriptionDashboardProps {
  subscription: UserSubscription;
  onUpgrade?: () => void;
  onManage?: () => void;
  onCancelSubscription?: () => void;
}

export const SubscriptionDashboard: React.FC<SubscriptionDashboardProps> = ({
  subscription,
  onUpgrade,
  onManage,
  onCancelSubscription,
}) => {
  const plan = getPlanById(subscription.planId);
  
  if (!plan) {
    return null;
  }

  const { usage } = subscription;
  const percentUsed = usage.reportsLimit 
    ? (usage.reportsGenerated / usage.reportsLimit) * 100
    : 0;

  const isNearLimit = percentUsed >= 80;
  const hasReachedLimit = usage.reportsLimit && usage.reportsGenerated >= usage.reportsLimit;
  const daysUntilRenewal = Math.ceil(
    (subscription.currentPeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Plan {plan.name}
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status === 'active' ? 'Activo' : subscription.status}
                </Badge>
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </div>
            {subscription.planId !== 'business' && (
              <Button onClick={onUpgrade} variant="outline" size="sm">
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Mejorar Plan
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  €{subscription.billingCycle === 'annually' ? plan.price.annually : plan.price.monthly}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscription.billingCycle === 'annually' ? 'Anual' : 'Mensual'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{daysUntilRenewal} días</p>
                <p className="text-xs text-muted-foreground">Hasta renovación</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {usage.reportsGenerated} / {usage.reportsLimit || '∞'}
                </p>
                <p className="text-xs text-muted-foreground">Reportes usados</p>
              </div>
            </div>
          </div>

          {/* Cancel Warning */}
          {subscription.cancelAtPeriodEnd && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Tu suscripción se cancelará el{' '}
                {subscription.currentPeriodEnd.toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Usage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Uso del Plan</CardTitle>
          <CardDescription>
            Período actual: {subscription.currentPeriodStart.toLocaleDateString('es-ES')} -{' '}
            {subscription.currentPeriodEnd.toLocaleDateString('es-ES')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reports Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Reportes generados</span>
              <span className={cn(
                "font-semibold",
                hasReachedLimit && "text-destructive",
                isNearLimit && !hasReachedLimit && "text-yellow-600"
              )}>
                {usage.reportsGenerated} / {usage.reportsLimit || '∞'}
              </span>
            </div>
            {usage.reportsLimit && (
              <Progress 
                value={percentUsed} 
                className={cn(
                  "h-2",
                  hasReachedLimit && "[&>*]:bg-destructive",
                  isNearLimit && !hasReachedLimit && "[&>*]:bg-yellow-500"
                )}
              />
            )}
            {hasReachedLimit && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Has alcanzado el límite de tu plan
              </p>
            )}
            {isNearLimit && !hasReachedLimit && (
              <p className="text-xs text-yellow-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Te estás acercando al límite de tu plan
              </p>
            )}
          </div>

          {/* Transactions Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Transacciones procesadas</span>
              <span className="font-semibold">{usage.transactionsProcessed.toLocaleString()}</span>
            </div>
          </div>

          {/* Features List */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Características incluidas:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features.slice(0, 6).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Gestionar Suscripción</CardTitle>
          <CardDescription>Administra tu plan y métodos de pago</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={onManage} variant="outline" className="w-full justify-start">
            <CreditCard className="w-4 h-4 mr-2" />
            Actualizar método de pago
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Ver historial de facturas
          </Button>
          {!subscription.cancelAtPeriodEnd && (
            <Button 
              onClick={onCancelSubscription} 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              Cancelar suscripción
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

