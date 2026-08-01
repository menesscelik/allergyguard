import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { notificationsEnabled, setNotificationsEnabled } from './service';
import { styles } from './styles';

import { PRIMARY } from '@/components/form';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import { useThemePreference, type ThemePreference } from '@/lib/theme-preferences';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLocalization();
  const { preference, setPreference } = useThemePreference();
  const layout = useResponsiveLayout();
  const [notifsOn, setNotifsOn] = useState(true);
  const themeOptions: ThemePreference[] = ['light', 'dark', 'system'];

  useEffect(() => {
    notificationsEnabled().then(setNotifsOn);
  }, []);

  async function toggleNotifications(value: boolean) {
    setNotifsOn(value);
    const ok = await setNotificationsEnabled(value);
    if (value && !ok) {
      setNotifsOn(false);
      Alert.alert(t('profile.permissionRequired'), t('profile.permissionInstructions'));
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: t('settings.title') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        contentInsetAdjustmentBehavior="automatic">
        <View style={[styles.card, layout.centerContent]}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          <View style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{t('profile.notifications')}</Text>
              <Text style={styles.rowDesc}>{t('profile.notificationDesc')}</Text>
            </View>
            <Switch value={notifsOn} onValueChange={toggleNotifications} trackColor={{ true: PRIMARY }} />
          </View>
        </View>

        <View style={[styles.card, layout.centerContent]}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          {(['tr', 'en'] as const).map((lang) => (
            <Text
              key={lang}
              style={[styles.languageOption, language === lang && styles.languageOptionSelected]}
              onPress={() => setLanguage(lang).catch((error) => Alert.alert(t('common.error'), error.message))}>
              {lang === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
            </Text>
          ))}
        </View>

        <View style={[styles.card, layout.centerContent]}>
          <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
          <View style={styles.themeSegment}>
            {themeOptions.map((option) => {
              const selected = preference === option;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() =>
                    setPreference(option).catch((error) => Alert.alert(t('common.error'), error.message))
                  }
                  style={[styles.themeOption, selected && styles.themeOptionSelected]}>
                  <Text style={[styles.themeOptionText, selected && styles.themeOptionTextSelected]}>
                    {t(`settings.theme.${option}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.systemText}>{t('settings.theme.description')}</Text>
        </View>
      </ScrollView>
    </>
  );
}
