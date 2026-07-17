import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { deleteAllergy, getAllergy, getRecentChecksForAllergy } from './service';
import { styles } from './styles';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import { RISK_META, SEVERITY_COLORS, type Allergy, type DrugCheck } from '@/lib/types';

function formatDate(value: string, language: 'tr' | 'en') {
  return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

export default function AllergyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const [allergy, setAllergy] = useState<Allergy | null>(null);
  const [checks, setChecks] = useState<DrugCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAllergy(id)
      .then(async ({ data, error }) => {
        if (error || !data) {
          Alert.alert(t('common.error'), error?.message ?? t('common.error'));
          return;
        }
        setAllergy(data);
        const related = await getRecentChecksForAllergy(data);
        setChecks(related.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  function confirmDelete() {
    if (!allergy) return;
    Alert.alert(t('allergies.deleteTitle'), t('allergies.deleteMessage', { name: allergy.drug_name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteAllergy(allergy.id);
          if (error) {
            Alert.alert(t('common.error'), error.message);
            return;
          }
          router.back();
        },
      },
    ]);
  }

  const severityLabel = allergy
    ? {
        mild: t('common.mild'),
        moderate: t('common.moderate'),
        severe: t('common.severe'),
        unknown: t('common.unknown'),
      }[allergy.severity]
    : '';

  return (
    <>
      <Stack.Screen
        options={{
          title: t('allergyDetail.title'),
          headerRight: () => allergy ? (
            <Pressable onPress={() => router.push({ pathname: '/add-allergy', params: { id: allergy.id } })}>
              <IconSymbol name="pencil" size={21} color={Palette.primary} />
            </Pressable>
          ) : null,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: layout.pagePadding, paddingTop: layout.cardGap },
        ]}
        contentInsetAdjustmentBehavior="automatic">
        {loading && <ActivityIndicator size="large" color={Palette.primary} />}

        {allergy && (
          <>
            <View style={[styles.hero, layout.centerContent, { padding: layout.heroPadding }]}>
              <View style={[styles.avatar, { width: layout.badgeSize, height: layout.badgeSize }]}>
                <Text style={styles.avatarText}>{allergy.drug_name.slice(0, 1).toLocaleUpperCase(language)}</Text>
              </View>
              <Text style={styles.eyebrow}>{t('allergyDetail.eyebrow')}</Text>
              <Text style={styles.title}>{allergy.drug_name}</Text>
              <View style={[styles.severityPill, { backgroundColor: SEVERITY_COLORS[allergy.severity] }]}>
                <Text style={styles.severityText}>{severityLabel}</Text>
              </View>
            </View>

            <View style={[styles.section, layout.centerContent]}>
              <Text style={styles.sectionTitle}>{t('analysis.ingredients')}</Text>
              {allergy.active_ingredients.length > 0 ? (
                allergy.active_ingredients.map((ingredient) => (
                  <Text key={ingredient} style={styles.ingredient}>• {ingredient}</Text>
                ))
              ) : (
                <Text style={styles.muted}>{t('allergies.pendingIngredient')}</Text>
              )}
            </View>

            <View style={[styles.section, layout.centerContent]}>
              <Text style={styles.sectionTitle}>{t('allergyDetail.reaction')}</Text>
              <Text style={styles.bodyText}>
                {allergy.reaction_notes || t('allergyDetail.noReaction')}
              </Text>
            </View>

            <View style={[styles.infoGrid, layout.centerContent, { flexDirection: layout.isCompact ? 'column' : 'row' }]}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{t('allergyDetail.barcode')}</Text>
                <Text style={styles.infoValue}>{allergy.barcode || '—'}</Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>RxCUI</Text>
                <Text style={styles.infoValue}>{allergy.rxcui || '—'}</Text>
              </View>
            </View>

            <View style={[styles.section, layout.centerContent]}>
              <Text style={styles.sectionTitle}>{t('allergyDetail.relatedChecks')}</Text>
              {checks.length > 0 ? (
                checks.map((check) => {
                  const meta = RISK_META[check.risk_level];
                  return (
                    <Pressable
                      key={check.id}
                      style={styles.checkRow}
                      onPress={() => router.push({ pathname: '/analysis-detail' as never, params: { id: check.id } })}>
                      <Text style={styles.checkEmoji}>{meta.emoji}</Text>
                      <View style={styles.checkCopy}>
                        <Text style={styles.checkName}>{check.tested_drug_name}</Text>
                        <Text style={styles.checkDate}>{formatDate(check.created_at, language)}</Text>
                      </View>
                      <Text style={[styles.checkRisk, { color: meta.color }]}>
                        {t(`analysis.${check.risk_level}`)}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.muted}>{t('allergyDetail.noRelatedChecks')}</Text>
              )}
            </View>

            <Pressable style={[styles.deleteButton, layout.centerContent]} onPress={confirmDelete}>
              <Text style={styles.deleteText}>{t('allergyDetail.delete')}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </>
  );
}
