'use client';

import { HomeNavbar } from '@/features/home/components/home-navbar.component';
import { HomeFooter } from '@/features/home/components/home-footer.component';
import { AirdropHero } from '../components/airdrop-hero.component';
import { AirdropRequirements } from '../components/airdrop-requirements.component';
import { AirdropInfo } from '../components/airdrop-info.component';
import { useAirdrop } from '../hooks/use-airdrop.hook';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const AirdropContainer = () => {
  const { campaign, userProgress, isLoading } = useAirdrop();

  if (isLoading || !campaign || !userProgress) {
    return (
      <>
        <HomeNavbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-64 w-full" />
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
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
        <AirdropHero
          tokenSymbol={campaign.tokenSymbol}
          totalTokens={campaign.totalTokens}
          tokensDistributed={campaign.tokensDistributed}
          endDate={campaign.endDate}
        />
        <AirdropRequirements
          requirements={campaign.requirements}
          totalPoints={userProgress.totalPoints}
        />
        <AirdropInfo />
      </main>
      <HomeFooter />
    </>
  );
};
