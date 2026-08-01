import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { styles } from './styles';

import { Palette } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{
    access_token?: string;
    code?: string;
    refresh_token?: string;
  }>();

  useEffect(() => {
    let mounted = true;

    async function completeCallback() {
      try {
        if (params.code) {
          await supabase.auth.exchangeCodeForSession(params.code);
        } else if (params.access_token && params.refresh_token) {
          await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
        }
      } catch {
        // AuthProvider may already have consumed the same callback URL.
      }

      if (mounted) {
        router.replace({ pathname: '/reset-password', params: { verified: '1' } });
      }
    }

    completeCallback();

    return () => {
      mounted = false;
    };
  }, [params.access_token, params.code, params.refresh_token]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ActivityIndicator color={Palette.primary} size="large" />
        <Text style={styles.title}>Bağlantı doğrulanıyor...</Text>
      </View>
    </>
  );
}
