import { Stack } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Palette, Radius } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';

const APPLE_STANDARD_EULA = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export default function TermsOfUseScreen() {
  const { t } = useLocalization();

  return (
    <>
      <Stack.Screen options={{ title: t('legal.terms') }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('legal.subscriptionTitle')}</Text>
        <Text style={styles.text}>{t('legal.subscriptionTerms')}</Text>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(APPLE_STANDARD_EULA)} style={styles.linkButton}>
          <Text style={styles.linkText}>{t('legal.openAppleEula')}</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { padding: 22, paddingBottom: 48 },
  title: { color: Palette.text, fontSize: 22, fontWeight: '800', marginBottom: 14 },
  text: { color: Palette.textSecondary, fontSize: 15, lineHeight: 23 },
  linkButton: { marginTop: 24, padding: 16, borderRadius: Radius.large, backgroundColor: Palette.surface, borderWidth: 1, borderColor: Palette.border },
  linkText: { color: Palette.primary, fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
