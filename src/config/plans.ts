import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface PlanConfig {
  price_id: string;
  product_id: string;
  plan_key: string;
  name: string;
  price: number;
  role: AppRole;
  maxPatients?: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  trialDays?: number; // Trial period in days (14 or 30)
}

// Patient Plans
export const PATIENT_PLANS: PlanConfig[] = [
  {
    price_id: 'price_1SsY9bEIcgPWQIT2BYxOcZ4A',
    product_id: 'prod_TqEcjYXgsY6aMo',
    plan_key: 'patient_essential',
    name: 'Premium',
    price: 17.00,
    role: 'patient',
    description: 'Acompanhamento emocional completo',
    features: [
      'Check-ins e diário ilimitados',
      'Gráficos de evolução emocional',
      'Linha do tempo interativa',
      'Questionários de auto-observação',
      'Compartilhamento com terapeuta',
      'Suporte prioritário',
    ],
    highlighted: true,
    trialDays: 14,
  },
];

// Therapist Plans
export const THERAPIST_PLANS: PlanConfig[] = [
  {
    price_id: 'price_1SsYALEIcgPWQIT22HAp8ud9',
    product_id: 'prod_TqEdyM1rE4Zahh',
    plan_key: 'therapist_starter',
    name: 'Starter',
    price: 29.90,
    role: 'therapist',
    maxPatients: 5,
    description: 'Para quem está começando',
    features: [
      'Até 5 pacientes ativos',
      'Visualização de dados compartilhados',
      'Notas privadas por paciente',
      'Linha do tempo dos pacientes',
      'Agenda básica',
    ],
    trialDays: 7,
  },
  {
    price_id: 'price_1SsYAwEIcgPWQIT2bszeHFo5',
    product_id: 'prod_TqEeypZsxCiVus',
    plan_key: 'therapist_growth',
    name: 'Growth',
    price: 59.90,
    role: 'therapist',
    maxPatients: 20,
    description: 'Para práticas em crescimento',
    features: [
      'Até 20 pacientes ativos',
      'Tudo do plano Starter',
      'Gráficos de evolução por paciente',
      'Questionários personalizados',
      'Notificações inteligentes',
      'Suporte prioritário',
    ],
    highlighted: true,
    trialDays: 7,
  },
  {
    price_id: 'price_1SxG4JEIcgPWQIT2Xx0T9hSY',
    product_id: 'prod_Tv6Gy3vKKO7DWi',
    plan_key: 'therapist_pro',
    name: 'Pro',
    price: 79.90,
    role: 'therapist',
    maxPatients: 35,
    description: 'Para profissionais estabelecidos',
    features: [
      'Até 35 pacientes ativos',
      'Tudo do plano Growth',
      'Relatórios avançados',
      'Gestão financeira básica',
      'Suporte preferencial',
    ],
    trialDays: 7,
  },
  {
    price_id: 'price_1SxG5oEIcgPWQIT2sAg6mSFL',
    product_id: 'prod_Tv6ILDjxe1NOAo',
    plan_key: 'therapist_scale',
    name: 'Scale',
    price: 129.90,
    role: 'therapist',
    maxPatients: 80,
    description: 'Para clínicas e grandes práticas',
    features: [
      'Até 80 pacientes ativos',
      'Tudo do plano Pro',
      'Exportação de dados e relatórios',
      'Relatórios por paciente',
      'API de integração',
      'Suporte dedicado',
    ],
    trialDays: 7,
  },
];

// All plans combined
export const ALL_PLANS = [...PATIENT_PLANS, ...THERAPIST_PLANS];

// Get plan by key
export const getPlanByKey = (planKey: string): PlanConfig | undefined => {
  return ALL_PLANS.find(p => p.plan_key === planKey);
};

// Get plan by product ID
export const getPlanByProductId = (productId: string): PlanConfig | undefined => {
  return ALL_PLANS.find(p => p.product_id === productId);
};

// Get plans by role
export const getPlansByRole = (role: AppRole): PlanConfig[] => {
  if (role === 'patient') return PATIENT_PLANS;
  if (role === 'therapist') return THERAPIST_PLANS;
  return [];
};

// Plan features lookup (matches database plans table)
export interface PlanFeatures {
  maxPatients: number | null;
  canExport: boolean;
  canViewCharts: boolean;
  canUseTimeline: boolean;
  canUseQuestionnaires: boolean;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  none: {
    maxPatients: null,
    canExport: false,
    canViewCharts: false,
    canUseTimeline: false,
    canUseQuestionnaires: false,
  },
  patient_essential: {
    maxPatients: null,
    canExport: false,
    canViewCharts: true,
    canUseTimeline: true,
    canUseQuestionnaires: true,
  },
  therapist_starter: {
    maxPatients: 5,
    canExport: false,
    canViewCharts: false,
    canUseTimeline: true,
    canUseQuestionnaires: false,
  },
  therapist_growth: {
    maxPatients: 20,
    canExport: false,
    canViewCharts: true,
    canUseTimeline: true,
    canUseQuestionnaires: true,
  },
  therapist_pro: {
    maxPatients: 35,
    canExport: true,
    canViewCharts: true,
    canUseTimeline: true,
    canUseQuestionnaires: true,
  },
  therapist_scale: {
    maxPatients: 80,
    canExport: true,
    canViewCharts: true,
    canUseTimeline: true,
    canUseQuestionnaires: true,
  },
};

export const getPlanFeatures = (planKey: string): PlanFeatures => {
  return PLAN_FEATURES[planKey] || PLAN_FEATURES.none;
};
