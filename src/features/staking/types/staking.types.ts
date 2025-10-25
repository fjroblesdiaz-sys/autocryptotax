export interface StakingPool {
  id: string;
  name: string;
  description: string;
  tokenSymbol: string;
  apy: number;
  totalStaked: number;
  minStake: number;
  lockPeriod: number; // in days
  isActive: boolean;
  rewardToken: string;
  features: string[];
}

export interface UserStake {
  id: string;
  poolId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  rewards: number;
  status: 'active' | 'completed' | 'withdrawn';
  autoCompound: boolean;
}

export interface StakingStats {
  totalValueLocked: number;
  totalStakers: number;
  averageApy: number;
  totalRewardsDistributed: number;
}

export interface UserStakingData {
  totalStaked: number;
  totalRewards: number;
  activeStakes: UserStake[];
  availableBalance: number;
}
