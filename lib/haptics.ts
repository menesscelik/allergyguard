import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// iOS'ta hafif dokunsal geri bildirim; diğer platformlarda no-op.
export function hapticLight() {
  if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function hapticSuccess() {
  if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function hapticSelection() {
  if (Platform.OS === 'ios') Haptics.selectionAsync().catch(() => {});
}
