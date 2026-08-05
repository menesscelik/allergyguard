import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getEmergencyCardData } from './service';
import { styles } from './styles';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import { SEVERITY_LABELS, type Allergy, type Profile } from '@/lib/types';

export default function EmergencyCardScreen() {
  const { session } = useAuth();
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getEmergencyCardData(session.user.id).then(({ profile: nextProfile, allergies: nextAllergies, error }) => {
        if (error) {
          Alert.alert(t('common.error'), error.message);
          return;
        }
        setProfile(nextProfile);
        setAllergies(nextAllergies);
      });
    }, [session, t])
  );

  const severeAllergies = useMemo(
    () => allergies.filter((item) => item.severity === 'severe'),
    [allergies]
  );

  return (
    <>
      <Stack.Screen options={{ title: t('emergency.title') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        contentInsetAdjustmentBehavior="automatic">
        <Animated.View entering={FadeInDown.duration(240)} style={[styles.hero, layout.centerContent]}>
          <View style={styles.heroIcon}>
            <IconSymbol name="cross.case.fill" size={30} color={Palette.white} />
          </View>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('emergency.hero')}</Text>
          <Text selectable style={styles.name}>{profile?.full_name || session?.user.email || t('profile.fallbackName')}</Text>
          <Text selectable style={styles.email}>{session?.user.email}</Text>
        </Animated.View>

        <View style={[styles.alertCard, layout.centerContent]}>
          <Text style={styles.sectionTitle}>{t('emergency.severeTitle')}</Text>
          {severeAllergies.length > 0 ? (
            severeAllergies.map((item) => (
              <Text selectable key={item.id} style={styles.strongLine}>
                • {item.drug_name}
              </Text>
            ))
          ) : (
            <Text style={styles.muted}>{t('emergency.noSevere')}</Text>
          )}
        </View>

        <View style={[styles.card, layout.centerContent]}>
          <Text style={styles.sectionTitle}>{t('emergency.allergiesTitle')}</Text>
          {allergies.length > 0 ? (
            allergies.map((item) => (
              <View key={item.id} style={styles.allergyRow}>
                <View style={styles.allergyCopy}>
                  <Text selectable style={styles.allergyName}>{item.drug_name}</Text>
                  <Text selectable style={styles.ingredients}>
                    {item.active_ingredients.length > 0
                      ? item.active_ingredients.join(', ')
                      : t('allergies.pendingIngredient')}
                  </Text>
                </View>
                <Text style={[styles.severity, item.severity === 'severe' && styles.severityDanger]}>
                  {SEVERITY_LABELS[item.severity]}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.muted}>{t('emergency.empty')}</Text>
          )}
        </View>

        <Text style={[styles.disclaimer, layout.centerContent]}>⚠️ {t('emergency.disclaimer')}</Text>
      </ScrollView>
    </>
  );
}
