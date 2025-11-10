import { HomeNavbar } from '@/features/home/components/home-navbar.component';
import { HomeFooter } from '@/features/home/components/home-footer.component';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNavbar />
      <main className="flex-1">
        {children}
      </main>
      <HomeFooter />
    </div>
  );
}

