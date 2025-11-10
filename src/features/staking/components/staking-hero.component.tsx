'use client';

import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Coins, Award } from 'lucide-react';
import { StakingStats } from '../types/staking.types';

interface StakingHeroProps {
  stats: StakingStats | null;
}

export const StakingHero = ({ stats }: StakingHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-primary/10 to-accent/5 border-b">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
            <TrendingUp className="w-4 h-4 mr-2 inline" />
            Staking ACT
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Gana Recompensas con Staking
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl text-center">
              Stake tus tokens ACT y gana recompensas pasivas mientras apoyas el ecosistema 
              de Auto Crypto Tax. Elige el pool que mejor se adapte a tus necesidades.
            </p>
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
              <div className="bg-card rounded-lg p-6 border shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">
                  ${(stats.totalValueLocked / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-muted-foreground">TVL</p>
              </div>

              <div className="bg-card rounded-lg p-6 border shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">
                  {stats.totalStakers.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Stakers</p>
              </div>

              <div className="bg-card rounded-lg p-6 border shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">{stats.averageApy}%</p>
                <p className="text-sm text-muted-foreground">APY Promedio</p>
              </div>

              <div className="bg-card rounded-lg p-6 border shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">
                  {(stats.totalRewardsDistributed / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-muted-foreground">Recompensas</p>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            🔒 Contratos auditados. Tus fondos están seguros y protegidos.
          </p>
        </div>
      </div>
    </section>
  );
};
