'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, ArrowRight } from 'lucide-react';

export const HomeAirdropBanner = () => {
  return (
    <section className="relative overflow-hidden bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 border-y">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 py-12 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
          <div className="flex items-start gap-4 text-center md:text-left">
            <div className="p-3 bg-primary/10 rounded-full shrink-0">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Nuevo
                </Badge>
                <h2 className="text-2xl font-bold">ACT Genesis Airdrop</h2>
              </div>
              <p className="text-muted-foreground max-w-xl">
                Participa en nuestro airdrop y recibe hasta 1,000 tokens ACT completando tareas simples. 
                ¡Únete a la comunidad y sé parte del futuro!
              </p>
            </div>
          </div>
          <Link href="/airdrop">
            <Button size="lg" className="gap-2 shrink-0">
              Participar Ahora
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
