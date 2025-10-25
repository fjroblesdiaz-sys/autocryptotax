'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StakingPool } from '../types/staking.types';
import {
  Clock,
  TrendingUp,
  Lock,
  Unlock,
  CheckCircle2,
  Coins,
} from 'lucide-react';
import { StakingModal } from './staking-modal.component';

interface StakingPoolsProps {
  pools: StakingPool[];
  isConnected: boolean;
  onStake?: (poolId: string, amount: number, autoCompound: boolean) => void;
}

export const StakingPools = ({ pools, isConnected, onStake }: StakingPoolsProps) => {
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStakeClick = (pool: StakingPool) => {
    setSelectedPool(pool);
    setIsModalOpen(true);
  };

  const handleStakeConfirm = (amount: number, autoCompound: boolean) => {
    if (selectedPool && onStake) {
      onStake(selectedPool.id, amount, autoCompound);
    }
    setIsModalOpen(false);
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Pools de Staking</h2>
          <p className="text-muted-foreground">
            Elige el pool que mejor se adapte a tu estrategia de inversión
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pools.map((pool) => {
            const utilizationRate = (pool.totalStaked / (pool.totalStaked * 1.5)) * 100;

            return (
              <Card
                key={pool.id}
                className={`transition-all hover:shadow-lg ${
                  pool.lockPeriod === 0
                    ? 'border-green-500/50'
                    : pool.apy >= 70
                    ? 'border-purple-500/50'
                    : pool.apy >= 40
                    ? 'border-blue-500/50'
                    : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl">{pool.name}</CardTitle>
                      <CardDescription>{pool.description}</CardDescription>
                    </div>
                    {pool.lockPeriod === 0 ? (
                      <Badge variant="secondary" className="gap-1">
                        <Unlock className="w-3 h-3" />
                        Flexible
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <Lock className="w-3 h-3" />
                        {pool.lockPeriod}d
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* APY Display */}
                  <div className="text-center p-6 bg-primary/5 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">APY</p>
                    <p className="text-5xl font-bold text-primary">{pool.apy}%</p>
                  </div>

                  {/* Pool Stats */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Coins className="w-4 h-4" />
                        Total Staked
                      </span>
                      <span className="font-semibold">
                        {(pool.totalStaked / 1000000).toFixed(2)}M {pool.tokenSymbol}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Utilización del Pool</span>
                        <span className="font-semibold">{utilizationRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={utilizationRate} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Stake Mínimo
                      </span>
                      <span className="font-semibold">
                        {pool.minStake} {pool.tokenSymbol}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Recompensa
                      </span>
                      <span className="font-semibold">{pool.rewardToken}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Características:</p>
                    <ul className="space-y-2">
                      {pool.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleStakeClick(pool)}
                    disabled={!isConnected}
                  >
                    {isConnected ? 'Stake Ahora' : 'Conecta tu Cartera'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Staking Modal */}
      {selectedPool && (
        <StakingModal
          pool={selectedPool}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleStakeConfirm}
        />
      )}
    </section>
  );
};
