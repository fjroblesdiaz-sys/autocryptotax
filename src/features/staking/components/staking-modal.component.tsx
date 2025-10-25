'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { StakingPool } from '../types/staking.types';
import { AlertCircle, TrendingUp, Calendar, Coins } from 'lucide-react';

interface StakingModalProps {
  pool: StakingPool;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, autoCompound: boolean) => void;
}

export const StakingModal = ({ pool, isOpen, onClose, onConfirm }: StakingModalProps) => {
  const [amount, setAmount] = useState('');
  const [autoCompound, setAutoCompound] = useState(false);
  const [error, setError] = useState('');

  const availableBalance = 10000; // Mock balance

  const calculateRewards = () => {
    const numAmount = parseFloat(amount) || 0;
    const dailyRate = pool.apy / 365 / 100;
    const days = pool.lockPeriod || 30;
    return numAmount * dailyRate * days;
  };

  const handleMaxClick = () => {
    setAmount(availableBalance.toString());
    setError('');
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);

    if (!amount || numAmount <= 0) {
      setError('Por favor ingresa una cantidad válida');
      return;
    }

    if (numAmount < pool.minStake) {
      setError(`El stake mínimo es ${pool.minStake} ${pool.tokenSymbol}`);
      return;
    }

    if (numAmount > availableBalance) {
      setError('Saldo insuficiente');
      return;
    }

    onConfirm(numAmount, autoCompound);
    setAmount('');
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Stake {pool.tokenSymbol}</DialogTitle>
          <DialogDescription>{pool.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pool Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">APY</p>
              <p className="text-2xl font-bold text-primary">{pool.apy}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Período</p>
              <p className="text-2xl font-bold">
                {pool.lockPeriod === 0 ? 'Flexible' : `${pool.lockPeriod}d`}
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Cantidad a Stake</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {availableBalance.toLocaleString()} {pool.tokenSymbol}
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder={`Mínimo ${pool.minStake}`}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleMaxClick}>
                MAX
              </Button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Auto-compound Toggle */}
          {pool.lockPeriod > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="auto-compound" className="text-base">
                  Auto-Compound
                </Label>
                <p className="text-sm text-muted-foreground">
                  Reinvierte automáticamente las recompensas
                </p>
              </div>
              <Switch
                id="auto-compound"
                checked={autoCompound}
                onCheckedChange={setAutoCompound}
              />
            </div>
          )}

          {/* Estimated Rewards */}
          {amount && parseFloat(amount) > 0 && (
            <div className="space-y-3 p-4 bg-primary/5 rounded-lg border">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recompensas Estimadas
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Cantidad Staked
                  </span>
                  <span className="font-semibold">
                    {parseFloat(amount).toLocaleString()} {pool.tokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Período
                  </span>
                  <span className="font-semibold">
                    {pool.lockPeriod === 0 ? '30 días (estimado)' : `${pool.lockPeriod} días`}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Recompensa Total</span>
                  <span className="font-bold text-primary">
                    ~{calculateRewards().toFixed(2)} {pool.rewardToken}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning for locked pools */}
          {pool.lockPeriod > 0 && (
            <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-500/50">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  Período de Bloqueo
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Tus tokens estarán bloqueados por {pool.lockPeriod} días. No podrás retirarlos
                  antes de que finalice este período.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Confirmar Stake
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
