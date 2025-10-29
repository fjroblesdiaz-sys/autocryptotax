'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/lib/thirdweb-client';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { useRouter } from 'next/navigation';

export const HomeHero = () => {
  const { isConnected } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isConnected) {
      // If already connected, go to dashboard
      router.push('/dashboard');
    }
    // If not connected, the ConnectButton will handle it
  };

  const handleLearnMore = () => {
    // Scroll to how it works section
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          {isConnected ? (
            <Button size="lg" onClick={handleGetStarted}>Ir al Panel</Button>
          ) : (
            <ConnectButton 
              client={client} 
              theme="dark"
              locale='es_ES'
              connectButton={{
                label: "Comenzar",
                style: {
                  height: "44px",
                  fontSize: "16px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  borderRadius: "6px",
                },
              }}
              detailsButton={{
                style: {
                  height: "44px",
                  fontSize: "16px",
                },
              }}
            />
          )}
          <Button size="lg" variant="outline" onClick={handleLearnMore}>Ver cómo funciona</Button>
        </div>
        <p className="text-sm text-muted-foreground">No se requieren claves privadas. Tus datos permanecen tuyos.</p>
      </div>
    </section>
  );
};

