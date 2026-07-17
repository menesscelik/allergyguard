import { router } from 'expo-router';

import { useOnboarding } from '@/lib/onboarding-context';

export function useCompleteOnboarding() {
  const { complete } = useOnboarding();

  return async function completeOnboarding() {
    await complete();
    router.replace('/(auth)/login');
  };
}
