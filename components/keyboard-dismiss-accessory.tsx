import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';

export const KEYBOARD_DISMISS_ACCESSORY_ID = 'allergyguard-keyboard-dismiss-accessory';

export function KeyboardDismissAccessory() {
  const { t } = useLocalization();

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <InputAccessoryView nativeID={KEYBOARD_DISMISS_ACCESSORY_ID}>
      <View style={styles.bar}>
        <Pressable hitSlop={8} onPress={Keyboard.dismiss} style={styles.button}>
          <Text style={styles.buttonText}>{t('common.close')}</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});
