import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { privacyPolicyText } from '@/features/auth/privacy/policy';
import { Palette, Radius } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export function PrivacyConsentModal({ visible, onClose, onAccept }: Props) {
  const { t, language } = useLocalization();
  const [reachedEnd, setReachedEnd] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    if (visible) setReachedEnd(false);
  }, [visible]);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 24) {
      setReachedEnd(true);
    }
  }

  function handleContentSize(_w: number, h: number) {
    // İçerik ekrandan kısaysa kaydırmaya gerek yok, doğrudan aktif et.
    if (scrollHeight > 0 && h <= scrollHeight + 4) setReachedEnd(true);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.register.privacyTitle')}</Text>
          <Pressable hitSlop={12} onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={(e) => setScrollHeight(e.nativeEvent.layout.height)}
          onContentSizeChange={handleContentSize}>
          <Text style={styles.body}>{privacyPolicyText(language)}</Text>
        </ScrollView>

        <View style={styles.footer}>
          {!reachedEnd && <Text style={styles.hint}>{t('auth.register.privacyScrollHint')}</Text>}
          <Pressable
            disabled={!reachedEnd}
            onPress={() => {
              onAccept();
              onClose();
            }}
            style={({ pressed }) => [
              styles.button,
              !reachedEnd && styles.buttonDisabled,
              pressed && reachedEnd && { opacity: 0.85 },
            ]}>
            <Text style={styles.buttonText}>{t('auth.register.privacyAccept')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.border,
  },
  title: { fontSize: 18, fontWeight: '700', color: Palette.text },
  close: { fontSize: 20, fontWeight: '600', color: Palette.textMuted },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32 },
  body: { fontSize: 14, lineHeight: 22, color: Palette.text },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.border,
    gap: 8,
  },
  hint: { fontSize: 12, color: Palette.textMuted, textAlign: 'center' },
  button: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.large,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: Palette.borderStrong },
  buttonText: { color: Palette.white, fontSize: 16, fontWeight: '700' },
});
