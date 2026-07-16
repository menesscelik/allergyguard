import { styles } from './styles';
import { analyzeDrug, asAnalysisResult, saveAnalyzedAllergy } from './service';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/form';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { RISK_META, type AnalysisResult } from '@/lib/types';

export default function DrugResultScreen() {
  const { session } = useAuth();
  const { t, language } = useLocalization();
  const params = useLocalSearchParams<{ name: string; rxcui?: string; ingredients?: string }>();
  const drugName = params.name ?? '';
  const ingredients: string[] = params.ingredients ? JSON.parse(params.ingredients) : [];

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedToAllergies, setSavedToAllergies] = useState(false);

  async function saveToAllergies() {
    if (!session || !result) return;
    setSaving(true);

    const { alreadyExists, error } = await saveAnalyzedAllergy({
      userId: session.user.id,
      drugName,
      ingredients,
      rxcui: params.rxcui || null,
      reactionNotes: result.matched_ingredients.length > 0
        ? t('analysis.matchNote', { ingredients: result.matched_ingredients.join(', ') })
        : t('analysis.resultNote'),
    });

    if (alreadyExists) {
      setSaving(false);
      setSavedToAllergies(true);
      Alert.alert(t('analysis.already'), t('analysis.alreadyMessage'));
      return;
    }
    setSaving(false);
    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }
    setSavedToAllergies(true);
    Alert.alert(t('analysis.added'), t('analysis.addedMessage', { name: drugName }));
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setErrorMsg(null);

    const { data, error } = await analyzeDrug({
      drugName, ingredients, rxcui: params.rxcui || null, language,
    });

    setAnalyzing(false);
    if (error) {
      if (error instanceof FunctionsHttpError) {
        try {
          const body = await error.context.json();
          if (body?.error === 'weekly_limit') {
            setErrorMsg(
              '⏳ ' + (body.message ?? t('analysis.weeklyLimit'))
            );
            return;
          }
          setErrorMsg(body?.message ?? t('analysis.failed'));
          return;
        } catch {
          // gövde okunamadıysa genel mesaja düş
        }
      }
      setErrorMsg(t('analysis.failed'));
      return;
    }
    setResult(asAnalysisResult(data));
  }

  const meta = result ? RISK_META[result.risk_level] : null;

  return (
    <>
      <Stack.Screen options={{ title: t('analysis.title') }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.drugHero}>
          <View style={styles.drugBadge}><Text style={styles.drugEmoji}>💊</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>{t('analysis.title').toLocaleUpperCase(language)}</Text>
            <Text style={styles.drugName}>{drugName}</Text>
          </View>
        </View>
        {ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('analysis.ingredients')}</Text>
            {ingredients.map((ing) => (
              <Text key={ing} style={styles.ingredient}>
                • {ing}
              </Text>
            ))}
          </View>
        )}

        {!result && (
          <>
            <PrimaryButton
              title={analyzing ? t('analysis.analyzing') : t('analysis.compare')}
              onPress={handleAnalyze}
              loading={analyzing}
            />
            {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
          </>
        )}

        {result && meta && (
          <View style={[styles.resultCard, { backgroundColor: meta.bg, borderColor: meta.color }]}>
            <Text style={[styles.riskTitle, { color: meta.color }]}>
              {meta.emoji} {t(`analysis.${result.risk_level}`)}
            </Text>

            {result.matched_ingredients.length > 0 && (
              <View style={styles.matchedBox}>
                <Text style={[styles.matchedTitle, { color: meta.color }]}>{t('analysis.matched')}</Text>
                {result.matched_ingredients.map((m) => (
                  <Text key={m} style={[styles.matchedItem, { color: meta.color }]}>
                    • {m}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.explanation}>{result.explanation}</Text>
            <Text style={styles.recommendation}>👉 {result.recommendation}</Text>

            {!!result.evidence_sources?.length && (
              <View style={styles.evidenceRow}>
                {result.evidence_sources.map((source) => (
                  <View key={source} style={styles.evidenceChip}>
                    <Text style={styles.evidenceText}>✓ {source}</Text>
                  </View>
                ))}
              </View>
            )}

            {result.used_fallback && (
              <Text style={styles.fallbackNote}>
                {t('analysis.fallback')}
              </Text>
            )}
          </View>
        )}

        {result && result.risk_level !== 'safe' && (
          <Pressable
            style={[styles.saveButton, savedToAllergies && styles.saveButtonDone]}
            onPress={saveToAllergies}
            disabled={saving || savedToAllergies}>
            <Text style={[styles.saveButtonText, savedToAllergies && styles.saveButtonTextDone]}>
              {savedToAllergies
                ? `✓ ${t('analysis.inList')}`
                : saving
                  ? 'Ekleniyor...'
                  : `➕ ${t('analysis.addAllergy')}`}
            </Text>
          </Pressable>
        )}

        <Text style={styles.disclaimer}>
          ⚠️ {t('analysis.disclaimer')}
        </Text>
      </ScrollView>
    </>
  );
}
