'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ConnectButton } from 'thirdweb/react';
import { client } from '@/lib/thirdweb-client';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';

export const HomeNavbar = () => {
  const { isConnected } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = isConnected ? [
    { href: '/dashboard', label: 'Panel' },
    { href: '/reports', label: 'Informes' },
    { href: '/airdrop', label: 'Airdrop' },
  ] : [
    { href: '#features', label: 'Características' },
    { href: '#how-it-works', label: 'Cómo funciona' },
    { href: '/airdrop', label: 'Airdrop' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            Auto Crypto Tax
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ConnectButton 
                client={client} 
                theme="dark"
                connectButton={{
                  label: "Conectar",
                  style: {
                    height: "40px",
                    fontSize: "14px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                  },
                }}
                detailsButton={{
                  style: {
                    height: "40px",
                    fontSize: "14px",
                  },
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="flex flex-col py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium py-2 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Separator className="my-2" />
              <div className="pt-2">
                <ConnectButton 
                  client={client} 
                  theme="dark"
                  connectButton={{
                    label: "Conectar",
                    style: {
                      height: "40px",
                      fontSize: "14px",
                      width: "100%",
                    },
                  }}
                  detailsButton={{
                    style: {
                      height: "40px",
                      fontSize: "14px",
                      width: "100%",
                    },
                  }}
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

