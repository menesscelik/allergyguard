import { FunctionsHttpError } from '@supabase/supabase-js';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/form';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { RISK_META, type AnalysisResult } from '@/lib/types';

export default function DrugResultScreen() {
  const { session } = useAuth();
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

    // Aynı ilaç zaten listede mi?
    const { data: existing } = await supabase
      .from('allergies')
      .select('id')
      .eq('user_id', session.user.id)
      .ilike('drug_name', drugName)
      .limit(1);

    if (existing && existing.length > 0) {
      setSaving(false);
      setSavedToAllergies(true);
      Alert.alert('Zaten kayıtlı', 'Bu ilaç alerji listende zaten var.');
      return;
    }

    const { error } = await supabase.from('allergies').insert({
      user_id: session.user.id,
      drug_name: drugName,
      active_ingredients: ingredients,
      rxcui: params.rxcui || null,
      reaction_notes:
        result.matched_ingredients.length > 0
          ? `Risk analizinde eşleşti: ${result.matched_ingredients.join(', ')}`
          : 'Risk analizi sonucu eklendi',
      severity: 'unknown',
    });
    setSaving(false);
    if (error) {
      Alert.alert('Hata', 'Eklenemedi: ' + error.message);
      return;
    }
    setSavedToAllergies(true);
    Alert.alert('Eklendi ✅', `"${drugName}" alerji listene kaydedildi.`);
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setErrorMsg(null);

    const { data, error } = await supabase.functions.invoke('analyze-drug', {
      body: { drugName, ingredients, rxcui: params.rxcui || null, language: 'tr' },
    });

    setAnalyzing(false);
    if (error) {
      if (error instanceof FunctionsHttpError) {
        try {
          const body = await error.context.json();
          if (body?.error === 'weekly_limit') {
            setErrorMsg(
              '⏳ ' + (body.message ?? 'Bu haftaki ücretsiz test hakkın doldu. Pazartesi yenilenir.')
            );
            return;
          }
          setErrorMsg(body?.message ?? 'Analiz başarısız oldu, tekrar dene.');
          return;
        } catch {
          // gövde okunamadıysa genel mesaja düş
        }
      }
      setErrorMsg('Analiz başarısız oldu. Bağlantını kontrol edip tekrar dene.');
      return;
    }
    setResult(data as AnalysisResult);
  }

  const meta = result ? RISK_META[result.risk_level] : null;

  return (
    <>
      <Stack.Screen options={{ title: 'İlaç Analizi' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.drugName}>{drugName}</Text>
        {ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Etken Maddeler</Text>
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
              title={analyzing ? 'Analiz ediliyor...' : 'Alerjilerimle Karşılaştır'}
              onPress={handleAnalyze}
              loading={analyzing}
            />
            {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
          </>
        )}

        {result && meta && (
          <View style={[styles.resultCard, { backgroundColor: meta.bg, borderColor: meta.color }]}>
            <Text style={[styles.riskTitle, { color: meta.color }]}>
              {meta.emoji} {meta.label}
            </Text>

            {result.matched_ingredients.length > 0 && (
              <View style={styles.matchedBox}>
                <Text style={[styles.matchedTitle, { color: meta.color }]}>Eşleşen maddeler:</Text>
                {result.matched_ingredients.map((m) => (
                  <Text key={m} style={[styles.matchedItem, { color: meta.color }]}>
                    • {m}
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.explanation}>{result.explanation}</Text>
            <Text style={styles.recommendation}>👉 {result.recommendation}</Text>

            {result.used_fallback && (
              <Text style={styles.fallbackNote}>
                Not: AI analizi şu an kullanılamadı, temel karşılaştırma yapıldı.
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
                ? '✓ Alerji listende'
                : saving
                  ? 'Ekleniyor...'
                  : '➕ Bu İlacı Alerji Listeme Ekle'}
            </Text>
          </Pressable>
        )}

        <Text style={styles.disclaimer}>
          ⚠️ Bu sonuç tıbbi tavsiye değildir. İlaç kullanmadan önce mutlaka doktorunuza veya
          eczacınıza danışın.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  drugName: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  ingredient: {
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  error: {
    color: Palette.warning,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 16,
    textAlign: 'center',
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: 18,
    marginTop: 8,
  },
  riskTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  matchedBox: {
    marginBottom: 10,
  },
  matchedTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  matchedItem: {
    fontSize: 15,
    lineHeight: 22,
  },
  explanation: {
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  recommendation: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    marginTop: 10,
    lineHeight: 22,
  },
  fallbackNote: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 10,
  },
  saveButton: {
    borderWidth: 1.5,
    borderColor: Palette.danger,
    borderRadius: Radius.medium,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },
  saveButtonDone: {
    borderColor: Palette.success,
    backgroundColor: Palette.successSoft,
  },
  saveButtonText: {
    color: Palette.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  saveButtonTextDone: {
    color: Palette.success,
  },
  disclaimer: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 24,
    lineHeight: 19,
    textAlign: 'center',
  },
});
