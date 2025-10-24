'use client';

import { ThirdwebProvider } from 'thirdweb/react';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
};
