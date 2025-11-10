"use client";

import { Separator } from '@/components/ui/separator';
import { HomeHero } from '@/features/home/components/home-hero.component';
import { HomeAirdropBanner } from '@/features/home/components/home-airdrop-banner.component';
import { HomeFeatures } from '@/features/home/components/home-features.component';
import { HomeHowItWorks } from '@/features/home/components/home-how-it-works.component';
import { HomePricing } from '@/features/home/components/home-pricing.component';

export const HomeContainer = () => {
  return (
    <>
      <HomeHero />
      {/* <HomeAirdropBanner /> */}
      <Separator />
      <HomeFeatures />
      <Separator />
      <HomePricing />
      <Separator />
      <HomeHowItWorks />
    </>
  );
};
