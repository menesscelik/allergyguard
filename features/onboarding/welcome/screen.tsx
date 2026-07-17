import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from './styles';
import { useCompleteOnboarding } from './service';

import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';

export default function OnboardingScreen() {
  const { t } = useLocalization();
  const complete = useCompleteOnboarding();

  const cards = useMemo(
    () => [
      { emoji: '🛡️', title: t('onboarding.cards.allergies.title'), text: t('onboarding.cards.allergies.text') },
      { emoji: '🧪', title: t('onboarding.cards.check.title'), text: t('onboarding.cards.check.text') },
      { emoji: '⏰', title: t('onboarding.cards.reminders.title'), text: t('onboarding.cards.reminders.text') },
    ],
    [t]
  );

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>💊</Text>
        </View>
        <Text style={styles.eyebrow}>{t('onboarding.eyebrow')}</Text>
        <Text style={styles.title}>{t('onboarding.title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
      </View>

      <View style={styles.cardStack}>
        {cards.map((card, index) => (
          <View key={card.title} style={[styles.card, index === 1 && styles.cardFeatured]}>
            <View style={[styles.cardIcon, index === 1 && { backgroundColor: Palette.accent }]}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardText}>{card.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>{t('onboarding.noticeTitle')}</Text>
        <Text style={styles.noticeText}>{t('onboarding.noticeText')}</Text>
      </View>

      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={complete}>
        <Text style={styles.buttonText}>{t('onboarding.start')}</Text>
      </Pressable>
    </ScrollView>
  );
}
