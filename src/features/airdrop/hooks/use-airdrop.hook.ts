'use client';

import { useState, useEffect } from 'react';
import { AirdropCampaign, UserAirdropProgress } from '../types/airdrop.types';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';

export const useAirdrop = () => {
  const { address, isConnected } = useAuth();
  const [campaign, setCampaign] = useState<AirdropCampaign | null>(null);
  const [userProgress, setUserProgress] = useState<UserAirdropProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading campaign data
    const loadCampaignData = async () => {
      setIsLoading(true);
      
      // Mock campaign data
      const mockCampaign: AirdropCampaign = {
        id: 'act-genesis-airdrop',
        name: 'ACT Genesis Airdrop',
        description: 'Participa en el lanzamiento de Auto Crypto Tax y recibe tokens ACT',
        tokenSymbol: 'ACT',
        totalTokens: 1000000,
        tokensDistributed: 250000,
        startDate: new Date('2025-10-20'),
        endDate: new Date('2025-12-31'),
        status: 'active',
        requirements: [
          {
            id: 'wallet-connect',
            type: 'wallet_connect',
            description: 'Conecta tu cartera de criptomonedas',
            completed: isConnected,
            points: 100,
          },
          {
            id: 'exchange-connect',
            type: 'exchange_connect',
            description: 'Conecta al menos un exchange (Binance, Coinbase, etc.)',
            completed: false,
            points: 200,
          },
          {
            id: 'transaction-import',
            type: 'transaction_import',
            description: 'Importa tus transacciones de criptomonedas',
            completed: false,
            points: 150,
          },
          {
            id: 'report-generate',
            type: 'report_generate',
            description: 'Genera tu primer informe fiscal',
            completed: false,
            points: 250,
          },
          {
            id: 'referral',
            type: 'referral',
            description: 'Invita a 3 amigos a usar la plataforma',
            completed: false,
            points: 300,
          },
        ],
        rewardAmount: 1000,
      };

      setCampaign(mockCampaign);

      // Calculate user progress
      const completedRequirements = mockCampaign.requirements
        .filter(req => req.completed)
        .map(req => req.id);
      
      const totalPoints = mockCampaign.requirements
        .filter(req => req.completed)
        .reduce((sum, req) => sum + req.points, 0);

      const maxPoints = mockCampaign.requirements
        .reduce((sum, req) => sum + req.points, 0);

      const estimatedReward = (totalPoints / maxPoints) * mockCampaign.rewardAmount;

      setUserProgress({
        totalPoints,
        completedRequirements,
        estimatedReward,
        walletAddress: address,
        isEligible: isConnected,
      });

      setIsLoading(false);
    };

    loadCampaignData();
  }, [address, isConnected]);

  const claimAirdrop = async () => {
    // Implement claim logic
    console.log('Claiming airdrop...');
  };

  return {
    campaign,
    userProgress,
    isLoading,
    claimAirdrop,
  };
};
