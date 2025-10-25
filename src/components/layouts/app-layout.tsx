'use client';

import { HomeNavbar } from '@/features/home/components/home-navbar.component';
import { HomeFooter } from '@/features/home/components/home-footer.component';

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const AppLayout = ({ children, showFooter = true }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNavbar />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <HomeFooter />}
    </div>
  );
};
