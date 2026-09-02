import { Redirect } from 'expo-router';

// Social sign-in must not be followed by a mandatory personal-information form.
export default function CompleteProfileRedirect() {
  return <Redirect href="/(tabs)" />;
}
