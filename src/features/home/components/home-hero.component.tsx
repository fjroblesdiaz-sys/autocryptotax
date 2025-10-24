import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const HomeHero = () => {
  return (
    <section className="container mx-auto px-4 py-20 md:py-28">
      <div className="flex flex-col items-center text-center gap-8">
        <Badge variant="secondary" className="px-3 py-1">Para inversores españoles en criptomonedas</Badge>
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Automatiza tus impuestos de criptomonedas en España
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Conecta carteras, consolida transacciones y genera informes listos para Hacienda en minutos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg">Comenzar</Button>
          <Button size="lg" variant="outline">Ver cómo funciona</Button>
        </div>
        <p className="text-sm text-muted-foreground">No se requieren claves privadas. Tus datos permanecen tuyos.</p>
      </div>
    </section>
  );
};

