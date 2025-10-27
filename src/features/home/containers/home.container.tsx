"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { Separator } from '@/components/ui/separator';
import { HomeHero } from '@/features/home/components/home-hero.component';
import { HomeAirdropBanner } from '@/features/home/components/home-airdrop-banner.component';
import { HomeFeatures } from '@/features/home/components/home-features.component';
import { HomeHowItWorks } from '@/features/home/components/home-how-it-works.component';

export const HomeContainer = () => {
  const { isConnected } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.replace('/dashboard');
    }
  }, [isConnected, router]);

  return (
    <>
      <HomeHero />
      {/* <HomeAirdropBanner /> */}
      <Separator />
      <HomeFeatures />
      <Separator />
      <HomeHowItWorks />
    </>
  );
};
