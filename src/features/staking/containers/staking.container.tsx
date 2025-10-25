'use client';

import { HomeNavbar } from '@/features/home/components/home-navbar.component';
import { HomeFooter } from '@/features/home/components/home-footer.component';
import { StakingHero } from '../components/staking-hero.component';
import { StakingPools } from '../components/staking-pools.component';
import { UserStakes } from '../components/user-stakes.component';
import { StakingInfo } from '../components/staking-info.component';
import { useStaking } from '../hooks/use-staking.hook';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const StakingContainer = () => {
  const { isConnected } = useAuth();
  const { pools, userData, stats, isLoading, stakeTokens, unstakeTokens, claimRewards } = useStaking();

  if (isLoading) {
    return (
      <>
        <HomeNavbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <Skeleton className="h-64 w-full" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
        <HomeFooter />
      </>
    );
  }

  return (
    <>
      <HomeNavbar />
      <main className="min-h-screen">
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
      </main>
      <HomeFooter />
    </>
  );
};
