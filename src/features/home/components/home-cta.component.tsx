'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/lib/thirdweb-client';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { useRouter } from 'next/navigation';

export const HomeCta = () => {
  const { isConnected } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isConnected) {
      // If already connected, go to dashboard
      router.push('/dashboard');
    }
    // If not connected, the ConnectButton will handle it
  };

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
            {isConnected ? (
              <Button size="lg" onClick={handleGetStarted}>Ir al Panel</Button>
            ) : (
              <ConnectButton 
                client={client} 
                theme="dark"
                locale='es_ES'
                connectButton={{
                  label: "Comenzar Ahora",
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

