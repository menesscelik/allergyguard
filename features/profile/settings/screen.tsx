import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';

import { notificationsEnabled, setNotificationsEnabled } from './service';
import { styles } from './styles';

import { PRIMARY } from '@/components/form';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLocalization();
  const layout = useResponsiveLayout();
  const [notifsOn, setNotifsOn] = useState(true);

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
          <Text style={styles.systemText}>{t('settings.systemTheme')}</Text>
        </View>
      </ScrollView>
    </>
  );
}
