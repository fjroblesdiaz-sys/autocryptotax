import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HomeCta = () => {
  return (
    <section>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-center sm:text-4xl">
              ¿Listo para simplificar tus impuestos de criptomonedas?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <p className="text-lg text-muted-foreground text-center">
              Únete a los inversores españoles en criptomonedas que simplificaron su declaración fiscal con Auto Crypto Tax
            </p>
            <Button size="lg">Comenzar Ahora</Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

