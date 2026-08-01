import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Appearance,
  useColorScheme,
  type ColorSchemeName,
} from 'react-native';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemePreferenceContextValue = {
  effectiveScheme: NonNullable<ColorSchemeName>;
  loading: boolean;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const THEME_PREFERENCE_KEY = 'appearance_theme_preference';

const ThemePreferenceContext = createContext<ThemePreferenceContextValue>({
  effectiveScheme: 'light',
  loading: true,
  preference: 'system',
  setPreference: async () => {},
});

function applyThemePreference(preference: ThemePreference) {
  Appearance.setColorScheme(preference === 'system' ? null : preference);
}

function normalizeThemePreference(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }

  return 'system';
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREFERENCE_KEY)
      .then((storedPreference) => {
        const nextPreference = normalizeThemePreference(storedPreference);
        setPreferenceState(nextPreference);
        applyThemePreference(nextPreference);
      })
      .finally(() => setLoading(false));
  }, []);

  const setPreference = async (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    applyThemePreference(nextPreference);
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, nextPreference);
  };

  const value = useMemo(
    () => ({
      effectiveScheme: preference === 'system' ? (systemScheme ?? 'light') : preference,
      loading,
      preference,
      setPreference,
    }),
    [loading, preference, systemScheme],
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
