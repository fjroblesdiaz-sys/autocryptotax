export type DataSourceType = 'wallet' | 'csv' | 'manual' | 'api-key' | 'oauth';

export type ExchangePlatform = 'binance' | 'coinbase' | 'whitebit' | 'kraken' | 'other';

export type ReportType = 'model-720' | 'model-100' | 'model-714';

export interface DataSource {
  type: DataSourceType;
  label: string;
  description: string;
  icon: string;
}

export interface CSVUploadData {
  file: File;
  platform: ExchangePlatform;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface APIKeyData {
  platform: ExchangePlatform;
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // For Coinbase
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface OAuthData {
  platform: ExchangePlatform;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface ManualEntryTransaction {
  id: string;
  date: Date;
  type: 'buy' | 'sell' | 'transfer' | 'stake' | 'airdrop';
  asset: string;
  amount: number;
  price: number;
  fee?: number;
  notes?: string;
}

export interface WalletData {
  address: string;
  chain?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface ReportGenerationData {
  reportType: ReportType;
  dataSource: DataSourceType;
  fiscalYear: number;
  data: WalletData | CSVUploadData | APIKeyData | OAuthData | ManualEntryTransaction[];
}

export interface GeneratedReport {
  id: string;
  reportType: ReportType;
  fiscalYear: number;
  generatedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  dataSource: DataSourceType;
  downloadUrl?: string;
  summary?: {
    totalTransactions: number;
    totalGains: number;
    totalLosses: number;
    netResult: number;
  };
}

export interface ReportGenerationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}
