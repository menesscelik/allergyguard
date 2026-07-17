import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';

import { checkLocalInteraction, getPremiumStatus, type InteractionResult } from './service';
import { styles } from './styles';

import { PrimaryButton } from '@/components/form';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import { RISK_META } from '@/lib/types';

export default function InteractionCheckScreen() {
  const { session } = useAuth();
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const [premium, setPremium] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [firstIngredients, setFirstIngredients] = useState('');
  const [secondIngredients, setSecondIngredients] = useState('');
  const [result, setResult] = useState<InteractionResult | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getPremiumStatus(session.user.id).then(({ isPremium, error }) => {
        if (error) Alert.alert(t('common.error'), error.message);
        setPremium(isPremium);
      });
    }, [session, t])
  );

  function handleCheck() {
    if (!firstName.trim() || !secondName.trim()) {
      Alert.alert(t('common.error'), t('interaction.nameRequired'));
      return;
    }
    setResult(checkLocalInteraction({ firstName, secondName, firstIngredients, secondIngredients }));
  }

  const meta = result ? RISK_META[result.risk] : null;

  return (
    <>
      <Stack.Screen options={{ title: t('interaction.title') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        contentInsetAdjustmentBehavior="automatic">
        <View style={[styles.hero, layout.centerContent]}>
          <Text style={styles.badge}>🧬</Text>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('interaction.hero')}</Text>
          <Text style={styles.subtitle}>{t('interaction.subtitle')}</Text>
        </View>

        {!premium ? (
          <View style={[styles.lockCard, layout.centerContent]}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockTitle}>{t('premium.lockedTitle')}</Text>
            <Text style={styles.lockText}>{t('premium.lockedInteraction')}</Text>
            <PrimaryButton title={t('premium.open')} onPress={() => router.push('/premium' as never)} />
          </View>
        ) : (
          <>
            <View style={[styles.card, layout.centerContent]}>
              <Text style={styles.groupTitle}>{t('interaction.firstDrug')}</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t('interaction.drugNamePlaceholder')}
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
              <TextInput
                value={firstIngredients}
                onChangeText={setFirstIngredients}
                placeholder={t('interaction.ingredientsPlaceholder')}
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <Text style={styles.groupTitle}>{t('interaction.secondDrug')}</Text>
              <TextInput
                value={secondName}
                onChangeText={setSecondName}
                placeholder={t('interaction.drugNamePlaceholder')}
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
              <TextInput
                value={secondIngredients}
                onChangeText={setSecondIngredients}
                placeholder={t('interaction.ingredientsPlaceholder')}
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={layout.centerContent}>
              <PrimaryButton title={t('interaction.check')} onPress={handleCheck} />
            </View>

            {result && meta && (
              <View style={[styles.resultCard, layout.centerContent, { borderColor: meta.color, backgroundColor: meta.bg }]}>
                <Text style={styles.resultEmoji}>{meta.emoji}</Text>
                <Text style={[styles.resultTitle, { color: meta.color }]}>{t(result.titleKey)}</Text>
                <Text style={styles.resultText}>{t(result.detailKey)}</Text>
                {result.overlaps.length > 0 && (
                  <View style={styles.overlapBox}>
                    {result.overlaps.map((item) => (
                      <Text selectable key={item} style={[styles.overlapText, { color: meta.color }]}>• {item}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Text style={[styles.disclaimer, { color: Palette.textSecondary }]}>{t('interaction.disclaimer')}</Text>
          </>
        )}
      </ScrollView>
    </>
  );
}
