import { StyleSheet } from 'react-native';

import { Palette } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
    backgroundColor: Palette.background,
  },
  title: {
    color: Palette.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
