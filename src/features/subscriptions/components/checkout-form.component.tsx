'use client';

/**
 * CheckoutForm Component
 * Displays checkout form for subscription purchase
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, CreditCard, Check, AlertCircle } from 'lucide-react';
import { SubscriptionPlan, BillingCycle } from '../types/subscription.types';
import { calculateSavingsPercentage } from '../constants/plans.constants';
import { cn } from '@/lib/utils';

export interface CheckoutFormProps {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  onSubmit: (data: CheckoutFormData) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export interface CheckoutFormData {
  email: string;
  cardholderName: string;
  acceptTerms: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  plan,
  billingCycle,
  onSubmit,
  onCancel,
  isProcessing = false,
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    cardholderName: '',
    acceptTerms: false,
  });

  const price = billingCycle === 'annually' ? plan.price.annually : plan.price.monthly;
  const savings = calculateSavingsPercentage(plan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = 
    formData.email && 
    formData.cardholderName && 
    formData.acceptTerms;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan Details */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">{plan.name}</span>
                {plan.popular && (
                  <Badge variant="secondary">Popular</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <p className="text-sm font-medium mb-3">Incluye:</p>
              <ul className="space-y-2">
                {plan.features.slice(0, 5).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Pricing Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>€{price.toFixed(2)}</span>
              </div>
              {billingCycle === 'annually' && savings > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento anual ({savings}%)</span>
                  <span>-€{((plan.price.monthly * 12 - price)).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>€{price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {billingCycle === 'annually' 
                  ? `Facturado anualmente (€${(price / 12).toFixed(2)}/mes)`
                  : 'Facturado mensualmente'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de Pago</CardTitle>
            <CardDescription>
              Completa los datos para finalizar tu suscripción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Enviaremos tu recibo y actualizaciones a este email
              </p>
            </div>

            <Separator />

            {/* Card Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Información de la Tarjeta</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholder">Nombre del Titular</Label>
                <Input
                  id="cardholder"
                  type="text"
                  placeholder="Como aparece en tu tarjeta"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  required
                  disabled={isProcessing}
                />
              </div>

              {/* Stripe Elements Placeholder */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Nota de desarrollo:</strong> En producción, aquí se integrará Stripe Elements 
                  para el procesamiento seguro de pagos. Este es un formulario visual de demostración.
                </AlertDescription>
              </Alert>

              {/* Mock Card Fields */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Número de Tarjeta</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    disabled
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Fecha de Expiración</Label>
                    <Input
                      id="expiry"
                      placeholder="MM / YY"
                      disabled
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      disabled
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, acceptTerms: checked as boolean })
                }
                disabled={isProcessing}
              />
              <div className="flex-1">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Acepto los{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    términos y condiciones
                  </a>
                  {' '}y la{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    política de privacidad
                  </a>
                </label>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Pago 100% seguro con Stripe</span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>Procesando...</>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Suscribirse a {plan.name}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
};

