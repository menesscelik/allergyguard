import AsyncStorage from '@react-native-async-storage/async-storage';

const REMEMBER_SESSION_KEY = 'auth_remember_session';
const REMEMBERED_EMAIL_KEY = 'auth_remembered_email';

export async function getAuthPreferences() {
  const [rememberValue, rememberedEmail] = await Promise.all([
    AsyncStorage.getItem(REMEMBER_SESSION_KEY),
    AsyncStorage.getItem(REMEMBERED_EMAIL_KEY),
  ]);

  return {
    rememberSession: rememberValue !== 'off',
    rememberedEmail: rememberedEmail ?? '',
  };
}

export async function saveAuthPreferences(rememberSession: boolean, email: string) {
  await AsyncStorage.setItem(REMEMBER_SESSION_KEY, rememberSession ? 'on' : 'off');

  if (rememberSession) {
    await AsyncStorage.setItem(REMEMBERED_EMAIL_KEY, email);
  } else {
    await AsyncStorage.removeItem(REMEMBERED_EMAIL_KEY);
  }
}

export async function clearAuthPreferences() {
  await AsyncStorage.multiRemove([REMEMBER_SESSION_KEY, REMEMBERED_EMAIL_KEY]);
}
