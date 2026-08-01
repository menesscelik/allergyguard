import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useAuth } from './auth-context';
import { i18n, type AppLanguage } from './i18n';
import { supabase } from './supabase';

type LocalizationContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const deviceLanguage: AppLanguage = getLocales()[0]?.languageCode === 'en' ? 'en' : 'tr';
const LocalizationContext = createContext<LocalizationContextValue | null>(null);

function isMissingTranslation(value: string) {
  return value.startsWith('[missing "') && value.endsWith('" translation]');
}

function humanizeMissingKey(key: string) {
  return key
    .split('.')
    .at(-1)!
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .trim();
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [language, setLanguageState] = useState<AppLanguage>(deviceLanguage);

  useEffect(() => {
    if (!session) {
      setLanguageState(deviceLanguage);
      return;
    }

    supabase
      .from('profiles')
      .select('language')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.language === 'tr' || data?.language === 'en') setLanguageState(data.language);
      });
  }, [session]);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({ language: nextLanguage, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
    if (error) throw error;
  }, [session]);

  const t = useCallback(
    (key: string, options?: Record<string, unknown>) => {
      const translated = i18n.t(key, { ...options, locale: language });

      if (!isMissingTranslation(translated)) {
        return translated;
      }

      const fallback = i18n.t(key, { ...options, locale: 'tr' });
      return isMissingTranslation(fallback) ? humanizeMissingKey(key) : fallback;
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const value = useContext(LocalizationContext);
  if (!value) throw new Error('useLocalization must be used inside LocalizationProvider');
  return value;
}
