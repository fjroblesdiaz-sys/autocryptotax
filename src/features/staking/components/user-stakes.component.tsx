'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserStakingData } from '../types/staking.types';
import { Coins, TrendingUp, Calendar, Gift, Lock } from 'lucide-react';

interface UserStakesProps {
  userData: UserStakingData | null;
  onUnstake?: (stakeId: string) => void;
  onClaim?: (stakeId: string) => void;
}

export const UserStakes = ({ userData, onUnstake, onClaim }: UserStakesProps) => {
  if (!userData) {
    return null;
  }

  const calculateTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const calculateProgress = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.min((elapsed / total) * 100, 100);
  };

  return (
    <section className="mx-auto px-4 py-12 bg-muted/30 w-full">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Mis Stakes</h2>
          <p className="text-muted-foreground">
            Gestiona tus stakes activos y reclama tus recompensas
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="w-5 h-5 text-primary" />
                Total Staked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {userData.totalStaked.toLocaleString()} ACT
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ~${(userData.totalStaked * 0.5).toLocaleString()} USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Recompensas Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {userData.totalRewards.toFixed(2)} ACT
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ~${(userData.totalRewards * 0.5).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-primary" />
                Stakes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userData.activeStakes.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                En diferentes pools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Stakes */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Stakes Activos</h3>
          {userData.activeStakes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No tienes stakes activos. ¡Comienza a stakear para ganar recompensas!
                </p>
              </CardContent>
            </Card>
          ) : (
            userData.activeStakes.map((stake) => {
              const daysRemaining = calculateTimeRemaining(stake.endDate);
              const progress = calculateProgress(stake.startDate, stake.endDate);
              const isCompleted = daysRemaining === 0;

              return (
                <Card key={stake.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Pool ID: {stake.poolId}
                          {stake.autoCompound && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-Compound
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Iniciado el {stake.startDate.toLocaleDateString('es-ES')}
                        </CardDescription>
                      </div>
                      <Badge variant={isCompleted ? 'default' : 'secondary'}>
                        {isCompleted ? 'Completado' : 'Activo'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Stake Details */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cantidad Staked</p>
                        <p className="text-xl font-bold">
                          {stake.amount.toLocaleString()} ACT
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Recompensas</p>
                        <p className="text-xl font-bold text-green-600">
                          {stake.rewards.toFixed(2)} ACT
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Finaliza</p>
                        <p className="text-xl font-bold">
                          {isCompleted ? 'Ahora' : `${daysRemaining}d`}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {!isCompleted && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Progreso del Período
                          </span>
                          <span className="font-semibold">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      {isCompleted && (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onUnstake?.(stake.id)}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Retirar Stake
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => onClaim?.(stake.id)}
                          >
                            <Gift className="w-4 h-4 mr-2" />
                            Reclamar Recompensas
                          </Button>
                        </>
                      )}
                      {!isCompleted && stake.rewards > 0 && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => onClaim?.(stake.id)}
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Reclamar {stake.rewards.toFixed(2)} ACT
                        </Button>
                      )}
                      {!isCompleted && stake.rewards === 0 && (
                        <div className="flex-1 text-center text-sm text-muted-foreground py-2">
                          Las recompensas se acumularán con el tiempo
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
