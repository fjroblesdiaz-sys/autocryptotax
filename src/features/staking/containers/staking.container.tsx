'use client';

import { StakingHero } from '../components/staking-hero.component';
import { StakingPools } from '../components/staking-pools.component';
import { UserStakes } from '../components/user-stakes.component';
import { StakingInfo } from '../components/staking-info.component';
import { useStaking } from '../hooks/use-staking.hook';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { Skeleton } from '@/components/ui/skeleton';

export const StakingContainer = () => {
  const { isConnected } = useAuth();
  const { pools, userData, stats, isLoading, stakeTokens, unstakeTokens, claimRewards } = useStaking();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-64 w-full" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <StakingHero stats={stats} />
      <StakingPools 
        pools={pools} 
        isConnected={isConnected}
        onStake={stakeTokens}
      />
      {isConnected && userData && (
        <UserStakes 
          userData={userData}
          onUnstake={unstakeTokens}
          onClaim={claimRewards}
        />
      )}
      <StakingInfo />
    </>
  );
};
