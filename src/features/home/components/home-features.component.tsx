import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Soporte multi-cartera',
    description: 'Conecta carteras y exchanges para importar transacciones automáticamente.',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Informes compatibles con España',
    description: 'Genera informes listos para los Modelos 720, 100 y 714.',
    iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: 'Privacidad primero',
    description: 'Nunca almacenamos claves privadas. Tus datos están encriptados y seguros.',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04',
  },
  {
    title: 'Cálculos precisos',
    description: 'Ganancias/pérdidas de capital con FIFO/LIFO y desgloses detallados.',
    iconPath: 'M3 3v18h18',
  },
  {
    title: 'Exportar a cualquier lugar',
    description: 'Descarga en formatos PDF/CSV para guardar o compartir con asesores.',
    iconPath: 'M4 16l4 4 12-12',
  },
  {
    title: 'Configuración rápida',
    description: 'Ve de cero al primer informe en menos de 10 minutos.',
    iconPath: 'M12 6v6l4 2',
  },
];

export const HomeFeatures = () => {
  return (
    <section id="features" className="bg-muted/50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un conjunto completo de herramientas para manejar tus obligaciones fiscales de criptomonedas en España
          </p>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath} />
                  </svg>
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

