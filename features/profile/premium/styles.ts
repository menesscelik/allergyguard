import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { paddingTop: 12, paddingBottom: 44, gap: 16 },
  hero: {
    alignItems: 'center',
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.premium,
    boxShadow: Shadows.accent,
  },
  badge: { fontSize: 46 },
  title: { color: Palette.white, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  subtitle: { color: Palette.onPrimaryMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  pricePill: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Palette.onPrimarySurface,
  },
  price: { color: Palette.white, fontSize: 14, fontWeight: '900' },
  featureCard: {
    padding: 18,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
    gap: 12,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    lineHeight: 26,
    overflow: 'hidden',
    backgroundColor: Palette.successSoft,
    color: Palette.success,
    fontWeight: '900',
  },
  featureText: { flex: 1, color: Palette.text, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  note: { color: Palette.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 12 },
});
