export interface AirdropCampaign {
  id: string;
  name: string;
  description: string;
  tokenSymbol: string;
  totalTokens: number;
  tokensDistributed: number;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'ended';
  requirements: AirdropRequirement[];
  rewardAmount: number;
}

export interface AirdropRequirement {
  id: string;
  type: 'wallet_connect' | 'exchange_connect' | 'transaction_import' | 'report_generate' | 'referral';
  description: string;
  completed: boolean;
  points: number;
}

export interface UserAirdropProgress {
  totalPoints: number;
  completedRequirements: string[];
  estimatedReward: number;
  walletAddress?: string;
  isEligible: boolean;
}
