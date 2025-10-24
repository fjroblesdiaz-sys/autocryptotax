import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const plans = {
  monthly: [
    { name: 'Starter', price: '€9', features: ['Up to 2 wallets', 'Basic reports', 'Email support'] },
    { name: 'Pro', price: '€19', features: ['Up to 10 wallets', 'Advanced reports', 'Priority support'] },
    { name: 'Expert', price: '€39', features: ['Unlimited wallets', 'All reports & exports', 'Priority support'] },
  ],
  yearly: [
    { name: 'Starter', price: '€90', features: ['Up to 2 wallets', 'Basic reports', 'Email support'] },
    { name: 'Pro', price: '€190', features: ['Up to 10 wallets', 'Advanced reports', 'Priority support'] },
    { name: 'Expert', price: '€390', features: ['Unlimited wallets', 'All reports & exports', 'Priority support'] },
  ],
};

export const HomePricing = () => {
  return (
    <section id="pricing" className="bg-muted/50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Simple pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a plan that fits your needs. Cancel anytime.
          </p>
        </div>
        <Tabs defaultValue="monthly" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="monthly">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {plans.monthly.map((plan) => (
                <Card key={plan.name}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                    <Button className="w-full">Choose {plan.name}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="yearly">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {plans.yearly.map((plan) => (
                <Card key={plan.name}>
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                    <Button className="w-full">Choose {plan.name}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

