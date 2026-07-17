import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import { getDrugCheck } from './service';
import { styles } from './styles';

import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import { RISK_META, type DrugCheck } from '@/lib/types';

function formatFullDate(value: string, language: 'tr' | 'en') {
  return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const [item, setItem] = useState<DrugCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDrugCheck(id)
      .then(({ data, error }) => {
        if (error) Alert.alert(t('common.error'), error.message);
        setItem(data);
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  const meta = item ? RISK_META[item.risk_level] : null;

  return (
    <>
      <Stack.Screen options={{ title: t('analysis.detailTitle') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: layout.pagePadding, paddingTop: layout.cardGap },
        ]}
        contentInsetAdjustmentBehavior="automatic">
        {loading && <ActivityIndicator size="large" color={Palette.primary} />}

        {item && meta && (
          <>
            <View style={[styles.hero, layout.centerContent, { borderColor: meta.color, backgroundColor: meta.bg }]}>
              <Text style={styles.heroEmoji}>{meta.emoji}</Text>
              <Text style={[styles.riskTitle, { color: meta.color }]}>
                {t(`analysis.${item.risk_level}`)}
              </Text>
              <Text style={styles.drugName}>{item.tested_drug_name}</Text>
              <Text style={styles.date}>{formatFullDate(item.created_at, language)}</Text>
            </View>

            <View style={[styles.section, layout.centerContent]}>
              <Text style={styles.sectionTitle}>{t('analysis.whatChecked')}</Text>
              {item.tested_ingredients.length > 0 ? (
                item.tested_ingredients.map((ingredient) => (
                  <View key={ingredient} style={styles.ingredientRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>{t('history.noIngredients')}</Text>
              )}
            </View>

            <View style={[styles.section, layout.centerContent]}>
              <Text style={styles.sectionTitle}>{t('analysis.matchDetails')}</Text>
              {item.matched_ingredients.length > 0 ? (
                item.matched_ingredients.map((match) => (
                  <View key={match} style={[styles.matchChip, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.matchText, { color: meta.color }]}>✓ {match}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>{t('analysis.noMatchedDetail')}</Text>
              )}
            </View>

            <View style={[styles.section, layout.centerContent]}>
              <Text style={styles.sectionTitle}>{t('analysis.explanationTitle')}</Text>
              <Text style={styles.bodyText}>{item.ai_explanation ?? t('analysis.noExplanation')}</Text>
            </View>

            <View style={[styles.recommendation, layout.centerContent, { borderColor: meta.color }]}>
              <Text style={styles.recommendationTitle}>👉 {t('analysis.recommendationTitle')}</Text>
              <Text style={styles.bodyText}>{item.ai_recommendation ?? t('analysis.disclaimer')}</Text>
            </View>

            <View style={[styles.timeline, layout.centerContent]}>
              <Text style={styles.timelineTitle}>{t('analysis.howItWorks')}</Text>
              <Text style={styles.timelineText}>{t('analysis.stepIngredients')}</Text>
              <Text style={styles.timelineText}>{t('analysis.stepCompare')}</Text>
              <Text style={styles.timelineText}>{t('analysis.stepExplain')}</Text>
            </View>

            <Text style={styles.disclaimer}>⚠️ {t('analysis.disclaimer')}</Text>
          </>
        )}
      </ScrollView>
    </>
  );
}
