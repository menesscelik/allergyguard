import { supabase } from '@/lib/supabase';
import type { FeedbackType } from '@/lib/types';

export async function submitFeedback(input: {
  type: FeedbackType;
  drugName?: string;
  barcode?: string;
  message: string;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;

  if (!userId) {
    return { error: new Error('User session was not found.') };
  }

  return supabase.from('feedback_reports').insert({
    user_id: userId,
    type: input.type,
    drug_name: input.drugName?.trim() || null,
    barcode: input.barcode?.trim() || null,
    message: input.message.trim(),
    metadata: {},
  });
}
