import { styles } from './styles';
import { getAllergy, saveAllergy, suggestTrDrugs } from './service';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { FormInput, PrimaryButton } from '@/components/form';
import { useAuth } from '@/lib/auth-context';
import type { TrDrugSuggestion } from '@/lib/drugs';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import { SEVERITY_COLORS, type Severity } from '@/lib/types';

const SEVERITIES: Severity[] = ['mild', 'moderate', 'severe', 'unknown'];

export default function AddAllergyScreen() {
  const { session } = useAuth();
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [drugName, setDrugName] = useState('');
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState<Severity>('unknown');
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<TrDrugSuggestion[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<TrDrugSuggestion | null>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChangeDrugName(text: string) {
    setDrugName(text);
    setSelectedDrug(null);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    const term = text.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    // 300ms bekle: her tuşta değil, yazma durunca sorgula
    suggestTimer.current = setTimeout(async () => {
      const found = await suggestTrDrugs(term);
      setSuggestions(found);
    }, 300);
  }

  function pickSuggestion(s: TrDrugSuggestion) {
    setDrugName(s.name);
    setSelectedDrug(s);
    setSuggestions([]);
    Keyboard.dismiss();
  }

  // Düzenleme modunda mevcut kaydı yükle
  useEffect(() => {
    if (!id) return;
    getAllergy(id)
      .then(({ data, error }) => {
        if (error || !data) {
          Alert.alert(t('common.error'), t('common.retry'));
          router.back();
          return;
        }
        setDrugName(data.drug_name);
        setNotes(data.reaction_notes ?? '');
        setSeverity(data.severity);
      });
  }, [id, t]);

  async function handleSave() {
    if (!drugName.trim()) {
      Alert.alert(t('common.error'), t('allergies.drugName'));
      return;
    }
    setSaving(true);
    const payload = {
      drug_name: drugName.trim(),
      reaction_notes: notes.trim() || null,
      severity,
      // Listeden seçildiyse etken maddeler de kaydedilir (analiz kalitesini artırır)
      ...(selectedDrug
        ? { active_ingredients: selectedDrug.ingredients, barcode: selectedDrug.barcode }
        : {}),
    };
    const { error } = await saveAllergy(id, session!.user.id, payload);
    setSaving(false);
    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? t('allergies.editTitle') : t('allergies.addTitle') }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: layout.pagePadding, paddingTop: layout.cardGap },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled">
          <View style={[styles.introCard, layout.centerContent, { padding: layout.heroPadding }]}>
            <View style={styles.introIcon}><Text style={styles.introEmoji}>🛡️</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>
                {isEdit ? t('allergies.editTitle') : t('allergies.addTitle')}
              </Text>
              <Text style={styles.introText}>{t('allergies.emptyText')}</Text>
            </View>
          </View>
          {!isEdit && (
            <Pressable style={[styles.scanButton, layout.centerContent]} onPress={() => router.replace('/scan')}>
              <Text style={styles.scanButtonText}>📷 {t('allergies.scanAdd')}</Text>
            </Pressable>
          )}

          <View style={layout.centerContent}>
            <FormInput
              label={t('allergies.drugName')}
              value={drugName}
              onChangeText={onChangeDrugName}
              placeholder={t('allergies.drugPlaceholder')}
              autoFocus={!isEdit}
              autoCorrect={false}
            />
          </View>

          {suggestions.length > 0 && (
            <View style={[styles.suggestions, layout.centerContent]}>
              {suggestions.map((s) => (
                <Pressable
                  key={s.barcode ?? s.name}
                  style={styles.suggestionRow}
                  onPress={() => pickSuggestion(s)}>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {s.name}
                  </Text>
                  {s.ingredients.length > 0 && (
                    <Text style={styles.suggestionIngredients} numberOfLines={1}>
                      {s.ingredients.join(', ')}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {selectedDrug && selectedDrug.ingredients.length > 0 && (
            <Text style={styles.selectedInfo}>
              ✓ {t('allergies.selectedIngredient', { ingredients: selectedDrug.ingredients.join(', ') })}
            </Text>
          )}

          <View style={layout.centerContent}>
            <Text style={styles.label}>{t('allergies.reactionSeverity')}</Text>
          </View>
          <View style={[styles.chips, layout.centerContent]}>
            {SEVERITIES.map((s) => {
              const selected = severity === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSeverity(s)}
                  style={[
                    styles.chip,
                    selected && { backgroundColor: SEVERITY_COLORS[s], borderColor: SEVERITY_COLORS[s] },
                  ]}>
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {{ mild: t('common.mild'), moderate: t('common.moderate'), severe: t('common.severe'), unknown: t('common.unknown') }[s]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={layout.centerContent}>
            <FormInput
              label={t('allergies.reactionNotes')}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('allergies.reactionPlaceholder')}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </View>

          <View style={layout.centerContent}>
            <PrimaryButton
              title={isEdit ? t('common.save') : t('common.add')}
              onPress={handleSave}
              loading={saving}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
