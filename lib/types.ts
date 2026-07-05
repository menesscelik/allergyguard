import { Palette } from '@/constants/theme';

export type Severity = 'mild' | 'moderate' | 'severe' | 'unknown';

export type Allergy = {
  id: string;
  user_id: string;
  drug_name: string;
  drug_name_en: string | null;
  active_ingredients: string[];
  active_ingredients_en: string[];
  rxcui: string | null;
  barcode: string | null;
  reaction_notes: string | null;
  severity: Severity;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  language: 'tr' | 'en';
  is_premium: boolean;
  premium_until: string | null;
  created_at: string;
  updated_at: string;
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  mild: 'Hafif',
  moderate: 'Orta',
  severe: 'Şiddetli',
  unknown: 'Bilinmiyor',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  mild: Palette.severityMild,
  moderate: Palette.severityModerate,
  severe: Palette.danger,
  unknown: Palette.textSecondary,
};

export type Reminder = {
  id: string;
  user_id: string;
  drug_name: string;
  allergy_id: string | null;
  remind_time: string; // "08:30:00"
  repeat_days: number[]; // 1=Pzt ... 7=Paz
  is_active: boolean;
  notes: string | null;
  created_at: string;
};

// index = gün - 1
export const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export type DrugSearchResult = {
  rxcui: string | null;
  name: string;
  ingredients: string[];
};

export type RiskLevel = 'safe' | 'warning' | 'danger';

export type AnalysisResult = {
  risk_level: RiskLevel;
  matched_ingredients: string[];
  explanation: string;
  recommendation: string;
  tested_drug_name: string;
  tested_ingredients: string[];
  used_fallback: boolean;
};

export const RISK_META: Record<RiskLevel, { label: string; emoji: string; color: string; bg: string }> = {
  safe: { label: 'Güvenli Görünüyor', emoji: '✅', color: Palette.success, bg: Palette.successSoft },
  warning: { label: 'Dikkatli Ol', emoji: '⚠️', color: Palette.warning, bg: Palette.warningSoft },
  danger: { label: 'Riskli', emoji: '🔴', color: Palette.danger, bg: Palette.dangerSoft },
};
