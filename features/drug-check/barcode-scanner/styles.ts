import { StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';
import { PRIMARY } from '@/components/form';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.black,
  },
  camera: {
    flex: 1,
  },
  panel: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    padding: 20,
    paddingBottom: 36,
    gap: 10,
  },
  center: {
    flex: 1,
    backgroundColor: Palette.surface,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 24,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  notFoundTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.warning,
    textAlign: 'center',
  },
  drugName: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  ingredients: {
    fontSize: 14,
    color: Palette.textSecondary,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: Radius.medium,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  rescanText: {
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});


