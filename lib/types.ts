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
  username: string | null;
  birth_date: string | null;
  language: 'tr' | 'en';
  is_premium: boolean;
  is_admin: boolean;
  premium_until: string | null;
  created_at: string;
  updated_at: string;
};

export type PromoCode = {
  code: string;
  description: string | null;
  premium_days: number;
  max_redemptions: number | null;
  redeemed_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
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

export type IntakeStatus = 'taken' | 'skipped';

export type MedicationIntakeLog = {
  id: string;
  user_id: string;
  reminder_id: string;
  status: IntakeStatus;
  taken_for_date: string;
  note: string | null;
  created_at: string;
};

export type DrugCheck = {
  id: string;
  user_id: string;
  tested_drug_name: string;
  tested_drug_name_en: string | null;
  tested_ingredients: string[];
  tested_ingredients_en: string[];
  risk_level: RiskLevel;
  matched_ingredients: string[];
  ai_explanation: string | null;
  ai_recommendation: string | null;
  language: 'tr' | 'en';
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
  severity_alert?: Severity | null;
  explanation: string;
  recommendation: string;
  tested_drug_name: string;
  tested_ingredients: string[];
  used_fallback: boolean;
  evidence_sources?: string[];
  analysis_method?: string;
  remaining_checks?: number | null;
};

export type FeedbackType = 'drug_not_found' | 'wrong_info' | 'general';

export type FeedbackReport = {
  id: string;
  user_id: string;
  type: FeedbackType;
  drug_name: string | null;
  barcode: string | null;
  message: string;
  metadata: Record<string, unknown>;
  status: string;
  created_at: string;
};

export const RISK_META: Record<RiskLevel, { label: string; emoji: string; color: string; bg: string }> = {
  safe: { label: 'Güvenli Görünüyor', emoji: '✅', color: Palette.success, bg: Palette.successSoft },
  warning: { label: 'Dikkatli Ol', emoji: '⚠️', color: Palette.warning, bg: Palette.warningSoft },
  danger: { label: 'Riskli', emoji: '🔴', color: Palette.danger, bg: Palette.dangerSoft },
};
