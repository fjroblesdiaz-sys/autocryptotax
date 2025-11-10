/**
 * Subscription Module Types
 * Defines all TypeScript interfaces for the subscription system
 */

export type PlanTier = 'free' | 'basic' | 'pro' | 'business';

export type BillingCycle = 'monthly' | 'annually';

export type SubscriptionStatus = 
  | 'active' 
  | 'inactive' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing';

/**
 * Plan Configuration
 * Defines the features and limits for each subscription plan
 */
export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  description: string;
  price: {
    monthly: number;
    annually: number;
  };
  features: string[];
  limits: {
    reportsPerYear: number | 'unlimited';
    transactionsPerReport: number | 'unlimited';
    exchangesSupported: number | 'unlimited';
    apiAccess: boolean;
    prioritySupport: boolean;
    multiUser: boolean;
    customTemplates: boolean;
  };
  popular?: boolean;
  cta: string;
}

/**
 * User Subscription
 * Represents a user's active subscription
 */
export interface UserSubscription {
  id: string;
  userId: string;
  planId: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  usage: {
    reportsGenerated: number;
    reportsLimit: number | null; // null = unlimited
    transactionsProcessed: number;
    lastReportDate?: Date;
  };
}

/**
 * Subscription Usage Stats
 * Track usage for displaying in dashboard
 */
export interface SubscriptionUsage {
  reportsGenerated: number;
  reportsLimit: number | 'unlimited';
  reportsRemaining: number | 'unlimited';
  transactionsProcessed: number;
  periodStart: Date;
  periodEnd: Date;
  percentUsed: number; // 0-100
}

/**
 * Pricing Feature
 * Individual feature in pricing comparison
 */
export interface PricingFeature {
  name: string;
  description?: string;
  available: boolean | string; // can be boolean or custom text like "50 reports"
}

/**
 * Invoice
 * Billing invoice for a subscription
 */
export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceDate: Date;
  paidDate?: Date;
  invoiceUrl?: string;
  invoicePdf?: string;
}

