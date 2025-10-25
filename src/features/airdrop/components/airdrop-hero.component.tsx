'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Gift, Sparkles } from 'lucide-react';

interface AirdropHeroProps {
  tokenSymbol: string;
  totalTokens: number;
  tokensDistributed: number;
  endDate: Date;
}

export const AirdropHero = ({ 
  tokenSymbol, 
  totalTokens, 
  tokensDistributed,
  endDate 
}: AirdropHeroProps) => {
  const percentageDistributed = (tokensDistributed / totalTokens) * 100;
  const daysRemaining = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-primary/10 to-accent/5 border-b">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Airdrop Activo
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Gift className="w-12 h-12 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                ACT Genesis Airdrop
              </h1>
            </div>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl">
              Únete a la comunidad de Auto Crypto Tax y recibe tokens {tokenSymbol} completando 
              tareas simples. ¡Sé parte del futuro de la declaración fiscal de criptomonedas en España!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Tokens Totales</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
              </div>
              <p className="text-2xl font-bold">{percentageDistributed.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Distribuido</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold">{daysRemaining}</p>
              <p className="text-sm text-muted-foreground">Días Restantes</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gap-2">
              <Gift className="w-5 h-5" />
              Participar Ahora
            </Button>
            <Button size="lg" variant="outline">
              Ver Requisitos
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            🔒 Sin riesgos. No se requieren claves privadas. Tus datos permanecen seguros.
          </p>
        </div>
      </div>
    </section>
  );
};
