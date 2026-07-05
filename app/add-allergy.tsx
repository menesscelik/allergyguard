import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormInput, PrimaryButton } from '@/components/form';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { suggestTrDrugs, type TrDrugSuggestion } from '@/lib/drugs';
import { supabase } from '@/lib/supabase';
import { SEVERITY_COLORS, SEVERITY_LABELS, type Severity } from '@/lib/types';

const SEVERITIES: Severity[] = ['mild', 'moderate', 'severe', 'unknown'];

export default function AddAllergyScreen() {
  const { session } = useAuth();
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
    supabase
      .from('allergies')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          Alert.alert('Hata', 'Kayıt yüklenemedi.');
          router.back();
          return;
        }
        setDrugName(data.drug_name);
        setNotes(data.reaction_notes ?? '');
        setSeverity(data.severity);
      });
  }, [id]);

  async function handleSave() {
    if (!drugName.trim()) {
      Alert.alert('Eksik bilgi', 'İlaç adını gir.');
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
    const { error } = isEdit
      ? await supabase.from('allergies').update(payload).eq('id', id)
      : await supabase.from('allergies').insert({ ...payload, user_id: session!.user.id });
    setSaving(false);
    if (error) {
      Alert.alert('Hata', 'Kaydedilemedi: ' + error.message);
      return;
    }
    router.back();
  }

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Alerjiyi Düzenle' : 'Alerji Ekle' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!isEdit && (
            <Pressable style={styles.scanButton} onPress={() => router.replace('/scan')}>
              <Text style={styles.scanButtonText}>📷 Barkod ile Ekle</Text>
            </Pressable>
          )}

          <FormInput
            label="İlaç adı *"
            value={drugName}
            onChangeText={onChangeDrugName}
            placeholder="örn. Aspirin"
            autoFocus={!isEdit}
            autoCorrect={false}
          />

          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
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
              ✓ Etken madde: {selectedDrug.ingredients.join(', ')}
            </Text>
          )}

          <Text style={styles.label}>Reaksiyon şiddeti</Text>
          <View style={styles.chips}>
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
                    {SEVERITY_LABELS[s]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <FormInput
            label="Reaksiyon notları"
            value={notes}
            onChangeText={setNotes}
            placeholder="örn. Nefes darlığı, kızarıklık..."
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />

          <PrimaryButton
            title={isEdit ? 'Kaydet' : 'Ekle'}
            onPress={handleSave}
            loading={saving}
          />

          <Text style={styles.hint}>
            💡 Faz 2&apos;de ilacın etken maddeleri otomatik çekilecek; şimdilik ilaç adı yeterli.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scanButton: {
    borderWidth: 1.5,
    borderColor: Palette.primary,
    borderRadius: Radius.medium,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: Palette.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.medium,
    backgroundColor: Palette.surface,
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surfaceMuted,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  suggestionIngredients: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  selectedInfo: {
    fontSize: 13,
    color: Palette.success,
    marginTop: -8,
    marginBottom: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Palette.surface,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  chipTextSelected: {
    color: Palette.white,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
});
