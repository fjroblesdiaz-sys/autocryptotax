/**
 * Validation schemas for report generation
 * Using Zod for runtime validation
 */

import { z } from 'zod';

/**
 * Wallet Data Validation
 */
export const WalletDataSchema = z.object({
  address: z.string().min(1, 'Wallet address is required').regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
  chain: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
});

/**
 * CSV Upload Validation
 */
export const CSVUploadDataSchema = z.object({
  file: z.instanceof(File),
  platform: z.enum(['binance', 'coinbase', 'kraken', 'other']),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
});

/**
 * API Key Configuration Validation
 */
export const APIKeyDataSchema = z.object({
  platform: z.enum(['binance', 'coinbase', 'kraken', 'other']),
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().min(1, 'API secret is required'),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
});

/**
 * OAuth Data Validation
 */
export const OAuthDataSchema = z.object({
  platform: z.enum(['binance', 'coinbase', 'kraken', 'other']),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
});

/**
 * Manual Entry Transaction Validation
 */
export const ManualEntryTransactionSchema = z.object({
  id: z.string(),
  date: z.date(),
  type: z.enum(['buy', 'sell', 'transfer', 'stake', 'airdrop']),
  asset: z.string().min(1, 'Asset is required'),
  amount: z.number().positive('Amount must be positive'),
  price: z.number().nonnegative('Price must be non-negative'),
  fee: z.number().nonnegative('Fee must be non-negative').optional(),
  notes: z.string().optional(),
});

/**
 * Report Type Validation
 */
export const ReportTypeSchema = z.enum(['model-720', 'model-100', 'model-714']);

/**
 * Fiscal Year Validation
 */
export const FiscalYearSchema = z.number()
  .int('Fiscal year must be an integer')
  .min(2009, 'Bitcoin was created in 2009')
  .max(new Date().getFullYear(), 'Cannot generate reports for future years');

/**
 * Report Configuration Validation
 */
export const ReportConfigSchema = z.object({
  reportType: ReportTypeSchema,
  fiscalYear: FiscalYearSchema,
});

/**
 * Taxpayer Info Validation
 */
export const TaxpayerInfoSchema = z.object({
  nif: z.string().regex(/^[0-9]{8}[A-Z]$/, 'Invalid NIF format (DNI)').or(z.string().regex(/^[XYZ][0-9]{7}[A-Z]$/, 'Invalid NIE format')).optional(),
  name: z.string().min(1, 'Name is required').optional(),
  surname: z.string().min(1, 'Surname is required').optional(),
  address: z.string().optional(),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Invalid postal code').optional(),
  city: z.string().optional(),
  province: z.string().optional(),
});

/**
 * Data Source Type Validation
 */
export const DataSourceTypeSchema = z.enum(['wallet', 'csv', 'manual', 'api-key', 'oauth']);

/**
 * Complete Report Generation Request Validation
 */
export const ReportGenerationRequestSchema = z.object({
  dataSource: DataSourceTypeSchema,
  sourceData: z.union([
    WalletDataSchema,
    CSVUploadDataSchema,
    APIKeyDataSchema,
    OAuthDataSchema,
    z.array(ManualEntryTransactionSchema),
  ]),
  reportType: ReportTypeSchema,
  fiscalYear: FiscalYearSchema,
  taxpayerInfo: TaxpayerInfoSchema.optional(),
});

// Type exports
export type WalletDataInput = z.infer<typeof WalletDataSchema>;
export type CSVUploadDataInput = z.infer<typeof CSVUploadDataSchema>;
export type APIKeyDataInput = z.infer<typeof APIKeyDataSchema>;
export type OAuthDataInput = z.infer<typeof OAuthDataSchema>;
export type ManualEntryTransactionInput = z.infer<typeof ManualEntryTransactionSchema>;
export type ReportConfigInput = z.infer<typeof ReportConfigSchema>;
export type TaxpayerInfoInput = z.infer<typeof TaxpayerInfoSchema>;
export type ReportGenerationRequestInput = z.infer<typeof ReportGenerationRequestSchema>;

