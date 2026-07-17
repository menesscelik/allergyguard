import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, use, useCallback, useEffect, useState } from 'react';

const ONBOARDING_KEY = 'allergyguard_onboarding_seen_v1';

type OnboardingContextValue = {
  loading: boolean;
  seen: boolean;
  complete: () => Promise<void>;
};

export const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => setSeen(value === 'yes'))
      .finally(() => setLoading(false));
  }, []);

  const complete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'yes');
    setSeen(true);
  }, []);

  return (
    <OnboardingContext.Provider value={{ loading, seen, complete }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const value = use(OnboardingContext);
  if (!value) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return value;
}
