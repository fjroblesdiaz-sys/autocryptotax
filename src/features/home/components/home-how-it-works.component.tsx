import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  { number: 1, title: 'Conecta carteras', description: 'Vincula carteras y exchanges de forma segura.' },
  { number: 2, title: 'Revisa transacciones', description: 'Consolida y valida tu historial.' },
  { number: 3, title: 'Genera informes', description: 'Descarga informes listos para Hacienda.' },
];

export const HomeHowItWorks = () => {
  return (
    <section id="how-it-works">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Cómo funciona</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tres simples pasos para obtener tus informes fiscales de criptomonedas
          </p>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.number}>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Badge variant="outline" className="h-16 w-16 rounded-full text-2xl font-bold flex items-center justify-center">
                    {step.number}
                  </Badge>
                </div>
                <CardTitle className="text-center">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

