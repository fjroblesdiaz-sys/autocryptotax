import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import Dashboard from '@/components/Dashboard';
import BinanceConnect from '@/components/BinanceConnect';
import Spinner from '@/components/Spinner';

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasBinanceKeys, setHasBinanceKeys] = useState(null);
  const [isCheckingKeys, setIsCheckingKeys] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const checkBinanceKeys = useCallback(async () => {
    if (user) {
      setIsCheckingKeys(true);
      try {
        const { data, error } = await supabase
          .from('encrypted_binance_keys')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        const keysExist = !!data;
        setHasBinanceKeys(keysExist);
        if (keysExist) {
          setIsSyncing(true);
          // Simulate data fetching after sync
          setTimeout(() => {
            setDashboardData({
              totalBalance: 12543.78,
              gains: 4350.15,
              losses: -1230.40,
              assets: 15,
              netGain: 3119.75,
              estimatedTax: 717.54,
              acquisitionCost: 21480.50,
              totalProceeds: 24600.25,
            });
            setIsSyncing(false);
          }, 3000);
        }
      } catch (error) {
        console.error('Error checking for Binance keys:', error);
        setHasBinanceKeys(false);
      } finally {
        setIsCheckingKeys(false);
      }
    } else {
      setIsCheckingKeys(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      checkBinanceKeys();
    }
  }, [user, authLoading, checkBinanceKeys]);

  const handleConnect = () => {
    setHasBinanceKeys(true);
    setIsSyncing(true);
    // Simulate data fetching after connecting
    setTimeout(() => {
      setDashboardData({
        totalBalance: 12543.78,
        gains: 4350.15,
        losses: -1230.40,
        assets: 15,
        netGain: 3119.75,
        estimatedTax: 717.54,
        acquisitionCost: 21480.50,
        totalProceeds: 24600.25,
      });
      setIsSyncing(false);
    }, 3000);
  };

  if (authLoading || isCheckingKeys) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Fiscal - CryptoTax Pro</title>
        <meta name="description" content="Tu panel de control para el seguimiento de ganancias, pérdidas y transacciones de criptomonedas." />
      </Helmet>
      <div className="pt-20">
        <Dashboard 
          user={user} 
          isDemo={!hasBinanceKeys} 
          isSyncing={isSyncing}
          data={dashboardData}
        />
        {!hasBinanceKeys && (
          <div className="py-12 px-6">
            <BinanceConnect user={user} onConnect={handleConnect} />
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;