'use client';

import { ThirdwebProvider } from 'thirdweb/react';
import { useEffect } from 'react';
import { initializeCacheManager } from '@/lib/cache-manager';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  // Initialize cache manager on app load
  useEffect(() => {
    initializeCacheManager();
  }, []);

  return <ThirdwebProvider>{children}</ThirdwebProvider>;
};
