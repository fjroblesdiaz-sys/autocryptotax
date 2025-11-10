/**
 * Subscription Plans Configuration
 * Defines all available subscription plans and their features
 */

import { SubscriptionPlan } from '../types/subscription.types';

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfecto para probar la plataforma',
    price: {
      monthly: 0,
      annually: 0,
    },
    features: [
      '1 reporte al año',
      'Hasta 50 transacciones',
      '1 exchange soportado',
      'Modelo 100 (IRPF)',
      'Soporte por email',
    ],
    limits: {
      reportsPerYear: 1,
      transactionsPerReport: 50,
      exchangesSupported: 1,
      apiAccess: false,
      prioritySupport: false,
      multiUser: false,
      customTemplates: false,
    },
    cta: 'Comenzar Gratis',
  },
  
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'Para usuarios individuales con actividad regular',
    price: {
      monthly: 3.99,
      annually: 29,
    },
    features: [
      '5 reportes al año',
      'Hasta 500 transacciones',
      '2 exchanges soportados',
      'Todos los modelos fiscales (100, 720, 714)',
      'Soporte por email',
      'Exportación PDF y CSV',
      'Histórico de reportes',
    ],
    limits: {
      reportsPerYear: 5,
      transactionsPerReport: 500,
      exchangesSupported: 2,
      apiAccess: false,
      prioritySupport: false,
      multiUser: false,
      customTemplates: false,
    },
    popular: true,
    cta: 'Comenzar Ahora',
  },
  
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para traders activos y profesionales',
    price: {
      monthly: 9.99,
      annually: 79,
    },
    features: [
      'Reportes ilimitados',
      'Transacciones ilimitadas',
      'Todos los exchanges',
      'Todos los modelos fiscales',
      'Soporte prioritario',
      'Generación automática',
      'Alertas y recordatorios',
      'Análisis de portfolio',
    ],
    limits: {
      reportsPerYear: 'unlimited',
      transactionsPerReport: 'unlimited',
      exchangesSupported: 'unlimited',
      apiAccess: false,
      prioritySupport: true,
      multiUser: false,
      customTemplates: false,
    },
    cta: 'Actualizar a Pro',
  },
  
  business: {
    id: 'business',
    name: 'Business',
    description: 'Para asesorías, gestorías y empresas',
    price: {
      monthly: 29.99,
      annually: 299,
    },
    features: [
      'Todo lo incluido en Pro',
      'API access completo',
      'Templates personalizables',
      'Multi-usuario (hasta 10)',
      'White label (opcional)',
      'Soporte dedicado',
      'SLA garantizado',
      'Onboarding personalizado',
    ],
    limits: {
      reportsPerYear: 'unlimited',
      transactionsPerReport: 'unlimited',
      exchangesSupported: 'unlimited',
      apiAccess: true,
      prioritySupport: true,
      multiUser: true,
      customTemplates: true,
    },
    cta: 'Contactar Ventas',
  },
};

/**
 * Get plan by ID
 */
export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS[planId];
};

/**
 * Get all plans as array
 */
export const getAllPlans = (): SubscriptionPlan[] => {
  return Object.values(SUBSCRIPTION_PLANS);
};

/**
 * Calculate savings when paying annually
 */
export const calculateAnnualSavings = (plan: SubscriptionPlan): number => {
  if (plan.price.monthly === 0) return 0;
  const monthlyTotal = plan.price.monthly * 12;
  return monthlyTotal - plan.price.annually;
};

/**
 * Calculate savings percentage
 */
export const calculateSavingsPercentage = (plan: SubscriptionPlan): number => {
  if (plan.price.monthly === 0) return 0;
  const monthlyTotal = plan.price.monthly * 12;
  return Math.round(((monthlyTotal - plan.price.annually) / monthlyTotal) * 100);
};

