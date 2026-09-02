import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Palette } from '@/constants/theme';
import { privacyPolicyText } from '@/features/auth/privacy/policy';
import { useLocalization } from '@/lib/localization-context';

export default function PrivacyPolicyScreen() {
  const { language, t } = useLocalization();

  return (
    <>
      <Stack.Screen options={{ title: t('legal.privacy') }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text selectable style={styles.text}>{privacyPolicyText(language)}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { padding: 22, paddingBottom: 48 },
  text: { color: Palette.text, fontSize: 14, lineHeight: 22 },
});
