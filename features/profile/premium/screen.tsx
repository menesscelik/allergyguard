import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { premiumFeatures } from './service';
import { styles } from './styles';

import { PrimaryButton } from '@/components/form';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

export default function PremiumScreen() {
  const { t } = useLocalization();
  const layout = useResponsiveLayout();

  return (
    <>
      <Stack.Screen options={{ title: t('premium.title') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        contentInsetAdjustmentBehavior="automatic">
        <Animated.View
          entering={FadeInDown.duration(260)}
          style={[styles.hero, layout.centerContent, { padding: layout.heroPadding }]}>
          <Text style={styles.badge}>⭐</Text>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('premium.hero')}</Text>
          <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
          <View style={styles.pricePill}>
            <Text style={styles.price}>{t('premium.price')}</Text>
          </View>
        </Animated.View>

        <View style={[styles.featureCard, layout.centerContent]}>
          {premiumFeatures().map((key, index) => (
            <Animated.View
              key={key}
              entering={FadeInDown.duration(220).delay(index * 55)}
              style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{t(key)}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={layout.centerContent}>
          <PrimaryButton title={t('premium.cta')} onPress={() => {}} />
          <Text style={styles.note}>{t('premium.note')}</Text>
        </View>
      </ScrollView>
    </>
  );
}
