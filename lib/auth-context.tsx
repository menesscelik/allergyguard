import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Linking } from 'react-native';

import { supabase } from './supabase';
import { getAuthPreferences } from './auth-preferences';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });
let authCallbackSessionPending = false;

function queryFromUrl(url: string) {
  const [, queryString = ''] = url.replace('#', '?').split('?');
  return new URLSearchParams(queryString);
}

async function handleAuthLink(url: string) {
  const isAuthCallback =
    url.startsWith('com.menescelik.allergyguard://auth/callback') ||
    url.startsWith('allergyguard://auth/callback') ||
    url.startsWith('allergyguard:///auth/callback');

  if (!isAuthCallback) return;

  const params = queryFromUrl(url);
  const code = params.get('code');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  authCallbackSessionPending = true;

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    router.replace({ pathname: '/reset-password', params: { verified: '1' } });
    return;
  }

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    router.replace({ pathname: '/reset-password', params: { verified: '1' } });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthLink(url).catch(() => {});
    });

    async function bootstrapAuth() {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleAuthLink(initialUrl).catch(() => {});
      }

      const { data } = await supabase.auth.getSession();
      const { rememberSession } = await getAuthPreferences();

      if (!rememberSession && data.session && !authCallbackSessionPending) {
        await supabase.auth.signOut({ scope: 'local' });
        setSession(null);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    }

    bootstrapAuth().catch(() => {
      setSession(null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      linkingSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
