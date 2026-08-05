import { useMemo, useRef, useState, type ComponentProps } from 'react';
import {
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './styles';
import { useCompleteOnboarding } from './service';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';

type SFName = ComponentProps<typeof IconSymbol>['name'];
type Variant = 'hero' | 'allergy' | 'result' | 'reminder';
type Slide = { key: string; variant: Variant; tint: string; soft: string; icon: SFName; title: string; text: string };

export default function OnboardingScreen() {
  const { t } = useLocalization();
  const complete = useCompleteOnboarding();
  const { width } = useWindowDimensions();

  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const slides = useMemo<Slide[]>(
    () => [
      { key: 'intro', variant: 'hero', tint: Palette.primary, soft: Palette.primarySoft, icon: 'shield.checkered', title: t('onboarding.title'), text: t('onboarding.subtitle') },
      { key: 'allergies', variant: 'allergy', tint: Palette.coral, soft: Palette.coralSoft, icon: 'cross.case.fill', title: t('onboarding.cards.allergies.title'), text: t('onboarding.cards.allergies.text') },
      { key: 'check', variant: 'result', tint: Palette.success, soft: Palette.successSoft, icon: 'checkmark.circle.fill', title: t('onboarding.cards.check.title'), text: t('onboarding.cards.check.text') },
      { key: 'reminders', variant: 'reminder', tint: Palette.warning, soft: Palette.warningSoft, icon: 'alarm.fill', title: t('onboarding.cards.reminders.title'), text: t('onboarding.cards.reminders.text') },
    ],
    [t]
  );

  const isLast = index === slides.length - 1;
  const activeTint = slides[index]?.tint ?? Palette.primary;
  const progress = ((index + 1) / slides.length) * 100;

  const onViewRef = useRef((info: { viewableItems: ViewToken[] }) => {
    const first = info.viewableItems[0]?.index;
    if (first != null) setIndex(first);
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  function goNext() {
    if (isLast) {
      complete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Üst: ilerleme çubuğu + Atla */}
      <View style={styles.topBar}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: activeTint }]} />
        </View>
        <Pressable hitSlop={10} onPress={complete} accessibilityRole="button">
          <Text style={styles.skip}>{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Sparkles tint={item.tint} />

            {item.variant === 'hero' ? (
              <View style={styles.heroBlock}>
                <View style={[styles.haloOuter, { backgroundColor: item.tint }]} />
                <View style={[styles.heroLogo, { backgroundColor: item.tint }]}>
                  <IconSymbol name={item.icon} size={56} color={Palette.white} />
                </View>
                <Text style={styles.heroTitle}>{item.title}</Text>
                <Text style={styles.heroText}>{item.text}</Text>
              </View>
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.text}>{item.text}</Text>
                </View>
                <View style={styles.stage}>
                  {item.variant === 'allergy' && <AllergyMock />}
                  {item.variant === 'result' && <ResultMock />}
                  {item.variant === 'reminder' && <ReminderMock />}
                </View>
              </>
            )}
          </View>
        )}
      />

      <Text style={styles.notice}>{t('onboarding.noticeText')}</Text>

      <Pressable
        onPress={goNext}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, { backgroundColor: activeTint }, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>{isLast ? t('onboarding.start') : t('onboarding.next')}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

/* --- Dekoratif küçük yıldızlar --- */
function Sparkles({ tint }: { tint: string }) {
  return (
    <>
      <View style={[styles.spark, { top: 24, left: 40, backgroundColor: tint }]} />
      <View style={[styles.sparkSm, { top: 90, right: 54, backgroundColor: tint }]} />
      <View style={[styles.spark, { bottom: 120, right: 36, backgroundColor: tint }]} />
      <View style={[styles.sparkSm, { bottom: 60, left: 48, backgroundColor: tint }]} />
    </>
  );
}

/* --- Uygulama arayüzü taklidi kartlar --- */
function AllergyMock() {
  return (
    <View style={styles.mockCard}>
      <View style={[styles.mockAccent, { backgroundColor: Palette.coral }]} />
      <View style={[styles.mockAvatar, { backgroundColor: Palette.coralSoft }]}>
        <Text style={[styles.mockAvatarText, { color: Palette.coral }]}>A</Text>
      </View>
      <View style={styles.mockGrow}>
        <Text style={styles.mockTitle}>Amoksisilin</Text>
        <Text style={styles.mockSub}>2 etken madde • penisilin</Text>
      </View>
      <View style={[styles.mockChip, { backgroundColor: Palette.coral }]}>
        <Text style={styles.mockChipText}>Şiddetli</Text>
      </View>
    </View>
  );
}

function ResultMock() {
  return (
    <View style={styles.resultCard}>
      <View style={[styles.resultIcon, { backgroundColor: Palette.successSoft }]}>
        <IconSymbol name="checkmark.circle.fill" size={40} color={Palette.success} />
      </View>
      <Text style={styles.resultTitle}>Güvenli görünüyor</Text>
      <Text style={styles.resultText}>İbuprofen, alerji listenle çakışmıyor.</Text>
      <View style={styles.resultBar}>
        <View style={[styles.resultBarFill, { backgroundColor: Palette.success }]} />
      </View>
    </View>
  );
}

function ReminderMock() {
  const rows = [
    { time: '08:30', name: 'D Vitamini', on: true },
    { time: '13:00', name: 'Antihistaminik', on: true },
    { time: '21:00', name: 'Magnezyum', on: false },
  ];
  return (
    <View style={styles.reminderCard}>
      {rows.map((r) => (
        <View key={r.time} style={styles.reminderRow}>
          <View style={[styles.reminderTime, { backgroundColor: Palette.warningSoft }]}>
            <Text style={[styles.reminderTimeText, { color: Palette.warning }]}>{r.time}</Text>
          </View>
          <Text style={styles.reminderName}>{r.name}</Text>
          <View style={[styles.reminderToggle, r.on && { backgroundColor: Palette.success }]}>
            <View style={[styles.reminderKnob, r.on && styles.reminderKnobOn]} />
          </View>
        </View>
      ))}
    </View>
  );
}
