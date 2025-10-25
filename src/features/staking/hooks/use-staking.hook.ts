'use client';

import { useState, useEffect } from 'react';
import { StakingPool, UserStakingData, StakingStats } from '../types/staking.types';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';

export const useStaking = () => {
  const { address, isConnected } = useAuth();
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [userData, setUserData] = useState<UserStakingData | null>(null);
  const [stats, setStats] = useState<StakingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStakingData = async () => {
      setIsLoading(true);

      // Mock staking pools
      const mockPools: StakingPool[] = [
        {
          id: 'flexible-pool',
          name: 'Flexible Staking',
          description: 'Stake y retira en cualquier momento sin penalización',
          tokenSymbol: 'ACT',
          apy: 12,
          totalStaked: 5000000,
          minStake: 100,
          lockPeriod: 0,
          isActive: true,
          rewardToken: 'ACT',
          features: ['Sin período de bloqueo', 'Retiro instantáneo', 'Recompensas diarias'],
        },
        {
          id: '30-day-pool',
          name: 'Staking 30 Días',
          description: 'Bloquea tus tokens por 30 días para mejores recompensas',
          tokenSymbol: 'ACT',
          apy: 25,
          totalStaked: 8000000,
          minStake: 500,
          lockPeriod: 30,
          isActive: true,
          rewardToken: 'ACT',
          features: ['APY más alto', 'Auto-compound disponible', 'Recompensas garantizadas'],
        },
        {
          id: '90-day-pool',
          name: 'Staking 90 Días',
          description: 'Maximiza tus ganancias con el pool de 90 días',
          tokenSymbol: 'ACT',
          apy: 45,
          totalStaked: 12000000,
          minStake: 1000,
          lockPeriod: 90,
          isActive: true,
          rewardToken: 'ACT',
          features: ['APY máximo', 'Bonus de fidelidad', 'Acceso a funciones premium'],
        },
        {
          id: '180-day-pool',
          name: 'Staking 180 Días',
          description: 'El pool de mayor rendimiento para holders a largo plazo',
          tokenSymbol: 'ACT',
          apy: 75,
          totalStaked: 15000000,
          minStake: 2000,
          lockPeriod: 180,
          isActive: true,
          rewardToken: 'ACT',
          features: ['APY premium', 'NFT exclusivo', 'Voto en gobernanza', 'Soporte prioritario'],
        },
      ];

      setPools(mockPools);

      // Mock global stats
      const mockStats: StakingStats = {
        totalValueLocked: 40000000,
        totalStakers: 12543,
        averageApy: 39.25,
        totalRewardsDistributed: 2500000,
      };

      setStats(mockStats);

      // Mock user data if connected
      if (isConnected) {
        const mockUserData: UserStakingData = {
          totalStaked: 5000,
          totalRewards: 234.56,
          activeStakes: [
            {
              id: 'stake-1',
              poolId: '30-day-pool',
              amount: 2000,
              startDate: new Date('2025-10-01'),
              endDate: new Date('2025-10-31'),
              rewards: 123.45,
              status: 'active',
              autoCompound: true,
            },
            {
              id: 'stake-2',
              poolId: '90-day-pool',
              amount: 3000,
              startDate: new Date('2025-09-15'),
              endDate: new Date('2025-12-15'),
              rewards: 111.11,
              status: 'active',
              autoCompound: false,
            },
          ],
          availableBalance: 10000,
        };

        setUserData(mockUserData);
      }

      setIsLoading(false);
    };

    loadStakingData();
  }, [address, isConnected]);

  const stakeTokens = async (poolId: string, amount: number, autoCompound: boolean) => {
    console.log('Staking tokens:', { poolId, amount, autoCompound });
    // Implement staking logic
  };

  const unstakeTokens = async (stakeId: string) => {
    console.log('Unstaking tokens:', stakeId);
    // Implement unstaking logic
  };

  const claimRewards = async (stakeId: string) => {
    console.log('Claiming rewards:', stakeId);
    // Implement claim logic
  };

  return {
    pools,
    userData,
    stats,
    isLoading,
    stakeTokens,
    unstakeTokens,
    claimRewards,
  };
};
