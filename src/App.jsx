import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import DashboardDemoPage from '@/pages/DashboardDemoPage';
import PricingPage from '@/pages/PricingPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import CookiesPage from '@/pages/CookiesPage';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import Loader from '@/components/Loader';
import ParticleBackground from '@/components/ParticleBackground';
import useAnchorNavigation from '@/hooks/useAnchorNavigation';

const App = () => {
  const location = useLocation();
  const { user, session, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useAnchorNavigation(isAppReady);

  const handleLoaderExit = useCallback(() => {
    setIsAppReady(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const isAuthenticated = !!session;

  const handleLogin = () => setIsAuthModalOpen(true);
  const handleLogout = () => signOut();

  return (
    <>
      <AnimatePresence onExitComplete={handleLoaderExit}>
        {isLoading && <Loader />}
      </AnimatePresence>
      
      <div className={`min-h-screen flex flex-col bg-slate-950 text-white relative transition-opacity duration-500 ${isAppReady ? 'opacity-100' : 'opacity-0'}`}>
        <ParticleBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header 
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={handleLogout}
            onLogin={handleLogin}
          />
          
          <main className="flex-grow">
            <ScrollToTop />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route 
                  path="/" 
                  element={<HomePage onLogin={handleLogin} />} 
                />
                <Route 
                  path="/dashboard" 
                  element={isAuthenticated ? <DashboardPage /> : <DashboardDemoPage onLogin={handleLogin} />} 
                />
                <Route 
                  path="/pricing" 
                  element={<PricingPage onLogin={handleLogin} />} 
                />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/cookies" element={<CookiesPage />} />
              </Routes>
            </AnimatePresence>
          </main>

          <Footer />
        </div>
        <Toaster />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </>
  );
};

export default App;