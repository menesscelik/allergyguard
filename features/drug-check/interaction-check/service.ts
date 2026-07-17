import { supabase } from '@/lib/supabase';
import type { Profile, RiskLevel } from '@/lib/types';

export type InteractionResult = {
  risk: RiskLevel;
  titleKey: string;
  detailKey: string;
  overlaps: string[];
};

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseIngredients(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getPremiumStatus(userId: string) {
  const { data, error } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
  return { isPremium: Boolean((data as Pick<Profile, 'is_premium'> | null)?.is_premium), error };
}

export function checkLocalInteraction(input: {
  firstName: string;
  firstIngredients: string;
  secondName: string;
  secondIngredients: string;
}): InteractionResult {
  const firstName = normalize(input.firstName);
  const secondName = normalize(input.secondName);
  const firstIngredients = parseIngredients(input.firstIngredients);
  const secondIngredients = parseIngredients(input.secondIngredients);
  const secondIngredientKeys = new Set(secondIngredients.map(normalize));
  const overlaps = firstIngredients.filter((item) => secondIngredientKeys.has(normalize(item)));

  if (firstName && secondName && firstName === secondName) {
    return { risk: 'warning', titleKey: 'interaction.sameDrugTitle', detailKey: 'interaction.sameDrugDetail', overlaps };
  }

  if (overlaps.length > 0) {
    return { risk: 'warning', titleKey: 'interaction.overlapTitle', detailKey: 'interaction.overlapDetail', overlaps };
  }

  if (firstIngredients.length === 0 || secondIngredients.length === 0) {
    return { risk: 'warning', titleKey: 'interaction.missingTitle', detailKey: 'interaction.missingDetail', overlaps: [] };
  }

  return { risk: 'safe', titleKey: 'interaction.clearTitle', detailKey: 'interaction.clearDetail', overlaps: [] };
}
