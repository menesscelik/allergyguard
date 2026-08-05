import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { submitFeedback } from './service';
import { styles } from './styles';

import { PrimaryButton } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KEYBOARD_DISMISS_ACCESSORY_ID } from '@/components/keyboard-dismiss-accessory';
import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import type { FeedbackType } from '@/lib/types';

const TYPES: FeedbackType[] = ['drug_not_found', 'wrong_info', 'general'];

export default function FeedbackScreen() {
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const [type, setType] = useState<FeedbackType>('drug_not_found');
  const [drugName, setDrugName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      Alert.alert(t('common.error'), t('feedback.messageRequired'));
      return;
    }
    setSaving(true);
    const { error } = await submitFeedback({ type, drugName, barcode, message });
    setSaving(false);
    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }
    Alert.alert(t('feedback.sentTitle'), t('feedback.sentText'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: t('feedback.title') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, layout.centerContent]}>
          <View style={styles.heroIcon}>
            <IconSymbol name="bubble.left.fill" size={32} color={Palette.primary} />
          </View>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('feedback.hero')}</Text>
          <Text style={styles.subtitle}>{t('feedback.subtitle')}</Text>
        </View>

        <View style={[styles.card, layout.centerContent]}>
          <Text style={styles.label}>{t('feedback.type')}</Text>
          <View style={styles.typeRow}>
            {TYPES.map((item) => {
              const selected = type === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setType(item)}
                  style={[styles.typeChip, selected && styles.typeChipSelected]}>
                  <Text style={[styles.typeText, selected && styles.typeTextSelected]}>
                    {t(`feedback.types.${item}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>{t('feedback.drugName')}</Text>
          <TextInput
            inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
            value={drugName}
            onChangeText={setDrugName}
            placeholder={t('drugTest.placeholder')}
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.label}>{t('feedback.barcode')}</Text>
          <TextInput
            inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
            value={barcode}
            onChangeText={setBarcode}
            placeholder="869..."
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text style={styles.label}>{t('feedback.message')}</Text>
          <TextInput
            inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
            value={message}
            onChangeText={setMessage}
            placeholder={t('feedback.messagePlaceholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={layout.centerContent}>
          <PrimaryButton title={t('feedback.send')} onPress={handleSubmit} loading={saving} />
        </View>
      </ScrollView>
    </>
  );
}
