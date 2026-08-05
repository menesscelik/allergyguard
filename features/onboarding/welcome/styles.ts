import { StyleSheet } from 'react-native';

import { Fonts, Palette, Radius } from '@/constants/theme';

const CARD_SHADOW = '0 12px 30px rgba(0, 0, 0, 0.10)';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },

  // Üst bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    height: 48,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  skip: {
    color: Palette.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },

  // Slayt
  slide: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 18,
    overflow: 'hidden',
  },
  spark: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 3,
    opacity: 0.16,
    transform: [{ rotate: '45deg' }],
  },
  sparkSm: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 2,
    opacity: 0.14,
    transform: [{ rotate: '45deg' }],
  },

  // Hero (ilk slayt)
  heroBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloOuter: {
    position: 'absolute',
    top: '18%',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.08,
  },
  heroLogo: {
    width: 108,
    height: 108,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.16)',
  },
  heroTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 30,
    fontWeight: '700',
    color: Palette.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 30,
  },
  heroText: {
    fontSize: 16,
    lineHeight: 24,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 320,
  },

  // Özellik slaytları başlığı (sola yaslı)
  header: {
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: '700',
    color: Palette.text,
    letterSpacing: -0.5,
  },
  text: {
    fontSize: 16,
    lineHeight: 23,
    color: Palette.textSecondary,
    marginTop: 10,
    maxWidth: 340,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Alerji kartı
  mockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: Palette.surface,
    borderRadius: Radius.large,
    padding: 16,
    paddingLeft: 22,
    boxShadow: CARD_SHADOW,
    overflow: 'hidden',
  },
  mockAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  mockAvatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockAvatarText: {
    fontSize: 19,
    fontWeight: '700',
  },
  mockGrow: { flex: 1, gap: 3 },
  mockTitle: { color: Palette.text, fontSize: 16, fontWeight: '700' },
  mockSub: { color: Palette.textSecondary, fontSize: 12, fontWeight: '600' },
  mockChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  mockChipText: { color: Palette.white, fontSize: 11, fontWeight: '700' },

  // Sonuç kartı
  resultCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radius.xlarge,
    padding: 26,
    boxShadow: CARD_SHADOW,
  },
  resultIcon: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: { color: Palette.text, fontSize: 19, fontWeight: '700' },
  resultText: {
    color: Palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },
  resultBar: {
    width: '72%',
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.surfaceMuted,
    overflow: 'hidden',
    marginTop: 18,
  },
  resultBarFill: {
    width: '82%',
    height: 6,
    borderRadius: 3,
  },

  // Hatırlatıcı kartı
  reminderCard: {
    width: '100%',
    backgroundColor: Palette.surface,
    borderRadius: Radius.xlarge,
    padding: 12,
    gap: 6,
    boxShadow: CARD_SHADOW,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  reminderTime: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },
  reminderTimeText: { fontSize: 13, fontWeight: '700' },
  reminderName: { flex: 1, color: Palette.text, fontSize: 15, fontWeight: '700' },
  reminderToggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.borderStrong,
    padding: 3,
    justifyContent: 'center',
  },
  reminderKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Palette.white,
    alignSelf: 'flex-start',
  },
  reminderKnobOn: { alignSelf: 'flex-end' },

  // Alt
  notice: {
    fontSize: 11,
    lineHeight: 16,
    color: Palette.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    borderRadius: Radius.large,
    paddingVertical: 17,
    marginHorizontal: 24,
    alignItems: 'center',
    marginBottom: 6,
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.12)',
  },
  buttonPressed: { opacity: 0.88 },
  buttonText: {
    color: Palette.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
